# TypeScript 构造方法 / Factory 与 native 构造方法对齐调研

- 日期：2026-06-02
- 范围：`src/common/Chat*.ts` 中所有 class `constructor` 与 `static createXxx` factory
- 基准：`modules/objc/dispatch/ExtSdkToJson.m`（commit `9e85c77`）、`modules/java/com/chatsdk/dispatch/ExtSdkHelper.java`（commit `6e15393`）中 native 对象构造器签名与 `fromJson*` 行为
- 关联规则：`docs/three-platform-value-normalization-rules.md`

## 0. 判定原则

| 维度 | 说明 |
| --- | --- |
| native 是否可选 | native 构造器只传 1 个参数（或允许 nil/null）、其余字段以 has-check / 空串→nil 推迟到 setter → **native 视为可选** |
| TS 是否必填 | TS class `constructor` / `static factory` 形参没有 `?` → **TS 必填** |
| 命中目标 | TS 必填、native 可选 → **不合理**，本次目标 |
| 类属性 | 公开 class 属性的可选性**不动**（兼容性约束，用户代码已依赖） |
| 可改范围 | constructor 形参可选性、factory 形参可选性、内部 `?? ''` / `?? 0` / `?? false` 这类把 `undefined` 伪装成兼容默认值的写法 |

## 1. 总览：建议人工审核的不合理项

按"修改受益高 / 兼容风险低"排序。每项的详细论据见后文。

| # | 位置 | 问题摘要 | 风险 |
| --- | --- | --- | --- |
| **A** | `ChatMessage.createImageMessage` 的 `width` / `height` | factory 形参必填，native 实际可选（has-check 包裹） | 低 |
| **B** | `ChatMessage.createVideoMessage` 的 `thumbnailLocalPath` / `width` / `height` | 同上 | 低 |
| **C** | `ChatMessage.createLocationMessage` 的 `address` | factory 必填 + `opt?.address ?? ''`，native 允许 nil | 低 |
| **D** | `ChatMessage.createCustomMessage` 的 `params` | factory 必填，native 允许 nil / 缺失 | 低 |
| **E** | `ChatMessage.createXxxMessage` 内部所有 `?? ''` / `?? false` 兜底 | factory 把 undefined 改为兼容空值，违反归一化规则 | 低（仅 factory 内部） |
| **F** | `ChatContact` constructor 的 `remark` | TS 必填，native 可选（iOS 空串→nil） | **中**（属性也需改可选，可能破坏兼容） |
| **G** | `ChatOptions` constructor 的 `appKey` / `appId` | 二选一却签名都必填，靠 throw 兜底，factory 用 `undefined as any` 绕 | **中**（公开签名变化） |

## 2. A：`ChatMessage.createImageMessage`

- 位置：`src/common/ChatMessage.ts:777-813`
- 当前签名片段：

  ```ts
  opt?: {
    displayName?: string;
    thumbnailLocalPath?: string;
    sendOriginalImage?: boolean;
    width: number;
    height: number;
    ...
  }
  ```

- native 实际行为：
  - iOS：`if (aJson[@"width"] && aJson[@"height"]) { ret.size = CGSizeMake(...); }`
  - Android：`if (json.has("width") && json.has("height")) { body.setThumbnailSize(...); }`
  - 缺失时 native 不调用 setter，保留默认状态 → **可选**

- 建议改动：
  - `width: number` → `width?: number`
  - `height: number` → `height?: number`
  - factory 内 `width: opt?.width` / `height: opt?.height` 已是透传，无需 `??`

- 兼容影响：factory 形参从必填变可选，调用方原有"必传"代码完全兼容。

## 3. B：`ChatMessage.createVideoMessage`

- 位置：`src/common/ChatMessage.ts:839-873`
- 当前签名片段：

  ```ts
  opt?: {
    displayName?: string;
    thumbnailLocalPath: string;
    duration: number;
    width: number;
    height: number;
    ...
  }
  ```

- native 实际行为：
  - `thumbnailLocalPath`：iOS / Android 都是 `optString().isEmpty() ? nil : setter` → **可选**
  - `width` / `height`：iOS / Android 都是 has-check 包裹 → **可选**
  - `duration`：
    - iOS：`if (aJson[@"duration"]) { ret.duration = ... }` → 可选
    - Android：`new EMVideoMessageBody(localPath, null, duration, 0)` — duration 是构造器入参，但读取处做了 `int duration = 0; if (json.has("duration")) duration = json.getInt("duration");` → native 端**默认 0**，TS 形参可选可选

- 建议改动：
  - `thumbnailLocalPath: string` → `thumbnailLocalPath?: string`
  - `width` / `height` → 可选
  - `duration` → 可选

- 兼容影响：同 A，低风险。

## 4. C：`ChatMessage.createLocationMessage`

- 位置：`src/common/ChatMessage.ts:1000-1026`
- 当前片段：

  ```ts
  opt?: { address: string; ... }
  // 调用：
  body: new ChatLocationMessageBody({
    latitude, longitude,
    address: opt?.address ?? '',
  })
  ```

- native 实际行为：
  - iOS：`address = (address && length > 0) ? address : nil; initWithLatitude:longitude:address:buildingName:` 允许 nil
  - Android：`String address = json.optString("address").isEmpty() ? null : json.getString("address"); new EMLocationMessageBody(address, ..., null)` 允许 null

- 建议改动：
  - `address: string` → `address?: string`
  - 删除 factory 中的 `opt?.address ?? ''`，改为 `address: opt?.address`
  - **注意**：`ChatLocationMessageBody` 的属性 `address: string` 必填，受类型约束 body class constructor 内部仍需 `?? ''`，但 factory 层可以传 `undefined` 让 constructor 自己兜底；或者把 body class 属性也改成可选——**这是兼容性风险**，建议保留属性必填、只改 factory 形参

## 5. D：`ChatMessage.createCustomMessage`

- 位置：`src/common/ChatMessage.ts:1088-1112`
- 当前签名：

  ```ts
  opt?: { params: Record<string, string>; ... }
  ```

- native 实际行为：
  - iOS：`EMCustomMessageBody initWithEvent:customExt:` — customExt 允许 nil，且 fromJson 对 `NSNull` / 非字典都转 nil
  - Android：`if (json.has("params") && json.get("params") != JSONObject.NULL) { ... }` → 可选

- 建议改动：
  - `params: Record<string, string>` → `params?: Record<string, string>`
  - `ChatCustomMessageBody` 的属性 `params?` 已是可选，无冲突

- 兼容影响：低。

## 6. E：`createXxxMessage` 内部 `?? ''` / `?? false` 兜底

涉及的 factory 内部赋值（factory 层把 `undefined` 改为兼容默认值后再喂给 body class）：

| 位置 | 当前写法 | 建议 |
| --- | --- | --- |
| `createFileMessage` line 738 | `displayName: opt?.displayName ?? ''` | `displayName: opt?.displayName` |
| `createImageMessage` line 798-800 | `displayName: opt?.displayName ?? ''` / `thumbnailLocalPath: opt?.thumbnailLocalPath ?? ''` / `sendOriginalImage: opt?.sendOriginalImage ?? false` | 三处直接透传，不要 `??` |
| `createVideoMessage` line 859-860 | `displayName: opt?.displayName ?? ''` / `thumbnailLocalPath: opt?.thumbnailLocalPath ?? ''` | 同上 |
| `createVoiceMessage` line 913 | `displayName: opt?.displayName ?? ''` | 直接透传 |
| `createLocationMessage` line 1017 | `address: opt?.address ?? ''` | 与 C 联动 |
| `createCombineMessage` line 967 | `localPath: ''` | 这是固定值 `''`，combine 消息确实没有 localPath，保留 |

兼容影响：
- factory 层删除 `??` 后传 `undefined` 给 body class
- body class constructor 内部仍有 `?? ''`（属性必填约束），最终结果与原来一致 → **进入 native bridge payload 时仍是 `''`**，由 native fromJson 的"空串→nil"兜住
- 等价于"消除 factory 层多余的兜底，向规则靠拢"，不影响最终 native 行为

**这一节是低风险清理**，可直接做；但收益主要是"语义清晰"，不解决最终归一化问题（最终归一化由 native fromJson 兜住）。

## 7. F：`ChatContact` 的 `remark`

- 位置：`src/common/ChatContact.ts:13-16`

  ```ts
  export class ChatContact {
    userId: string;
    remark: string;
    constructor(params: { userId: string; remark: string }) {
      this.userId = params.userId;
      this.remark = params.remark;
    }
  }
  ```

- native 实际行为：
  - iOS：`remark = (remark && length > 0) ? remark : nil; initWithUserId:remark:` 允许 nil
  - Android：`EMContact` 的 native 行为通常也允许 null（`getRemark()` 可返回 null）

- 风险点：`remark` 在 TS 端是 public 属性 + 必填，改可选会触发：
  - 属性类型 `remark: string` → `remark?: string`（**破坏兼容**：用户代码 `contact.remark.toUpperCase()` 会报错）
  - constructor 形参改可选

- 建议：**先记录、人工拍板**。两个选项：
  - 选项 1：保持 TS 必填 + factory 调用方传 `''`，与 native 空串→nil 兜底协同 → 维持现状
  - 选项 2：改可选，破坏兼容但语义最清晰
  - 推荐选项 1（与 §6 思路一致）。

## 8. G：`ChatOptions` 的 `appKey` / `appId`

- 位置：`src/common/ChatOptions.ts:267-355`

- 当前写法：

  ```ts
  constructor(params: {
    appKey: string;
    appId: string;
    ...
  }) {
    if (!params.appKey && !params.appId) {
      throw new ChatError({ code: -1, description: '...' });
    }
    this.appId = params.appId;
    this.appKey = params.appKey;
    ...
  }

  static withAppId(params: { appId: string; ... }) {
    return new ChatOptions({
      ...params,
      appId: params.appId,
      appKey: undefined as any,   // ← 类型作弊
    });
  }
  ```

- native 实际行为：
  - iOS：`if (appKey != nil) { optionsWithAppkey } else if (appId != nil) { optionsWithAppId } else { NSLog 警告 }`
  - Android：`if (!json.optString("appKey").isEmpty()) { options.setAppKey(...); } if (!json.optString("appId").isEmpty()) { options.setAppId(...); }`
  - **二选一**，至少有一个；纯 native 端两个都允许缺失（带警告）

- 风险点：构造器签名 `appKey: string; appId: string;` 都必填与"二选一"语义矛盾，现在用 `undefined as any` 绕过。如果改成都可选：
  - constructor 签名变化 → **可能破坏用户代码**（如果用户用 TS 严格模式调用 `new ChatOptions({ appKey: '...' })` 会报 missing `appId`）
  - factory 不再需要 `undefined as any`

- 建议：构造器形参改成 `appKey?: string; appId?: string;`，保留 throw 检查。**人工评估兼容性**。

## 9. 不在本次范围 / 已确认无问题

| 类 / 方法 | 备注 |
| --- | --- |
| `_ChatFileMessageBody` / `ChatImageMessageBody` / `ChatVideoMessageBody` / `ChatVoiceMessageBody` / `ChatCombineMessageBody` constructor 内部 `?? ''` / `?? 0` | 公开属性必填，constructor 内部 `??` 受类型约束动不了；最终空值由 native fromJson "空串→nil" 兜底，**不需改 TS** |
| `ChatSilentModeTime` (`hour` / `minute`) | Android 构造器入参裸读，iOS 也按 0 处理；TS `?? 0` 与 native 行为一致，**合理** |
| `ChatSilentModeParam.paramType` | iOS / Android 构造器入参，必填一致，**合理** |
| `ChatGroupOptions` | 全可选，native 全 has-check，**一致** |
| `ChatUserInfo.userId` | TS 必填；native fromJson 实际可选（空串→nil），但业务上 userId 必填合理，**保留** |
| `ChatGroup` / `ChatGroupSharedFile` / `ChatGroupInfo` / `ChatGroupMember` / `ChatRoom` / `ChatConversation` / `ChatPushConfig` / `ChatPushOption` / `ChatPresence` / `ChatDeviceInfo` / `ChatTranslateLanguage` / `ChatMessageReaction` / `ChatMessageThread` | native 端只有 `toJson`（SDK→TS），没有 fromJson 构造路径，**不在比对范围** |
| `ChatRecalledMessageInfo` / `ChatMessagePinInfo` / `ChatFetchMessageOptions` | native fromJson 行为已对齐或 TS 端属业务必填，**不动** |

## 10. 待决策事项

1. A / B / C / D / E（factory 层清理）：是否一次性做？低风险，建议做。
2. F（`ChatContact.remark`）：保留现状（推荐）还是破坏兼容改可选？
3. G（`ChatOptions.appKey/appId`）：保留现状还是改可选 + 保留 throw？

请逐项标注：做 / 跳过 / 待定。

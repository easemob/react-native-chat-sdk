# iOS `fromJsonObject` 输入归一化执行日志

- 日期：2026-05-29
- 关联 spec：`docs/superpowers/specs/2026-05-29-ios-fromjson-input-normalization-design.md`
- 范围文件：`modules/objc/dispatch/ExtSdkToJson.m`

## 1. 已改造方法

| # | 方法 | 备注 |
|---|---|---|
| 1 | `EMGroupOptions fromJsonObject:` | 4 个属性赋值全部加 has-check；`ext` 用 length>0 过滤 |
| 2 | `EMChatMessage fromJsonObject:` | 构造器入参保留；其余 14 个属性全部加 has-check；`direction` 块表达式重写为一行 `if` |
| 3 | `EMTextMessageBody fromJsonObject:` | `targetLanguages` 加 list count>0 判断 |
| 4 | `EMLocationMessageBody fromJsonObject:` | `address` / `buildingName` 空串→nil 归一化（构造器入参允许 nil） |
| 5 | `EMCmdMessageBody fromJsonObject:` | 用户手动注释多余的 `ret.action = aJson[@"action"]`（构造器已传入） |
| 6 | `EMCombineMessageBody fromJsonObject:` | 构造器 string 入参（title/summary/compatibleText）空串→nil；`remotePath` / `secretKey` / `localPath` 加 has-check |
| 7 | `EMFileMessageBody fromJsonObject:` | 范本：displayName 空串→nil；secret/remotePath/fileSize/fileStatus 加 has-check；统一外层括号 |
| 8 | `EMImageMessageBody fromJsonObject:` | displayName 空串→nil；9 个属性全部加 has-check；`width`/`height` 联合判断 |
| 9 | `EMVideoMessageBody fromJsonObject:` | displayName 空串→nil；10 个属性全部加 has-check；`width`/`height` 联合判断 |
| 10 | `EMVoiceMessageBody fromJsonObject:` | displayName 空串→nil；4 个属性全部加 has-check |
| 11 | `EMOptions fromJsonObject:` | 构造器分支（appKey/appId）保留；其余 ~30 个属性全部加 has-check；嵌套 `pushConfig[@"deviceId"]` 加二级判断 |
| 12 | `EMUserInfo fromJsonObject:` | 9 个属性全部加 has-check；`gender` 去掉 `?: 0` 兜底，改 has-check |
| 13 | `EMSilentModeParam fromJsonObject:` | `paramType` 构造器入参保留；其余 4 个属性全部加 has-check |
| 14 | `EMFetchServerMessagesOption fromJsonObject:` | 6 个直接属性赋值全部加 has-check；`msgTypes` 处理逻辑不动 |
| 15 | `EMContact fromJsonObject:` | `remark` 空串→nil 归一化（构造器入参允许 nil） |
| 16 | `EMConversationFilter fromJsonObject:` | `mark` / `pageSize` 加 has-check |
| 17 | `EMMessagePinInfo fromJsonObject:` | `operatorId` 用 length>0；`pinTime` 加 has-check |

## 2. 跳过的方法

| 方法 | 原因 |
|---|---|
| `EMMessageBody fromJsonObject:` (类型分发器) | 仅按 `type` 分发到具体子类，无属性赋值 |
| `EMSilentModeTime fromJsonObject:` | `hour` / `minute` 都是 `int` 构造器入参，无法用 nil 表达"未设置" |
| `EMRecallMessageInfo fromJsonObject:` | 函数体 `return nil`，未实现 |

## 3. 未改动但记录在案（§5 类别）

### 3.1 跨端 JSON key 不一致（§5 类别 1）

（无遗留——`dnsUrl` 与 `pushConfig` 的 key 不一致已在 §4 顺手修复。）

### 3.2 方法整体行为存疑（§5 类别 2）

| 方法 | 备注 |
|---|---|
| `EMRecallMessageInfo fromJsonObject:` | `return nil`，未实现。是否需要实现待后续单独决定。 |

### 3.3 构造器 / init 默认值豁免（§5 类别 4）

| 方法 | 字段 | 备注 |
|---|---|---|
| 所有构造器入参 | （略） | 按 §1.5 例外一，按原样传入或做空串→nil 归一化 |
| `EMSilentModeTime` | `hour` / `minute` | int 入参，无法用 nil 表达未设置 |

## 4. 顺手修复清单（§6.3 例外）

| 方法 | 改动 | 原因 |
|---|---|---|
| `EMCmdMessageBody fromJsonObject:` | 注释掉 `ret.action = aJson[@"action"]`（用户手动） | 构造器已传入 `action`，此处属重复赋值。注释而非删除，便于追溯。 |
| `EMChatMessage fromJsonObject:` | `direction` 块表达式 `({ ... })` 重写为一行 `if (aJson[@"direction"]) { ... }` | 原写法是块表达式套三元，与本次规则冲突；改成 has-check 风格更一致。 |
| `EMSilentModeParam fromJsonObject:` | 删除局部变量 `dictStartTime` / `dictEndTime` / `duration` / `remindType`，直接在 `if` 内引用 dict | 因为加 has-check 后局部变量没用，整理为一行形态。无语义变化。 |
| `EMUserInfo fromJsonObject:` | `gender = [... integerValue] ?: 0` 改为 `if (aJson[@"gender"]) { userInfo.gender = [aJson[@"gender"] integerValue]; }` | 原 `?: 0` 兜底在加 has-check 后冗余。 |
| `EMOptions fromJsonObject:` `dnsURL`（用户手动） | JSON key 由 `dnsURL` 改读为 `dnsUrl`，赋值仍是 `options.dnsURL` | 审计 6.1：TS 侧用 `dnsUrl`，iOS 原读 `dnsURL` 永远拿不到值。这次改造为该字段加 has-check 时若不修 key，has-check 永远 false，等效于把 bug 固化。属"原 bug 与本次改动直接冲突"，按 §6.3 例外修复。 |
| `EMOptions fromJsonObject:` `pushConfig`（用户手动） | 合并两段 `apnsCertName` 赋值：删除 `options.apnsCertName = aJson[@"pushConfig"][@"apnsCertName"]`，仅保留 `pushConfig.deviceId` 的赋值；并把原文件末尾独立的 `if (pushConfig != nil) { ... }` 整段并入前部 | 第一段 `apnsCertName` 是覆盖逻辑残留：后面的 `deviceId` 必然覆盖前者，第一段实际无效。按 §6.3 例外修复。 |

## 5. 待办

- iOS 编译验证：`yarn example ios` 或等价构建。

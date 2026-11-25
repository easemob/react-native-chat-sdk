# 5.2.0 验证记录（2026-11-25）

依据：[03-implementation.md](03-implementation.md)。代码位于 `5.2.0`，**未提交**。

## 静态验证（均已执行）

| 验证项 | 结果 | 备注 |
| --- | --- | --- |
| yarn install --immutable | ✅ | lockfile 未改动 |
| yarn typecheck / yarn lint | ✅ | exit 0；首轮 typecheck 失败是因缺少 `yarn prepare` 生成文件（`src/version.ts`、`example/src/env.ts`），生成后通过 |
| yarn test --no-watchman | ✅ | 26 suites / 221 tests；其中 `ChatMessage.test.ts` 新增 8 个用例；既有断言未改 |
| yarn check:circular:dpdm | ✅ | 无循环依赖 |
| yarn bob build | ✅ | module 与 typescript 产物均生成 |
| node scripts/ci/check_case_mapping.js | ✅ | 新增 `RN-MSG-017` 已登记 |
| git diff --check | ✅ | 无空白错误 |
| `porting_guard.sh gate react-native <worktree>` | ✅ | 无输出，exit 0（本会话为 Cursor，无 hooks 机制，手动执行） |
| 契约逐字抽查 | ✅ | 见下 |

新增单元用例覆盖：单体消息 `bodies = [body]` 与 `contentType`；`createSendMessage` 传 `bodies` 保序且 `contentType = MULTIBODY`；给 `body` 赋值会把列表替换为单个；追加 body 后 `contentType` 变为 `MULTIBODY`；从原生 JSON 重建时 `bodies` 优先于 `body`；无 body 报错；**只有 `bodies` 是自有可枚举属性（`body`、`contentType` 不是）**；TS 不校验 25 个 body（交给 native）。

## 契约抽查输出

```text
getConnectionState 出现次数  Consts.ts:1  ExtSdkMethodType.java:1  ExtSdkMethodTypeObjc.h:2(key+Value)  .m:1
                            cpp .h:1  .cpp:1  ExtSdkDispatch.java:2  ExtSdkDispatch.m:2
ObjC 值：ExtSdkMethodKeyGetConnectionStateValue = 2041（前一个最大值 2040；"= 2041" 仅此一处）
disconnectNotifyThreshold   ChatOptions.ts（字段 + 3 处入参 + 默认 10）  ExtSdkHelper.java（fromJson/toJson）
                            ExtSdkToJson.m（fromJsonObject/toJsonObject）  example auto_mode.ts 白名单
bodies key                  ExtSdkHelper.java（读 644 / 写 758）  ExtSdkToJson.m（读 705 / 写 790）  ChatMessage.ts
版本                        package.json / example/package.json 5.2.0  src/version.ts 5.2.0
                            android hyphenate-chat:5.2.1  podspec minimumVersion 5.2.0 与 ~> 5.2.0
                            iOS MARKETING_VERSION 5.2.0（x2）CURRENT_PROJECT_VERSION 5（x2）  Android versionCode 5
```

## 原生构建与运行：**未完成**

| 验证项 | 结果 | 备注 |
| --- | --- | --- |
| Android 编译（Java 改动） | ⏭️ 未执行 | 环境网络受限：`services.gradle.org` 约 48 B/s，wrapper 无法下载 Gradle；改用本地缓存的 Gradle 9.0.0 后离线缺插件缓存，在线长时间停在依赖解析，进程被回收，未得到编译结果 |
| iOS 编译 / SPM 解析 | ⏭️ 未执行 | 同样依赖网络（`pod install` / SPM），未尝试 |
| 设备运行用例 | ⏭️ 未执行 | 依赖上面两项 |

用户已确认（2026-11-25）：原生构建由用户在自己的网络环境中执行，本报告对应项标记为待验证。**Java 与 ObjC 改动目前没有任何编译证据，仅有静态审阅与契约抽查。**

### 待用户执行的构建与验证

需要登录的用例需要 `E2E_*` 环境变量或 `example/config.local.json`（见 `AGENTS.md`）。

```bash
cd react-native-chat-sdk/.worktree/5.2.0
bash scripts/ci/ci_test_local.sh android logged_out            # 含 RN-APP-001（options 默认值）
bash scripts/ci/ci_test_local.sh android logged_in_base 'RN-(AUTH-001|MSG-017)'
bash scripts/ci/ci_test_local.sh ios logged_out
bash scripts/ci/ci_test_local.sh ios logged_in_base 'RN-(AUTH-001|MSG-017)'
```

编译通过后建议在 example 的手测入口里再补以下必须实测的项（原生 wrapper 无自动化测试）：

1. **桥序列化假设**：`ChatMessage.body` 是类访问器、不可枚举，因此依赖 RN 桥只序列化自有可枚举属性，JS→native 只带 `bodies`。单元测试只证明了 `JSON.stringify` 层面，真实桥需要靠 `RN-MSG-017`（导入后读回、更新后读回）确认。
2. **`ChatManager.sendMultiBodyMessage`**（新增手测入口）：向另一账号发送文本加自定义体，核对返回消息的 `bodies` 长度为 2，并在接收端核对 `onMessagesReceived`。
3. **失败路径**：iOS 多体消息含 `cmd` 时构造返回 nil，Android 在发送期报错；两端都需确认走到的是错误回调（错误码 1 或原生错误码），而不是崩溃（见验收报告未匹配项 2）。
4. **`getConnectionState`**：登录后为 `connected`；登出或断网后状态；两端数值序不同，确认返回的是字符串而非数字。
5. **`disconnectNotifyThreshold`**：默认 10 秒；断网短于阈值恢复时不应回调 `onDisconnected`（需手动断网）。
6. 单体消息发送、接收、更新（旧路径）无回归，尤其 `updateMessage` 后 `body` 不变。

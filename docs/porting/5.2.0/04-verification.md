# 5.2.0 验证记录（2026-11-25）

依据：[03-implementation.md](03-implementation.md)。核心平版已提交为 `e42fdf4`；其后补充的三类测试与 `testing/` 目录调整**尚未提交**。

## 静态验证（均已执行）

| 验证项                                          | 结果 | 备注                                                                                                              |
| ----------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| yarn install --immutable                        | ✅   | lockfile 未改动                                                                                                   |
| yarn typecheck / yarn lint                      | ✅   | exit 0；首轮 typecheck 失败是因缺少 `yarn prepare` 生成文件（`src/version.ts`、`example/src/env.ts`），生成后通过 |
| yarn test --no-watchman                         | ✅   | 26 suites / 225 tests；其中 `ChatMessage.test.ts` 新增 8 个用例；既有断言未改                                     |
| yarn check:circular:dpdm                        | ✅   | 无循环依赖                                                                                                        |
| yarn bob build                                  | ✅   | module 与 typescript 产物均生成                                                                                   |
| node scripts/ci/check_case_mapping.js           | ✅   | 新增 `RN-MSG-017` 已登记                                                                                          |
| git diff --check                                | ✅   | 无空白错误                                                                                                        |
| `porting_guard.sh gate react-native <worktree>` | ✅   | 无输出，exit 0（本会话为 Cursor，无 hooks 机制，手动执行）                                                        |
| 契约逐字抽查                                    | ✅   | 见下                                                                                                              |

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

## 原生构建与运行（2026-11-25 本机实测）

| 验证项 | 结果 | 备注 |
| --- | --- | --- |
| Android 编译（Java 改动） | ✅ 通过 | 本机 `app:assembleDebug`（arm64-v8a）成功；Gradle wrapper 临时指向镜像，已还原 |
| iOS 编译 / Pods | ✅ 通过 | iPhone 17 Pro 模拟器构建并运行 CI |
| CI 回归（Android，`emulator-5554`） | ✅ 5/5 entry、98/98 用例 | 含 `RN-APP-001`、`RN-AUTH-001`、`RN-MSG-017`、`RN-MSG-018` |
| CI 回归（iOS，iPhone 17 Pro） | ✅ 5/5 entry、98/98 用例 | 同上 |
| 单设备（Android） | ✅ `port_5_2_0_positive.json` 3/3 步（`checks` 断言 `bodies` 数量与顺序）；`port_5_2_0_negative.json` 1/1 步（`errorCode: -1`） | iOS 单设备未单独运行 |
| 多设备（Android 双模拟器） | ✅ `5.2.0-multi-message-multibody-positive` 1/1 | `Pixel_2_XL_API_31` + `Pixel_9`；runId `20261125-183229-message-multibody-dda0c123`；bob 收到的 `bodies` 为 `[first, second]`，顺序与发送端一致 |

未覆盖：iOS 单设备、iOS 多设备，以及下方手测清单（原生 wrapper 无自动化测试）。Java 与 ObjC 改动已有编译证据和 CI 运行证据。

### 复现命令

需要登录的用例需要 `E2E_*` 环境变量或 `example/config.local.json`（见 `AGENTS.md`）。

```bash
cd react-native-chat-sdk/.worktree/5.2.0
bash scripts/ci/ci_test_local.sh android      # 或 ios；全部 entry
yarn report:api --platform android --script testing/single/cases/port_5_2_0_positive.json   # 单设备；反向用 port_5_2_0_negative.json
scripts/ci/multi.sh generate --platform android --target testing/target-rn.yaml \
  --case 5.2.0-multi-message-multibody-positive --instance <AVD1> --instance <AVD2>
scripts/ci/multi.sh all --cases <IMTO>/multi/config/cases.json --target testing/target-rn.yaml
```

建议在 example 的手测入口里再补以下实测的项（原生 wrapper 无自动化测试）：

1. **桥序列化假设**：`ChatMessage.body` 是类访问器、不可枚举，因此依赖 RN 桥只序列化自有可枚举属性，JS→native 只带 `bodies`。单元测试只证明了 `JSON.stringify` 层面，真实桥需要靠 `RN-MSG-017`（导入后读回、更新后读回）确认。
2. **`ChatManager.sendMultiBodyMessage`**（新增手测入口，参数为 `bodies` 列表，支持 `txt` / `custom`）：向另一账号发送文本加自定义体，核对返回消息的 `bodies` 长度为 2，并在接收端核对 `onMessagesReceived`。

3. **失败路径**：iOS 多体消息含 `cmd` 时构造返回 nil，Android 在发送期报错；两端都需确认走到的是错误回调（错误码 1 或原生错误码），而不是崩溃（见验收报告未匹配项 2）。
4. **`getConnectionState`**：登录后为 `connected`；登出或断网后状态；两端数值序不同，确认返回的是字符串而非数字。
5. **`disconnectNotifyThreshold`**：默认 10 秒；断网短于阈值恢复时不应回调 `onDisconnected`（需手动断网）。
6. 单体消息发送、接收、更新（旧路径）无回归，尤其 `updateMessage` 后 `body` 不变。

### 三类测试用例的分工与新增

| 类别                            | 目的                          | 5.2.0 新增                                                                                                                                                                                    |
| ------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI（`example/src/ci`）          | 回归                          | `RN-MSG-018`：向 peer 真实发送双文本体消息，核对确认消息与本地读回的 `bodies`；`RN-MSG-017`、`RN-AUTH-001`、`RN-APP-001` 断言                                                                 |
| 单设备（`testing/single/cases/*.json`）   | 平版：针对本版新增/修改的 API | `port_5_2_0_positive.json`（`getConnectionState`、双文本体发送并读回，3 步；发送结果与读回都用 `checks` 按下标断言 body 数量和顺序）；`port_5_2_0_negative.json`（`bodies` 为空，期望 `ChatError(-1)`，1 步）                                         |
| 多设备（`testing/multi/cases`） | 真实设备之间的收发            | `5.2.0-multi-message-multibody-positive`（取自 Flutter 仓）：alice 发双文本体，发送结果 `bodies` 长度 2，bob 的 `onMessagesReceived` 按 `bodies.0`/`bodies.1` 下标核对内容和顺序；agent 的 `sendMessage` 支持 `bodies`，消息 canonical JSON 在多体时输出 `bodies` |

- 图片等附件体的多体消息**不做自动化**：CI 可能在本地或云端运行，样本文件与路径不一致；只靠手测入口覆盖。
- 单设备 runner 的 `expect` 新增了最小 `checks`（`path` + `equals`/`length`），`port_5_2_0_positive.json` 用它断言 `bodies` 数量和顺序；`success` / `errorCode` 的旧语义不变。
- 空 `bodies` 在 JS 层构造消息时即抛 `ChatError(-1, 'A message requires at least one body.')`，不会到达 native；`-1` 也是脚本引擎的兜底码，需看日志里的描述确认。native 的数量上限（20）与类型组合限制的真实错误码未在设备上观察到，没有编造期望值。
- 多设备场景与 Flutter 仓逐字节一致；orchestrator 的 `agent-contract.md` 还没写 `sendMessage.bodies` 和消息 JSON 的 `bodies`（见 `testing/multi/README.md`）；新场景、`RN-MSG-018` 与两份单设备脚本已在 Android 真机环境运行通过（见上表），iOS 单设备与多设备未运行。

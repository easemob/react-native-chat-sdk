# 5.1.0 验证记录（2026-11-10）

依据：[03-implementation.md](03-implementation.md)。代码位于 `5.1.0`；用户已确认升级结果并授权统一提交。

## 静态验证

| 验证项 | 结果 | 备注 |
| --- | --- | --- |
| yarn install --immutable | ✅ | lockfile 未修改；有既有 peer dependency 警告 |
| yarn typecheck / yarn lint | ✅ | 首次发现新增代码返回值类型标注与格式问题，修复后 exit 0 |
| yarn check:circular:dpdm | ✅ | 无循环依赖 |
| yarn test --no-watchman --runInBand | ✅ | 19 suites / 117 tests；现有测试全部通过，未修改测试断言 |
| yarn bob build | ✅ | JS 模块及类型声明均生成成功 |
| git diff --check | ✅ | 无空白错误 |
| MT / dispatch / JSON 契约逐字抽查 | ✅ | 四层 getConversationsFromDB 一致，ObjC Value 2040 唯一；两个 options key 在 TS、Java、ObjC、auto_mode 一致 |
| 序列化与事件 | ✅ 静态 | 复用双端 EMCursorResult 会话 helper 与 ChatCursorResult 映射；34/52 仍为独立事件；群 configs.inviteNeedConfirm 读取 native getter |
| 版本与文档 | ✅ | SDK/example package、versionName、两处 MARKETING_VERSION 均 5.1.0；两端 build number 均 4；三处 native 依赖均 5.1.0；双语 CHANGELOG 与 API 概览已补齐 |

命令实证摘录：

```text
Test Suites: 19 passed, 19 total
Tests:       117 passed, 117 total
Circular Dependencies: no circular dependency was found
[module] Wrote files to lib/module
[typescript] Wrote definition files to lib/typescript
Native versions, example versions, unique ObjC value 2040 and option JSON keys: OK
```

## 原生构建与运行

| 验证项 | 结果 | 备注 |
| --- | --- | --- |
| Android example：yarn example build:android | ✅ | JDK 17、arm64-v8a、正式 Maven 5.1.0；BUILD SUCCESSFUL in 1m 12s |
| Android 现有无登录冒烟 | ✅ | emulator-5556；init + 7 steps 全过 |
| iOS SPM 依赖解析 | ✅ | Package.resolved：HyphenateChat_iOS 5.1.0，revision 2aacd520c3890e3b09d949ace6711db41f11931d |
| iOS example 构建（SPM） | ✅ | `bash scripts/ci/smoke_local.sh ios` 的 xcodebuild 阶段 BUILD SUCCEEDED |
| iOS 现有无登录冒烟（SPM） | ❌ 启动失败 | DYLD 缺失 `@rpath/HyphenateChat.framework/HyphenateChat`，App 在进入脚本前崩溃；等待用户确认修复方向 |
| 新增功能正反向运行用例（Android） | ✅ | 正向 15/15，逆向 2/2；init/login 均成功，沿用 success/errorCode；详情见下节 |
| 群信息多设备事件、聊天室收发配置行为 | ⏭️ 未执行 | 用户排除多账号/多设备协作场景；当前只验证单客户端，不以初始化成功代替聊天室行为验证 |

本地完整日志：`/tmp/rn-510-{prepare,bob,android-build,android-smoke,bundle,pods,ios-smoke}.log`；静态检查日志 `/tmp/rn-510-check-{0,1,2,3}.log`。设备证据在 worktree `build/reports/smoke-{android,ios}-api_test.log`（Git 忽略）。

## 验证边界

- 现有 Jest 测试全部通过；iOS 运行冒烟发现动态库嵌入问题，已按用户要求询问 Flutter 是否同样遇到，未擅自修改集成方式。新增分页与群配置用例已获授权；不修改测试执行器或断言 DSL。
- Android native 5.1.0 源码修复了旧版缺失消息回执崩溃，但本任务未运行该错误路径，也未修改既有回执 wrapper/断言；不声明旧问题已经验收关闭。
- iOS thumbnailSecretKey 本轮标记废弃（未删除），RN 5.0 已移除旧公开属性，无需重新添加。
- 当前会话手动执行 skill gate，hook 信任状态不可验证。

## 契约抽查输出

```text
src/__internal__/Consts.ts: getConversationsFromDB OK
modules/java/com/chatsdk/common/ExtSdkMethodType.java: getConversationsFromDB OK
modules/objc/common/ExtSdkMethodTypeObjc.h: getConversationsFromDB OK
modules/cpp/common/ExtSdkMethodType.cpp: getConversationsFromDB OK
package.json: 5.1.0 OK
example/package.json: 5.1.0 OK
Native versions, example versions, unique ObjC value 2040 and option JSON keys: OK
```

## iOS 启动失败证据与阶段四状态

- 2026-11-10 16:53:32，iPhone 16 Pro / iOS 18.2 模拟器启动时 `EXC_CRASH / SIGABRT`。
- crash：`~/Library/Logs/DiagnosticReports/ChatSdkExample-2026-11-10-165335.ips`，`termination.namespace=DYLD`，`indicator=Library missing`。
- `Library not loaded: @rpath/HyphenateChat.framework/HyphenateChat`，引用者为 App 内的 `Frameworks/ChatSdk.framework/ChatSdk`。
- App 的 Frameworks 目录有 ChatSdk.framework，但没有 HyphenateChat.framework，也没有 aosl.framework。SPM package/二进制已解析并参与编译，最终嵌入链路仍需排查。
- `Documents/api_test.log` 不存在，故不能归因于分页接口或其断言；测试脚本未开始。
- 当前 `Podfile.lock` 与 Xcode 链接引用为本轮 `USE_FRAMEWORKS=dynamic bundle exec pod install` 生成状态，便于复现；尚未切换 CocoaPods 路径或添加自定义复制步骤。
- 手动 `porting_guard.sh gate react-native <worktree>`：exit 0，stdout/stderr 为空。此机械检查不覆盖运行时依赖嵌入，**阶段四未通过，验收未完成**。

## 5.1.0 新增正反向脚本

- 正向：[port_5_1_0_positive.json](../../../example/ci/port_5_1_0_positive.json)，15 步：创建邀请确认 true 的群、服务端查询、更新为 false 并查询；另建 false 的群并查询；向两个自有群各发一条消息，形成分页数据；默认参数、第一页（1 条）、上一页 cursor 续页、100 条页大小；解散两个群并仅删除本轮临时会话。
- 逆向：[port_5_1_0_negative.json](../../../example/ci/port_5_1_0_negative.json)，2 步：非法 cursor → 110；不存在的群更新 InviteNeedConfirm → 600。两份脚本独立运行，逆向不依赖正向数据。
- 补充既有 SDK API 的 example 注册：`ChatGroupManager.fetchGroupInfoWithoutMembersFromServer`。不修改执行器、报告器及 success/errorCode 断言逻辑。
- 正向成功只表示 API 调用成功。字段值、分页结果与 cursor 从本次报告人工核对，不声称具备自动字段/排序断言；不为非法页大小猜测错误码。
- `autoLoadConversations=false` 是分页初始化前提；`enableChatroomConversation=false` 本轮随配置传入，但不代表已验证聊天室收发行为。布尔开关没有独立的非法输入用例。多设备 GROUP_UPDATE 事件按用户要求排除。

运行前在 Git 忽略的 `example/config.local.json` 中配置一个可用测试账号，在既有 `chatOptions` 中设置：

```json
{
  "autoLoadConversations": false,
  "enableChatroomConversation": false
}
```

保留当前测试环境其余配置，运行 `yarn env:gettoken`。脚本不设置 `init`，通过既有 env.ts 生成机制读取配置；不要在 `script.init` 中写 `$config` 引用，该位置不解析引用。

```sh
yarn report:api --platform android --device emulator-5556 --script example/ci/port_5_1_0_positive.json
yarn report:api --platform android --device emulator-5556 --script example/ci/port_5_1_0_negative.json
```

实际报告保存在 Git 忽略的 `build/reports/5.1.0/` 下。若准备步骤失败，检查报告中的创建结果并清理该次成功创建的群；不要删除既有会话或改用旧群作为可销毁数据。

### 2026-11-10 Android 实际结果

| 脚本 | 报告目录（`build/reports/5.1.0/` 下） | 结果 | 清理 |
| --- | --- | --- | --- |
| 正向 | `20261110092027-android-emulator-5556` | 15/15 passed，init/login 成功，退出码 0 | 两个 destroyGroup 与临时会话 deleteConversations 全部成功 |
| 逆向 | `20261110092201-android-emulator-5556` | 2/2 passed，init/login 成功，退出码 0 | 未创建资源 |

日志人工核对（不属于新增自动断言）：

- `group_true` / `fetch_true` 的 `configs.inviteNeedConfirm=true`；`update_false` / `fetch_updated_false` 均为 false；直接以 false 创建的 `group_false` / `fetch_false` 也为 false。未复现群配置值异常。
- 默认参数与 pageSize=100 均返回 7 条会话、空 cursor；pageSize=1 第一页与续页各返回一条不同的本轮群会话，两页 cursor 非空；本轮较晚发送消息的群在前。没有修改或清理其余 5 条既有会话。未验证所有页遍历、置顶优先级或同时间 ID 排序。
- 非法 cursor 返回 `110: invalid cursor for getConversationsFromDB`；不存在的群更新返回 `600: do not find this group`，与预期一致。逆向 `script.done.failed=2` 是原始 API 失败数；报告按预期错误码判定为 2/2 通过。
- 失败记录：本轮 Android 两份脚本没有失败步骤、没有崩溃；iOS 仍是上文已记录的启动缺库阻塞，本轮未运行新脚本，不能宣称双平台运行验证通过。
- Flutter 已完成升级；对照其 `docs/porting/5.1.0/2026-11-09-test-verification.md` 中群配置 true→false 与非法 cursor 记录，Android 本次结果一致。Flutter 的多设备场景不纳入 RN 本轮范围。

增量检查：`yarn typecheck`、`yarn lint`、JSON/API 注册名/ID/前置引用检查、`git diff --check` 均通过。`scripts/ci/` 无修改；没有更改已有测试断言，也没有重复运行与本次 example 注册无关的全部 SDK 单测。

本轮手动 skill gate：`printf '{}' | bash /Users/asterisk/Codes/zuoyu_rn/.agents/skills/platform-sdk-porting-v2/hooks/porting_guard.sh gate react-native "$PWD"`，exit 0，stdout/stderr 为空。

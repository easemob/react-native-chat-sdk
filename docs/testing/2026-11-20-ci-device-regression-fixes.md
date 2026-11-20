# 1.21.0 CI 设备回归修复

## 来源与范围

- 失败运行：`easemob/react-native-chat-sdk` 的 Actions run `44705169878`，源提交 `dd54a32`，分支 `1.21.0`。
- 修复在 `1.21.0` worktree 完成。用户随后授权提交并推送至全部远端，再合并到 `dev` 并推送；不修改 `5.1.0`，不主动触发远端工作流。
- 用户确认：`RN-CONV-005` 是 native 异步处理未读状态与同步读数之间的已知问题，用有边界的范围断言临时兼容，不加固定延迟；群配置和错误码问题修复 SDK，不能修改断言掩盖。

## 修复约定

| 场景 | 处理 |
| --- | --- |
| iOS REST fixture 网络失败 | 原生日志确认 `NSURLErrorDomain -1022` 拒绝 HTTP。已对同一环境主机做无凭据 HTTPS HEAD，证书校验通过、HTTP 200、无跳转。CI 入口在凭据回退后统一 HTTPS，取 token 与设备配置共用地址；ATS 不放宽。 |
| RN-CONV-005 | 标记已知 native 异步问题；仅未读快照允许整数 `[0, 2]`，保留消息顺序、内容和 ID 的严格断言，不延迟等待。 |
| RN-CONV-019 | 用 `markAllMessagesAsRead` 建立、清理本地未读状态；回执发送不承担本地清零职责；退出时验证基线恢复。 |
| RN-CONV-012 / RN-MSG-010 | 两端 SDK 的会话/manager 更新路径在本地消息不存在时返回消息错误 `500`；测试继续精确断言 `500` 和存储不变，不接受任意异常。其他缺失消息场景不扩大改动。 |
| RN-GROUP-008 | iOS 群详情改从 `settings.IsInviteNeedConfirm` 读取，不再使用 `isMemberAllowToInvite`。Android 尚未修复，原因见下节。保留 `true` / `false` 双值、服务端拉取和本地读取断言。 |

## Android 待确认事项

已检查 `SDK_4.25.1` 源码，并下载 Maven `io.hyphenate:hyphenate-chat:4.25.1` AAR，通过 `javap` 独立核对实际字节码：

- `EMGroup` 没有公开的邀请确认 getter，也没有 group options/settings 读取接口；不能使用 5.1 才提供的 API。
- 正确值位于 `EMAGroupSetting.inviteNeedConfirm()`，但需经 package-private `EMBase` 的 protected `emaObject` 访问。
- 当前 Android 的错误映射仍保留，不能声称 `RN-GROUP-008` 已修好。
- 首选由 native 暴露正确的公开 getter。若需保持现有 native 版本，可以评估增加同包兼容桥接；该方式不需要反射，但会依赖 native 内部实现，需要用户确认后再落地。未自行采用反射、同包桥接或升级依赖。

## 验证记录

- `yarn typecheck`、`yarn lint`：通过。
- 全量 Jest：26 套件、230 项通过，含新增 16 项会话用例宿主回归；这些 mock 验证范围断言、内容检查和清理流程，不验证 native 行为。
- `yarn test:ci-scripts`：50 项通过，含 HTTPS 升级、完整凭据回退、token/设备地址一致性及无效地址不泄密的检查。
- case mapping、循环依赖、shell/JS 语法和 diff 检查：通过。
- Android `:react-native-chat-sdk:compileDebugJavaWithJavac`：使用 JDK 17 通过。首次离线尝试因缺少 4.25.1 AAR 失败；获批下载既定依赖后编译通过，未改依赖版本。
- 三个已修改 ObjC 文件：对照已安装的 4.25.0 simulator Pods 做 `clang -fsyntax-only`，通过，有既有警告。
- 完整 native App 构建、设备回归和远端 Actions：尚未运行。Android 群字段访问方案待确认，不把宿主测试通过描述为设备问题已闭环。

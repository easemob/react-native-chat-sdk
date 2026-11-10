# 5.1.0 实现记录（2026-11-10）

依据：[02-contract.md](02-contract.md)。

## 实现覆盖

| id | 结果 |
| --- | --- |
| conversation_page | implemented：TS Manager、MT 常量（TS/Java/ObjC/C++）、双端 dispatch/wrapper、example 注册项 |
| options_chatroom_conversation | implemented：withAppKey/withAppId、双端 options 序列化/反序列化、auto_mode 白名单 |
| options_auto_load | implemented：同上，默认 true，分页要求显式 false |
| group_invite_confirm | implemented：Android configs JSON 补真实 getter；iOS/TS 复用已有实现 |
| multi_device_group_update | implemented：现有 34/52 映射已覆盖，仅修正文档 |
| options_data_sync_default | implemented：保留 native 默认策略，更新 TS 注释与双语 CHANGELOG |
| options_sync_ws_host / options_sync_ws_port | skip：RN 无对应封装，无需删除 |
| options_brand_domain | skip：KI-107 内部开关，环信不设置 |
| image_thumbnail_secret | skip：native 尚存但废弃；RN 5.0 已移除旧属性 |
| search_keyword_limits | skip：RN 注释已为 120/120/5 |

SDK/example package.json、Android versionName、iOS MARKETING_VERSION 均 5.1.0；Android versionCode、iOS CURRENT_PROJECT_VERSION 均从 3 增至 4。src/version.ts 与 CMakeLists.txt 由 yarn prepare 生成。未修改 Flutter 变体目录。

## 阶段三门禁

| 命令 | 结果 |
| --- | --- |
| yarn typecheck | exit 0（修复新增方法返回值 unknown 标注后） |
| yarn lint | exit 0（格式修复后） |
| yarn check:circular:dpdm | exit 0，无循环依赖 |
| yarn test --no-watchman --runInBand | exit 0，19 suites / 117 tests 通过；没有新增或调整断言 |
| yarn bob build | exit 0，module/typescript 均成功 |
| git diff --check | exit 0 |
| porting_guard.sh gate react-native <worktree> | exit 0，stdout/stderr 为空 |

## 遗留与推断

- cursor/pageSize 默认值采用 RN 习惯 ''/20，未添加有效性过滤。
- 后续验证已完成双端 example 编译；Android 新增正向 15/15、逆向 2/2 通过，iOS 运行受启动缺库阻塞。新增脚本沿用 success/errorCode，不修改测试架构；详细记录见 [04-verification.md](04-verification.md)。
- hook 文件已安装，当前会话继续采用手动门禁；所有变更未提交。

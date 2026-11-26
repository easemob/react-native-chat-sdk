# CI 编排层

CI 只负责调用：各测试分类的执行入口在 `testing/` 下（见 [testing/README.md](../testing/README.md)），本地与 CI 调用同一个入口。本目录只放跨分类或 CI 专属的内容。

## 调用矩阵

| 触发                                                                                        | workflow / job                                                     | 调用                                                                                                                       | 覆盖                                                                              |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| PR（任意 base）；push 到 `dev`/`1.x`/`5.x`（忽略 `dailylog/**`、`docs/**`、`*.md`）；手动   | `ci.yml` / `quality`                                               | `bash ci/run_quality.sh`                                                                                                   | typecheck、lint、① 单元与契约测试、① 测试工具自测、② 用例登记表静态检查、循环依赖 |
| 同上                                                                                        | `ci.yml` / `android-build`、`ios-build`                            | 构建 + `scripts/scan-deprecated-*.sh`                                                                                      | 构建与 native deprecated API 扫描（不属于测试分类）                               |
| 每日 19:37 UTC（只在默认分支 `dev` 生效；`5.x` 由 `dev` 上的 `ci-dispatch.yml` 派发）；手动 | `ci-device.yml` / `android-test-logged-out`、`ios-test-logged-out` | `bash testing/regression/ci_test_local.sh <platform> logged_out`                                                           | ② 未登录入口                                                                      |
| 同上                                                                                        | `ci-device.yml` / `android-test-logged-in`、`ios-test-logged-in`   | `bash testing/regression/ci_test_local.sh <platform> logged_in_base,logged_in_group,logged_in_contact,logged_in_user_info` | ② 四个登录入口                                                                    |

③ 单设备、④ 多设备目前不由 CI 调用，只在本地执行。

## 新增 CI 调用的规则

1. workflow 直接调用分类的执行入口，不在本目录为每个分类再包一层转发脚本。
2. 只有跨分类的门禁，或 CI 专属的准备逻辑（如 runner 上启动多台模拟器、准备账号），才在本目录新增文件。
3. 逻辑放在脚本里而不是内联在 YAML 里，保证本地运行与 CI 一致。
4. 新增调用后同步更新上面的调用矩阵。

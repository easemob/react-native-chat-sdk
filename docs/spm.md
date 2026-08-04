# iOS 集成方式：CocoaPods 与 Swift Package Manager

ChatSdk 的 iOS 端同时支持两种 `HyphenateChat` 依赖集成方式，由 `ChatSdk.podspec` 自动选择：

| 条件 | 集成方式 |
| --- | --- |
| React Native >= 0.75 且 `USE_FRAMEWORKS=dynamic pod install` | Swift Package Manager（`spm_dependency`） |
| 其他情况（RN < 0.75、静态链接、默认 `pod install`） | CocoaPods（`HyphenateChat` pod） |

## CocoaPods（默认）

无需任何额外配置，保持现有流程：

```sh
cd ios && pod install
```

SDK 依赖 `HyphenateChat ~> 4.19.1` pod。注意：CocoaPods trunk 将于 2026-12-02 进入只读状态，已发布的版本仍可 `pod install`，但无法再从 trunk 获取新版本。

## Swift Package Manager（可选）

要求：

- React Native >= 0.75（提供 `spm_dependency` 帮助方法）
- 动态链接 frameworks

在 App 的 `ios` 目录执行：

```sh
USE_FRAMEWORKS=dynamic pod install
```

此时 podspec 会通过 `spm_dependency` 把官方 SPM 包加入 Xcode 工程：

- 包地址：<https://github.com/easemob/HyphenateChat_iOS.git>
- product：`HyphenateChat`
- 版本约束：`upToNextMinorVersion`，最低 `4.19.1`
- `ShengwangInfra_iOS` 由该 SPM 包自动带入

注意事项：

- `pod install` 后请重新打开 `.xcworkspace`，让 Xcode 刷新 SPM 包状态。
- 首次安装需要联网下载 SPM 包及其二进制 xcframework。
- 静态链接（默认或 `USE_FRAMEWORKS=static`）下请勿使用 SPM 路径，可能遇到 duplicate symbols / undefined symbols 等链接错误；此时会自动回退到 CocoaPods 方式。
- 源码中的 `#import <HyphenateChat/EMClient.h>` 等导入方式在两种集成方式下均无需修改。

## 选择逻辑

`ChatSdk.podspec` 中的判断逻辑：

```ruby
if defined?(:spm_dependency) && ENV['USE_FRAMEWORKS'] == 'dynamic'
  spm_dependency(s, ...)
else
  s.dependency 'HyphenateChat', '~> 4.19.1'
end
```

即：只有宿主 App 明确使用动态链接且 RN 版本支持时才走 SPM，其余一律保持 CocoaPods 行为，对现有使用者无破坏性变更。

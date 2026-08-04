require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ChatSdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/AsteriskZuo/react-native-chat-sdk.git", :tag => "#{s.version}" }

  s.source_files = ['ios/**/*.{h,m,mm}', 'modules/cpp/**/*.{h,cpp,mm}', 'modules/objc/**/*.{h,m,mm}']
  s.private_header_files = ['modules/cpp/**/*.h']
  s.exclude_files = ['modules/cpp/java/**/*', 'modules/cpp/android/**/*', 'modules/objc/flutter/**/*']

  s.xcconfig = {
    "OTHER_LDFLAGS": "-ObjC",
    'GCC_PREPROCESSOR_DEFINITIONS' => [
      "OBJC_LANGUAGE",
      "REACT_NATIVE_ARCHITECTURE",
      "IOS_PLATFORM"
    ]
  }

  s.pod_target_xcconfig = {
    "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    'HEADER_SEARCH_PATHS' => [
      "$(PODS_ROOT)/boost",
      "$(PODS_TARGET_SRCROOT)/modules/cpp/common",
      "$(PODS_TARGET_SRCROOT)/modules/cpp/core",
      "$(PODS_TARGET_SRCROOT)/modules/cpp/objc",
      "$(PODS_TARGET_SRCROOT)/modules/objc/common",
      "$(PODS_TARGET_SRCROOT)/modules/objc/dispatch",
      "$(PODS_TARGET_SRCROOT)/modules/objc/rn"
    ]
  }

  # HyphenateChat can be integrated in two ways:
  # - Swift Package Manager (opt-in): React Native >= 0.75 and the host app
  #   installed with dynamic frameworks:
  #     USE_FRAMEWORKS=dynamic pod install
  # - CocoaPods (default, fallback): any other setup, including React
  #   Native < 0.75 and static linkage.
  if defined?(:spm_dependency) && ENV['USE_FRAMEWORKS'] == 'dynamic'
    spm_dependency(
      s,
      url: 'https://github.com/easemob/HyphenateChat_iOS.git',
      requirement: { kind: 'upToNextMinorVersion', minimumVersion: '4.19.1' },
      products: ['HyphenateChat']
    )
  else
    s.dependency 'HyphenateChat', '~> 4.19.1'
  end

  install_modules_dependencies(s)
end

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "react-native-chat-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/easemob/react-native-chat-sdk.git", :tag => "#{s.version}" }

  s.source_files = ['ios/**/*.{h,m,mm}', 'native_src/cpp/**/*.{h,cpp,mm}', 'native_src/objc/**/*']
  s.private_header_files = ['native_src/cpp/**/*.h']
  s.exclude_files = ['native_src/cpp/java/**/*', 'native_src/cpp/android/**/*', 'native_src/objc/flutter/**/*']

  s.dependency "React-Core"
  s.dependency 'HyphenateChat','4.1.1'

  s.xcconfig = {
    "OTHER_LDFLAGS": "-ObjC",
    'GCC_PREPROCESSOR_DEFINITIONS' => [
      "OBJC_LANGUAGE",
      "REACT_NATIVE_ARCHITECTURE",
      "IOS_PLATFORM"
    ]
  }

  # Don't install the dependencies when we run `pod install` in the old architecture.
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    puts "log: enable rct new arch."
    s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig    = {
      "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
      'HEADER_SEARCH_PATHS' => [
        "$(PODS_ROOT)/boost",
        "$(PODS_TARGET_SRCROOT)/native_src/cpp/common",
        "$(PODS_TARGET_SRCROOT)/native_src/cpp/core",
        "$(PODS_TARGET_SRCROOT)/native_src/cpp/objc",
        "$(PODS_TARGET_SRCROOT)/native_src/objc/common",
        "$(PODS_TARGET_SRCROOT)/native_src/objc/dispatch",
        "$(PODS_TARGET_SRCROOT)/native_src/objc/rn"
      ]
    }
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
  else
    puts "log: disable rct new arch."
    s.pod_target_xcconfig    = {
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
      'OTHER_LDFLAGS' => [
        '-Wunused-function',
        '-Wunreachable-code',
        '-Wunused-variable'
      ],
      'HEADER_SEARCH_PATHS' => [
        "$(PODS_TARGET_SRCROOT)/native_src/cpp/common",
        "$(PODS_TARGET_SRCROOT)/native_src/cpp/core",
        "$(PODS_TARGET_SRCROOT)/native_src/cpp/objc",
        "$(PODS_TARGET_SRCROOT)/native_src/objc/common",
        "$(PODS_TARGET_SRCROOT)/native_src/objc/dispatch",
        "$(PODS_TARGET_SRCROOT)/native_src/objc/rn"
      ]
   }
  end
end

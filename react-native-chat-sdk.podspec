require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-chat-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "10.0" }
  s.source       = { :git => "https://github.com/easemob/react-native-chat-sdk.git", :tag => "#{s.version}" }

  s.source_files = ['ios/**/*.{h,m,mm}', 'native_src/cpp/**/*.{h,cpp,mm}', 'native_src/objc/**/*']
  s.private_header_files = ['native_src/cpp/**/*.h']
  s.exclude_files = ['native_src/cpp/java/**/*', 'native_src/cpp/android/**/*', 'native_src/objc/flutter/**/*']

  s.dependency "React-Core"
  s.dependency 'HyphenateChat','3.9.5'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++11",
    # 'VALID_ARCHS[sdk=iphonesimulator*]' => 'x86_64',
    # "ENABLE_BITCODE": "NO",
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
  s.xcconfig = {
    "OTHER_LDFLAGS": "-ObjC",
    'GCC_PREPROCESSOR_DEFINITIONS' => [
      "OBJC_LANGUAGE",
      "REACT_NATIVE_ARCHITECTURE",
      "IOS_PLATFORM"
    ]
  }
end

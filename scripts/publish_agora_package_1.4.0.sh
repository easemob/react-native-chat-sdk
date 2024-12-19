#!/bin/bash

# readme
#
# sh publish_agora_package.sh [original-version] [target-version]
#
# See `npm help install`
#
# For example:
# sh '/Users/asterisk/Codes/rn/react-native-chat-sdk-1.3.1/scripts/publish_agora_package_1.4.0.sh' 1.4.0 1.3.1-beta.2
#

function now() {
  local lv_var=$1
  eval "$lv_var='$(date +%Y-%m-%d\ %H:%M:%S)'"
}

function log() {
  # high | green
  local FOREGROUND=32
  local FONT=5
  now CURRENT_DATETIME
  echo "[$CURRENT_DATETIME] \\033[${FOREGROUND};${FONT}m${@}\\033[0m"
}

current_dir=$(
  cd "$(dirname "$0")"
  pwd
)
output_dir=${current_dir}/../build/agora

# read -rsn1 -p "Enter any key continue..."

mkdir -p "${output_dir}"

new_package_name=react-native-agora-chat
orignialVersion=$1
targetVersion=$2

log package name: "${new_package_name}"
log package target version: "${targetVersion}"
log package original version: "${orignialVersion}"
log package output directory: "${output_dir}"

# todo: 判断工具是否存在 `npm`, `jq`, `tar`
if ! command -v npm &>/dev/null; then
  echo "npm could not be found"
  exit 1
fi
if ! command -v jq &>/dev/null; then
  echo "jq could not be found"
  exit 1
fi
if ! command -v tar &>/dev/null; then
  echo "tar could not be found"
  exit 1
fi

# todo: 打包 `npm pack` 生成压缩包
npm pack

# todo: 解压缩包
tar -zxvf react-native-chat-sdk-"${orignialVersion}".tgz

# todo: 修改 package.json
pushd package || exit

# 修改 name
jq '.name = "react-native-agora-chat"' package.json >tmp.json && mv tmp.json package.json
# 修改 version
jq --arg version "${targetVersion}" '.version = $version' package.json >tmp.json && mv tmp.json package.json
# 修改 types
jq --arg types "lib/typescript/src/index.d.ts" '.types = $types' package.json >tmp.json && mv tmp.json package.json
# 修改 repository
jq '.repository = "https://github.com/AgoraIO/Agora-Chat-API-Examples"' package.json >tmp.json && mv tmp.json package.json
# 修改 bugs.url
jq '.bugs.url = "https://github.com/AgoraIO/Agora-Chat-API-Examples"' package.json >tmp.json && mv tmp.json package.json
# 修改 homepage
jq '.homepage = "https://github.com/AgoraIO/Agora-Chat-API-Examples"' package.json >tmp.json && mv tmp.json package.json
# 删除 scripts.prepare
jq 'del(.scripts.prepare)' package.json >tmp.json && mv tmp.json package.json
# 删除 README.zh.md
rm -f README.zh.md

# todo: 修改 README.md
# 替换 `react-native-chat-sdk` 为 `react-native-agora-chat`
sed -i '' 's/https:\/\/docs-im.easemob.com\/ccim\/rn\/quickstart/https:\/\/docs.agora.io\/en\/agora-chat\/get-started\/get-started-sdk?platform=react-native/g' ./README.md
sed -i '' 's/https:\/\/github.com\/easemob\/react-native-chat-sdk\/tree\/dev\/examples//g' ./README.md
sed -i '' 's/react-native-chat-sdk/react-native-agora-chat/g' ./README.md

# todo: 修改 版本号
# 替换 `1.4.0` 为 `1.3.1-beta.2`
sed -i '' "s/$orignialVersion/$targetVersion/g" ./lib/typescript/src/version.d.ts
sed -i '' "s/$orignialVersion/$targetVersion/g" ./lib/module/version.js
sed -i '' "s/$orignialVersion/$targetVersion/g" ./lib/commonjs/version.js
sed -i '' "s/$orignialVersion/$targetVersion/g" ./src/version.ts

# todo: 修改 LICENSE
# 替换 `easemob` 为 `agora`
sed -i '' 's/easemob/agora/g' ./LICENSE

# todo: 拷贝文件 `modules/cpp/CMakeLists.txt.rn` 为 `modules/cpp/CMakeLists.txt`
cp modules/cpp/CMakeLists.txt.rn modules/cpp/CMakeLists.txt
# todo: 删除文件 `modules/cpp/CMakeLists.txt.rn`
rm -f modules/cpp/CMakeLists.txt.rn
# todo: 删除文件 `modules/cpp/CMakeLists.txt.flutter`
rm -f modules/cpp/CMakeLists.txt.flutter

# todo: 将 `package` 添加到压缩包 `${new_package_name}-${targetVersion}.zip`
if [ "${targetVersion}" == "" ]; then
  zip -r -1 -q -b ${output_dir} ${new_package_name}.zip *
  mv ${new_package_name}.zip ${output_dir}
else
  zip -r -1 -q -b ${output_dir} ${new_package_name}-${targetVersion}.zip *
  mv ${new_package_name}-${targetVersion}.zip ${output_dir}
fi

# todo: 返回上级目录
popd || exit

# todo: 移除不需要的文件以及文件夹
rm -rf package

# todo: 删除 压缩包
rm -f react-native-agora-chat-1.4.0.tgz

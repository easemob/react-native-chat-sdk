#!/bin/bash

# readme
#
# sh publish_agora_package.sh [suffix] [version]|[tag] [directory]
# See `npm help install`
# [suffix]: (optional) generate package name's suffix
# For example: suffix is 1.0.5-rc.1, package name is react-native-agora-chat-1.0.5-rc.1
# [version]: (optional) specified version
# [tag]: (optional) package tag, see `npm help dist-tag`, common ones are alpha, beta, rc and latest.
# [directory]: (optional) specified output zip directory
#
# download latest release version
# sh publish_agora_package.sh 0.4.5 latest
# or
# sh publish_agora_package.sh 0.4.5
#
# download tag latest version
# sh publish_agora_package.sh 1.0.5 rc
#
# download specified version
# sh publish_agora_package.sh 0.4.4 0.4.4
#
# any directory execute this bash script is ok.
# For example: sh publish_agora_package.sh
#
# npm package version list: `npm dist-tag react-native-chat-sdk`
#
# npm pack

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

old_package_name=react-native-chat-sdk
new_package_name=react-native-agora-chat
suffix=$1
tagOrVersion=$2
# output_dir=$3

log package name: "${new_package_name}"
log package zip suffix: "${suffix}"
log package tag or version: "${tagOrVersion}"
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
tar -zxvf react-native-chat-sdk-1.4.0.tgz

# todo: 修改 package.json
pushd package || exit

# 修改 name
jq '.name = "react-native-agora-chat"' package.json >tmp.json && mv tmp.json package.json
# 修改 version
jq --arg version "${tagOrVersion}" '.version = $version' package.json >tmp.json && mv tmp.json package.json
# 修改 types
jq --arg types "lib/typescript/src/index.d.ts" '.types = $types' package.json >tmp.json && mv tmp.json package.json
# 修改 repository
jq '.repository = "https://github.com/AgoraIO/Agora-Chat-API-Examples"' package.json >tmp.json && mv tmp.json package.json
# 修改 bugs.url
jq '.bugs.url = "https://github.com/AgoraIO/Agora-Chat-API-Examples"' package.json >tmp.json && mv tmp.json package.json
# 修改 homepage
jq '.homepage = "https://github.com/AgoraIO/Agora-Chat-API-Examples"' package.json >tmp.json && mv tmp.json package.json
# 删除 README.zh.md
rm -f README.zh.md

# todo: 修改 README.md
# 替换 `react-native-chat-sdk` 为 `react-native-agora-chat`
sed -i '' 's/https:\/\/docs-im.easemob.com\/ccim\/rn\/quickstart/https:\/\/docs.agora.io\/en\/agora-chat\/get-started\/get-started-sdk?platform=react-native/g' ./README.md
sed -i '' 's/https:\/\/github.com\/easemob\/react-native-chat-sdk\/tree\/dev\/examples//g' ./README.md
sed -i '' 's/react-native-chat-sdk/react-native-agora-chat/g' ./README.md

# todo: 修改 LICENSE
# 替换 `easemob` 为 `agora`
sed -i '' 's/easemob/agora/g' ./LICENSE

# todo: 拷贝文件 `native_src/cpp/CMakeLists.txt.rn` 为 `native_src/cpp/CMakeLists.txt`
cp native_src/cpp/CMakeLists.txt.rn native_src/cpp/CMakeLists.txt
# todo: 删除文件 `native_src/cpp/CMakeLists.txt.rn`
rm -f native_src/cpp/CMakeLists.txt.rn
# todo: 删除文件 `native_src/cpp/CMakeLists.txt.flutter`
rm -f native_src/cpp/CMakeLists.txt.flutter

# todo: 将 `package` 添加到压缩包 `${new_package_name}-${suffix}.zip`
if [ "${suffix}" == "" ]; then
  zip -r -1 -q -b ${output_dir} ${new_package_name}.zip *
  mv ${new_package_name}.zip ${output_dir}
else
  zip -r -1 -q -b ${output_dir} ${new_package_name}-${suffix}.zip *
  mv ${new_package_name}-${suffix}.zip ${output_dir}
fi

# todo: 返回上级目录
popd || exit

# todo: 移除不需要的文件以及文件夹
rm -rf package

# todo: 删除 压缩包
rm -f react-native-agora-chat-1.4.0.tgz

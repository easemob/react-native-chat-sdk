#!/bin/bash
###############################################################################
###############################################################################
###############################################################################
# readme
# usage: sh publish_agora_package_3.0.0.sh <target_version> <target_type> <output_dir> <ios_current_version> <ios_new_version> <android_version> <android_new_version>
# example: sh scripts/publish_agora_package_3.0.0.sh 2.0.0 agora
# example: sh scripts/publish_agora_package_3.0.0.sh 1.3.2 shengwang "" 4.12.0 1.3.2 4.12.0 1.3.2
###############################################################################
###############################################################################
###############################################################################

# read -rsn1 -p "Enter any key continue..."

function now() {
  local lv_var=$1
  eval "$lv_var='$(date +%Y-%m-%d\ %H:%M:%S)'"
}

function log() {
  # high | green
  local FOREGROUND=32
  local FONT=5
  now CURRENT_DATETIME
  echo "[$CURRENT_DATETIME] \\033[${FOREGROUND};${FONT}m${*}\\033[0m"
}

current_dir=$(
  cd "$(dirname "$0")" || exit
  pwd
)

# 读取参数
## 第一个参数：目标版本号， 原始版本号通过 `package.json` 文件获取
target_version=$1
original_version=$(cat package.json | jq -r '.version')
## 第二个参数：目标类型: `agora`, `shengwang`
target_type=$2
### 判断参数是否为空
if [ -z "${target_type}" ]; then
  log "target type is required"
  exit 1
fi
### 并且判断参数是否合法（agora|shengwang），提示错误信息并且推出脚本
if [ "${target_type}" != "agora" ] && [ "${target_type}" != "shengwang" ]; then
  log "target type must be 'agora' or 'shengwang'"
  exit 1
fi

## 第三个参数：保存路径， 需要创建和清理
output_dir=$3
### 判断参数是否为空，如果为空则使用默认路径
output_dir=${output_dir:-${current_dir}/../build/agora}
### 如果目录不存在，则创建目录
if [ ! -d "${output_dir}" ]; then
  mkdir -p "${output_dir}"
fi

## 第四个参数：ios 当前版本号
ios_current_version=$4
## 第五个参数：ios 新版本号
ios_new_version=$5
## 第六个参数：android 当前版本号
android_current_version=$6
## 第七个参数：android 新版本号
android_new_version=$7

### 输出参数信息
log "package target version: ${target_version}"
log "package original version: ${original_version}"
log "package target type: ${target_type}"
log "package output directory: ${output_dir}"
log "ios current version: ${ios_current_version}"
log "ios new version: ${ios_new_version}"
log "android current version: ${android_current_version}"
log "android new version: ${android_new_version}"

# 打包npm包
log "npm pack..."
npm pack >/dev/null 2>&1

# 解压npm包
log "tar -zxf react-native-chat-sdk-${original_version}.tgz -C ${output_dir}"
## 解压npm包到 output_dir 目录
if [ -d "${output_dir}/package" ]; then
  rm -rf "${output_dir}"/package
fi
tar -zxf react-native-chat-sdk-"${original_version}".tgz -C "${output_dir}"
## 修改解压后的目录名称 为 react-native-${target_type}-chat-${target_version}
target_dir="react-native-${target_type}-chat-${target_version}"
if [ -d "${output_dir}/${target_dir}" ]; then
  rm -rf "${output_dir:?}/${target_dir}"
fi
mv "${output_dir}"/package "${output_dir}/${target_dir}"

# 修改内容
log "modify content..."
## 进入解压后的目录 "${output_dir}/${target_dir}"
pushd "${output_dir}/${target_dir}" >/dev/null 2>&1 || exit

###############################################################################
###############################################################################
###############################################################################

## 修改 package.json 文件
### 修改 name 字段为 `react-native-${target_type}-chat`
jq '.name = "react-native-'${target_type}'-chat"' package.json >tmp.json && mv tmp.json package.json
### 修改 version 字段为 target_version
jq '.version = "'${target_version}'"' package.json >tmp.json && mv tmp.json package.json
### 修改 repository 字段为 `https://www.npmjs.com/package/react-native-${target_type}-chat
jq '.repository = "https://www.npmjs.com/package/react-native-'${target_type}'-chat"' package.json >tmp.json && mv tmp.json package.json
### 修改 bugs.url 字段为 `https://www.npmjs.com/package/react-native-${target_type}-chat
jq '.bugs.url = "https://www.npmjs.com/package/react-native-'${target_type}'-chat"' package.json >tmp.json && mv tmp.json package.json
### 修改 homepage 字段为 `https://www.npmjs.com/package/react-native-${target_type}-chat
jq '.homepage = "https://www.npmjs.com/package/react-native-'${target_type}'-chat"' package.json >tmp.json && mv tmp.json package.json
### 删除 scripts.prepare 字段
jq 'del(.scripts.prepare)' package.json >tmp.json && mv tmp.json package.json

## 修改 README.zh.md 文件
### 将 `react-native-chat-sdk` 替换为 `react-native-${target_type}-chat`
sed -i '' "s/react-native-chat-sdk/react-native-${target_type}-chat/g" README.zh.md

## 修改 README.md 文件
### 将 `react-native-chat-sdk` 替换为 `react-native-${target_type}-chat`
sed -i '' "s/react-native-chat-sdk/react-native-${target_type}-chat/g" README.md

## 修改 LICENSE 文件
### 将 `easemob` 替换为 `${target_type}`
sed -i '' "s/easemob/${target_type}/g" LICENSE

## 修改 版本号
### 修改 `src/version.ts` 文件
sed -i '' "s/${original_version}/${target_version}/g" src/version.ts
### 修改 `lib/typescript/src/version.d.ts` 文件
sed -i '' "s/${original_version}/${target_version}/g" lib/typescript/src/version.d.ts
### 修改 `lib/module/version.js` 文件
sed -i '' "s/${original_version}/${target_version}/g" lib/module/version.js
### 修改 `lib/commonjs/version.js` 文件
sed -i '' "s/${original_version}/${target_version}/g" lib/commonjs/version.js

###############################################################################
###############################################################################
###############################################################################

## 修改 `modules` 目录下的文件
### 调用 `modules_code_rename.py` 脚本
echo "${current_dir}"
PYTHONPATH="${current_dir}" python -m rename_modules.ios "${target_type}" "${output_dir}/${target_dir}/modules/objc"
PYTHONPATH="${current_dir}" python -m rename_modules.android "${target_type}" "${output_dir}/${target_dir}/modules/java"

###############################################################################
###############################################################################
###############################################################################

## native android 修改
### 修改 android/build.gradle 文件内容 `io.hyphenate:hyphenate-chat:4.11.0` 替换为 `xxx:yyy`
if [ "${target_type}" == "shengwang" ]; then
  src_native_package_name="io.hyphenate:hyphenate-chat"
  src_native_package_version=${android_current_version}
  dist_native_package_name="cn.shengwang:chat-sdk"
  dist_native_package_version=${android_new_version}
  sed -i '' "s/${src_native_package_name}/${dist_native_package_name}/g" "${output_dir}/${target_dir}/android/build.gradle"
  sed -i '' "s/${src_native_package_version}/${dist_native_package_version}/g" "${output_dir}/${target_dir}/android/build.gradle"
fi

## native ios 修改
### 修改 react-native-chat-sdk.podspec 文件内容 `HyphenateChat` 替换为 `xxxx` 和 `4.11.0` 替换为 `yyy`
if [ "${target_type}" == "shengwang" ]; then
  src_native_package_name="HyphenateChat"
  src_native_package_version=${ios_current_version}
  dist_native_package_name="ShengwangChat_iOS"
  dist_native_package_version=${ios_new_version}
  sed -i '' "s/${src_native_package_name}/${dist_native_package_name}/g" "${output_dir}/${target_dir}/react-native-chat-sdk.podspec"
  sed -i '' "s/${src_native_package_version}/${dist_native_package_version}/g" "${output_dir}/${target_dir}/react-native-chat-sdk.podspec"
fi

###############################################################################
###############################################################################
###############################################################################

## 退出解压目录 "${output_dir}/${target_dir}"
popd >/dev/null 2>&1 || exit

# 重新压缩
log "tar -zcf ${output_dir}/${target_dir}.tgz -C ${output_dir} ${target_dir}"
## 压缩目录 "${output_dir}/${target_dir}" 到 "${output_dir}/${target_dir}.tgz"
tar -zcf "${output_dir}/${target_dir}.tgz" -C "${output_dir}" "${target_dir}"
log "zip -r ${output_dir}/${target_dir}.zip ${target_dir}"
## 压缩目录 "${output_dir}/${target_dir}" 到 "${output_dir}/${target_dir}.zip"
pushd "${output_dir}" >/dev/null 2>&1 || exit
zip -r "${target_dir}.zip" "${target_dir}" >/dev/null 2>&1
popd >/dev/null 2>&1 || exit

# 清理临时目录和文件
# rm -rf "${output_dir}/${target_dir}"

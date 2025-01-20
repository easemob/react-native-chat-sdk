#!/bin/bash

# This script is used to scan the safe files in the repository
# example: java -jar synopsys-detect-7.14.0.jar --blackduck.api.token=xxxx --blackduck.trust.cert=true --blackduck.url=https://60.191.137.48/ --detect.project.name=SDK_AgoraChat_ReactNative -detect.project.version.name=v1.3.2 --detect.source.path="/Users/asterisk/Downloads/react-native-chat-sdk-1.8.0-beta.1" --detect.accuracy.required=NONE
# schema: java -jar synopsys-detect-7.14.0.jar --blackduck.api.token=token --blackduck.trust.cert=true --blackduck.url=url --detect.project.name={project_name} -detect.project.version.name={version_name} --detect.source.path="{source_path}" --detect.accuracy.required=NONE

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  echo "使用方法: $0 <version_name> <source_path> <synopsys_path> <bearer_token>"
  echo "示例: $0 v1.0.0 /path/to/source /path/to/synopsys xxx"
  exit 1
fi

project_name="SDK_AgoraChat_ReactNative"
version_name=$1
source_path=$2
synopsys_path=$3
bearer_token=$4

# 检查 synopsys 目录是否存在
if [ ! -d "$synopsys_path" ]; then
  echo "错误: Synopsys 路径 '$synopsys_path' 不存在"
  exit 1
fi

pushd "${synopsys_path}" >/dev/null 2>&1 || exit

java -jar synopsys-detect-7.14.0.jar --blackduck.api.token=${bearer_token} --blackduck.trust.cert=true --blackduck.url=https://60.191.137.48/ --detect.project.name=${project_name} -detect.project.version.name=${version_name} --detect.source.path=${source_path} --detect.accuracy.required=NONE

popd >/dev/null 2>&1 || exit

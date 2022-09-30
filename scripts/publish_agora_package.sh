# /bin/bash

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

function now() {
    local lv_var=$1
    eval $lv_var='$(date +%Y-%m-%d\ %H:%M:%S)'
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

# read -s -n1 -p "Enter any key continue..."

mkdir -p ${current_dir}/Output/agora

old_package_name=react-native-chat-sdk
new_package_name=react-native-agora-chat
suffix=$1
tagOrVersion=$2
output_dir=$3

log package name: "${new_package_name}"
log package zip suffix: "${suffix}"
log package tag or version: "${tagOrVersion}"
log package output directory: "${output_dir}"

if [ "${tagOrVersion}" == "" ]; then
    yarn global add ${old_package_name} --global-folder ${current_dir}/Output
else
    yarn global add ${old_package_name}@${tagOrVersion} --global-folder ${current_dir}/Output
fi

mv ${current_dir}/Output/node_modules/${old_package_name} ${current_dir}/Output/node_modules/${new_package_name}

sed -i '' 's/: \"react-native-chat-sdk/: \"react-native-agora-chat/g' ${current_dir}/Output/node_modules/${new_package_name}/package.json
sed -i '' 's/lib\/typescript\/src\/index.d.ts/lib\/typescript\/index.d.ts/g' ${current_dir}/Output/node_modules/${new_package_name}/package.json

sed -i '' 's/react-native-chat-sdk/react-native-agora-chat/g' ${current_dir}/Output/node_modules/${new_package_name}/README.md
# https://docs-im.easemob.com/ccim/rn/quickstart
# https://docs.agora.io/en/agora-chat/agora_chat_get_started_rn?platform=React%20Native
sed -i '' 's/https:\/\/docs-im.easemob.com\/ccim\/rn\/quickstart/https:\/\/docs.agora.io\/en\/agora-chat\/agora_chat_get_started_rn?platform=React%20Native/g' ${current_dir}/Output/node_modules/${new_package_name}/README.md
# For more examples, see here.[Portal](https://github.com/easemob/react-native-chat-sdk/tree/dev/examples)
# 
sed -i '' 's/For more examples, see here.\[Portal\](https:\/\/github.com\/easemob\/react-native-chat-sdk\/tree\/dev\/examples)//g' ${current_dir}/Output/node_modules/${new_package_name}/README.md

sed -i '' 's/react-native-chat-sdk/react-native-agora-chat/g' ${current_dir}/Output/node_modules/${new_package_name}/tsconfig.json

mv ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt.rn ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt

rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt.flutter
rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/generate.ps1
rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/generate.sh
rm -rf ${current_dir}/Output/node_modules/${new_package_name}/README.zh.md

pushd ${current_dir}/Output/node_modules

zip -r -1 -q -b ${current_dir}/Output/node_modules/${new_package_name} ${new_package_name} *

popd

if [ "${output_dir}" == "" ]; then
    output_dir=${current_dir}/Output/agora
else
    mkdir -p ${output_dir}
fi

if [ "${suffix}" == "" ]; then
    rm -rf ${output_dir}/${new_package_name}.zip
    mv ${current_dir}/Output/node_modules/${new_package_name}.zip ${output_dir}/${new_package_name}.zip
    log "agora package output local path: ${output_dir}/${new_package_name}.zip"
else
    rm -rf ${output_dir}/${new_package_name}-${suffix}.zip
    mv ${current_dir}/Output/node_modules/${new_package_name}.zip ${output_dir}/${new_package_name}-${suffix}.zip
    log "agora package output local path: ${output_dir}/${new_package_name}-${suffix}.zip"
fi

yarn global remove ${old_package_name} --global-folder ${current_dir}/Output

read -s -n1 -p "Enter any key continue..."

rm -rf ${current_dir}/Output

log "agora package make success."

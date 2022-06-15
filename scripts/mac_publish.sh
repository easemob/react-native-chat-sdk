# /bin/bash

# readme
#
# sh mac_publish.sh [suffix] [version]|[tag]
# See `npm help install`
# [suffix]: generate package name's suffix
# For example: suffix is 1.0.5-rc.1, package name is agora-react-native-chat-1.0.5-rc.1
# [version]: specified version
# [tag]: package tag, see `npm help dist-tag`, common ones are alpha, beta, rc and latest.
#
# download latest release version
# sh mac_publish.sh 0.4.5 latest
# or
# sh mac_publish.sh 0.4.5
#
# download tag latest version
# sh mac_publish.sh 1.0.5 rc
#
# download specified version
# sh mac_publish.sh 0.4.4 0.4.4
#
# any directory execute this bash script is ok.
# For example: sh mac_publish.sh
#
# npm package version list: `npm dist-tag react-native-chat-sdk`

current_dir=$(
    cd "$(dirname "$0")"
    pwd
)

# read -s -n1 -p "Enter any key continue..."

mkdir -p ${current_dir}/Output/agora

old_package_name=react-native-chat-sdk
new_package_name=agora-react-native-chat
suffix=$1
tagOrVersion=$2

if [ "${tagOrVersion}" == "" ]; then
    yarn global add ${old_package_name} --global-folder ${current_dir}/Output
else
    yarn global add ${old_package_name}@${tagOrVersion} --global-folder ${current_dir}/Output
fi

mv ${current_dir}/Output/node_modules/${old_package_name} ${current_dir}/Output/node_modules/${new_package_name}

sed -i '' 's/: \"react-native-chat-sdk/: \"agora-react-native-chat/g' ${current_dir}/Output/node_modules/${new_package_name}/package.json

mv ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt.rn ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt

rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt.flutter
rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/generate.ps1
rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/generate.sh

rm -rf ${current_dir}/Output/agora/${new_package_name}.zip

pushd ${current_dir}/Output/node_modules

zip -r -1 -q -b ${current_dir}/Output/node_modules/${new_package_name} ${new_package_name} *

popd

if [ "${suffix}" == "" ]; then
    mv ${current_dir}/Output/node_modules/${new_package_name}.zip ${current_dir}/Output/agora/${new_package_name}.zip
else
    mv ${current_dir}/Output/node_modules/${new_package_name}.zip ${current_dir}/Output/agora/${new_package_name}-${suffix}.zip
fi

yarn global remove ${old_package_name} --global-folder ${current_dir}/Output

read -s -n1 -p "Enter any key continue..."

rm -rf ${current_dir}/Output

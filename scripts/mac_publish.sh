# /bin/bash

# readme
# sh ./scripts/mac_publish.sh 1.0.5-rc.5
# sh ./scripts/mac_publish.sh
# sh mac_publish.sh

current_dir=$(
    cd "$(dirname "$0")"
    pwd
)

# read -s -n1 -p "Enter any key continue..."

mkdir -p ${current_dir}/Output/agora

old_package_name=react-native-chat-sdk
new_package_name=react-native-agora-chat-sdk
version=$1

yarn global add ${old_package_name}@rc --global-folder ${current_dir}/Output

mv ${current_dir}/Output/node_modules/${old_package_name} ${current_dir}/Output/node_modules/${new_package_name}

sed -i '' 's/: \"react-native-chat-sdk/: \"react-native-agora-chat-sdk/g' ${current_dir}/Output/node_modules/${new_package_name}/package.json

mv ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt.rn ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt

rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt.flutter
rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/generate.ps1
rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/generate.sh

rm -rf ${current_dir}/Output/agora/${new_package_name}.zip

pushd ${current_dir}/Output/node_modules

zip -r -1 -q -b ${current_dir}/Output/node_modules/${new_package_name} ${new_package_name} *

popd

if [ "${version}" == "" ]; then
    mv ${current_dir}/Output/node_modules/${new_package_name}.zip ${current_dir}/Output/agora/${new_package_name}.zip
else
    mv ${current_dir}/Output/node_modules/${new_package_name}.zip ${current_dir}/Output/agora/${new_package_name}-${version}.zip
fi

yarn global remove ${old_package_name} --global-folder ${current_dir}/Output

read -s -n1 -p "Enter any key continue..."

rm -rf ${current_dir}/Output

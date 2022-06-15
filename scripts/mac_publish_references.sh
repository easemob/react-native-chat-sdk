# /bin/bash

current_dir=$(
    cd "$(dirname "$0")"
    pwd
)

# read -s -n1 -p "any key ..."

mkdir -p ${current_dir}/Output/agora

old_package_name=react-native-chat-sdk
new_package_name=react-native-agora-chat-sdk

yarn global add ${old_package_name}@rc --global-folder ${current_dir}/Output

mv ${current_dir}/Output/node_modules/${old_package_name} ${current_dir}/Output/node_modules/${new_package_name}

sed -i '' 's/: \"react-native-chat-sdk/: \"react-native-agora-chat-sdk/g' ${current_dir}/Output/node_modules/${new_package_name}/package.json
sed -i '' 's/react-native-chat-sdk.podspec/react-native-agora-chat-sdk.podspec/g' ${current_dir}/Output/node_modules/${new_package_name}/package.json
sed -i '' 's/= \"react-native-chat-sdk/= \"react-native-agora-chat-sdk/g' ${current_dir}/Output/node_modules/${new_package_name}/react-native-chat-sdk.podspec

mv ${current_dir}/Output/node_modules/${new_package_name}/react-native-chat-sdk.podspec ${current_dir}/Output/node_modules/${new_package_name}/react-native-agora-chat-sdk.podspec

mv ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt.rn ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt

rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/CMakeLists.txt.flutter
rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/generate.ps1
rm -rf ${current_dir}/Output/node_modules/${new_package_name}/native_src/cpp/generate.sh

rm -rf ${current_dir}/Output/agora/${new_package_name}.zip

pushd Output/node_modules

zip -r -1 -q -b ${current_dir}/Output/node_modules/${new_package_name} ${new_package_name} *

popd

mv ${current_dir}/Output/node_modules/${new_package_name}.zip ${current_dir}/Output/agora/${new_package_name}.zip

yarn global remove ${old_package_name} --global-folder ${current_dir}/Output

rm -rf ${current_dir}/Output

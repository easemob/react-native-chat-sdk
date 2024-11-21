# Add chat sdk dependencies

1. Add npm dependencies
   - `yarn add react-native-chat-sdk`
   - `npm -i save react-native-chat-sdk`
2. Add local dependencies
   - `"react-native-chat-sdk": "${absolute_path}"` in `package.json`. absolute_path can start with either `file:` or `link:`.
3. Add remote dependencies
   1. `"react-native-chat-sdk": "git+${url}#${common_id}"` in `package.json`
   2. `cd ${sdk_path} && yarn run prepare`

### android platform needs to execute scripts

For the android platform, a pre-build script needs to be executed to generate the required files.

```bash
cd node_modules/react-native-chat-sdk/native_src/cpp && sh generate.sh --type rn && cd ../../../..
```
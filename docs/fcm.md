# Implement offline notification

React Native SDK with Firebase Cloud Messaging.

# Firebase Console

控制台提供了项目的管理，应用的管理，iOS 证书的管理，以及推送消息需要的信息。
The console provides project management, application management, iOS certificate management, and information required for push messages.

# Client

客户端需要集成 npm 包：@react-native-firebase/app 和@react-native-firebase/messaging。
对于 android 平台，需要将 `google-services.json` 文件集成到项目中。该文件来自控制台创建的项目。
对于 ios 平台，需要将 `GoogleService-Info.plist` 文件集成到项目中。该文件来自控制台创建的项目。ios应用还需要上传apns证书或者填写apns秘钥。
Clients need to integrate npm packages: @react-native-firebase/app and @react-native-firebase/messaging.
For the android platform, the `google-services.json` file needs to be integrated into the project. The file is from a console created project.
For the ios platform, the `GoogleService-Info.plist` file needs to be integrated into the project. The file is from a console created project.The ios application also needs to upload the apns certificate or fill in the apns secret key.

# Server
服务器端需要用户的ID和token。在用户离线的时候进行消息推送。所以，客户端在初始化或者比较合适的时机将需要的参数传递给服务器。
在服务器的控制台配置推送参数，填写谷歌的ID和token。设置消息接收的优先级。如果优先级是普通，无法唤醒已经杀死的应用。
推送的类别有notification和data，data数据给用户准备的，notification是给界面显示的。

# References

[react native firebase](https://rnfirebase.io/)

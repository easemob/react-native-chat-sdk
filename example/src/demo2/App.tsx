import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Button, ScrollView, View } from 'react-native';

import { screenComponents } from './__internal__/Components';
import { styleValues } from './__internal__/Css';
import {
  getComponentList,
  registerComponent,
  ScreenComponent,
  Stack,
  unregisterComponents,
} from './__internal__/Utils';
import { AppServerClient } from './Client/AppServer';
// import messaging from '@react-native-firebase/messaging';

function HomeScreen(params: { navigation: any }) {
  return (
    <ScrollView>
      {getComponentList()
        .filter((component: ScreenComponent) => component.isNavigation)
        .map((component: ScreenComponent) => {
          console.log(`route: ${component.route}`);
          return (
            <View key={component.route} style={styleValues.scrollView}>
              <Button
                title={component.route}
                onPress={() => params.navigation?.navigate(component.route)}
              />
            </View>
          );
        })}
    </ScrollView>
  );
}

function App() {
  AppServerClient.regUrl = 'https://a41.chat.agora.io/app/chat/user/register';
  AppServerClient.tokenUrl = 'https://a41.chat.agora.io/app/chat/user/login';
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: true,
            title: 'React Native Chat SDK Test List',
          }}
        />
        {getComponentList().map((component: ScreenComponent) => {
          return (
            <Stack.Screen
              key={component.route}
              name={component.route}
              component={component.screen as any}
            />
          );
        })}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// (function onListenerNotification(): void {
//   console.log('fcm message listener:');
//   messaging().onMessage(async (remoteMessage) => {
//     const l = 'init: onMessage:' + JSON.stringify(remoteMessage);
//     Alert.alert(l);
//     console.log(l);
//   });
//   messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//     const l =
//       'init: setBackgroundMessageHandler: ' + JSON.stringify(remoteMessage);
//     Alert.alert(l);
//     console.log(l);
//   });
// })();

unregisterComponents();
screenComponents.forEach((value: ScreenComponent) => {
  registerComponent(value);
});

export default App;

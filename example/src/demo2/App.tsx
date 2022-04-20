import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { ScrollView, View, Button } from 'react-native';
import { ChatClient, ChatOptions } from 'react-native-chat-sdk';
import { ChatManagerScreen } from './ChatManager';
import { SendMessageScreen } from './ChatManager/SendMessage';
import { ClientScreen } from './Client';
import { ClientOthersScreen } from './Client/ClientOthers';
import { CreateAccountScreen } from './Client/CreateAccount';
import { GetStateScreen } from './Client/GetState';
import { KickScreen } from './Client/Kick';
import { LoginAndLogoutScreen } from './Client/LoginAndLogout';
import { Stack, styleValues } from './Utils';

function HomeScreen(params: { navigation: any }) {
  return (
    <ScrollView>
      <View style={styleValues.scrollView}>
        <Button
          title="ClientScreen"
          onPress={() => params.navigation?.navigate(ClientScreen.route)}
        />
      </View>
      <View style={styleValues.scrollView}>
        <Button
          title="ChatManagerScreen"
          onPress={() => params.navigation?.navigate(ChatManagerScreen.route)}
        />
      </View>
    </ScrollView>
  );
}

function App() {
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
        <Stack.Screen name={ClientScreen.route} component={ClientScreen} />
        <Stack.Screen
          name={ChatManagerScreen.route}
          component={ChatManagerScreen}
        />
        <Stack.Screen
          name={LoginAndLogoutScreen.route}
          component={LoginAndLogoutScreen}
        />
        <Stack.Screen
          name={SendMessageScreen.route}
          component={SendMessageScreen}
        />
        <Stack.Screen
          name={CreateAccountScreen.route}
          component={CreateAccountScreen}
        />
        <Stack.Screen name={GetStateScreen.route} component={GetStateScreen} />
        <Stack.Screen name={KickScreen.route} component={KickScreen} />
        <Stack.Screen
          name={ClientOthersScreen.route}
          component={ClientOthersScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

ChatClient.getInstance().init(
  new ChatOptions({ appKey: 'easemob-demo#easeim', autoLogin: false })
);

export default App;

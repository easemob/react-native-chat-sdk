import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { type ViewStyle, ScrollView, View, Button, Text } from 'react-native';
import { ChatClient, ChatOptions } from 'react-native-chat-sdk';
import { ChatManagerScreen } from './ChatManager';
import { ClientScreen } from './Client';
import { ConnectScreen } from './Connect';

const styleValue: ViewStyle = {
  alignItems: 'stretch',
  justifyContent: 'center',
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 8,
  paddingBottom: 8,
};

function HomeScreen(params: { navigation: any }) {
  return (
    <ScrollView>
      {/* <View style={styleValue}>
        <Button
          title="测试基础功能"
          onPress={() => params.navigation?.navigate(ConnectScreen.route)}
        />
      </View> */}
      <View style={styleValue}>
        <Button
          title="test base functions"
          onPress={() => params.navigation?.navigate(ClientScreen.route)}
        />
      </View>
      <View style={styleValue}>
        <Button
          title="test send and recv message"
          onPress={() => params.navigation?.navigate(ChatManagerScreen.route)}
        />
      </View>
      <View style={styleValue}>
        <Button
          title="test"
          onPress={() => params.navigation?.navigate('Detail')}
        />
      </View>
    </ScrollView>
  );
}

// const styleValue2 = { flex: 1, alignItems: 'center', justifyContent: 'center' };

function DetailsScreen() {
  return (
    <View style={styleValue}>
      <Text>Details Screen</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: true, title: 'SDK Test Item List' }}
        />
        <Stack.Screen name={ConnectScreen.route} component={ConnectScreen} />
        <Stack.Screen name={ClientScreen.route} component={ClientScreen} />
        <Stack.Screen
          name={ChatManagerScreen.route}
          component={ChatManagerScreen}
        />
        <Stack.Screen name="Detail" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

ChatClient.getInstance().init(
  new ChatOptions({ appKey: 'easemob-demo#easeim', autoLogin: false })
);

export default App;

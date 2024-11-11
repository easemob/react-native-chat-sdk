import {
  NavigationContainer,
  type NavigationState,
} from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, View } from 'react-native';

import { screenComponents } from './__internal__/Components';
import { styleValues } from './__internal__/Css';
import {
  getComponentList,
  registerComponent,
  type ScreenComponent,
  Stack,
  unregisterComponents,
} from './__internal__/Utils';
import { AppServerClient } from './Client/AppServer';
import {
  isHermesEnabled,
  isTurboModuleEnabled,
} from './__internal__/rn_features';
import { Button } from './__internal__/Button';
// import messaging from '@react-native-firebase/messaging';

function HomeScreen(params: { navigation: any }) {
  const { navigation } = params;
  return (
    <>
      {getComponentList()
        .filter((component: ScreenComponent) => component.isNavigation)
        .map((component: ScreenComponent) => {
          return (
            <View key={component.route} style={styleValues.scrollView}>
              <Button
                title={component.route}
                onPress={() => {
                  navigation?.navigate(component.route);
                }}
              />
            </View>
          );
        })}
    </>
  );
}

export function formatNavigationState(
  state: NavigationState | undefined,
  result: string[] & string[][]
) {
  if (state) {
    const ret: string[] & string[][] = [];
    for (const route of state.routes) {
      ret.push(route.name);
      if (route.state) {
        formatNavigationState(route.state as NavigationState | undefined, ret);
      }
    }
    result.push(ret);
  }
}

function App() {
  console.log('dev:features:', isTurboModuleEnabled(), isHermesEnabled());
  AppServerClient.regUrl = 'https://a41.chat.agora.io/app/chat/user/register';
  AppServerClient.tokenUrl = 'https://a41.chat.agora.io/app/chat/user/login';

  const onStateChange = React.useCallback(
    (state: NavigationState | undefined) => {
      const rr: string[] & string[][] = [];
      formatNavigationState(state, rr);
      console.log('dev:onStateChange:', JSON.stringify(rr, undefined, '  '));
    },
    []
  );

  return (
    <NavigationContainer onStateChange={onStateChange}>
      <SafeAreaView style={{ flex: 1 }}>
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
      </SafeAreaView>
    </NavigationContainer>
  );
}

unregisterComponents();
screenComponents.forEach((value: ScreenComponent) => {
  registerComponent(value);
});

export default App;

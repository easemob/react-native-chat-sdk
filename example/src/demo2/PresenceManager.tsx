import React from 'react';
import { Button, ScrollView, View } from 'react-native';

import { styleValues } from './__internal__/Css';
import { getComponentList, ScreenComponent } from './__internal__/Utils';

export const PresenceManagerRoute = 'PresenceManagerScreen';
export function PresenceManagerScreen(params: {
  navigation: any;
}): JSX.Element {
  return (
    <ScrollView>
      {getComponentList()
        .filter(
          (component: ScreenComponent) =>
            component.parentScreen === PresenceManagerRoute
        )
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

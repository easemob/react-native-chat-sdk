import React from 'react';
import { ScrollView, View } from 'react-native';

import { styleValues } from './__internal__/Css';
import { getComponentList, type ScreenComponent } from './__internal__/Utils';
import { Button } from './__internal__/Button';

export const PushManagerRoute = 'PushManagerScreen';
export function PushManagerScreen(params: { navigation: any }): JSX.Element {
  return (
    <ScrollView>
      {getComponentList()
        .filter(
          (component: ScreenComponent) =>
            component.parentScreen === PushManagerRoute
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

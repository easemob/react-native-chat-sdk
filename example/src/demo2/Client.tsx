import React from 'react';
import { View, Button, ScrollView } from 'react-native';
import { ClientOthersScreen } from './Client/ClientOthers';
import { CreateAccountScreen } from './Client/CreateAccount';
import { GetStateScreen } from './Client/GetState';
import { KickScreen } from './Client/Kick';
import { LoginAndLogoutScreen } from './Client/LoginAndLogout';
import { styleValues } from './Utils';

const ClientScreen = function ClientScreen(params: {
  navigation: any;
}): JSX.Element {
  return (
    <ScrollView>
      <View style={styleValues.scrollView}>
        <Button
          title="LoginAndLogoutScreen"
          onPress={() =>
            params.navigation?.navigate(LoginAndLogoutScreen.route)
          }
        />
      </View>
      <View style={styleValues.scrollView}>
        <Button
          title="ClientOthersScreen"
          onPress={() => params.navigation?.navigate(ClientOthersScreen.route)}
        />
      </View>
      <View style={styleValues.scrollView}>
        <Button
          title="CreateAccountScreen"
          onPress={() => params.navigation?.navigate(CreateAccountScreen.route)}
        />
      </View>
      <View style={styleValues.scrollView}>
        <Button
          title="GetStateScreen"
          onPress={() => params.navigation?.navigate(GetStateScreen.route)}
        />
      </View>
      <View style={styleValues.scrollView}>
        <Button
          title="KickScreen"
          onPress={() => params.navigation?.navigate(KickScreen.route)}
        />
      </View>
    </ScrollView>
  );
};

ClientScreen.route = 'ClientScreen';

// const route2 = 'ClientScreen';

export { ClientScreen };

// export default function TestScreen(params: { navigation: any }): JSX.Element {
//   let ret = new (class implements JSX.Element {
//     type: any;
//     props: any;
//     key: React.Key | null;
//     route: string;
//     context: any;
//     constructor(props: PropsWithChildren<any>, context?: any) {
//       this.key = 'TestScreen';
//       this.route = this.key;
//       this.props = props;
//       this.context = context;
//     }
//   })({ navigation: params.navigation });
//   return ret;
// }

// export function TestComponent(): JSX.Element {
//   return (
//     <View>
//       <Button title="" onPress={(event: any) => console.log(event)}>
//         s
//       </Button>
//       {componentList().forEach((value: ffff) => {
//         return <Stack.Screen name={'value.route'} component={value} />;
//       })}
//     </View>
//   );
// }

// type ffff = (params: { navigation: any }) => JSX.Element;

// const arrays: ffff[] = [];

// export function register(element: ffff): void {
//   arrays.push(element);
// }

// export function componentList(): ffff[] {
//   return arrays;
// }

// register(TestScreen);
// register(ClientScreen);

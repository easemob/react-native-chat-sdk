import type { ChatConnectEventListener } from 'lib/typescript';
import * as React from 'react';
import { Button, Text, View } from 'react-native';
import { ChatClient } from 'react-native-chat-sdk';
import ModalDropdown from 'react-native-modal-dropdown';

import { datasheet } from '../__default__/Datasheet';

const LoginListScreen = (): JSX.Element => {
  const accounts = datasheet.accounts;
  const list = accounts.map((account) => {
    return account.id;
  });

  const [userId, setUserId] = React.useState(
    accounts.length > 0 ? accounts[0]!.id : ''
  );
  const [userPassword, setUserPassword] = React.useState(
    accounts.length > 0 ? accounts[0]!.mm : ''
  );
  const [userToken, setUserToken] = React.useState(
    accounts.length > 0 ? accounts[0]!.token : ''
  );

  const loginWithPasswordForEasemob = () => {
    ChatClient.getInstance()
      .login(userId, userPassword, true)
      .then(() => {
        console.log('login success.');
      })
      .catch((error) => {
        console.log('login fail: ', error);
      });
  };
  const loginWithTokenForEasemob = () => {
    ChatClient.getInstance()
      .login(userId, userToken, false)
      .then(() => {
        console.log('login success.');
      })
      .catch((error) => {
        console.log('login fail: ', error);
      });
  };
  const loginWithToken = () => {
    ChatClient.getInstance()
      .loginWithAgoraToken(userId, userToken)
      .then(() => {
        console.log('login success.');
      })
      .catch((error) => {
        console.log('login fail: ', error);
      });
  };

  const logout = () => {
    ChatClient.getInstance()
      .logout()
      .then(() => {
        console.log('logout success.');
      })
      .catch((error) => {
        console.log('logout fail: ', error);
      });
  };

  const onSelect = (index: string, option: string) => {
    console.log(index, option);
    for (const account of accounts) {
      if (account.id === option) {
        setUserId(account.id);
        setUserPassword(account.mm);
        setUserToken(account.token);
        break;
      }
    }
  };

  React.useEffect(() => {
    console.log('React.useEffect');
    ChatClient.getInstance().removeAllConnectionListener();
    ChatClient.getInstance().addConnectionListener({
      onConnected(): void {
        console.log('onConnected');
      },
      onDisconnected(): void {
        console.log('onDisconnected');
      },
      onAppActiveNumberReachLimit(): void {
        console.log('onAppActiveNumberReachLimit');
      },

      onUserDidLoginFromOtherDevice(deviceName?: string): void {
        console.log('onUserDidLoginFromOtherDevice', deviceName);
      },

      onUserDidLoginFromOtherDeviceWithInfo(params: {
        deviceName?: string;
        ext?: string;
      }): void {
        console.log('onUserDidLoginFromOtherDeviceWithInfo', params);
      },

      onUserDidRemoveFromServer(): void {
        console.log('onUserDidRemoveFromServer');
      },

      onUserDidForbidByServer(): void {
        console.log('onUserDidForbidByServer');
      },

      onUserDidChangePassword(): void {
        console.log('onUserDidChangePassword');
      },

      onUserDidLoginTooManyDevice(): void {
        console.log('onUserDidLoginTooManyDevice');
      },

      onUserKickedByOtherDevice(): void {
        console.log('onUserKickedByOtherDevice');
      },

      onUserAuthenticationFailed(): void {
        console.log('onUserAuthenticationFailed');
      },
    } as ChatConnectEventListener);
  }, []);

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginVertical: 20,
      }}
    >
      <ModalDropdown
        style={{ backgroundColor: 'gainsboro' }}
        textStyle={{ fontSize: 18 }}
        dropdownStyle={{ width: 100 }}
        defaultValue={list.length > 0 ? list[0] : ''}
        options={list}
        onSelect={onSelect}
      />
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <Text
          style={{ fontSize: 18, color: 'blue' }}
          numberOfLines={1}
          selectable={true}
        >
          id:
        </Text>
        <Text style={{ fontSize: 18 }} numberOfLines={1} selectable={true}>
          {userId}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <Text
          style={{ fontSize: 18, color: 'blue' }}
          numberOfLines={1}
          selectable={true}
        >
          ps:
        </Text>
        <Text style={{ fontSize: 18 }} numberOfLines={1} selectable={true}>
          {userPassword}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <Text
          style={{ fontSize: 18, color: 'blue' }}
          numberOfLines={1}
          selectable={true}
        >
          token:
        </Text>
        <Text style={{ fontSize: 18 }} numberOfLines={1} selectable={true}>
          {userToken}
        </Text>
      </View>
      <Button
        title="login with password for easemob"
        onPress={loginWithPasswordForEasemob}
      />
      <Button
        title="login with token for easemob"
        onPress={loginWithTokenForEasemob}
      />
      <Button title="login for agora" onPress={loginWithToken} />
      <Button title="logout from server" onPress={logout} />
    </View>
  );
};
LoginListScreen.route = 'LoginListScreen';

export default LoginListScreen;

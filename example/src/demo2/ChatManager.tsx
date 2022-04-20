import React from 'react';
import { View, Button, ScrollView } from 'react-native';
import { SendMessageScreen } from './ChatManager/SendMessage';
import { styleValues } from './Utils';

const ChatManagerScreen = function (params: { navigation: any }): JSX.Element {
  return (
    <ScrollView>
      <View style={styleValues.scrollView}>
        <Button
          title="SendMessageScreen"
          onPress={() => params.navigation?.navigate(SendMessageScreen.route)}
        />
      </View>
    </ScrollView>
  );
};

ChatManagerScreen.route = 'ChatManagerScreen';

export { ChatManagerScreen };

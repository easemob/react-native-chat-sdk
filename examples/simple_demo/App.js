/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ChatClient,
  ChatOptions,
  ChatMessageChatType,
  ChatMessage,
} from 'react-native-chat-sdk';

const App = () => {
  const title = 'AgoraChatQuickstart';
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [content, setContent] = React.useState('');
  const [logText, setWarnText] = React.useState('Show log area');

  const setListener = () => {
    let msgListener = {
      onMessagesReceived(messages) {
        console.log('onMessagesReceived: ', messages);
        setWarnText('onMessagesReceived: ', messages);
      },
    };

    ChatClient.getInstance().chatManager.removeAllMessageListener();
    ChatClient.getInstance().chatManager.addMessageListener(msgListener);
  };

  const registerAccount = () => {
    ChatClient.getInstance()
      .createAccount(username, password)
      .then(() => {
        console.log('register: success');
        setWarnText('register: success');
      })
      .catch(reason => {
        console.log('register: fail', reason);
        setWarnText('register: fail' + reason);
      });
  };

  const login = () => {
    setWarnText(`username:${username},password:${password}`);
    let listener = {
      onTokenWillExpire() {
        console.log('onTokenWillExpire');
        setWarnText('onTokenWillExpire');
      },
      onTokenDidExpire() {
        console.log('onTokenDidExpire');
        setWarnText('onTokenDidExpire');
      },
      onConnected() {
        console.log('onConnected');
        setWarnText('onConnected');
        setListener();
      },
      onDisconnected(errorCode) {
        console.log('onDisconnected: ', errorCode);
        setWarnText('onDisconnected' + errorCode);
      },
    };
    ChatClient.getInstance().removeAllConnectionListener();
    ChatClient.getInstance().addConnectionListener(listener);
    ChatClient.getInstance()
      .login('asteriskhx1', 'qwer')
      .then(() => {
        console.log('login: success');
        setWarnText('login: success');
      })
      .catch(reason => {
        console.log('login: fail', reason);
        setWarnText('login: fail' + JSON.stringify(reason));
      });
  };

  const logout = () => {
    ChatClient.getInstance()
      .logout()
      .then(() => {
        console.log('logout: success');
        setWarnText('logout: success');
      })
      .catch(reason => {
        console.log('logout: fail', reason);
        setWarnText('logout: fail' + reason);
      });
  };

  const sendmsg = () => {
    let msg = ChatMessage.createTextMessage(
      userId,
      content,
      ChatMessageChatType.PeerChat,
    );
    const callback = new (class {
      onProgress(locaMsgId, progress) {
        console.log('onProgress ', locaMsgId, progress);
        setWarnText('onProgress: ' + locaMsgId + progress);
      }
      onError(locaMsgId, error) {
        console.log('onError ', locaMsgId, error);
        setWarnText('onError: ' + locaMsgId + error);
      }
      onSuccess(message) {
        console.log('onSuccess', message.localMsgId);
        setWarnText('onError: ' + message.localMsgId);
      }
    })();
    ChatClient.getInstance()
      .chatManager.sendMessage(msg, callback)
      .then(() => {
        console.log('send success');
        setWarnText('send success: ' + msg.localMsgId);
      })
      .catch(reason => {
        console.log('send failed');
        setWarnText('send fail: ' + reason);
      });
  };

  return (
    <SafeAreaView>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView>
        <View style={styles.inputCon}>
          <TextInput
            multiline
            style={styles.inputBox}
            placeholder="Enter username"
            onChangeText={text => setUsername(text)}
            value={username}
          />
        </View>
        <View style={styles.inputCon}>
          <TextInput
            multiline
            style={styles.inputBox}
            placeholder="Enter password"
            onChangeText={text => setPassword(text)}
            value={password}
          />
        </View>
        <View style={styles.buttonCon}>
          <Text style={styles.eachBtn} onPress={registerAccount}>
            SIGN UP
          </Text>
          <Text style={styles.eachBtn} onPress={login}>
            SIGN IN
          </Text>
          <Text style={styles.eachBtn} onPress={logout}>
            SIGN OUT
          </Text>
        </View>
        <View style={styles.inputCon}>
          <TextInput
            multiline
            style={styles.inputBox}
            placeholder="Enter the username you want to send"
            onChangeText={text => setUserId(text)}
            value={userId}
          />
        </View>
        <View style={styles.inputCon}>
          <TextInput
            multiline
            style={styles.inputBox}
            placeholder="Enter content"
            onChangeText={text => setContent(text)}
            value={content}
          />
        </View>
        <View style={styles.buttonCon}>
          <Text style={styles.btn2} onPress={sendmsg}>
            SEND TEXT
          </Text>
        </View>
        <View>
          <Text style={styles.logText}>{logText}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    height: 60,
    backgroundColor: '#6200ED',
  },
  title: {
    lineHeight: 60,
    paddingLeft: 15,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  inputCon: {
    marginLeft: '5%',
    width: '90%',
    height: 60,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  inputBox: {
    marginTop: 15,
    width: '100%',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonCon: {
    marginLeft: '2%',
    width: '96%',
    flexDirection: 'row',
    marginTop: 20,
    height: 26,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  eachBtn: {
    height: 40,
    width: '28%',
    lineHeight: 40,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#6200ED',
  },
  btn2: {
    height: 40,
    width: '45%',
    lineHeight: 40,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#6200ED',
  },
  logText: {
    padding: 10,
    marginTop: 10,
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
});

(function init() {
  let o = new ChatOptions({
    autoLogin: false,
    appKey: 'easemob-demo#easeim',
  });
  ChatClient.getInstance()
    .init(o)
    .then(() => {
      console.log('success');
    })
    .catch(() => {
      console.log('error');
    });
})();

export default App;

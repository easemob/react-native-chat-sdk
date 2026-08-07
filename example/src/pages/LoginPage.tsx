import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChatClient } from 'react-native-chat-sdk';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { useSdkState } from '../sdk_state';
import { addLog } from '../log/log_store';
import { errResult, okResult } from '../result';
import { CopyableText } from '../copyable_text';
import { accounts } from '../env';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginPage({ navigation }: Props) {
  const sdk = useSdkState();
  const [isPassword, setIsPassword] = useState(true);
  // 预填自 env.ts（scripts/generate-env.js 生成），可手改
  const [userId, setUserId] = useState(accounts[0]?.id ?? '');
  const [pwdOrToken, setPwdOrToken] = useState(accounts[0]?.mm ?? '');
  const [resultText, setResultText] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const onLogin = async () => {
    setRunning(true);
    try {
      await ChatClient.getInstance().login(userId, pwdOrToken, isPassword);
      const result = okResult({ userId });
      addLog('api.ChatClient.login', result);
      setResultText(JSON.stringify(result, null, 2));
      sdk.markLoggedIn(userId);
      navigation.push('Search');
    } catch (e) {
      const result = errResult(e);
      addLog('api.ChatClient.login', result);
      setResultText(JSON.stringify(result, null, 2));
    } finally {
      setRunning(false);
    }
  };

  const onLogout = async () => {
    setRunning(true);
    try {
      await ChatClient.getInstance().logout();
      const result = okResult();
      addLog('api.ChatClient.logout', result);
      setResultText(JSON.stringify(result, null, 2));
      sdk.markLoggedOut();
    } catch (e) {
      const result = errResult(e);
      addLog('api.ChatClient.logout', result);
      setResultText(JSON.stringify(result, null, 2));
    } finally {
      setRunning(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {sdk.initOptionsJson != null && (
        <View>
          <Text style={styles.label}>
            本次初始化 ChatOptions（重测时杀 App 后对照修改）
          </Text>
          <CopyableText text={sdk.initOptionsJson} maxHeight={120} />
        </View>
      )}

      <Text style={styles.label}>
        当前状态：
        {sdk.loggedIn ? `已登录：${sdk.currentUser ?? ''}` : '未登录'}
      </Text>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>
          {isPassword ? '密码登录' : 'token 登录'}
        </Text>
        <Switch value={isPassword} onValueChange={setIsPassword} />
      </View>

      <TextInput
        style={styles.input}
        value={userId}
        onChangeText={setUserId}
        placeholder="username"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        value={pwdOrToken}
        onChangeText={setPwdOrToken}
        placeholder={isPassword ? 'password' : 'token'}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, running && styles.buttonDisabled]}
          onPress={onLogin}
          disabled={running}
        >
          <Text style={styles.buttonText}>登录</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.logoutButton,
            running && styles.buttonDisabled,
          ]}
          onPress={onLogout}
          disabled={running}
        >
          <Text style={styles.buttonText}>退出</Text>
        </TouchableOpacity>
      </View>

      {resultText != null && (
        <View>
          <Text style={styles.label}>结果</Text>
          <CopyableText text={resultText} maxHeight={200} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 12,
  },
  switchLabel: {
    color: '#333',
    fontSize: 15,
  },
  input: {
    marginHorizontal: 12,
    marginTop: 12,
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderRadius: 4,
    fontSize: 14,
    color: '#222',
  },
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: '#1e88e5',
    alignItems: 'center',
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: '#e53935',
    marginRight: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
});

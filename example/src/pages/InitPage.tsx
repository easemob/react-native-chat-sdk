import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChatClient, ChatOptions } from 'react-native-chat-sdk';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { useSdkState } from '../sdk_state';
import { addLog } from '../log/log_store';
import { registerAllListeners } from '../listeners';
import { errResult, okResult } from '../result';
import { CopyableText } from '../copyable_text';
import { appKey } from '../env';

/**
 * ChatOptions 模板：appKey/appId 预填自 env.ts（scripts/generate-env.js 生成），
 * 其余字段 SDK 有默认值，属可选。
 */
function buildDefaultTemplate(): string {
  const template: Record<string, unknown> = {
    appKey: appKey[0] ?? '',
    autoLogin: false,
    debugModel: true,
  };
  // const id = appId[0];
  // if (typeof id === 'string' && id.length > 0) {
  //   template.appId = id;
  // }
  return JSON.stringify(template, null, 2);
}

const DEFAULT_TEMPLATE = buildDefaultTemplate();

type Props = NativeStackScreenProps<RootStackParamList, 'Init'>;

/**
 * 初始化页（一次性页面）：init 成功后 replace 到登录页，不可返回重做。
 * 需要换 ChatOptions 重测时，流程为杀 App 重启。
 */
export function InitPage({ navigation }: Props) {
  const sdk = useSdkState();
  const [json, setJson] = useState(DEFAULT_TEMPLATE);
  const [resultText, setResultText] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const onInit = async () => {
    setRunning(true);
    try {
      const parsed = JSON.parse(json);
      const options = new ChatOptions(parsed);
      await ChatClient.getInstance().init(options);
      const result = okResult();
      addLog('api.ChatClient.init', result);
      setResultText(JSON.stringify(result, null, 2));
      // init 成功后：统一注册事件监听、记录状态（触发悬浮日志挂载）、跳转登录页
      registerAllListeners();
      sdk.markInitialized(json);
      navigation.replace('Login');
    } catch (e) {
      const result = errResult(e);
      addLog('api.ChatClient.init', result);
      setResultText(JSON.stringify(result, null, 2));
    } finally {
      setRunning(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>
        ChatOptions JSON（初始化仅可执行一次，失败可改后重试）
      </Text>
      <TextInput
        style={styles.editor}
        value={json}
        onChangeText={setJson}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity
        style={[styles.button, running && styles.buttonDisabled]}
        onPress={onInit}
        disabled={running}
      >
        <Text style={styles.buttonText}>
          {running ? '初始化中...' : '初始化'}
        </Text>
      </TouchableOpacity>
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
  editor: {
    margin: 12,
    marginTop: 0,
    padding: 8,
    minHeight: 160,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderRadius: 4,
    fontFamily: 'Menlo',
    fontSize: 13,
    color: '#222',
    textAlignVertical: 'top',
  },
  button: {
    marginHorizontal: 12,
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: '#1e88e5',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#90caf9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
});

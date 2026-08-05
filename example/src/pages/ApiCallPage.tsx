import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { findApi } from '../registry';
import { addLog } from '../log/log_store';
import { errResult, okResult } from '../result';
import { CopyableText } from '../copyable_text';

type Props = NativeStackScreenProps<RootStackParamList, 'ApiCall'>;

export function ApiCallPage({ navigation, route }: Props) {
  const entry = findApi(route.params.apiName);
  const [json, setJson] = useState(entry?.paramsTemplate ?? '{}');
  const [resultText, setResultText] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: route.params.apiName });
  }, [navigation, route.params.apiName]);

  if (entry == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.hint}>未找到 API：{route.params.apiName}</Text>
      </View>
    );
  }

  const onCall = async () => {
    setRunning(true);
    try {
      const params = JSON.parse(json);
      const data = await entry.invoke(params);
      const result = okResult(data ?? undefined);
      addLog(`api.${entry.name}`, result);
      setResultText(JSON.stringify(result, null, 2));
    } catch (e) {
      const result = errResult(e);
      addLog(`api.${entry.name}`, result);
      setResultText(JSON.stringify(result, null, 2));
    } finally {
      setRunning(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.name}>{entry.name}</Text>
      <Text style={styles.desc}>{entry.description}</Text>

      <Text style={styles.label}>参数 JSON（仅必填字段模板）</Text>
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
        onPress={onCall}
        disabled={running}
      >
        <Text style={styles.buttonText}>{running ? '调用中...' : '调用'}</Text>
      </TouchableOpacity>

      {resultText != null && (
        <View>
          <Text style={styles.label}>结果（长按全选复制）</Text>
          <CopyableText text={resultText} maxHeight={320} />
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
  name: {
    marginHorizontal: 12,
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  desc: {
    marginHorizontal: 12,
    marginTop: 4,
    fontSize: 13,
    color: '#666',
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
    minHeight: 120,
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
  hint: {
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

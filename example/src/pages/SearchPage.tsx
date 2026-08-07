import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { ALL_APIS } from '../registry';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

/**
 * API 搜索页：默认只显示提示语；输入关键字实时过滤（大小写不敏感子串，
 * 命中方法名 + 分组名）。另提供不参与搜索的只读全量清单入口。
 */
export function SearchPage({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [listVisible, setListVisible] = useState(false);

  const keyword = query.trim().toLowerCase();
  const results =
    keyword.length === 0
      ? []
      : ALL_APIS.filter(
          (e) =>
            e.name.toLowerCase().includes(keyword) ||
            e.group.toLowerCase().includes(keyword)
        );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="输入关键字搜索 API（如 send / chat / group）"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity
        style={styles.allEntry}
        onPress={() => setListVisible(true)}
      >
        <Text style={styles.allEntryText}>
          只读全量 API 清单（共 {ALL_APIS.length} 条）
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
        {keyword.length === 0 ? (
          <Text style={styles.hint}>输入关键字后实时显示匹配的 API</Text>
        ) : results.length === 0 ? (
          <Text style={styles.hint}>无匹配结果</Text>
        ) : (
          results.map((e) => (
            <TouchableOpacity
              key={e.name}
              style={styles.item}
              onPress={() => navigation.push('ApiCall', { apiName: e.name })}
            >
              <Text style={styles.itemName}>{e.name}</Text>
              <Text style={styles.itemDesc}>{e.description}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={listVisible}
        animationType="slide"
        onRequestClose={() => setListVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalToolbar}>
            <Text style={styles.modalTitle}>全量 API 清单（只读）</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setListVisible(false)}
            >
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {ALL_APIS.map((e) => (
              <View key={e.name} style={styles.modalItem}>
                <Text style={styles.itemName} selectable>
                  {e.name}
                </Text>
                <Text style={styles.itemDesc}>{e.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    margin: 12,
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderRadius: 4,
    fontSize: 14,
    color: '#222',
  },
  allEntry: {
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#eceff1',
    borderRadius: 4,
  },
  allEntryText: {
    color: '#1e88e5',
  },
  list: {
    flex: 1,
  },
  hint: {
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  itemName: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
  },
  itemDesc: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
  },
  modalToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  modalTitle: {
    fontSize: 16,
    color: '#222',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1e88e5',
    borderRadius: 4,
  },
  closeButtonText: {
    color: '#fff',
  },
  modalItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
});

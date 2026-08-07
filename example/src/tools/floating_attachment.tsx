import Clipboard from '@react-native-clipboard/clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addLog } from '../log/log_store';
import {
  ATTACHMENT_KIND_LABELS,
  ATTACHMENT_KINDS,
  pickAttachment,
  recordToJson,
  type AttachmentKind,
  type AttachmentRecord,
} from './attachment_picker';
import {
  addRecord,
  clearRecords,
  getFullJson,
  getRecords,
  subscribeRecords,
} from './attachment_store';

const BALL_SIZE = 48;

function formatSize(size: number | null): string {
  if (size == null) {
    return '大小未知';
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * 悬浮附件工具：常态为可拖动小球（绿色，与蓝色日志球区分），点开为全屏面板。
 * 选择附件 → 记录入 store → 复制路径/JSON 粘贴进测试参数（剪贴板契约），
 * 与测试项零耦合。生命周期独立于任何页面，由 App 在 init 成功后挂载。
 */
export function FloatingAttachment() {
  const insets = useSafeAreaInsets();
  // 默认在日志球（x:16, y:120）正下方
  const pan = useRef(new Animated.ValueXY({ x: 16, y: 184 })).current;
  const [panelVisible, setPanelVisible] = useState(false);
  const [picking, setPicking] = useState<AttachmentKind | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, setVersion] = useState(0);

  useEffect(() => subscribeRecords(() => setVersion((v) => v + 1)), []);

  // 拖动距离超过阈值视为拖动，否则视为点击（打开面板）
  const moved = useRef(false);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        moved.current = false;
        pan.extractOffset();
      },
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
          moved.current = true;
        }
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(evt, gestureState);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        if (!moved.current) {
          setPanelVisible(true);
        }
      },
    })
  ).current;

  const records = getRecords();

  const onPick = useCallback(async (kind: AttachmentKind) => {
    setPicking(kind);
    setErrorMsg(null);
    try {
      const record = await pickAttachment(kind);
      if (record) {
        addRecord(record);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      addLog('attachment.error', { kind, message });
      setErrorMsg(message);
    } finally {
      setPicking(null);
    }
  }, []);

  const copyText = useCallback((key: string, text: string) => {
    Clipboard.setString(text);
    setCopiedKey(key);
    if (copyTimer.current) {
      clearTimeout(copyTimer.current);
    }
    copyTimer.current = setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  return (
    <>
      <Animated.View
        style={[
          styles.ball,
          {
            transform: pan.getTranslateTransform(),
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.ballText}>附件</Text>
      </Animated.View>

      <Modal
        visible={panelVisible}
        animationType="slide"
        onRequestClose={() => setPanelVisible(false)}
      >
        <View style={[styles.panel, { paddingTop: insets.top + 8 }]}>
          <View style={styles.toolbar}>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => clearRecords()}
            >
              <Text style={styles.toolButtonText}>清空</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => copyText('__all__', getFullJson())}
            >
              <Text style={styles.toolButtonText}>
                {copiedKey === '__all__' ? '已复制' : '复制全部'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => setPanelVisible(false)}
            >
              <Text style={styles.toolButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.kindRow}>
            {ATTACHMENT_KINDS.map((kind) => (
              <TouchableOpacity
                key={kind}
                style={[
                  styles.kindButton,
                  picking !== null && styles.kindButtonDisabled,
                ]}
                disabled={picking !== null}
                onPress={() => onPick(kind)}
              >
                {picking === kind ? (
                  <ActivityIndicator size="small" color="#1e88e5" />
                ) : (
                  <Text style={styles.kindButtonText}>
                    {ATTACHMENT_KIND_LABELS[kind]}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {errorMsg ? (
            <Text style={styles.error}>选择失败：{errorMsg}</Text>
          ) : null}
          <ScrollView style={styles.recordList}>
            {records.length === 0 ? (
              <Text style={styles.empty}>
                暂无附件记录，点击上方按钮选择；{'\n'}
                选中后复制路径，粘贴到测试参数的 filePath 字段。
              </Text>
            ) : (
              records.map((r) => (
                <RecordItem
                  key={r.pickedAt + r.path}
                  record={r}
                  copiedKey={copiedKey}
                  onCopy={copyText}
                />
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

function RecordItem(props: {
  record: AttachmentRecord;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const { record, copiedKey, onCopy } = props;
  const pathKey = `path:${record.pickedAt}`;
  const jsonKey = `json:${record.pickedAt}`;
  const meta = [
    formatSize(record.size),
    record.width !== undefined && record.height !== undefined
      ? `${record.width}×${record.height}`
      : null,
    formatTime(record.pickedAt),
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <View style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordTitle}>
          {ATTACHMENT_KIND_LABELS[record.kind]} · {record.name}
        </Text>
        <TouchableOpacity onPress={() => onCopy(pathKey, record.path)}>
          <Text style={styles.recordAction}>
            {copiedKey === pathKey ? '已复制' : '复制路径'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onCopy(jsonKey, recordToJson(record))}>
          <Text style={styles.recordAction}>
            {copiedKey === jsonKey ? '已复制' : '复制JSON'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.recordPath} selectable>
        {record.path}
      </Text>
      <Text style={styles.recordMeta}>{meta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#43a047',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    zIndex: 999,
  },
  ballText: {
    color: '#fff',
    fontSize: 12,
  },
  panel: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  toolButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#1e88e5',
    borderRadius: 4,
  },
  toolButtonText: {
    color: '#fff',
  },
  kindRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  kindButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1e88e5',
    borderRadius: 4,
    alignItems: 'center',
  },
  kindButtonDisabled: {
    opacity: 0.5,
  },
  kindButtonText: {
    color: '#1e88e5',
  },
  error: {
    color: '#c62828',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  recordList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 20,
  },
  recordItem: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordTitle: {
    flex: 1,
    color: '#222',
    fontWeight: '500',
  },
  recordAction: {
    color: '#1e88e5',
    marginLeft: 12,
  },
  recordPath: {
    fontFamily: 'Menlo',
    fontSize: 11,
    color: '#555',
    marginTop: 4,
  },
  recordMeta: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
});

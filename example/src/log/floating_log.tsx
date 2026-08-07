import Clipboard from '@react-native-clipboard/clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import {
  clearEntries,
  foldText,
  formatEntry,
  getEntries,
  getFullLogText,
  subscribeLogs,
} from './log_store';

const BALL_SIZE = 48;

/**
 * 悬浮日志：常态为可拖动小球，点开为全屏日志面板（Modal）。
 * 生命周期独立于任何页面，由 App 在 init 成功后挂载。
 */
export function FloatingLog() {
  const insets = useSafeAreaInsets();
  const pan = useRef(new Animated.ValueXY({ x: 16, y: 120 })).current;
  const [panelVisible, setPanelVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, setVersion] = useState(0);

  useEffect(() => subscribeLogs(() => setVersion((v) => v + 1)), []);

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

  const entries = getEntries();

  const copyAll = useCallback(() => {
    Clipboard.setString(getFullLogText());
    setCopied(true);
    if (copyTimer.current) {
      clearTimeout(copyTimer.current);
    }
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
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
        <Text style={styles.ballText}>日志</Text>
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
              onPress={() => clearEntries()}
            >
              <Text style={styles.toolButtonText}>清空</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton} onPress={copyAll}>
              <Text style={styles.toolButtonText}>
                {copied ? '已复制' : '复制全部'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => setPanelVisible(false)}
            >
              <Text style={styles.toolButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.logList}>
            {entries.length === 0 ? (
              <Text style={styles.empty}>暂无日志</Text>
            ) : (
              entries.map((e) => (
                <Text key={e.seq} style={styles.logLine} selectable>
                  {foldText(formatEntry(e))}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#1e88e5',
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
  logList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  logLine: {
    fontFamily: 'Menlo',
    fontSize: 11,
    color: '#222',
    marginVertical: 2,
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

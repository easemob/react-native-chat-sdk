import Clipboard from '@react-native-clipboard/clipboard';
import { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * 可复制文本区：内容可选中，右上角提供一键复制按钮。
 */
export function CopyableText(props: { text: string; maxHeight?: number }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = () => {
    Clipboard.setString(props.text);
    setCopied(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View
      style={[
        styles.box,
        props.maxHeight ? { maxHeight: props.maxHeight } : null,
      ]}
    >
      <ScrollView nestedScrollEnabled>
        <Text style={styles.text} selectable>
          {props.text}
        </Text>
      </ScrollView>
      <TouchableOpacity style={styles.copyButton} onPress={onCopy}>
        <Text style={styles.copyButtonText}>{copied ? '已复制' : '复制'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    margin: 12,
  },
  text: {
    fontFamily: 'Menlo',
    fontSize: 12,
    color: '#222',
  },
  copyButton: {
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#1e88e5',
    borderRadius: 4,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});

import * as React from 'react';
import {
  Button as RNButton,
  Pressable,
  Text,
  StyleSheet,
  Platform,
  type ColorValue,
} from 'react-native';
import { isTurboModuleEnabled } from './rn_features';
export type ButtonProps = React.Attributes & {
  title: string;
  onPress?: () => void;
  color?: ColorValue | undefined;
};
export function Button(props: ButtonProps) {
  const { title, onPress, key, color } = props;
  if (isTurboModuleEnabled()) {
    return (
      <Pressable
        key={key}
        style={[
          {
            backgroundColor: color,
          },
          styles.button,
        ]}
        onPress={() => {
          // issue: react native, android, newArchEnabled=true, hermesEnabled=true, click button is not working
          // https://github.com/software-mansion/react-native-screens/pull/2292
          // https://github.com/facebook/react-native/issues/44643
          // https://github.com/DrZoidberg09/RN-Android-Touch-Issue/
          console.log('dev:onPress');
        }}
        onPressIn={() => {
          console.log('dev:onPressIn');
          onPress?.();
        }}
        onPressOut={() => {
          console.log('dev:onPressOut');
        }}
      >
        <Text style={styles.text}>{title}</Text>
      </Pressable>
    );
  } else {
    return <RNButton key={key} title={title} onPress={onPress} color={color} />;
  }
}

// from node_modules/react-native/Libraries/Components/Button.js
const styles = StyleSheet.create({
  button: Platform.select({
    ios: {},
    android: {
      elevation: 4,
      // Material design blue from https://material.google.com/style/color.html#color-color-palette
      backgroundColor: '#2196F3',
      borderRadius: 2,
    } as any,
  }),
  text: {
    textAlign: 'center',
    margin: 8,
    ...Platform.select({
      ios: {
        // iOS blue from https://developer.apple.com/ios/human-interface-guidelines/visual-design/color/
        color: '#007AFF',
        fontSize: 18,
      },
      android: {
        color: 'white',
        fontWeight: '500',
      },
    }),
  },
});

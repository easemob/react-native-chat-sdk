import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef, type RootStackParamList } from './navigation';
import { SdkStateProvider, useSdkState } from './sdk_state';
import { InitPage } from './pages/InitPage';
import { LoginPage } from './pages/LoginPage';
import { SearchPage } from './pages/SearchPage';
import { ApiCallPage } from './pages/ApiCallPage';
import { FloatingLog } from './log/floating_log';
import { FloatingAttachment } from './tools/floating_attachment';
import { addLog, LOG_FILE_PATH } from './log/log_store';
import { isAutoMode, runAutoMode, type AutoModeHooks } from './auto/auto_mode';
import { isCiMode, runCiMode } from './ci/ci_mode';
import { isAgentMode, runAgentMode } from './agent/agent_mode';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** 顶部状态条常显三态：未初始化 / 已初始化未登录 / 已登录：<userId>，不做硬性门控 */
function StatusBar() {
  const sdk = useSdkState();
  const text = !sdk.initialized
    ? '未初始化'
    : sdk.loggedIn
      ? `已登录：${sdk.currentUser ?? ''}`
      : '已初始化，未登录';
  return (
    <View style={styles.statusBar}>
      <Text style={styles.statusText}>{text}</Text>
    </View>
  );
}

/** 悬浮日志在 init 成功后挂载，生命周期独立于任何页面 */
function FloatingLogHost() {
  const sdk = useSdkState();
  return sdk.initialized ? <FloatingLog /> : null;
}

/** 悬浮附件工具同样在 init 成功后挂载（绿色球，默认在日志球下方） */
function FloatingAttachmentHost() {
  const sdk = useSdkState();
  return sdk.initialized ? <FloatingAttachment /> : null;
}

function CiModeRunner() {
  useEffect(() => {
    if (isCiMode()) {
      runCiMode();
    }
  }, []);
  return null;
}

// 第三种自动化模式（编排 agent，reverse 通道）：EASEMOB_AGENT 内联且 Debug
// 构建时运行；与 CI_RUN / API_SCRIPT 互斥，冲突由 runAgentMode 报错并拒绝启动
function AgentModeRunner() {
  useEffect(() => {
    if (isAgentMode()) {
      runAgentMode();
    }
  }, []);
  return null;
}

function AutoModeRunner() {
  const sdk = useSdkState();
  useEffect(() => {
    // 启动即打印日志文件绝对路径（真机/模拟器脱离控制台后追溯用）
    addLog('log.path', { path: LOG_FILE_PATH });
    // CI_RUN 内联时 auto 模式必须让位：两者同时内联是构建配置错误，
    // 由 runCiMode 报错并发 script.done（failed=1）fail-fast，互不静默优先
    if (isCiMode()) {
      return;
    }
    if (isAutoMode()) {
      const hooks: AutoModeHooks = {
        markInitialized: sdk.markInitialized,
        markLoggedIn: sdk.markLoggedIn,
      };
      runAutoMode(hooks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SdkStateProvider>
        <AppBody />
      </SdkStateProvider>
    </SafeAreaProvider>
  );
}

function AppBody() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <CiModeRunner />
      <AgentModeRunner />
      <AutoModeRunner />
      <StatusBar />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Init">
          <Stack.Screen
            name="Init"
            component={InitPage}
            options={{ title: '初始化', headerBackVisible: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginPage}
            options={{ title: '登录', headerBackVisible: false }}
          />
          <Stack.Screen
            name="Search"
            component={SearchPage}
            options={{ title: 'API 搜索' }}
          />
          <Stack.Screen
            name="ApiCall"
            component={ApiCallPage}
            options={{ title: 'API 调用' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <FloatingLogHost />
      <FloatingAttachmentHost />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBar: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#263238',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
});

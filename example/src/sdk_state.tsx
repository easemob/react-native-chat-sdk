import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface SdkState {
  initialized: boolean;
  loggedIn: boolean;
  currentUser: string | null;
  /** 初始化页 ChatOptions JSON 快照，跳转后仍展示在登录页顶部 */
  initOptionsJson: string | null;
  markInitialized: (optionsJson: string) => void;
  markLoggedIn: (userId: string) => void;
  markLoggedOut: () => void;
}

const SdkStateContext = createContext<SdkState | null>(null);

export function SdkStateProvider(props: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [initOptionsJson, setInitOptionsJson] = useState<string | null>(null);

  const markInitialized = useCallback((optionsJson: string) => {
    setInitOptionsJson(optionsJson);
    setInitialized(true);
  }, []);
  const markLoggedIn = useCallback((userId: string) => {
    setCurrentUser(userId);
    setLoggedIn(true);
  }, []);
  const markLoggedOut = useCallback(() => {
    setCurrentUser(null);
    setLoggedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      initialized,
      loggedIn,
      currentUser,
      initOptionsJson,
      markInitialized,
      markLoggedIn,
      markLoggedOut,
    }),
    [
      initialized,
      loggedIn,
      currentUser,
      initOptionsJson,
      markInitialized,
      markLoggedIn,
      markLoggedOut,
    ]
  );

  return (
    <SdkStateContext.Provider value={value}>
      {props.children}
    </SdkStateContext.Provider>
  );
}

export function useSdkState(): SdkState {
  const ctx = useContext(SdkStateContext);
  if (ctx == null) {
    throw new Error('useSdkState must be used within SdkStateProvider');
  }
  return ctx;
}

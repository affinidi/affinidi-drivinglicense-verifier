import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import SdkService from "utils/SdkService";

const SDK_AUTHENTICATION_LOCAL_STORAGE_KEY = "affinidi:accessToken";

type AuthenticationContextProps = {
  loading: boolean;
  authenticated: boolean;
  sdk: SdkService | undefined;
  login: {
    fromLoginAndPassword: typeof SdkService["fromLoginAndPassword"];
  };
  signOut(): Promise<void>;
};

const AuthenticationContext = createContext<AuthenticationContextProps>(
  null as any
);

export const useAuthentication = (): AuthenticationContextProps => {
  return useContext(AuthenticationContext);
};

type LoginState = {
  loading: boolean;
  authenticated: boolean;
  sdk: SdkService | undefined;
};

type FuncType<T> = (...args: any[]) => Promise<T>;

export const AuthenticationProvider: FC = ({ children }) => {
  const [loginState, setLoginState] = useState<LoginState>({
    loading: false,
    authenticated: false,
    sdk: undefined,
  });

  const { login, signOut, fromAccessToken } = useMemo(() => {
    function wrapLoginFunc(func: FuncType<SdkService>): FuncType<SdkService> {
      return async function (...args) {
        if (loginState.authenticated) {
          throw new Error(
            "you can not login when you are already authenticated"
          );
        }

        setLoginState({ ...loginState, loading: true });

        try {
          const sdk = await func(...args);

          setLoginState({
            ...loginState,
            loading: false,
            authenticated: true,
            sdk,
          });

          localStorage.setItem(
            SDK_AUTHENTICATION_LOCAL_STORAGE_KEY,
            sdk.accessToken
          );

          return sdk;
        } catch (err) {
          setLoginState({
            ...loginState,
            loading: false,
            authenticated: false,
            sdk: undefined,
          });
          throw err;
        }
      };
    }

    const login = {
      fromLoginAndPassword: wrapLoginFunc(SdkService.fromLoginAndPassword),
    };

    async function signOut() {
      if (!loginState.authenticated) {
        throw new Error("you can not sign out if you are not authenticated");
      }

      setLoginState({ ...loginState, loading: true });

      try {
        const result = await loginState.sdk!.signOut();

        localStorage.removeItem(SDK_AUTHENTICATION_LOCAL_STORAGE_KEY);
        setLoginState({
          ...loginState,
          loading: false,
          authenticated: false,
          sdk: undefined,
        });

        return result;
      } catch (err) {
        setLoginState({ ...loginState, loading: false });
        throw err;
      }
    }

    return {
      login,
      signOut,
      fromAccessToken: wrapLoginFunc(SdkService.fromAccessToken),
    };
  }, [loginState, setLoginState]);

  useEffect(() => {
    const accessToken = localStorage.getItem(
      SDK_AUTHENTICATION_LOCAL_STORAGE_KEY
    );

    if (accessToken) {
      fromAccessToken(accessToken).catch((err) => console.error(err));
    }
  }, []);

  return (
    <AuthenticationContext.Provider
      value={{ ...loginState, login, signOut }}
      children={children}
    />
  );
};

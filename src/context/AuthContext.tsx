import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { getToken, setToken, removeToken } from '../utils/storage';
import { getMe } from '../api/user';
import { logout as apiLogout } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; token: string; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'UPDATE_USER'; user: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.user,
        token: action.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'UPDATE_USER':
      return { ...state, user: action.user };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  const login = useCallback((token: string, user: User) => {
    setToken(token);
    dispatch({ type: 'LOGIN', token, user });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore logout API errors
    }
    removeToken();
    dispatch({ type: 'LOGOUT' });
    navigate('/login', { replace: true });
  }, [navigate]);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', user });
  }, []);

  // Validate stored token on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      return;
    }

    getMe()
      .then((res) => {
        if (res.code === 200 && res.data) {
          dispatch({ type: 'LOGIN', token, user: res.data });
        } else {
          removeToken();
          dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(() => {
        removeToken();
        dispatch({ type: 'LOGOUT' });
      });
  }, []);

  // Listen for forced logout events (token expired)
  useEffect(() => {
    const handleTokenExpired = () => {
      removeToken();
      navigate('/login', { replace: true });
      dispatch({ type: 'LOGOUT' });
    };
    window.addEventListener('auth:token-expired', handleTokenExpired);
    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, [navigate]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    updateUser,
    isAdmin: state.user?.role === 1,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { getStoredToken, setStoredToken } from "@/api/client";
import { fetchCurrentUser, signIn as apiSignIn, signUp as apiSignUp } from "@/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(!!getStoredToken());

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const t = getStoredToken();
      if (!t) {
        setBootstrapping(false);
        return;
      }
      try {
        const me = await fetchCurrentUser();
        if (!cancelled && me?.email) {
          setUser({ email: me.email });
        }
      } catch {
        if (!cancelled) {
          setStoredToken(null);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await apiSignIn(credentials);
      setToken(data.token);
      setUser({ email: data.email });
      navigate("/dashboard", { replace: true });
    },
    [navigate]
  );

  const signup = useCallback(async (payload) => {
    return apiSignUp(payload);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      token,
      user,
      bootstrapping,
      isAuthenticated: !!token,
      login,
      signup,
      logout,
    }),
    [token, user, bootstrapping, login, signup, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

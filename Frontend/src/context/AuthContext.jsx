import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cinevault_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cinevault_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem('cinevault_user');
        localStorage.removeItem('cinevault_token');
      }
    }
    return null;
  });
  const [loading] = useState(false);

  const persist = useCallback((data) => {
    const t = data.token;
    const u = data.user;
    localStorage.setItem('cinevault_token', t);
    localStorage.setItem('cinevault_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    persist(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authApi.register({ name, email, password });
    persist(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('cinevault_token');
    localStorage.removeItem('cinevault_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, isAdmin, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('cinevault_token');
    const savedUser = localStorage.getItem('cinevault_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('cinevault_token');
        localStorage.removeItem('cinevault_user');
      }
    }
    setLoading(false);
  }, []);

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

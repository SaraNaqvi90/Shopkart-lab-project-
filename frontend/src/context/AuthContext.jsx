import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentCustomer, logoutCustomer } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On first load, ask the backend who (if anyone) the HttpOnly
  // cookie belongs to, instead of trusting anything stored client-side.
  useEffect(() => {
    getCurrentCustomer()
      .then((res) => setCustomer(res.data))
      .catch(() => setCustomer(null))
      .finally(() => setCheckingSession(false));
  }, []);

  const login = useCallback((customerData) => {
    setCustomer(customerData);
  }, []);

  const logout = useCallback(async () => {
    await logoutCustomer();
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider value={{ customer, checkingSession, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { UserRole } from '../../types';

type AuthUserRole = UserRole | null;

interface AuthContextType {
  userRole: AuthUserRole;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<AuthUserRole>(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('simalem_user_role');
    return (saved as UserRole) || null;
  });

  const login = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('simalem_user_role', role);
  };

  const logout = () => {
    setUserRole(null);
    localStorage.removeItem('simalem_user_role');
  };

  return (
    <AuthContext.Provider value={{ userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
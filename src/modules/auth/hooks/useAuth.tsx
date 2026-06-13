'use client';

import React, { createContext, useContext } from 'react';
import { AuthContextType } from '../domain/AuthContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AuthContextType;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// For compatibility with the rest of the project
export function usePrivy() {
  return useAuth();
}

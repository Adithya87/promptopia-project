"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  isMounted: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const storedIsAdmin = sessionStorage.getItem('isAdmin');
      if (storedIsAdmin === 'true') {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error("Could not access session storage.");
    } finally {
        setIsMounted(true);
    }
  }, []);

  const login = (user: string, pass: string) => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout, isMounted }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

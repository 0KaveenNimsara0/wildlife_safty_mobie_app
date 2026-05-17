import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService, { Role } from '../services/AuthService';

interface User {
  uid: string;
  email: string;
  displayName: string;
  role?: Role;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isLoading: boolean;
  login: (user: User, token: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  role: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async (
    activeToken?: string, 
    activeRole?: Role, 
    activeUid?: string
  ) => {
    const t = activeToken || token;
    const r = activeRole || role;
    const u = activeUid || user?.uid;

    if (!t || !r || !u) return;

    try {
      const res = await AuthService.getProfile(u, r, t);
      const userData = res.user || res.medicalOfficer || res;
      if (userData) {
        // Enforce role consistency
        const enrichedUser = { ...userData, role: r };
        setUser(enrichedUser);
        await AsyncStorage.setItem('userData', JSON.stringify(enrichedUser));
      }
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');
        const storedRole = await AsyncStorage.getItem('userRole');

        if (storedToken && storedUser && storedRole) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setRole(storedRole as Role);
          
          // Refresh profile from backend to get latest data (like photoURL)
          refreshProfile(storedToken, storedRole as Role, parsedUser.uid);
        }
      } catch (e) {
        console.error('Failed to load auth data from storage', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (userData: User, userToken: string, userRole: Role) => {
    try {
      // Append role to userData for convenience
      const enrichedUser = { ...userData, role: userRole };
      
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userData', JSON.stringify(enrichedUser));
      await AsyncStorage.setItem('userRole', userRole);

      setToken(userToken);
      setUser(enrichedUser);
      setRole(userRole);
    } catch (e) {
      console.error('Failed to save auth data to storage', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userRole');

      setToken(null);
      setUser(null);
      setRole(null);
    } catch (e) {
      console.error('Failed to clear auth data from storage', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, role, isLoading, login, logout, refreshProfile: () => refreshProfile() }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    authService.setToken(null);
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const response = await authService.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      authService.setToken(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (accessToken, refreshToken, userData) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setToken(accessToken);
    authService.setToken(accessToken);
    setUser(userData);
  };

  const isAdmin = () => user && user.role === 'admin';
  const isLeader = () => user && (user.role === 'leader' || user.role === 'admin');

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isLeader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


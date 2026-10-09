import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('drivego_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.data) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load session, clearing stale token');
        localStorage.removeItem('drivego_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('drivego_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('drivego_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('drivego_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const res = await api.put('/auth/profile', formData);
    const updated = res.data.data;
    setUser(updated);
    return updated;
  };

  // Quick Account Switcher for MCA project demonstration
  const switchAccount = async (roleType) => {
    let email = 'customer1@drivego.com';
    let password = 'password123';

    if (roleType === 'admin') {
      email = 'admin@drivego.com';
      password = 'admin123';
    } else if (roleType === 'owner') {
      email = 'owner1@drivego.com';
      password = 'password123';
    } else if (roleType === 'customer') {
      email = 'customer1@drivego.com';
      password = 'password123';
    }

    return await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        switchAccount,
      }}
    >
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

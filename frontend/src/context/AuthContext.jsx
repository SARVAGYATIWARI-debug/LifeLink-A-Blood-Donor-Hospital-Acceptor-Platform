import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default axios config
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  axios.defaults.withCredentials = true;

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (role, data) => {
    try {
      const res = await axios.post(`/api/auth/${role}/login`, data);
      setUser(res.data.data);
      return true;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const register = async (role, data) => {
    try {
      const res = await axios.post(`/api/auth/${role}/register`, data);
      setUser(res.data.data);
      return true;
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, fetchUser, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

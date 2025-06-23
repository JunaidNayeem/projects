import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, getCurrentUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser(token)
        .then(response => {
          setUser(response.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = async (email, password) => {
    const response = await login(email, password);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    navigate('/admin/dashboard');
  };

  const registerUser = async (username, email, password) => {
    const response = await register(username, email, password);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    navigate('/admin/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
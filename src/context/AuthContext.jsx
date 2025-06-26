import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, getCurrentUser } from '../utils/services/api';

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
    try{

     const response = await login(email, password);
    const loggedInUser = response.data.user;
    localStorage.setItem('token', response.data.token);
    setUser(loggedInUser);
    navigate(`/${loggedInUser.username}/dashboard`);
  } catch (err) {
    console.log(err.message || "Login failed");
  }
  };

  const registerUser = async (username, email, password) => {
    const response = await register(username, email, password);
     const newUser = response.data.user;
    localStorage.setItem('token', response.data.token);
    setUser(newUser);
    navigate(`/${newUser.username}/dashboard`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
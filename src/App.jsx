import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Projects from './pages/Projects';
import UserShowcase from './pages/UserShowcase';
import Login from './components/admin/Login';
import Register from './components/admin/Register';
import Dashboard from './components/admin/Dashboard';
import './App.css';

function App() {
  return (
    
    <ThemeProvider>
        <Router>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Projects />} />
            <Route path="/showcase/:userId" element={<UserShowcase />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/:username/dashboard" element={<Dashboard />} />
          </Routes>
      </AuthProvider>
        </Router>
    </ThemeProvider>
    
  );
}

export default App;
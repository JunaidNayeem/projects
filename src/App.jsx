import Projects from './pages/Projects';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 bg-white ">
        <Projects />
      </div>
    </ThemeProvider>
  );
}

export default App;
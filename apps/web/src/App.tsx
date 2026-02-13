import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Contact from './pages/Contact'
import Help from './pages/Help'
import Team from './pages/Team'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  const [isloggedin, setIsloggedin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          credentials: 'include'
        });
        if (response.ok) {
          setIsloggedin(true);
        } else {
          setIsloggedin(false);
        }
      } catch (err) {
        console.error("Session check failed", err);
        setIsloggedin(false);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <ThemeProvider defaultTheme="system">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login isloggedin={isloggedin} setIsloggedin={setIsloggedin} />} />
        <Route path="/dashboard" element={isloggedin ? <Dashboard /> : <Login isloggedin={isloggedin} setIsloggedin={setIsloggedin} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/team" element={<Team />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  )
}

export default App

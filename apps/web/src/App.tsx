import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Complaint from './pages/Complaint'
import Manage from './pages/Manage'
import Contact from './pages/Contact'
import Help from './pages/Help'
import Team from './pages/Team'
import Profile from './pages/Profile'
import Announcements from './pages/Announcements'
import Feedback from './pages/Feedback'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  const [isloggedin, setIsloggedin] = useState<boolean>(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setIsloggedin(true);
          setUserRole(data.user_role);
        } else {
          setIsloggedin(false);
          setUserRole(null);
        }
      } catch (err) {
        console.error("Session check failed", err);
        setIsloggedin(false);
        setUserRole(null);
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
      <Navbar isloggedin={isloggedin} userRole={userRole} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login isloggedin={isloggedin} setIsloggedin={setIsloggedin} setUserRole={setUserRole} />} />
        <Route path="/dashboard" element={isloggedin ? <Dashboard /> : <Login isloggedin={isloggedin} setIsloggedin={setIsloggedin} setUserRole={setUserRole} />} />
        <Route path="/manage" element={isloggedin && userRole === 'admin' ? <Manage /> : <Login isloggedin={isloggedin} setIsloggedin={setIsloggedin} setUserRole={setUserRole} />} />
        <Route path="/complaint" element={isloggedin ? <Complaint /> : <Login isloggedin={isloggedin} setIsloggedin={setIsloggedin} setUserRole={setUserRole} />} />
        <Route path="/announcements" element={isloggedin ? <Announcements /> : <Login isloggedin={isloggedin} setIsloggedin={setIsloggedin} setUserRole={setUserRole} />} />
        <Route path="/feedback" element={isloggedin ? <Feedback /> : <Login isloggedin={isloggedin} setIsloggedin={setIsloggedin} setUserRole={setUserRole} />} />
        <Route path="/profile" element={isloggedin ? <Profile /> : <Login isloggedin={isloggedin} setIsloggedin={setIsloggedin} setUserRole={setUserRole} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/team" element={<Team />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  )
}

export default App

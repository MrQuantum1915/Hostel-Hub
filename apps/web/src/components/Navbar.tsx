import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface NavbarProps {
  isloggedin: boolean
}

function Navbar({ isloggedin }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex flex-row items-center justify-between">
        <Link to="/" className="flex flex-row items-center group">
          <div className="relative overflow-hidden">
            <img className="max-w-12 mx-auto border border-border rounded-full transition-transform duration-300 group-hover:scale-110" src="/logo.webp" alt="Hostel Hub Logo" />
          </div>
          <div className="ml-3 text-2xl font-bold font-serif tracking-tight text-foreground group-hover:text-accent transition-colors duration-300">
            HOSTEL HUB
          </div>
        </Link>

        {/* desktop */}
        <div className="hidden md:flex flex-row items-center gap-8">
          {['Home', 'Dashboard', 'Contact'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              {item}
            </Link>
          ))}
          {isloggedin ? (
            <Link
              to="/profile"
              className="px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
            >
              Profile
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
            >
              Login
            </Link>
          )}
          <ThemeToggle />
        </div>

        {/* mobile */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <button className="text-foreground hover:text-accent transition-colors" onClick={toggleMenu}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-b border-border bg-background/95 backdrop-blur-xl p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5 fade-in duration-300">
          {['Home', 'Dashboard', 'Contact'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="text-lg font-medium text-muted-foreground hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </Link>
          ))}
          {isloggedin ? (
            <Link
              to="/profile"
              className="text-lg font-bold text-accent hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-lg font-bold text-accent hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
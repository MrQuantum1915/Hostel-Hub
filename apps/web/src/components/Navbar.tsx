import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="container mx-auto flex flex-row items-center justify-between">
        <Link to="/" className="flex flex-row items-center group">
          <div className="relative overflow-hidden">
            <img className="max-w-12 mx-auto transition-transform duration-300 group-hover:scale-110" src="/logo.webp" alt="Hostel Hub Logo" />
          </div>
          <div className="ml-3 text-2xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors duration-300">
            HOSTEL HUB
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-row items-center gap-8">
          {['Home', 'Dashboard', 'Contact'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="relative text-sm font-medium text-white/70 hover:text-white transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-amber-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white hover:text-amber-400 transition-colors" onClick={toggleMenu}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-b border-white/5 bg-black/90 backdrop-blur-xl p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-5 fade-in duration-300">
          {['Home', 'Dashboard', 'Contact'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="text-lg font-medium text-white/70 hover:text-amber-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar
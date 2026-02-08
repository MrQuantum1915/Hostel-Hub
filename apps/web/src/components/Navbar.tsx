import { Link } from 'react-router-dom'

function Navbar() {
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
        <div className="flex flex-row items-center gap-8">
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
      </div>
    </nav>
  )
}

export default Navbar
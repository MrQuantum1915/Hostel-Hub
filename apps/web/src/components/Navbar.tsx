
function Navbar() {
  return (
    <nav className="w-full h-fit px-4 py-3 top-0 border-b border-gray-300/50 flex flex-row items-center justify-between">
      <div className=" flex flex-row items-center">
        <img className="max-w-16 mx-auto" src="/logo.webp" alt="Hostel Hub Logo" />
        <div className="text-3xl text-center text-amber-50 font-bold">
          HOSTEL HUB
        </div>
      </div>
      <div className="flex flex-row items-center gap-4">
        <a href="#" className="text-xl hover:text-amber-50 text-white/70 transition-colors duration-300">
          Home
        </a>
        <a href="#" className="text-xl hover:text-amber-50 text-white/70 transition-colors duration-300">
          Dashboard
        </a>  
        <a href="#" className="text-xl hover:text-amber-50 text-white/70 transition-colors duration-300">
          Contact
        </a>
      </div>
    </nav>
  )
}

export default Navbar
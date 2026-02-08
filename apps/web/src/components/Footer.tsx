import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'

function Footer() {
  return (
    <footer className="w-full border-t border-gray-300/50 py-8 mt-auto relative z-10 bg-black">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-0">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="text-6xl md:text-7xl font-black text-white/10 tracking-widest select-none pointer-events-none uppercase leading-none">
            Hostel / Hub
          </div>
          <p className="text-sm text-white/40 font-medium">
            &copy; {new Date().getFullYear()} Hostel Hub. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-8 md:gap-12 w-full md:w-auto">
          <div className="flex flex-col gap-3 items-center md:items-start">
            <span className="text-xs font-bold text-amber-50 uppercase tracking-widest">Platform</span>
            <nav className="flex flex-col gap-2 items-center md:items-start">
              <Link to="/complaints" className="text-sm text-white/70 hover:text-amber-50 transition-colors">Complaints</Link>
              <Link to="/announcements" className="text-sm text-white/70 hover:text-amber-50 transition-colors">Announcements</Link>
              <Link to="/mess-feedback" className="text-sm text-white/70 hover:text-amber-50 transition-colors">Mess Feedback</Link>
            </nav>
          </div>
          <div className="flex flex-col gap-3 items-center md:items-start">
            <span className="text-xs font-bold text-amber-50 uppercase tracking-widest">Support</span>
            <nav className="flex flex-col gap-2 items-center md:items-start">
              <Link to="/help" className="text-sm text-white/70 hover:text-amber-50 transition-colors">Help</Link>
              <Link to="/contact" className="text-sm text-white/70 hover:text-amber-50 transition-colors">Contact</Link>
            </nav>
          </div>
          <div className="flex flex-col gap-3 items-center md:items-start">
            <span className="text-xs font-bold text-amber-50 uppercase tracking-widest">Dev</span>
            <nav className="flex flex-col gap-2 items-center md:items-start">
              <Link to="/team" className="text-sm text-white/70 hover:text-amber-50 transition-colors">Team</Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/70 hover:text-amber-50 transition-colors">
                <Github className="w-4 h-4" />
                <span>Source</span>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
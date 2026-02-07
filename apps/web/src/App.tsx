import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <div className='text-8xl text-center flex flex-col items-center justify-center min-h-screen'>
        Welcome to HOSTEL HUB!
      </div>
      <Footer />
    </>
  )
}

export default App

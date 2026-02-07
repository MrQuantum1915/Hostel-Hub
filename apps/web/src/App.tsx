import './App.css'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

interface TestData {
  data: string
}

function App() {
  const [test, settest] = useState<TestData | null>(null);

  const handleClick = async () => {
    if(test){
      settest(null);
      return;
    }
    const response = await fetch('http://localhost:3000/')
    const data = await response.json()
    console.log(data)
    settest(data)
  }

  return (
    <>
      <Navbar />
      <div className='text-8xl text-center flex flex-col items-center justify-center min-h-screen'>
        Welcome to HOSTEL HUB!
        <button className="border-2 rounded-md p-4 m-4 bg-amber-50/20 text-4xl " onClick={handleClick}>Test Server</button>
        {test && <p className='text-4xl mt-4'>{test.data}</p>}
      </div>
      <Footer />
    </>
  )
}

export default App

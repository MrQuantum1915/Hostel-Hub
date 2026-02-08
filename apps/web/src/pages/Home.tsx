import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { useState } from 'react'

interface TestData {
    status: string
    time: string
}

function Home() {
    const [test, settest] = useState<TestData | null>(null);

    const handleClick = async () => {
        if (test) {
            settest(null);
            return;
        }
        const response = await fetch('http://localhost:3000/db-test')
        const { status, time } = await response.json()
        console.log({ status, time })
        settest({ status, time })
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 md:pt-20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-tight">
                    Streamline Your <br />
                    <span className="text-gradient">Hostel Experience</span>
                </h1>

                <p className="max-w-2xl text-lg md:text-xl text-white/60 mb-10 leading-relaxed">
                    A centralized platform for complaints, room assets, announcements, and mess feedback.
                    Improving communication for students and administration.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                    <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-amber-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2 group">
                        <ClipboardList className="w-5 h-5" />
                        <span>Go to Dashboard</span>
                    </Link>
                    <Link to="/complaint" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                        <span>File a Complaint</span>
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="mt-8 flex flex-col items-center">
                    <button
                        className="px-6 py-3 border border-amber-500/30 bg-amber-500/10 text-amber-200 rounded-lg font-bold hover:bg-amber-500/20 transition-all"
                        onClick={handleClick}
                    >
                        Test Server
                    </button>
                    {test && (
                        <p className='text-lg mt-4 text-green-400 font-mono bg-black/50 p-2 rounded border border-green-500/30'>
                            {test.status} to PostgreSQL Database on Time- {test.time}
                        </p>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full max-w-4xl">
                    {[
                        { label: 'Complaints Resolved', value: '1,200+' },
                        { label: 'Rooms Managed', value: '450+' },
                        { label: 'Mess Feedbacks', value: '5k+' },
                        { label: 'Uptime', value: '99.9%' },
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-white">{stat.value}</span>
                            <span className="text-sm text-white/40 uppercase tracking-widest mt-1">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Home

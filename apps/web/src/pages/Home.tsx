import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { useState } from 'react'

interface TestData {
    status: string
    time: string
}

function Home() {
    const [test, settest] = useState<TestData>({ status: "Disconnected", time: "0ms" });

    const handleClick = async () => {
        if (test.status === "Connected") {
            settest({ status: "Disconnected", time: "0ms" });
            return;
        }
        const response = await fetch('http://localhost:3000/db-test')
        const { status, time } = await response.json()
        console.log({ status, time })
        settest({ status, time })
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 md:pt-20 overflow-hidden bg-background text-foreground">

            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-foreground mb-6 leading-tight">
                    Streamline Your <br />
                    <span className="text-accent italic">Hostel Experience</span>
                </h1>

                <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed font-light">
                    A centralized platform for complaints, room assets, announcements, and mess feedback.
                    Improving communication for students and administration.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                    <Link to="/dashboard" className="w-full sm:w-auto px-8 py-3.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <ClipboardList className="w-5 h-5" />
                        <span>Go to Dashboard</span>
                    </Link>
                    <Link to="/complaint" className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-foreground font-medium rounded-lg border border-border hover:bg-muted transition-all flex items-center justify-center gap-2">
                        <span>File a Complaint</span>
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="mt-8 flex flex-col items-center">
                    <button
                        className="px-6 py-3 border border-border bg-muted/50 text-foreground rounded-lg font-medium hover:bg-muted transition-all"
                        onClick={handleClick}
                    >
                        Test Server
                    </button>
                    {/* {test && ( */}
                    <p className='text-lg mt-4 text-green-600 dark:text-green-400 font-mono bg-green-100/50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800'>
                        {test?.status} to PostgreSQL Database on Time- {test?.time}
                    </p>
                    {/* )} */}
                </div>

                <div className="mt-16 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full max-w-4xl">
                    {[
                        { label: 'Complaints Resolved', value: '1,200+' },
                        { label: 'Rooms Managed', value: '450+' },
                        { label: 'Mess Feedbacks', value: '5k+' },
                        { label: 'Uptime', value: '99.9%' },
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center">
                            <span className="text-3xl font-serif text-foreground">{stat.value}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-medium">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Home

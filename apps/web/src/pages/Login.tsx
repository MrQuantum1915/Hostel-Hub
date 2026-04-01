import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, Loader2, ArrowRight, Mail, Phone, UserCircle, LogOut } from 'lucide-react'

interface LoginResponse {
    success: boolean
    user: {
        id: string
        user_name: string
        name: string
        email: string
        phone: string
        user_role: string
    }
    message: string
}

interface LoginProps {
    isloggedin: boolean
    setIsloggedin: (isloggedin: boolean) => void
}

function Login({ isloggedin, setIsloggedin }: LoginProps) {
    const [stage, setStage] = useState<"login" | "register">("login")
    const [user_name, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const endpoint = stage === "login" ? "/login" : "/register"
            const body = stage === "login"
                ? { user_name, password }
                : { user_name, password, name, email, phone }

            const response = await fetch("http://localhost:3000/auth" + endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                credentials: 'include'
            })
            
            const data: LoginResponse = await response.json()
            
            if (data.success) {
                if (stage === "register") {
                    setStage("login")
                    setUserName('')
                    setPassword('')
                    setName('')
                    setEmail('')
                    setPhone('')
                    alert("Registration successful! Welcome to the Hub. Please sign in.")
                } else {
                    setIsloggedin(true)
                    navigate("/dashboard")
                }
            } else {
                alert(data.message)
            }
        } catch (err) {
            console.error(err)
            alert("A network error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogOut = async () => {
        try {
            const response = await fetch("http://localhost:3000/auth/logout", {
                method: "POST",
                credentials: 'include'
            })
            if (response.ok) {
                setIsloggedin(false)
                navigate("/")
            }
        } catch (err) {
            console.error(err)
        }
    }

    if (isloggedin) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-10 shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center">
                        <UserCircle className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-serif font-bold tracking-tight">You're signed in</h2>
                        <p className="text-muted-foreground">Ready to manage your hostel life? Head over to your dashboard.</p>
                    </div>
                    <div className="grid gap-4 pt-4">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            Go to Dashboard
                        </button>
                        <button 
                            onClick={handleLogOut}
                            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-destructive transition-colors py-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative bg-background overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            
            <div className="w-full max-w-md relative z-10 transition-all duration-500">
                <div className="bg-card/80 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 shadow-2xl shadow-foreground/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-10">
                        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 mb-4 animate-bounce-subtle">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-foreground mb-3 font-display">
                            {stage === "login" ? "Welcome Back" : "Join the Hub"}
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium">
                            {stage === "login" ? "Sign in to manage your hostel complaints and assets." : "Experience a smarter way to manage your hostel life."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {stage === "register" && (
                            <div className="space-y-5 animate-in slide-in-from-left-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                    <div className="relative group">
                                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-muted/20 border border-border rounded-2xl py-3.5 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                                            placeholder="Enter your full name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full bg-muted/20 border border-border rounded-2xl py-3.5 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                                                placeholder="Email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="tel"
                                                required
                                                className="w-full bg-muted/20 border border-border rounded-2xl py-3.5 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                                                placeholder="Phone (10 digits)"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-muted/20 border border-border rounded-2xl py-3.5 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                                    placeholder="your_handle"
                                    value={user_name}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                                {stage === "login" && (
                                    <Link to="#" className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors">
                                        Forgot?
                                    </Link>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-muted/20 border border-border rounded-2xl py-3.5 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative overflow-hidden bg-primary text-primary-foreground font-bold rounded-2xl py-4 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (stage === "login" ? "Sign In" : "Create Account")}</span>
                            {!isLoading && <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-10 text-center border-border/50 pt-6">
                        <p className="text-muted-foreground text-sm font-medium">
                            {stage === "login" ? "New to Hostel-Hub?" : "Already joined?"}{' '}
                            <button 
                                onClick={() => setStage(stage === "login" ? "register" : "login")} 
                                className="text-primary font-bold hover:underline transition-all decoration-2 underline-offset-4"
                            >
                                {stage === "login" ? "Create an account" : "Sign in to Hub"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Shield(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
    )
}

export default Login

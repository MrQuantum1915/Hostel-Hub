import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, Loader2, ArrowRight, LogOut } from 'lucide-react'

interface LoginResponse {
    success: boolean
    user: {
        id: number
        user_name: string
    }
    message: string
}

interface LoginProps {
    isloggedin: boolean
    setIsloggedin: (isloggedin: boolean) => void
}

function Login({ isloggedin, setIsloggedin }: LoginProps) {
    const [stage, setStage] = useState("login")
    const [user_name, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const endpoint = stage === "login" ? "/login" : "/register"
            const response = await fetch("http://localhost:3000/auth" + endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_name,
                    password
                }),
                credentials: 'include'
            })
            const { success, user, message }: LoginResponse = await response.json()
            if (success) {
                if (stage == "register") {
                    setStage("login")
                }
                else {
                    setIsloggedin(true)
                    navigate("/dashboard")
                }
            }
            else {
                alert(message)
            }
        } catch (err) {
            console.log(err);
        }
        finally {
            setIsLoading(false)
        }

    }

    const handleLogOut = async () => {
        try {
            const response = await fetch("http://localhost:3000/auth/logout", {
                method: "POST",
                credentials: 'include'
            })
            const { success, message }: LoginResponse = await response.json()
            if (success) {
                setIsloggedin(false)
                navigate("/")
            }
            else {
                alert(message)
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4 relative overflow-hidden bg-background text-foreground">
            <div className="w-full max-w-md relative z-10">
                <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold font-serif text-foreground mb-2">{stage === "login" ? "Welcome Back" : "Register"}</h1>
                        <p className="text-muted-foreground">{stage === "login" ? "Sign in to access your account" : "Create a new account"}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/80 ml-1">User Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:bg-muted/50 transition-all duration-300"
                                    placeholder="Enter your user name"
                                    value={user_name}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-foreground/80">Password</label>
                                {stage == "login" &&
                                    (<Link to="#" className="text-xs text-accent hover:text-accent/80 transition-colors">
                                        Forgot password?
                                    </Link>)
                                }
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 focus:bg-muted/50 transition-all duration-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3.5 hover:bg-primary/90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{stage === "login" ? "Sign In" : "Sign Up"}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            {stage === "login" ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button onClick={() => setStage(stage === "login" ? "register" : "login")} className="text-accent font-medium hover:text-accent/80 transition-colors">
                                {stage === "login" ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>
                    {isloggedin &&
                        <button onClick={handleLogOut} className="mt-4 w-full bg-destructive/10 border-2 border-destructive text-destructive font-bold rounded-xl py-3.5 hover:bg-destructive/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group">
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    }
                </div>
            </div>
        </div>
    )
}

export default Login

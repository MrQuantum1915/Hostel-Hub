import { useEffect, useState } from 'react'
import { User, Mail, Phone, Shield, Loader2, UserCircle } from 'lucide-react'

interface UserProfile {
    id: string
    user_name: string
    name: string
    email: string
    phone: string
    role: string
}

function Profile() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:3000/auth/me', {
                    credentials: 'include'
                })
                if (response.ok) {
                    const data = await response.json()
                    setUser(data)
                } else {
                    setError('Failed to load profile')
                }
            } catch (err) {
                console.error(err)
                setError('An error occurred while fetching profile')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-destructive">
                {error}
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="bg-accent/20 p-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-background p-1 rounded-full shadow-lg">
                        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            <UserCircle className="w-20 h-20 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold font-serif text-foreground">{user.name || "User"}</h1>
                        <p className="text-muted-foreground">@{user.user_name}</p>
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                            <Shield className="w-3 h-3" />
                            {user.role}
                        </div>
                    </div>
                </div>

                <div className="p-8 grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground ml-1">College Email</label>
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50 group hover:border-accent/50 transition-colors">
                            <Mail className="w-5 h-5 text-accent" />
                            <span className="text-foreground font-medium">{user.email || "N/A"}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Phone Number</label>
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50 group hover:border-accent/50 transition-colors">
                            <Phone className="w-5 h-5 text-accent" />
                            <span className="text-foreground font-medium">{user.phone || "N/A"}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Username</label>
                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50 group hover:border-accent/50 transition-colors">
                            <User className="w-5 h-5 text-accent" />
                            <span className="text-foreground font-medium">{user.user_name}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile

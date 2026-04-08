import { useEffect, useState } from 'react'
import { User, Mail, Phone, Shield, Loader2, UserCircle, Edit2, Check, X, MapPin, Hash, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UserProfile {
    id: string
    user_name: string
    name: string
    email: string
    phone: string
    user_role: string
    roll_no?: string
    hostel_name?: string
    room_id?: string
}

function Profile() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:3000/auth/me', {
                    credentials: 'include'
                })
                if (response.ok) {
                    const data = await response.json()
                    setUser(data)
                    setEditForm({
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || ''
                    })
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

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch('http://localhost:3000/auth/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setUser({ ...user!, ...data.user })
                setIsEditing(false)
            } else {
                alert("Failed to update profile")
            }
        } catch (err) {
            console.error(err)
            alert("Error updating profile")
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' })
            window.location.href = '/'
        } catch (err) { console.error(err) }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading your profile...</p>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <X className="w-12 h-12 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
                <p className="text-muted-foreground mb-6">{error || 'Session expired or profile not found.'}</p>
                <button 
                    onClick={() => navigate('/login')}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold"
                >
                    Back to Login
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl pt-28">
            <div className="grid gap-8 md:grid-cols-3">
                {/* Left Column: Avatar & Role */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent -z-10" />
                        
                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                <UserCircle className="w-24 h-24 text-muted-foreground/50" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-lg border-4 border-background">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-serif font-bold text-foreground truncate">{user.name || "Hostel Resident"}</h2>
                        <p className="text-muted-foreground text-sm font-medium mb-4">@{user.user_name}</p>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                {user.user_role}
                            </span>
                        </div>

                        <div className="mt-8 pt-8 border-t border-border/50">
                             <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 py-2 rounded-lg transition-all text-sm font-semibold"
                             >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                             </button>
                        </div>
                    </div>

                    {/* Quick Stats / Info */}
                    {user.user_role === 'student' && (
                        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Hostel Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-lg">
                                        <MapPin className="w-4 h-4 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Hostel</p>
                                        <p className="text-sm font-bold">{user.hostel_name || 'Not Assigned'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-lg">
                                        <Hash className="w-4 h-4 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Room ID</p>
                                        <p className="text-sm font-bold">{user.room_id || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Details & Edit */}
                <div className="md:col-span-2">
                    <div className="bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
                            <h3 className="text-xl font-serif font-bold">General Information</h3>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isEditing ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                            >
                                {isEditing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
                            </button>
                        </div>

                        <div className="p-8 flex-1 space-y-8">
                            <div className="grid gap-8 md:grid-cols-2">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
                                        <User className="w-3.5 h-3.5" /> Full Name
                                    </label>
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        />
                                    ) : (
                                        <p className="text-lg font-bold px-1">{user.name || 'Set your name'}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
                                        <Mail className="w-3.5 h-3.5" /> Email Address
                                    </label>
                                    {isEditing ? (
                                        <input 
                                            type="email"
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                        />
                                    ) : (
                                        <p className="text-lg font-bold px-1">{user.email || 'N/A'}</p>
                                    )}
                                </div>

                                {/* Phone Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
                                        <Phone className="w-3.5 h-3.5" /> Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input 
                                            type="tel"
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                        />
                                    ) : (
                                        <p className="text-lg font-bold px-1">{user.phone || 'N/A'}</p>
                                    )}
                                </div>

                                {/* Roll No Field (Read-only on profile mostly) */}
                                {user.user_role === 'student' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
                                            <Hash className="w-3.5 h-3.5" /> Roll Number
                                        </label>
                                        <p className="text-lg font-bold px-1">{user.roll_no || 'Pending Verification'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="p-6 bg-muted/30 border-t border-border flex justify-end gap-3">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 rounded-xl text-sm font-bold hover:bg-muted transition-colors"
                                >
                                    Discard Changes
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-primary text-primary-foreground px-8 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Save Profile
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile


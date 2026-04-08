import { useState, useEffect } from 'react'
import { Megaphone, Calendar, User, Plus, Loader2, AlertTriangle, Info, Clock, X } from 'lucide-react'

interface Announcement {
    announcement_id: string
    title: string
    content: string
    announcement_type: string
    posted_date: string
    author_name: string
}

function Announcements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [userRole, setUserRole] = useState('')
    
    // Create form state
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [type, setType] = useState('General')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const userRes = await fetch('http://localhost:3000/auth/me', { credentials: 'include' })
            const userData = await userRes.json()
            setUserRole(userData.user_role)

            const res = await fetch('http://localhost:3000/announcements/all', { credentials: 'include' })
            const data = await res.json()
            if (data.success) {
                setAnnouncements(data.announcements)
            } else {
                throw new Error(data.message)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load announcements')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await fetch('http://localhost:3000/announcements/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ title, content, announcement_type: type })
            })
            const data = await res.json()
            if (data.success) {
                setShowCreateModal(false)
                setTitle('')
                setContent('')
                fetchData()
            } else {
                alert(data.message)
            }
        } catch (err) {
            console.error(err)
            alert('Failed to publish announcement')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'emergency': return <AlertTriangle className="w-5 h-5 text-red-500" />
            case 'maintenance': return <Clock className="w-5 h-5 text-amber-500" />
            case 'event': return <Calendar className="w-5 h-5 text-blue-500" />
            default: return <Info className="w-5 h-5 text-primary" />
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-serif font-bold mb-2">Announcements</h1>
                        <p className="text-muted-foreground">Stay updated with the latest hostel news and notices.</p>
                    </div>
                    {userRole === 'admin' && (
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Create Notice
                        </button>
                    )}
                </div>

                {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive mb-8">{error}</div>}

                <div className="space-y-6">
                    {announcements.length === 0 ? (
                        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
                            No announcements posted yet.
                        </div>
                    ) : (
                        announcements.map((ann) => (
                            <div key={ann.announcement_id} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group shadow-sm hover:shadow-md">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-3 bg-muted rounded-xl group-hover:scale-110 transition-transform">
                                        {getTypeIcon(ann.announcement_type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2 gap-4">
                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{ann.title}</h3>
                                            <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md whitespace-nowrap">{ann.announcement_type}</span>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed mb-4">{ann.content}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(ann.posted_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                {ann.author_name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold font-serif">New Announcement</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Title</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Brief title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Type</label>
                                <select 
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option>General</option>
                                    <option>Emergency</option>
                                    <option>Maintenance</option>
                                    <option>Event</option>
                                    <option>Water Supply</option>
                                    <option>Mess Notice</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Content</label>
                                <textarea 
                                    required
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                    placeholder="Detailed announcement content..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                            <button 
                                disabled={isSubmitting}
                                type="submit" 
                                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Megaphone className="w-5 h-5" />}
                                Publish Notice
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}


export default Announcements

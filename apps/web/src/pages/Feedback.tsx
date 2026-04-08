import { useState, useEffect } from 'react'
import { Star, MessageSquare, PieChart, TrendingUp, Users, Calendar, Loader2, CheckCircle2, AlertCircle, Sparkles, Utensils } from 'lucide-react'

interface FeedbackSummary {
    total_feedback: string
    average_rating: string
}

interface FeedbackTrend {
    date: string
    avg_rating: string
    count: string
}

interface RecentFeedback {
    feedback_id: string
    student_name: string
    rating: number
    comments: string
    created_at: string
}

interface FeedbackReport {
    summary: FeedbackSummary
    recent: RecentFeedback[]
    dailyTrends: FeedbackTrend[]
}

function Feedback() {
    const [userRole, setUserRole] = useState('')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comments, setComments] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    
    const [reports, setReports] = useState<FeedbackReport | null>(null)
    const [loadingReports, setLoadingReports] = useState(false)

    useEffect(() => {
        fetchUserRole()
    }, [])

    const fetchUserRole = async () => {
        try {
            const res = await fetch('http://localhost:3000/auth/me', { credentials: 'include' })
            const data = await res.json()
            setUserRole(data.user_role)
            if (data.user_role === 'admin') {
                fetchReports()
            }
        } catch (err) {
            console.error('Failed to fetch user role', err)
        }
    }

    const fetchReports = async () => {
        setLoadingReports(true)
        try {
            const res = await fetch('http://localhost:3000/feedback/reports', { credentials: 'include' })
            const data = await res.json()
            if (data.success) {
                setReports(data.reports)
            }
        } catch (err) {
            console.error('Failed to fetch reports', err)
        } finally {
            setLoadingReports(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            setError('Please select a rating.')
            return
        }
        setError('')
        setIsSubmitting(true)
        try {
            const res = await fetch('http://localhost:3000/feedback/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rating, comments })
            })
            const data = await res.json()
            if (data.success) {
                setSuccess(true)
                setRating(0)
                setComments('')
                setTimeout(() => setSuccess(false), 5000)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to submit feedback. Try again later.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderRatingStars = (val: number, isInteractive = false) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={isInteractive ? "button" : undefined}
                        className={`${isInteractive ? "cursor-pointer transition-transform hover:scale-125" : "cursor-default"}`}
                        onClick={isInteractive ? () => setRating(star) : undefined}
                        onMouseEnter={isInteractive ? () => setHoverRating(star) : undefined}
                        onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
                    >
                        <Star 
                            className={`w-6 h-6 ${
                                (isInteractive ? (hoverRating || rating) : val) >= star 
                                    ? "text-amber-500 fill-amber-500" 
                                    : "text-muted-foreground fill-transparent"
                            }`} 
                        />
                    </button>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-serif font-bold mb-2">Mess Feedback</h1>
                    <p className="text-muted-foreground">Your input helps us improve the quality of daily meals.</p>
                </div>

                {userRole === 'admin' ? (
                    /* Admin View: Reports */
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {loadingReports ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                        ) : reports ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-2">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Users className="w-5 h-5" />
                                            <span className="text-sm font-medium uppercase tracking-wider">Total Feedbacks</span>
                                        </div>
                                        <p className="text-4xl font-bold">{reports.summary.total_feedback}</p>
                                    </div>
                                    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-2">
                                        <div className="flex items-center gap-2 text-amber-500">
                                            <Star className="w-5 h-5 fill-amber-500" />
                                            <span className="text-sm font-medium uppercase tracking-wider">Average Rating</span>
                                        </div>
                                        <p className="text-4xl font-bold">{reports.summary.average_rating || '0.0'}/5.0</p>
                                    </div>
                                    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-2">
                                        <div className="flex items-center gap-2 text-green-500">
                                            <TrendingUp className="w-5 h-5" />
                                            <span className="text-sm font-medium uppercase tracking-wider">Trend</span>
                                        </div>
                                        <p className="text-4xl font-bold">Stable</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                        <div className="p-6 border-b border-border bg-muted/30">
                                            <h3 className="font-bold flex items-center gap-2"><PieChart className="w-5 h-5" /> Daily Trends (Last 7 Days)</h3>
                                        </div>
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                {reports.dailyTrends.map((trend, i) => (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-sm font-medium">{new Date(trend.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary" style={{ width: `${(Number(trend.avg_rating)/5)*100}%` }}></div>
                                                            </div>
                                                            <span className="text-sm font-bold w-12 text-right">{trend.avg_rating}</span>
                                                            <span className="text-xs text-muted-foreground w-16">({trend.count} votes)</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                        <div className="p-6 border-b border-border bg-muted/30">
                                            <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Recent Feedback Details</h3>
                                        </div>
                                        <div className="p-6 max-h-[400px] overflow-y-auto space-y-4">
                                            {reports.recent.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-10">No recent feedback.</p>
                                            ) : (
                                                reports.recent.map((feed) => (
                                                    <div key={feed.feedback_id} className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-sm font-bold">{feed.student_name}</span>
                                                            {renderRatingStars(feed.rating)}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground italic">"{feed.comments || 'No comments left.'}"</p>
                                                        <p className="text-[10px] text-muted-foreground text-right">{new Date(feed.created_at).toLocaleString()}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-muted-foreground">Failed to load reporting data.</div>
                        )}
                    </div>
                ) : (
                    /* Student View: Form */
                    <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                        <div className="bg-primary/5 p-8 border-b border-border flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                <Utensils className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold font-serif mb-2">Daily Meal Rating</h2>
                            <p className="text-muted-foreground">How was the food today? Your feedback is anonymous to the staff.</p>
                        </div>

                        <div className="p-8">
                            {success ? (
                                <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                                    <p className="text-muted-foreground">Your feedback has been submitted. See you tomorrow!</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {error && (
                                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-2 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center space-y-4">
                                        <label className="text-sm font-medium">Rate Today's Meal</label>
                                        <div className="scale-150 py-4">
                                            {renderRatingStars(rating, true)}
                                        </div>
                                        <div className="h-4">
                                            {rating > 0 && (
                                                <span className="text-xs font-bold text-primary animate-in fade-in zoom-in duration-300">
                                                    {rating === 1 && "Terrible 😞"}
                                                    {rating === 2 && "Not Good 😕"}
                                                    {rating === 3 && "Average 😐"}
                                                    {rating === 4 && "Great! 😊"}
                                                    {rating === 5 && "Excellent! 😋"}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium ml-1">Additional Comments (Optional)</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                                            <textarea 
                                                className="w-full bg-muted/30 border border-border rounded-2xl pl-12 pr-4 py-4 min-h-[120px] focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                                placeholder="What did you like? What can be improved?"
                                                value={comments}
                                                onChange={(e) => setComments(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold hover:shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                Submit Feedback
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Feedback

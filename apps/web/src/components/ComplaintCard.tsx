import { useState } from 'react'
import { CheckCircle2, Clock, AlertCircle, Image as ImageIcon, X, Star, RotateCcw, Loader2 } from 'lucide-react'

export interface ComplaintType {
    complaint_id: string
    title: string
    details: string
    category: string
    urgency_level: string
    status: string
    created_at: string
    updated_at: string
    image_id: string | null
    student_name?: string
    rating: number | null
}

interface ComplaintCardProps {
    complaint: ComplaintType
    isAdmin: boolean
    onStatusChange?: (id: string, newStatus: string) => void
}

export function ComplaintCard({ complaint: initialComplaint, isAdmin, onStatusChange }: ComplaintCardProps) {
    const [complaint, setComplaint] = useState(initialComplaint)
    const [showModal, setShowModal] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [hoverRating, setHoverRating] = useState(0)

    const statusColors = {
        pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
        'in progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    }

    const StatusIcon = {
        pending: Clock,
        resolved: CheckCircle2,
        'in progress': AlertCircle,
    }[complaint.status.toLowerCase() as keyof typeof statusColors] || Clock

    const handleRate = async (rating: number) => {
        setIsProcessing(true)
        try {
            const res = await fetch(`http://localhost:3000/complaints/${complaint.complaint_id}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rating })
            })
            const data = await res.json()
            if (data.success) {
                setComplaint(prev => ({ ...prev, rating: data.rating }))
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReopen = async () => {
        setIsProcessing(true)
        try {
            const res = await fetch(`http://localhost:3000/complaints/${complaint.complaint_id}/reopen`, {
                method: 'POST',
                credentials: 'include'
            })
            const data = await res.json()
            if (data.success) {
                setComplaint(prev => ({ ...prev, status: 'pending' }))
                if (onStatusChange) onStatusChange(complaint.complaint_id, 'pending')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <div 
                onClick={() => setShowModal(true)}
                className="bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md h-full flex flex-col"
            >
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">{complaint.title}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(complaint.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusColors[complaint.status.toLowerCase() as keyof typeof statusColors] || statusColors.pending}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{complaint.status}</span>
                    </div>
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {complaint.details}
                </p>

                <div className="flex items-center justify-between text-xs mt-auto pt-2">
                    <span className="bg-muted px-2.5 py-1 rounded-md text-foreground font-medium">
                        {complaint.category}
                    </span>
                    {complaint.rating && (
                        <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span className="font-bold">{complaint.rating}</span>
                        </div>
                    )}
                    {complaint.image_id && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Image
                        </span>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="font-semibold text-lg flex-1 mr-4 line-clamp-1">{complaint.title}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <div className="flex gap-2 flex-wrap mb-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusColors[complaint.status.toLowerCase() as keyof typeof statusColors] || statusColors.pending}`}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    <span className="capitalize">Status: {complaint.status}</span>
                                </span>
                                <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium text-foreground">
                                    Cat: {complaint.category}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{complaint.details}</p>
                                </div>

                                {complaint.image_id && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Attached Image</h4>
                                        <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
                                            <img 
                                                src={`http://localhost:3000/complaints/image/${complaint.image_id}`} 
                                                alt="Complaint Attachment" 
                                                className="w-full h-auto max-h-[400px] object-contain cursor-default"
                                            />
                                        </div>
                                    </div>
                                )}

                                {!isAdmin && complaint.status === 'resolved' && (
                                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-4 animate-in zoom-in-95 duration-300">
                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Complaint Resolved
                                        </h4>
                                        
                                        {!complaint.rating ? (
                                            <div className="space-y-3">
                                                <p className="text-xs text-muted-foreground">How would you rate the resolution?</p>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button 
                                                            key={star}
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            onClick={() => handleRate(star)}
                                                            className="transition-transform hover:scale-110 disabled:opacity-50"
                                                            disabled={isProcessing}
                                                        >
                                                            <Star className={`w-6 h-6 ${(hoverRating || 0) >= star ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Your Rating:</span>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star key={star} className={`w-4 h-4 ${complaint.rating! >= star ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button 
                                            onClick={handleReopen}
                                            disabled={isProcessing}
                                            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-background border border-border text-xs font-bold hover:bg-muted transition-all disabled:opacity-50"
                                        >
                                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                            Not Satisfied? Reopen Complaint
                                        </button>
                                    </div>
                                )}

                                {isAdmin && onStatusChange && (
                                    <div className="pt-4 mt-6 border-t border-border">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Update Status</h4>
                                        <select 
                                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                                            value={complaint.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                setComplaint(prev => ({ ...prev, status: newStatus }));
                                                onStatusChange(complaint.complaint_id, newStatus);
                                            }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

import { useState } from 'react'
import { CheckCircle2, Clock, AlertCircle, Image as ImageIcon, X } from 'lucide-react'

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
}

interface ComplaintCardProps {
    complaint: ComplaintType
    isAdmin: boolean
    onStatusChange?: (id: string, newStatus: string) => void
}

export function ComplaintCard({ complaint, isAdmin, onStatusChange }: ComplaintCardProps) {
    const [showModal, setShowModal] = useState(false)

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

    return (
        <>
            <div 
                onClick={() => setShowModal(true)}
                className="bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md"
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

                <div className="flex items-center justify-between text-xs mt-auto">
                    <span className="bg-muted px-2.5 py-1 rounded-md text-foreground font-medium">
                        {complaint.category}
                    </span>
                    {isAdmin && complaint.student_name && (
                        <span className="text-muted-foreground">By: {complaint.student_name}</span>
                    )}
                    {complaint.image_id && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Image attached
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
                                {isAdmin && complaint.student_name && (
                                    <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium text-foreground">
                                        User: {complaint.student_name}
                                    </span>
                                )}
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
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Load+Error'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isAdmin && (
                                    <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
                                        <h4 className="text-sm font-bold border-b border-border pb-2">Student Information</h4>
                                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                                            <span className="text-muted-foreground">Name:</span>
                                            <span className="font-medium text-right">{(complaint as any).student_name || 'N/A'}</span>
                                            
                                            <span className="text-muted-foreground">Roll No:</span>
                                            <span className="font-medium text-right">{(complaint as any).roll_no || 'N/A'}</span>
                                            
                                            <span className="text-muted-foreground">Hostel:</span>
                                            <span className="font-medium text-right">{(complaint as any).hostel_name || 'N/A'}</span>
                                            
                                            <span className="text-muted-foreground">Room ID:</span>
                                            <span className="font-medium text-right">{(complaint as any).room_id || 'N/A'}</span>
                                        </div>
                                    </div>
                                )}

                                {isAdmin && onStatusChange && (
                                    <div className="pt-4 mt-6 border-t border-border">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Update Status</h4>
                                        <select 
                                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                                            defaultValue={complaint.status}
                                            onChange={(e) => onStatusChange(complaint.complaint_id, e.target.value)}
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

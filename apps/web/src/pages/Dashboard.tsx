import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ComplaintCard, type ComplaintType } from '../components/ComplaintCard'

interface UserProfile {
    id: string
    user_name: string
    name: string
    user_role: string
}

function Dashboard() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [complaints, setComplaints] = useState<ComplaintType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [updatingParams, setUpdatingParams] = useState<string | null>(null)

    const [staffList, setStaffList] = useState<any[]>([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // fetch User
                const userRes = await fetch('http://localhost:3000/auth/me', { credentials: 'include' })
                if (!userRes.ok) throw new Error('Failed to load profile')
                const userData = await userRes.json()
                setUser(userData)

                if (userData.user_role === 'admin') {
                    const staffRes = await fetch('http://localhost:3000/admin/staff', { credentials: 'include' })
                    if (staffRes.ok) {
                        const staffData = await staffRes.json()
                        setStaffList(staffData.staff || [])
                    }
                }

                // 2. Fetch Complaints based on role
                const endpoint = userData.user_role === 'student' ? '/complaints/me' : '/complaints/all'
                const compRes = await fetch(`http://localhost:3000${endpoint}`, { credentials: 'include' })
                if (!compRes.ok) throw new Error('Failed to load complaints')
                const compData = await compRes.json()
                setComplaints(compData.complaints || [])
            } catch (err: any) {
                console.error(err)
                setError(err.message || 'An error occurred')
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    const handleAssignStaff = async (id: string, staffId: string) => {
        setUpdatingParams(id)
        try {
            const res = await fetch(`http://localhost:3000/admin/complaints/${id}/assign`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ staff_id: staffId })
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'Failed to assign staff')
            }
            
            // update local state
            setComplaints(prev => prev.map(c => 
                c.complaint_id === id ? { ...c, assigned_staff_id: staffId } as any : c
            ))
        } catch (err: any) {
            console.error(err)
            alert(err.message || 'Error assigning staff')
        } finally {
            setUpdatingParams(null)
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdatingParams(id)
        try {
            const res = await fetch(`http://localhost:3000/complaints/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error('Failed to update status')
            
            // update local state
            setComplaints(prev => prev.map(c => 
                c.complaint_id === id ? { ...c, status: newStatus } : c
            ))
        } catch (err: any) {
            console.error(err)
            alert(err.message || 'Error updating status')
        } finally {
            setUpdatingParams(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive">
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg">Retry</button>
            </div>
        )
    }

    const isAdmin = user?.user_role?.toLowerCase() === 'admin' || user?.user_role?.toLowerCase() === 'staff'

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl pt-24 text-foreground animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                        {user?.user_role === 'admin' ? 'Admin Dashboard' : user?.user_role === 'staff' ? 'Maintenance Dashboard' : 'My Dashboard'}
                    </h1>
                    <p className="text-muted-foreground">
                        {user?.user_role === 'admin' ? 'Manage and update student complaints efficiently.' : user?.user_role === 'staff' ? 'View and resolve assigned maintenance tasks.' : 'Track the progress of your submitted complaints here.'}
                    </p>
                </div>
                <div className="bg-muted px-4 py-2 rounded-lg border border-border">
                    <span className="text-sm font-medium text-muted-foreground mr-2">
                        {user?.user_role === 'staff' ? 'Assigned Tasks:' : 'Total Complaints:'}
                    </span>
                    <span className="text-xl font-bold">{complaints.length}</span>
                </div>
            </div>

            {updatingParams && (
                <div className="mb-4 text-sm text-accent animate-pulse flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating complaint status...
                </div>
            )}

            {complaints.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[30vh]">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Complaints Found</h3>
                    <p className="text-muted-foreground max-w-sm">
                        {isAdmin ? "There are no complaints filed by any students yet." : "You haven't submitted any complaints yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {complaints.map(complaint => (
                        <ComplaintCard 
                            key={complaint.complaint_id} 
                            complaint={complaint} 
                            isAdmin={isAdmin}
                            staffList={staffList}
                            onStatusChange={handleStatusChange}
                            onAssignStaff={handleAssignStaff}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Dashboard

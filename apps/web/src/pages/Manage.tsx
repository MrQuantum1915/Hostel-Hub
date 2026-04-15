import { useState, useEffect } from 'react'
import { Users, Building, ShieldCheck, ShieldAlert, Loader2, Search, X, CheckCircle2, UserCog } from 'lucide-react'

interface Student {
    id: string
    user_name: string
    name: string
    email: string
    phone: string
    roll_no: string | null
    hostel_name: string | null
    room_id: string | null
}

interface Room {
    room_id: string
    hostel_name: string
    room_number: string
    room_capacity: number
    status: string
}

interface Hostel {
    hostel_id: string
    hostel_name: string
    capacity: number
    rooms: Room[]
}

interface User {
    id: string
    user_name: string
    name: string
    email: string
    phone: string
    user_role: string
}

export default function Manage() {
    const [activeTab, setActiveTab] = useState<'students' | 'hostels' | 'users'>('students')
    const [students, setStudents] = useState<Student[]>([])
    const [hostels, setHostels] = useState<Hostel[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    
    // Modal state
    const [verifyingStudent, setVerifyingStudent] = useState<Student | null>(null)
    const [verifyForm, setVerifyForm] = useState({ roll_no: '', hostel_name: '', room_id: '' })
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [stdRes, hstRes, userRes] = await Promise.all([
                fetch('http://localhost:3000/admin/students', { credentials: 'include' }),
                fetch('http://localhost:3000/admin/hostels', { credentials: 'include' }),
                fetch('http://localhost:3000/admin/users', { credentials: 'include' })
            ])
            const stdData = await stdRes.json()
            const hstData = await hstRes.json()
            const userData = await userRes.json()
            
            if (stdData.success) setStudents(stdData.students)
            if (hstData.success) setHostels(hstData.hostels)
            if (userData.success) setUsers(userData.users)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`http://localhost:3000/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ role: newRole })
            })
            const data = await res.json()
            if (data.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, user_role: newRole } : u))
            } else {
                alert(data.message || 'Failed to update role')
            }
        } catch (err: any) {
            alert(err.message || 'Failed to update role')
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!verifyingStudent) return
        setIsVerifying(true)
        setError('')
        
        try {
            const res = await fetch(`http://localhost:3000/admin/students/${verifyingStudent.id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(verifyForm)
            })
            const data = await res.json()
            if (data.success) {
                setStudents(prev => prev.map(s => s.id === verifyingStudent.id ? {
                    ...s, 
                    roll_no: verifyForm.roll_no, 
                    hostel_name: verifyForm.hostel_name, 
                    room_id: verifyForm.room_id 
                } : s))
                setVerifyingStudent(null)
                setVerifyForm({ roll_no: '', hostel_name: '', room_id: '' })
            } else {
                setError(data.message || 'Verification failed')
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed')
        } finally {
            setIsVerifying(false)
        }
    }

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_no?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-serif font-bold mb-2">Management Console</h1>
                        <p className="text-muted-foreground">Administer students, verifiable credentials, and hostels.</p>
                    </div>
                    
                    <div className="flex flex-wrap bg-muted p-1 rounded-xl border border-border gap-1">
                        <button 
                            onClick={() => setActiveTab('students')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Users className="w-4 h-4" /> Students
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <UserCog className="w-4 h-4" /> All Users
                        </button>
                        <button 
                            onClick={() => setActiveTab('hostels')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'hostels' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Building className="w-4 h-4" /> Hostels
                        </button>
                    </div>
                </div>

                {activeTab === 'students' && (
                    <div className="space-y-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                            <input 
                                type="text"
                                placeholder="Search by name, email, or roll number..."
                                className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStudents.map(student => (
                                <div key={student.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{student.name}</h3>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                        </div>
                                        {student.roll_no ? (
                                            <span className="bg-green-500/10 text-green-500 p-2 rounded-full border border-green-500/20" title="Verified">
                                                <ShieldCheck className="w-5 h-5" />
                                            </span>
                                        ) : (
                                            <span className="bg-destructive/10 text-destructive p-2 rounded-full border border-destructive/20" title="Unverified">
                                                <ShieldAlert className="w-5 h-5" />
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Roll No:</span>
                                            <span className="font-medium">{student.roll_no || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Hostel:</span>
                                            <span className="font-medium text-right max-w-[150px] truncate">{student.hostel_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Phone:</span>
                                            <span className="font-medium">{student.phone}</span>
                                        </div>
                                    </div>

                                    {!student.roll_no && (
                                        <button 
                                            onClick={() => setVerifyingStudent(student)}
                                            className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-lg font-bold transition-colors"
                                        >
                                            Verify Student
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                            <input 
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.filter(u => 
                                u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                u.email.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map(user => (
                                <div key={user.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{user.name}</h3>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground font-medium">Role:</span>
                                            <select 
                                                className="bg-background border border-border rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary text-xs font-bold"
                                                value={user.user_role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            >
                                                <option value="student">Student</option>
                                                <option value="staff">Staff</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'hostels' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {hostels.map(hostel => (
                            <div key={hostel.hostel_id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
                                    <h3 className="font-bold text-xl flex items-center gap-2">
                                        <Building className="w-5 h-5 text-primary" />
                                        {hostel.hostel_name}
                                    </h3>
                                    <span className="text-sm bg-background px-3 py-1 rounded-full border border-border text-muted-foreground">
                                        Total Capacity: {hostel.capacity}
                                    </span>
                                </div>
                                <div className="p-6">
                                    <h4 className="text-sm font-bold uppercase text-muted-foreground mb-4">Rooms List</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
                                        {hostel.rooms.map(room => (
                                            <div key={room.room_id} className="p-3 border border-border rounded-lg bg-background text-center flex flex-col items-center justify-center">
                                                <span className="font-bold block text-lg">{room.room_number}</span>
                                                <span className="text-xs text-muted-foreground mt-1 mb-1 block">Cap: {room.room_capacity}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${room.status === 'available' ? 'bg-green-500/10 text-green-500' : room.status === 'full' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {room.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Verification Modal */}
            {verifyingStudent && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
                            <h2 className="font-bold">Verify {verifyingStudent.name}</h2>
                            <button onClick={() => { setVerifyingStudent(null); setError(''); }} className="p-1 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleVerify} className="p-6 space-y-5">
                            {error && <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">{error}</div>}
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Roll Number</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="e.g. 2024CS01"
                                    value={verifyForm.roll_no}
                                    onChange={(e) => setVerifyForm({...verifyForm, roll_no: e.target.value})}
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Hostel Assignment</label>
                                <select 
                                    required
                                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary outline-none"
                                    value={verifyForm.hostel_name}
                                    onChange={(e) => setVerifyForm({...verifyForm, hostel_name: e.target.value, room_id: ''})}
                                >
                                    <option value="" disabled>Select a hostel</option>
                                    {hostels.map(h => <option key={h.hostel_id} value={h.hostel_name}>{h.hostel_name}</option>)}
                                </select>
                            </div>

                            {verifyForm.hostel_name && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Room Assignment</label>
                                    <select 
                                        required
                                        className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary outline-none"
                                        value={verifyForm.room_id}
                                        onChange={(e) => setVerifyForm({...verifyForm, room_id: e.target.value})}
                                    >
                                        <option value="" disabled>Select an available room</option>
                                        {hostels.find(h => h.hostel_name === verifyForm.hostel_name)?.rooms.filter(r => r.status === 'available').map(r => (
                                            <option key={r.room_id} value={r.room_id}>Room: {r.room_number} (Cap: {r.room_capacity})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button 
                                disabled={isVerifying}
                                type="submit" 
                                className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                Complete Verification
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

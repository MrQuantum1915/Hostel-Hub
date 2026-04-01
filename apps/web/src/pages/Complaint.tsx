import { useState, type FormEvent, useRef, useEffect, type ChangeEvent } from 'react'
import { AlertCircle, Send, FileText, Image as ImageIcon, Loader2, CheckCircle2, ChevronDown, Wrench, Sparkles, Zap, Droplet, Utensils, HelpCircle, X } from 'lucide-react'

const CATEGORIES = [
    { id: 'Maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'Cleaning', label: 'Cleaning', icon: Sparkles },
    { id: 'Electrical', label: 'Electrical', icon: Zap },
    { id: 'Plumbing', label: 'Plumbing', icon: Droplet },
    { id: 'Mess', label: 'Mess / Food', icon: Utensils },
    { id: 'Other', label: 'Other', icon: HelpCircle },
]

function Complaint() {
    const [title, setTitle] = useState('')
    const [details, setDetails] = useState('')
    const [category, setCategory] = useState('Maintenance')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB')
                return
            }
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            setError('')
        }
    }

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        setImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !details.trim()) {
            setError('Please fill in all required fields.')
            return
        }

        setError('')
        setLoading(true)

        try {
            const response = await fetch('http://localhost:3000/complaints/complaint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    details,
                    category,
                    urgency_level: 'normal',
                    image: imagePreview
                })
            });
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to submit complaint');
            }
            
            setLoading(false)
            setSuccess(true)
            setTitle('')
            setDetails('')
            setImage(null)
            setImagePreview(null)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            console.error('Error submitting complaint:', err)
            setError(err.message || 'An error occurred while submitting. Please try again later.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-4 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="bg-accent/10 p-8 border-b border-border flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4 text-accent">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold font-serif text-foreground mb-2">File a Complaint</h1>
                    <p className="text-muted-foreground">Submit your issues and we'll resolve them as soon as possible.</p>
                </div>

                <div className="p-8">
                    {success ? (
                        <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold text-foreground mb-2">Complaint Submitted</h2>
                            <p className="text-muted-foreground">Your complaint has been successfully registered. We will look into it shortly.</p>
                            <button 
                                onClick={() => setSuccess(false)}
                                className="mt-8 px-6 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors"
                            >
                                Submit Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-2 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2" ref={dropdownRef}>
                                <label className="text-sm font-medium text-foreground ml-1">Category</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className={`w-full bg-muted/30 border ${isDropdownOpen ? 'border-accent/50 ring-1 ring-accent/50' : 'border-border'} rounded-xl px-4 py-3 flex items-center justify-between transition-all cursor-pointer hover:border-accent/50`}
                                    >
                                        <div className="flex items-center gap-3 text-foreground">
                                            {CATEGORIES.find(c => c.id === category)?.icon && (() => {
                                                const Icon = CATEGORIES.find(c => c.id === category)!.icon
                                                return <Icon className="w-5 h-5 text-accent" />
                                            })()}
                                            <span>{CATEGORIES.find(c => c.id === category)?.label}</span>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setCategory(cat.id)
                                                        setIsDropdownOpen(false)
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${category === cat.id ? 'bg-accent/10 border-l-2 border-accent' : 'border-l-2 border-transparent'}`}
                                                >
                                                    <cat.icon className={`w-5 h-5 ${category === cat.id ? 'text-accent' : 'text-muted-foreground'}`} />
                                                    <span className={category === cat.id ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                                                        {cat.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground ml-1">Complaint Title</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-3.5 text-muted-foreground">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Brief summary of the issue"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-muted/30 border border-border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-muted-foreground/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground ml-1">Detailed Description</label>
                                <textarea 
                                    placeholder="Provide more details about your complaint..."
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 min-h-[150px] resize-y focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground ml-1">Attachment (Optional)</label>
                                <div 
                                    className={`border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group relative overflow-hidden min-h-[160px] ${imagePreview ? 'border-accent/50 bg-accent/5' : 'border-border hover:bg-muted/30'}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <>
                                            <div className="absolute inset-0 w-full h-full p-2">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={removeImage}
                                                className="absolute top-4 right-4 bg-background/80 hover:bg-destructive hover:text-destructive-foreground backdrop-blur-sm p-2 rounded-full transition-colors shadow-sm"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground mb-1">Click to upload an image</p>
                                            <p className="text-xs text-muted-foreground">JPG, PNG or WEBP (Max 5MB)</p>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/jpeg, image/png, image/webp" 
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed group mt-8"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        <span>Submit Complaint</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Complaint
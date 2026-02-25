import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
    AlertCircle,
    CheckCircle,
    Clock,
    MessageSquare,
    X,
    Send,
    Loader2,
    Filter,
    Phone,
    Plus,
    Search,
    Download,
    SearchX,
    User,
    Store,
    ChevronRight,
    Circle,
    CheckCircle2
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import {
    useGetIssuesQuery,
    useUpdateIssueStatusMutation,
    useAddIssueCommentMutation
} from '../features/issues/issuesApiSlice'

const AdminSupportPage = () => {
    const { user } = useSelector(state => state.auth)
    const [statusFilter, setStatusFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const { data: issues = [], isLoading } = useGetIssuesQuery({})
    const [updateStatus, { isLoading: isUpdating }] = useUpdateIssueStatusMutation()
    const [addComment, { isLoading: isAddingComment }] = useAddIssueCommentMutation()

    const [activeIssue, setActiveIssue] = useState(null)
    const [newComment, setNewComment] = useState('')

    // Real-time filtering logic
    const filteredIssues = issues.filter(issue => {
        const lowerQuery = searchQuery.toLowerCase()

        // Status matching (Show if it matches the filter OR if it is the currently active issue)
        const statusMatch = statusFilter === 'all' || issue.status === statusFilter || activeIssue?._id === issue._id
        if (!statusMatch) return false

        // Search matching
        return (
            issue.title.toLowerCase().includes(lowerQuery) ||
            issue.reportedBy?.name?.toLowerCase().includes(lowerQuery) ||
            issue.reportedBy?.shopName?.toLowerCase().includes(lowerQuery)
        )
    })
    const chatEndRef = useRef(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (activeIssue) {
            scrollToBottom()
        }
    }, [activeIssue?.comments, activeIssue])

    const handleAddComment = async (e) => {
        if (e) e.preventDefault()
        if (!newComment.trim()) return
        try {
            const updatedIssue = await addComment({ id: activeIssue._id, text: newComment }).unwrap()
            // Sync local activeIssue for immediate reflection
            setActiveIssue(updatedIssue)
            setNewComment('')
        } catch (err) {
            console.error(err)
        }
    }

    const handleStatusUpdate = async (newStatus) => {
        try {
            const updatedIssue = await updateStatus({ id: activeIssue._id, status: newStatus }).unwrap()
            setActiveIssue(updatedIssue)
        } catch (err) {
            console.error(err)
        }
    }

    const StatBadge = ({ status, dot = false }) => {
        const configs = {
            open: { label: 'Open', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle },
            in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock },
            resolved: { label: 'Resolved', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle },
            closed: { label: 'Closed', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', icon: X }
        }
        const config = configs[status] || configs.open
        if (dot) return <div className={`h-2 w-2 rounded-full ${config.bg.replace('bg-', 'bg-')}`} />

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.color} border ${config.border}`}>
                <config.icon className="h-3 w-3" />
                {config.label}
            </span>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] gap-6 max-w-[1600px] mx-auto">
            {/* Clean Header */}
            <header className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 text-white">
                            <MessageSquare size={20} />
                        </div>
                        Support Center
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium italic">Resolving operator issues with precision.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl items-center border border-slate-200">
                    {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${statusFilter === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                {/* Left: Ticket Scroll */}
                <aside className="w-80 lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
                    <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Filter size={14} /> Incoming Requests
                            </h3>
                            <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                {filteredIssues.length}
                            </span>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter by name, shop or title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md text-slate-400"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse h-24 bg-slate-50 rounded-xl border border-dashed border-slate-200" />
                            ))
                        ) : filteredIssues.length === 0 ? (
                            <div className="py-20 text-center space-y-4 px-6">
                                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                                    <SearchX size={32} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-900 text-sm font-black">No matches found</p>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed">Try adjusting your search query or status filter.</p>
                                </div>
                                <button
                                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                                    className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        ) : (
                            filteredIssues.map((issue) => (
                                <button
                                    key={issue._id}
                                    onClick={() => setActiveIssue(issue)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden
                                            ${activeIssue?._id === issue._id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 -translate-y-0.5'
                                            : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-blue-200 shadow-sm hover:shadow-md hover:scale-[1.01]'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`text-sm font-bold truncate ${activeIssue?._id === issue._id ? 'text-white' : 'text-slate-900'}`}>
                                            {issue.title}
                                        </h4>
                                        {activeIssue?._id !== issue._id && <StatBadge status={issue.status} />}
                                    </div>
                                    <p className={`text-xs line-clamp-1 mb-3 ${activeIssue?._id === issue._id ? 'text-blue-50' : 'text-slate-500'}`}>
                                        {issue.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black ${activeIssue?._id === issue._id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                {issue.reportedBy?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`text-[10px] font-bold ${activeIssue?._id === issue._id ? 'text-blue-100' : 'text-slate-500'}`}>
                                                {issue.reportedBy?.name}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-medium opacity-60 ${activeIssue?._id === issue._id ? 'text-white' : 'text-slate-400'}`}>
                                            {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    {/* Status Marker in Active State */}
                                    {activeIssue?._id === issue._id && (
                                        <div className="absolute top-0 right-0 h-10 w-10 bg-white/10 rounded-bl-3xl flex items-center justify-center">
                                            <ChevronRight size={14} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                {/* Right: Detailed View / Chat */}
                <main className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
                    {activeIssue ? (
                        <>
                            {/* Detailed Header */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <StatBadge status={activeIssue.status} />
                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Ticket ID: {activeIssue._id.slice(-8).toUpperCase()}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                            {activeIssue.title}
                                        </h2>

                                        {/* Unified Context Card */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 h-16 w-16 bg-blue-50/40 rounded-bl-3xl flex items-center justify-center pointer-events-none">
                                                <Store className="text-blue-100" size={32} />
                                            </div>
                                            <div className="space-y-1 relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><User size={12} className="text-blue-500" /> Reporter</p>
                                                <p className="text-xs font-black text-slate-900 truncate pr-4">{activeIssue.reportedBy?.name}</p>
                                            </div>
                                            <div className="space-y-1 relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Phone size={12} className="text-emerald-500" /> Contact</p>
                                                <a href={`tel:${activeIssue.reportedBy?.mobile}`} className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1">
                                                    {activeIssue.reportedBy?.mobile}
                                                </a>
                                            </div>
                                            <div className="space-y-1 relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Store size={12} className="text-amber-500" /> Branch</p>
                                                <p className="text-xs font-black text-slate-900 truncate">{activeIssue.reportedBy?.shopName || 'Main Center'}</p>
                                            </div>
                                            <div className="space-y-1 relative z-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} className="text-slate-500" /> Logged</p>
                                                <p className="text-xs font-black text-slate-900">{new Date(activeIssue.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 w-48 shrink-0">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Update Progress</label>
                                        <div className="flex flex-col gap-2">
                                            {[
                                                { id: 'in_progress', label: 'Processing', icon: Clock, color: 'text-blue-600', active: 'bg-blue-600 text-white border-blue-600' },
                                                { id: 'resolved', label: 'Resolve', icon: CheckCircle2, color: 'text-emerald-600', active: 'bg-emerald-600 text-white border-emerald-600' },
                                                { id: 'closed', label: 'Close Ticket', icon: X, color: 'text-slate-600', active: 'bg-slate-900 text-white border-slate-900' }
                                            ].map(btn => (
                                                <button
                                                    key={btn.id}
                                                    onClick={() => handleStatusUpdate(btn.id)}
                                                    disabled={isUpdating}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95
                                                            ${activeIssue.status === btn.id ? btn.active : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
                                                >
                                                    <span className="flex items-center gap-2"><btn.icon size={14} className={activeIssue.status === btn.id ? 'text-white' : btn.color} /> {btn.label}</span>
                                                    {activeIssue.status === btn.id && <Circle size={6} fill="white" className="text-white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modern Thread */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30 custom-scrollbar">
                                {/* Issue Description Bubble */}
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0 shadow-inner">
                                        <User size={18} className="text-slate-500" />
                                    </div>
                                    <div className="space-y-2 max-w-[85%]">
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-xs font-black text-slate-900">{activeIssue.reportedBy?.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-widest">Original Issue</span>
                                        </div>
                                        <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-slate-200 shadow-sm text-sm text-slate-700 leading-relaxed">
                                            {activeIssue.description}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200/50 border-dashed" /></div>
                                    <div className="relative flex justify-center"><span className="bg-slate-50 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Correspondence History</span></div>
                                </div>

                                {activeIssue.comments.map((comment, idx) => (
                                    <div key={idx} className={`flex gap-4 ${comment.isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${comment.isAdmin ? 'bg-blue-600 text-white order-2' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                            {comment.isAdmin ? <Store size={18} /> : <User size={18} />}
                                        </div>
                                        <div className={`space-y-2 max-w-[80%] ${comment.isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className="flex items-center gap-2 px-1">
                                                <span className={`text-xs font-black ${comment.isAdmin ? 'text-blue-600' : 'text-slate-900'}`}>
                                                    {comment.isAdmin ? 'Resolution Team' : activeIssue.reportedBy?.name}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">•</span>
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className={`p-4 text-sm leading-relaxed shadow-sm transition-all
                                                    ${comment.isAdmin
                                                    ? 'bg-blue-600 text-white rounded-3xl rounded-tr-none'
                                                    : 'bg-white border border-slate-200 text-slate-700 rounded-3xl rounded-tl-none'}`}>
                                                {comment.text}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Premium Input */}
                            <div className="p-4 bg-white border-t border-slate-100 mb-2">
                                <form onSubmit={handleAddComment} className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Resolve this query. Your message will be sent to the operator..."
                                        className="flex-1 px-4 py-2 bg-transparent outline-none text-sm font-semibold text-slate-700"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isAddingComment}
                                        className="h-10 px-6 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-blue-100 flex items-center gap-2"
                                    >
                                        {isAddingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={14} />}
                                        Respond
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                            <div className="relative mb-6">
                                <div className="h-32 w-32 bg-slate-50 rounded-full flex items-center justify-center">
                                    <MessageSquare size={48} className="opacity-20" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
                                    <ChevronRight className="text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Omni-Channel Support</h3>
                            <p className="text-sm font-medium text-slate-400 max-w-xs leading-relaxed">
                                Select a ticket from the sidebar to view customer details, status timeline, and begin resolution.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default AdminSupportPage


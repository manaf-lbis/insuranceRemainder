import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Plus,
    MessageSquare,
    X,
    Send,
    Loader2
} from 'lucide-react'
import VleLayout from '../components/VleLayout'
import {
    useGetIssuesQuery,
    useCreateIssueMutation,
    useAddIssueCommentMutation
} from '../features/issues/issuesApiSlice'

const VleSupportPage = () => {
    const { user } = useSelector(state => state.auth)
    const { data: issues = [], isLoading } = useGetIssuesQuery()
    const [createIssue, { isLoading: isCreating }] = useCreateIssueMutation()
    const [addComment, { isLoading: isAddingComment }] = useAddIssueCommentMutation()

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '' })
    const [activeIssue, setActiveIssue] = useState(null)
    const [newComment, setNewComment] = useState('')

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await createIssue(formData).unwrap()
            setIsCreateOpen(false)
            setFormData({ title: '', description: '' })
        } catch (err) {
            alert('Failed to submit issue')
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return
        try {
            const updatedIssue = await addComment({ id: activeIssue._id, text: newComment }).unwrap()
            setActiveIssue(updatedIssue)
            setNewComment('')
        } catch (err) {
            alert('Failed to add comment')
        }
    }

    const StatBadge = ({ status }) => {
        switch (status) {
            case 'open':
                return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><AlertCircle className="h-3 w-3" /> Open</span>
            case 'in_progress':
                return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><Clock className="h-3 w-3" /> In Progress</span>
            case 'resolved':
                return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><CheckCircle className="h-3 w-3" /> Resolved</span>
            case 'closed':
                return <span className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><X className="h-3 w-3" /> Closed</span>
            default:
                return null
        }
    }

    return (
        <VleLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <MessageSquare className="h-6 w-6 text-primary" />
                            Support Tickets
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Report issues or request help from the administrators.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Report Issue
                    </button>
                </div>

                {/* Dashboard / Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ticket List */}
                    <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[700px]">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">Your Tickets</div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {isLoading ? (
                                <p className="text-center p-4 text-slate-500 text-sm">Loading...</p>
                            ) : issues.length === 0 ? (
                                <p className="text-center p-6 text-slate-400 text-sm">No tickets reported yet.</p>
                            ) : (
                                issues.map((issue) => (
                                    <button
                                        key={issue._id}
                                        onClick={() => setActiveIssue(issue)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${activeIssue?._id === issue._id ? 'bg-blue-50 border-primary shadow-sm' : 'bg-white border-transparent hover:bg-slate-50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2 gap-4">
                                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{issue.title}</h4>
                                            <StatBadge status={issue.status} />
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2">{issue.description}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-3">{new Date(issue.createdAt).toLocaleDateString()}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Thread */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[700px]">
                        {activeIssue ? (
                            <>
                                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">{activeIssue.title}</h2>
                                        <p className="text-sm text-slate-500 mt-1">{activeIssue.description}</p>
                                    </div>
                                    <StatBadge status={activeIssue.status} />
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                                    {activeIssue.comments.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                                            <MessageSquare className="h-8 w-8 opacity-20" />
                                            <p className="text-sm">No comments yet. Send a message to start.</p>
                                        </div>
                                    ) : (
                                        activeIssue.comments.map((comment) => (
                                            <div key={comment._id} className={`flex ${comment.addedBy?._id === user._id ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-2xl p-4 ${comment.addedBy?._id === user._id ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm'}`}>
                                                    <div className="flex items-center gap-2 mb-1 opacity-80 text-[10px] font-bold uppercase tracking-widest">
                                                        <span>{comment.isAdmin ? 'Support Admin' : 'You'}</span>
                                                        <span>•</span>
                                                        <span>{new Date(comment.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Input Box */}
                                <div className="p-4 bg-white border-t border-slate-100">
                                    <form onSubmit={handleAddComment} className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write your message..."
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim() || isAddingComment}
                                            className="px-6 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isAddingComment ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center">
                                    <MessageSquare className="h-8 w-8" />
                                </div>
                                <p className="font-semibold text-slate-500">Select a ticket to view conversation</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative animate-in slide-in-from-bottom-4">
                            <button onClick={() => setIsCreateOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><X className="h-5 w-5" /></button>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="bg-blue-50 text-primary p-2 rounded-xl"><Plus className="h-6 w-6" /></span>
                                New Support Ticket
                            </h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Subject / Title</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" placeholder="Brief summary of the issue" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Detailed Description</label>
                                    <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm font-medium" placeholder="Please provide details to help us investigate..." />
                                </div>
                                <button type="submit" disabled={isCreating} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95">
                                    {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Ticket'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </VleLayout>
    )
}

export default VleSupportPage

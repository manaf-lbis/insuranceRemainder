import React, { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useSelector } from 'react-redux'
import {
    CheckCircle,
    XCircle,
    FileText,
    Folder,
    Plus,
    Trash2,
    Search,
    AlertCircle,
    Check,
    X,
    ExternalLink,
    Eye,
    Printer,
    Loader2,
    Download
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import {
    useGetDocumentsQuery,
    useUpdateDocumentStatusMutation,
    useDeleteDocumentMutation,
    useIncrementDownloadMutation,
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useDeleteCategoryMutation
} from '../features/vle/vleAuthApiSlice'

// Custom Debounce Hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const AdminDocumentsPage = () => {
    const [search, setSearch] = useState('')
    const [newCat, setNewCat] = useState({ name: '', description: '' })
    const [previewDoc, setPreviewDoc] = useState(null)
    const [editDoc, setEditDoc] = useState(null)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [isCatModalOpen, setIsCatModalOpen] = useState(false)
    const [rejectingDocId, setRejectingDocId] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [processingId, setProcessingId] = useState(null)
    const [activeTab, setActiveTab] = useState('queue') // 'queue' | 'library'
    const [libSearch, setLibSearch] = useState('')
    const [libPage, setLibPage] = useState(1)
    const [isPrinting, setIsPrinting] = useState(false)

    // API Hooks
    const debouncedLibSearch = useDebounce(libSearch, 500);

    const { data: queueData, isLoading, refetch } = useGetDocumentsQuery({ status: 'pending' })
    const { data: libData } = useGetDocumentsQuery({
        search: debouncedLibSearch,
        status: activeTab === 'library' ? '' : undefined,
        page: libPage,
        limit: 20
    })

    const docs = queueData?.documents || []

    const allDocs = useMemo(() => {
        let items = libData?.documents || [];
        if (debouncedLibSearch.trim()) {
            const fuse = new Fuse(items, {
                keys: [
                    { name: 'title', weight: 0.7 },
                    { name: 'category.name', weight: 0.2 },
                    { name: 'description', weight: 0.1 }
                ],
                threshold: 0.3,
                includeScore: true,
                shouldSort: true
            });
            const results = fuse.search(debouncedLibSearch);
            items = results.map(r => r.item);
        }
        return items;
    }, [libData, debouncedLibSearch]);

    const totalLibPages = libData?.pages || 1
    const { data: categories = [] } = useGetCategoriesQuery()

    const [updateStatus] = useUpdateDocumentStatusMutation()
    const [deleteDocument] = useDeleteDocumentMutation()

    useEffect(() => {
        setLibPage(1);
    }, [debouncedLibSearch, activeTab]);

    const [createCategory, { isLoading: isCreatingCat }] = useCreateCategoryMutation()
    const [removeCategory] = useDeleteCategoryMutation()
    const [incrementDownload] = useIncrementDownloadMutation()

    const token = useSelector((state) => state.auth.token)
    const baseUrl = import.meta.env.VITE_API_URL || '/api'

    const handleStatus = async (id, status, reason) => {
        setProcessingId(id)
        try {
            await updateStatus({ id, status, rejectionReason: reason }).unwrap()
            await refetch()
            setIsRejectModalOpen(false)
            setRejectionReason('')
            setRejectingDocId(null)
        } catch (err) {
            alert(err?.data?.message || 'Failed to update status')
        } finally {
            setProcessingId(null)
        }
    }

    const handleEditUpdate = async (e) => {
        e.preventDefault()
        setProcessingId(editDoc._id)
        try {
            await updateStatus({
                id: editDoc._id,
                title: editDoc.title,
                description: editDoc.description,
                category: editDoc.category?._id || editDoc.category
            }).unwrap()
            setEditDoc(null)
            refetch()
        } catch (err) {
            alert(err?.data?.message || 'Failed to update document')
        } finally {
            setProcessingId(null)
        }
    }

    const handleDeleteDoc = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document permanently? This action cannot be undone.')) return
        setProcessingId(id)
        try {
            await deleteDocument(id).unwrap()
            refetch()
        } catch (err) {
            alert(err?.data?.message || 'Failed to delete document')
        } finally {
            setProcessingId(null)
        }
    }

    const openRejectModal = (id) => {
        setRejectingDocId(id)
        setIsRejectModalOpen(true)
    }

    const handleDownload = async (doc) => {
        try {
            await incrementDownload(doc._id).unwrap()
            const url = `${baseUrl}/documents/${doc._id}/view?token=${token}&download=true`;
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = doc.fileName || `${doc.title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download failed:', err)
            window.open(`${baseUrl}/documents/${doc._id}/view?token=${token}&download=true`, '_blank');
        }
    }

    const handlePrint = async () => {
        if (!previewDoc || isPrinting) return;
        setIsPrinting(true);
        try {
            const url = `${baseUrl}/documents/${previewDoc._id}/view?token=${token}`;
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const printFrame = document.createElement('iframe');
            printFrame.style.display = 'none';
            printFrame.src = blobUrl;
            document.body.appendChild(printFrame);
            printFrame.onload = () => {
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
                setTimeout(() => {
                    document.body.removeChild(printFrame);
                    window.URL.revokeObjectURL(blobUrl);
                    setIsPrinting(false);
                }, 1000);
            };
        } catch (err) {
            console.error('Print failed:', err);
            setIsPrinting(false);
            alert('Failed to prepare document for printing.');
        }
    }

    const handleAddCategory = async (e) => {
        e.preventDefault()
        try {
            await createCategory(newCat).unwrap()
            setNewCat({ name: '', description: '' })
            setIsCatModalOpen(false)
        } catch (err) {
            alert(err?.data?.message || 'Failed to create category')
        }
    }

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category? Documents using it will be uncategorized.')) return
        try {
            await removeCategory(id).unwrap()
        } catch (err) {
            alert(err?.data?.message || 'Delete failed')
        }
    }

    const formatSize = (bytes) => {
        if (!bytes) return ''
        const kb = bytes / 1024
        return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`
    }

    return (
        <>
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Document Management</h1>
                        <p className="text-slate-500 font-medium pt-1">Approve contributions and manage the library categories.</p>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('queue')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'queue' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            Approval Queue ({docs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            Global Library
                        </button>
                    </div>
                    {activeTab === 'library' && (
                        <div className="relative mr-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search library..."
                                value={libSearch}
                                onChange={(e) => setLibSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 w-64"
                            />
                        </div>
                    )}
                </div>

                {/* Content based on Tab */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    {activeTab === 'queue' ? (
                        <>
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-orange-500" />
                                    Pending Approval Queue ({docs.length})
                                </h2>
                            </div>

                            {isLoading ? (
                                <div className="p-12 text-center text-slate-400 font-bold">Loading queue...</div>
                            ) : docs.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 font-medium italic">
                                    No pending documents for approval. Good job!
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                                <th className="px-6 py-4">Title / Category</th>
                                                <th className="px-6 py-4">Uploaded By</th>
                                                <th className="px-6 py-4">Details</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {docs.map(doc => (
                                                <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm">{doc.title}</p>
                                                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase">
                                                                    {doc.category?.name || 'General'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-slate-700">{doc.uploadedBy?.name}</p>
                                                        <p className="text-xs text-slate-500">{doc.uploadedBy?.mobile}</p>
                                                        <p className="text-[10px] text-slate-400">{doc.uploadedBy?.shopName}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-[11px] font-bold text-slate-500">{formatSize(doc.fileSize)}</p>
                                                        <p className="text-[10px] text-slate-300">{new Date(doc.createdAt).toLocaleString()}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => setEditDoc(doc)}
                                                            className="p-2 text-slate-400 hover:text-blue-500 inline-block transition-colors"
                                                            disabled={processingId === doc._id}
                                                            title="Edit Details"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setPreviewDoc(doc)}
                                                            className="p-2 text-slate-400 hover:text-primary inline-block transition-colors"
                                                            disabled={processingId === doc._id}
                                                            title="Preview"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatus(doc._id, 'approved')}
                                                            className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                                            disabled={processingId === doc._id}
                                                            title="Approve"
                                                        >
                                                            {processingId === doc._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(doc._id)}
                                                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                                            disabled={processingId === doc._id}
                                                            title="Reject"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Folder className="h-5 w-5 text-primary" />
                                    Operator Library
                                </h2>
                            </div>
                            <div className="p-0">
                                {Object.entries(
                                    allDocs.reduce((acc, doc) => {
                                        const catName = doc.category?.name || 'General';
                                        if (!acc[catName]) acc[catName] = [];
                                        acc[catName].push(doc);
                                        return acc;
                                    }, {})
                                ).map(([catName, catDocs]) => (
                                    <div key={catName} className="mb-8 last:mb-0">
                                        <div className="px-6 py-3 bg-slate-100/50 border-y border-slate-100 flex items-center justify-between">
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Folder className="h-3 w-3 text-primary" />
                                                {catName}
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400">{catDocs.length} items</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                                        <th className="px-6 py-4 w-1/3">Title / Path</th>
                                                        <th className="px-6 py-4">Uploaded By</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {catDocs.map(doc => (
                                                        <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                                                                        <FileText className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-slate-900 text-sm truncate">{doc.title}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                                            situated in <span className="text-primary">{catName}</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm font-bold text-slate-700">{doc.uploadedBy?.name}</p>
                                                                <p className="text-xs text-slate-500">{doc.uploadedBy?.mobile}</p>
                                                                <p className="text-[10px] text-slate-400">{doc.uploadedBy?.shopName || 'Staff'}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-right space-x-2">
                                                                <button
                                                                    onClick={() => setEditDoc(doc)}
                                                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                                    title="Edit Details"
                                                                >
                                                                    <FileText className="h-5 w-5 text-blue-400" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setPreviewDoc(doc)}
                                                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteDoc(doc._id)}
                                                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                                                    disabled={processingId === doc._id}
                                                                    title="Delete Document"
                                                                >
                                                                    {processingId === doc._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!isLoading && totalLibPages > 1 && (
                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setLibPage(prev => Math.max(1, prev - 1))}
                                        disabled={libPage === 1}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-all"
                                    >
                                        PREV
                                    </button>
                                    <span className="text-xs font-black text-slate-400">
                                        PAGE {libPage} OF {totalLibPages}
                                    </span>
                                    <button
                                        onClick={() => setLibPage(prev => Math.min(totalLibPages, prev + 1))}
                                        disabled={libPage === totalLibPages}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-all"
                                    >
                                        NEXT
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900">Categories</h2>
                            <button
                                onClick={() => setIsCatModalOpen(true)}
                                className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all"
                            >
                                <Plus className="h-4 w-4" /> Add New
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categories.map(cat => (
                                <div key={cat._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group flex items-center justify-between hover:border-primary/20 transition-all">
                                    <div>
                                        <span className="font-bold text-slate-700 text-sm block">{cat.name}</span>
                                        {cat.description && <span className="text-[10px] text-slate-400 font-medium">{cat.description}</span>}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCategory(cat._id)}
                                        className="p-1.5 text-slate-200 group-hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-blue-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Folder className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 space-y-1">
                            <p className="text-blue-100 font-bold text-sm uppercase tracking-widest">Library Stats</p>
                            <h3 className="text-4xl font-black">{libData?.total || 0} Total Files</h3>
                            <p className="text-blue-200 font-medium">Approved and circulating in the operator portal.</p>
                        </div>
                        <div className="relative z-10 mt-12 grid grid-cols-3 gap-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Total</p>
                                <p className="text-2xl font-black">{libData?.total || 0}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 opacity-50">
                                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Page View</p>
                                <p className="text-2xl font-black">{allDocs.length}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 opacity-50">
                                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Pages</p>
                                <p className="text-2xl font-black">{totalLibPages}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 relative animate-in slide-in-from-bottom-4">
                        <button
                            onClick={() => setIsRejectModalOpen(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 text-red-600">Reject Document</h3>
                            <p className="text-slate-500 text-sm">Please provide a reason for rejection.</p>
                        </div>
                        <div className="space-y-4">
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-sm h-32"
                                placeholder="e.g. Scanned copy is not clear..."
                            />
                            <button
                                onClick={() => handleStatus(rejectingDocId, 'rejected', rejectionReason)}
                                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-10 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full h-full max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{previewDoc.title}</h3>
                                <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">{previewDoc.category?.name || 'General'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewDoc.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white text-slate-700 rounded-2xl hover:bg-slate-50 transition-all border border-slate-200"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                </a>
                                <button
                                    onClick={handlePrint}
                                    disabled={isPrinting}
                                    className="p-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-primary hover:text-white transition-all border border-slate-200 disabled:opacity-50"
                                >
                                    {isPrinting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5" />}
                                </button>
                                <button
                                    onClick={() => handleDownload(previewDoc)}
                                    className="p-3 bg-primary text-white rounded-2xl hover:bg-blue-800 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Download className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-50/50 p-4 md:p-8 overflow-hidden relative">
                            {previewDoc.fileUrl.match(/\.(jpg|jpeg|png|webp|avif)$/i) || previewDoc.fileType?.startsWith('image/') ? (
                                <div className="w-full h-full flex items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-inner overflow-auto">
                                    <img src={previewDoc.fileUrl} alt={previewDoc.title} className="max-w-full max-h-full object-contain" />
                                </div>
                            ) : (
                                <iframe src={`${baseUrl}/documents/${previewDoc._id}/view?token=${token}`} title="Preview" className="w-full h-full border-none rounded-3xl bg-white" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 relative animate-in slide-in-from-bottom-4">
                        <button onClick={() => setIsCatModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
                            <X className="h-6 w-6" />
                        </button>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Add New Category</h3>
                            <p className="text-slate-500 text-sm">Create a new organizational tag.</p>
                        </div>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <input
                                type="text"
                                required
                                value={newCat.name}
                                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                                placeholder="Category Name"
                            />
                            <textarea
                                value={newCat.description}
                                onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm h-20"
                                placeholder="Description (Optional)"
                            />
                            <button type="submit" disabled={isCreatingCat} className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
                                {isCreatingCat ? 'Creating...' : 'Create Category'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Document Modal */}
            {editDoc && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6 relative animate-in slide-in-from-bottom-4 border border-slate-100">
                        <button onClick={() => setEditDoc(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
                            <X className="h-6 w-6" />
                        </button>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Edit Document</h3>
                            <p className="text-slate-500 text-sm font-medium">Update title, category or description.</p>
                        </div>
                        <form onSubmit={handleEditUpdate} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editDoc.title}
                                    onChange={(e) => setEditDoc({ ...editDoc, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select
                                    required
                                    value={editDoc.category?._id || editDoc.category}
                                    onChange={(e) => setEditDoc({ ...editDoc, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                                >
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    value={editDoc.description}
                                    onChange={(e) => setEditDoc({ ...editDoc, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm h-24"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setEditDoc(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processingId === editDoc._id} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/10 transition-all disabled:opacity-50">
                                    {processingId === editDoc._id ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default AdminDocumentsPage

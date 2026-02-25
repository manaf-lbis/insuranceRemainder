import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
    FileText,
    Search,
    Filter,
    Download,
    Plus,
    X,
    FolderOpen,
    Eye,
    Printer,
    Loader2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Upload
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Fuse from 'fuse.js'
import VleLayout from '../components/VleLayout'
import {
    useGetDocumentsQuery,
    useGetCategoriesQuery,
    useIncrementDownloadMutation,
    useCreateCategoryMutation
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

const VleDocumentsPage = () => {
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    // API Hooks
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const debouncedSearch = useDebounce(search, 500);
    const { data: responseData, isLoading, refetch } = useGetDocumentsQuery({
        search: debouncedSearch,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        status: 'approved',
        page,
        limit
    })
    const docsData = responseData?.documents || [];
    const totalPages = responseData?.pages || 1;
    const { data: categories = [] } = useGetCategoriesQuery()
    const [incrementDownload] = useIncrementDownloadMutation()
    const [createCategory, { isLoading: isCreatingCat }] = useCreateCategoryMutation()

    const { user, token } = useSelector((state) => state.auth)
    const baseUrl = import.meta.env.VITE_API_URL || '/api'

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedCategory, limit]);

    // Modals State
    const [previewDoc, setPreviewDoc] = useState(null)
    const [isCatModalOpen, setIsCatModalOpen] = useState(false)
    const [newCat, setNewCat] = useState({ name: '', description: '' })
    const [isPrinting, setIsPrinting] = useState(false)
    const [error, setError] = useState('')

    const previewRef = useRef()
    const catRef = useRef()

    // Outside click handlers
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (previewRef.current && !previewRef.current.contains(e.target)) {
                setPreviewDoc(null)
            }
            if (catRef.current && !catRef.current.contains(e.target)) {
                setIsCatModalOpen(false)
            }
        }
        if (previewDoc || isCatModalOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [previewDoc, isCatModalOpen])

    const handleAddCategory = async (e) => {
        e.preventDefault()
        try {
            await createCategory(newCat).unwrap()
            setNewCat({ name: '', description: '' })
            setIsCatModalOpen(false)
        } catch (err) {
            setError(err?.data?.message || 'Failed to create category')
        }
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
            refetch()
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

    const formatSize = (bytes) => {
        if (!bytes) return ''
        const kb = bytes / 1024
        return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`
    }

    // Group documents by category
    const groupedDocs = useMemo(() => {
        const groups = {};

        // 1. First filter by our criteria
        let filtered = docsData;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(d => d.category?._id === selectedCategory);
        }

        if (search.trim()) {
            const fuse = new Fuse(filtered, {
                keys: [
                    { name: 'title', weight: 0.7 },
                    { name: 'category.name', weight: 0.2 },
                    { name: 'description', weight: 0.1 }
                ],
                threshold: 0.3, // Tycho-tolerance
                includeScore: true,
                shouldSort: true
            });

            const results = fuse.search(search);
            filtered = results.map(r => r.item);
        }

        // 2. Then group the remaining correctly
        filtered.forEach(doc => {
            const catName = doc.category?.name || 'General';
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(doc);
        });

        return groups;
    }, [docsData, search, selectedCategory]);

    return (
        <VleLayout>
            <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <FolderOpen className="h-8 w-8 text-primary" />
                            Resource Library
                        </h1>
                        <p className="text-slate-500 text-sm mt-2">
                            Browse, preview, and download community-verified document models and certificates.
                        </p>
                    </div>
                    <Link
                        to="/vle/contributions"
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 shrink-0"
                    >
                        <Upload className="h-4 w-4" />
                        Upload New Document
                    </Link>
                </div>

                {/* Advanced Search & Filter Ecosystem */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-all" />
                        <input
                            type="text"
                            placeholder="Search parameters: Form Name, Application Type..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="md:w-72 flex items-center gap-2 relative">
                        <div className="relative w-full group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                        <button
                            onClick={() => setIsCatModalOpen(true)}
                            className="shrink-0 h-[46px] w-[46px] bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center border border-slate-200"
                            title="Add Category"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Results Grouped View */}
                <div className="space-y-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : Object.keys(groupedDocs).length > 0 ? (
                        Object.entries(groupedDocs).map(([catName, docs]) => (
                            <div key={catName} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ breakInside: 'avoid' }}>
                                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <FolderOpen className="h-5 w-5 fill-primary/10 text-primary" />
                                        {catName}
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-200/50 px-2 py-1 rounded-md">
                                        {docs.length} Items
                                    </span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {docs.map((doc) => (
                                        <div key={doc._id} className="p-4 md:px-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className="h-12 w-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-semibold text-slate-900 truncate text-sm">{doc.title}</h4>
                                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                                                        <span>{formatSize(doc.fileSize)}</span>
                                                        <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {doc.downloadCount || 0} Downloads</span>
                                                        {doc.status === 'approved' && <span className="flex items-center gap-1 text-green-600"><ShieldCheck className="h-3 w-3" /> Verified</span>}
                                                        <span>Shared by {doc.uploadedBy?.shopName || 'Staff'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                                                <button
                                                    onClick={() => setPreviewDoc(doc)}
                                                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                                                >
                                                    <Eye className="h-4 w-4" /> Preview
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(doc)}
                                                    className="px-4 py-2 bg-primary text-white hover:bg-blue-700 rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
                                                >
                                                    <Download className="h-4 w-4" /> Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <Search className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No resources found</h3>
                            <button
                                onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                                className="px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Clean Preview Modal */}
                {previewDoc && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div ref={previewRef} className="bg-white w-full h-full max-w-6xl rounded-2xl shadow-xl flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                                <div className="min-w-0 pr-4">
                                    <h3 className="text-lg font-bold text-slate-900 truncate">{previewDoc.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{formatSize(previewDoc.fileSize)} • {previewDoc.category?.name || 'General'}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={handlePrint}
                                        disabled={isPrinting}
                                        className="h-10 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold disabled:opacity-50 shadow-sm"
                                    >
                                        {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                                        <span className="hidden sm:inline">Print</span>
                                    </button>
                                    <button
                                        onClick={() => handleDownload(previewDoc)}
                                        className="h-10 px-4 bg-primary text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm shadow-primary/20"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">Download</span>
                                    </button>
                                    <div className="w-px h-6 bg-slate-200 mx-1" />
                                    <button
                                        onClick={() => setPreviewDoc(null)}
                                        className="h-10 w-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Viewer Content */}
                            <div className="flex-1 bg-slate-100/50 p-4 sm:p-6 overflow-hidden">
                                <div className="w-full h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    {previewDoc.fileType?.startsWith('image/') ? (
                                        <div className="w-full h-full flex items-center justify-center p-6 overflow-auto">
                                            <img
                                                src={previewDoc.fileUrl}
                                                alt={previewDoc.title}
                                                className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                                            />
                                        </div>
                                    ) : (
                                        <iframe
                                            id="vle-preview-frame"
                                            src={`${baseUrl}/documents/${previewDoc._id}/view?token=${token}`}
                                            title="Native Document Viewer"
                                            className="w-full h-full"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Modal */}
                {isCatModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div ref={catRef} className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-in slide-in-from-bottom-4 border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-primary" /> New Category
                                </h3>
                                <button
                                    onClick={() => setIsCatModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCat.name}
                                        onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                                        placeholder="e.g. Welfare Schemes"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={isCreatingCat}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
                                >
                                    {isCreatingCat ? 'Creating...' : 'Create Category'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </VleLayout>
    )
}

export default VleDocumentsPage

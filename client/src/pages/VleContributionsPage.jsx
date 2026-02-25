import React, { useState, useRef, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import {
    FileText,
    Upload,
    CheckCircle,
    AlertCircle,
    X,
    FolderOpen,
    Loader2,
    ChevronDown,
    Trash2,
    Clock,
    Eye,
    Plus,
    Search,
    Filter,
    Download,
    CheckCircle2
} from 'lucide-react'
import { useSelector } from 'react-redux'
import VleLayout from '../components/VleLayout'
import {
    useGetDocumentsQuery,
    useUploadDocumentMutation,
    useDeleteDocumentMutation,
    useGetCategoriesQuery,
    useGetDocStatsQuery,
    useCreateCategoryMutation,
    useCheckSimilarityMutation
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

const VleContributionsPage = () => {
    const { user } = useSelector(state => state.auth)
    const baseUrl = import.meta.env.VITE_API_URL || '/api'

    // Data Hooks
    const { data: categories = [] } = useGetCategoriesQuery()
    const { data: stats, refetch: refetchStats } = useGetDocStatsQuery()
    // Load up to 100 on contributions page to allow robust client side filtering
    const { data: responseData, isLoading, refetch } = useGetDocumentsQuery({ page: 1, limit: 100 })

    const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation()
    const [deleteDocument] = useDeleteDocumentMutation()

    // Upload Modal State
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', category: '', termsAccepted: false })
    const [file, setFile] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const fileRef = useRef()
    const modalRef = useRef()

    // Category Modal State
    const [isCatModalOpen, setIsCatModalOpen] = useState(false)
    const [isFirstContribution, setIsFirstContribution] = useState(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [newCat, setNewCat] = useState({ name: '', description: '' })
    const [createCategory, { isLoading: isCreatingCat }] = useCreateCategoryMutation()
    const [checkSimilarity] = useCheckSimilarityMutation()
    const catRef = useRef()

    // Category Dropdown State
    const [catSearch, setCatSearch] = useState('')
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false)
    const catDropdownRef = useRef()

    // Similarity Detection State
    const [similarDocs, setSimilarDocs] = useState([])

    // Filtering & Preview state
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [previewDoc, setPreviewDoc] = useState(null)
    const previewRef = useRef()

    const debouncedSearch = useDebounce(searchQuery, 300)
    const debouncedTitle = useDebounce(formData.title, 500)

    // Derived filtered documents
    const filteredDocs = useMemo(() => {
        let docs = (responseData?.documents || []).filter(d => d.uploadedBy?._id === user?._id || d.uploadedBy === user?._id);

        if (selectedCategory !== 'all') {
            docs = docs.filter(d => d.category?._id === selectedCategory);
        }

        if (debouncedSearch.trim()) {
            const fuse = new Fuse(docs, {
                keys: [
                    { name: 'title', weight: 0.7 },
                    { name: 'category.name', weight: 0.2 },
                    { name: 'description', weight: 0.1 }
                ],
                threshold: 0.3,
                includeScore: true,
                shouldSort: true
            });
            const results = fuse.search(debouncedSearch);
            docs = results.map(r => r.item);
        }

        return docs;
    }, [responseData, user, selectedCategory, debouncedSearch]);

    // Similarity Check Effect
    useEffect(() => {
        const check = async () => {
            if (debouncedTitle.trim().length > 5 && isUploadOpen) {
                try {
                    const results = await checkSimilarity({ title: debouncedTitle }).unwrap()
                    setSimilarDocs(results || [])
                } catch (err) {
                    console.error('Similarity check failed:', err)
                }
            } else {
                setSimilarDocs([])
            }
        }
        check()
    }, [debouncedTitle, isUploadOpen, checkSimilarity])


    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setIsUploadOpen(false)
            }
            if (previewRef.current && !previewRef.current.contains(e.target)) {
                setPreviewDoc(null)
            }
            if (catRef.current && !catRef.current.contains(e.target)) {
                setIsCatModalOpen(false)
            }
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
                setIsCatDropdownOpen(false)
            }
        }
        if (isUploadOpen || previewDoc || isCatModalOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isUploadOpen, previewDoc, isCatModalOpen])


    const handleUpload = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        if (!file) return setError('Please select a file (PDF or Image)')

        // 3MB Limit Check
        const MAX_SIZE = 3 * 1024 * 1024; // 3MB
        if (file.size > MAX_SIZE) {
            return setError('File size too large. Maximum limit is 3MB.')
        }

        if (!formData.title.trim()) return setError('Please enter a title')
        if (!formData.category) return setError('Please select a category')

        if (!formData.termsAccepted) return setError('You must agree to the terms and conditions')

        const data = new FormData()
        data.append('file', file)
        data.append('title', formData.title)
        data.append('description', formData.description)
        data.append('category', formData.category)

        data.append('termsAccepted', formData.termsAccepted)

        try {
            await uploadDocument(data).unwrap()

            // Check if it's the first contribution to show special message
            if (stats?.myContributions === 0) {
                setIsFirstContribution(true)
            }

            setIsSuccessModalOpen(true)
            setIsUploadOpen(false)
            setFile(null)
            setFormData({ title: '', description: '', category: '', termsAccepted: false })
            setSimilarDocs([])
            setCatSearch('')
            setIsCatDropdownOpen(false)
            if (fileRef.current) fileRef.current.value = ''
            refetch()
            refetchStats()
        } catch (err) {
            setError(err?.data?.message || 'Upload failed.')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contribution?')) {
            try {
                await deleteDocument(id).unwrap()
                refetch()
                refetchStats()
            } catch (err) {
                alert('Failed to delete document')
            }
        }
    }

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

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

    return (
        <VleLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Upload className="h-6 w-6 text-primary" />
                            My Contributions
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Manage and track your uploaded resources.</p>
                    </div>
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Upload
                    </button>
                </div>

                {/* Advanced Search & Filter Ecosystem */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-all" />
                        <input
                            type="text"
                            placeholder="Search by file name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="md:w-72 flex items-center gap-2 relative">
                        <div className="relative w-full group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><FileText /></div>
                        <div><p className="text-sm font-medium text-slate-500">Total Uploads</p><p className="text-2xl font-bold">{stats?.myContributions || 0}</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle /></div>
                        <div><p className="text-sm font-medium text-slate-500">Approved</p><p className="text-2xl font-bold">{stats?.myApproved || 0}</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Clock /></div>
                        <div><p className="text-sm font-medium text-slate-500">Pending Review</p><p className="text-2xl font-bold">{stats?.myPending || 0}</p></div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-semibold text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Document Details</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan="4" className="text-center py-8 text-slate-400">Loading...</td></tr>
                                ) : filteredDocs.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-12 text-slate-400">No contributions found matching your filters.</td></tr>
                                ) : (
                                    filteredDocs.map((doc) => (
                                        <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-slate-900 truncate">{doc.title}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-xs text-slate-400">{formatSize(doc.fileSize)}</p>
                                                            <span className="text-slate-300">•</span>
                                                            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                                <Download className="h-3 w-3" /> {doc.downloadCount}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
                                                    {doc.category?.name || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {doc.status === 'approved' && <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 w-max"><CheckCircle className="h-3 w-3" /> Approved</span>}
                                                {doc.status === 'pending' && <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 w-max"><Clock className="h-3 w-3" /> Pending</span>}
                                                {doc.status === 'rejected' && (
                                                    <div className="flex flex-col gap-1 w-max">
                                                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                                                            <AlertCircle className="h-3 w-3" /> Rejected
                                                        </span>
                                                        <span className="text-[10px] text-red-500 max-w-[150px] truncate" title={doc.rejectionReason}>{doc.rejectionReason}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setPreviewDoc(doc)}
                                                        className="p-2 text-slate-400 hover:text-primary bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View File"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(doc._id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete File"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Simplified Compact Upload Modal */}
                {isUploadOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div ref={modalRef} className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-primary" /> Contribute File
                                </h3>
                                <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="p-5 space-y-4">
                                {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex gap-2 items-start"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                                {success && <div className="p-3 bg-green-50 text-green-600 text-xs rounded-lg flex gap-2 items-start"><CheckCircle className="h-4 w-4 shrink-0" />{success}</div>}

                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${file ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                >
                                    <input type="file" ref={fileRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files[0])} />
                                    {file ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <FileText className="h-6 w-6 text-primary" />
                                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{file.name}</p>
                                            <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-slate-500">
                                            <Upload className="h-6 w-6 mb-1" />
                                            <p className="text-sm font-medium">Click to select file</p>
                                            <p className="text-xs opacity-70">PDF, JPG, PNG (Max 3MB)</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Document Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="Enter a descriptive title"
                                        />

                                        {similarDocs.length > 0 && (
                                            <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Similar Documents Found</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {similarDocs.map((sDoc) => (
                                                        <div key={sDoc._id} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-amber-200/50 shadow-sm">
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] font-bold text-slate-800 truncate">{sDoc.title}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{sDoc.category?.name}</p>
                                                            </div>
                                                            <Link
                                                                to={`/vle/documents`}
                                                                className="shrink-0 px-2 py-1 bg-amber-100 text-amber-700 rounded text-[9px] font-black hover:bg-amber-200 transition-colors"
                                                            >
                                                                VIEW LIBRARY
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="mt-2 text-[9px] text-amber-600 font-bold italic leading-tight">
                                                    If this is a duplicate or updated version of an existing file, please check the library first.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Select Category</label>
                                        <div className="flex gap-2 relative" ref={catDropdownRef}>
                                            <div className="flex-1 relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all flex items-center justify-between group-hover:border-slate-300"
                                                >
                                                    <span className={formData.category ? 'text-slate-900' : 'text-slate-400'}>
                                                        {categories.find(c => c._id === formData.category)?.name || 'Choose a category...'}
                                                    </span>
                                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {isCatDropdownOpen && (
                                                    <div className="absolute z-[110] left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                                                <input
                                                                    type="text"
                                                                    autoFocus
                                                                    placeholder="Search categories..."
                                                                    value={catSearch}
                                                                    onChange={(e) => setCatSearch(e.target.value)}
                                                                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                                            {categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase())).length === 0 ? (
                                                                <div className="p-4 text-center text-xs text-slate-400 font-bold italic">No categories found</div>
                                                            ) : (
                                                                categories
                                                                    .filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
                                                                    .map(cat => (
                                                                        <button
                                                                            key={cat._id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setFormData({ ...formData, category: cat._id });
                                                                                setIsCatDropdownOpen(false);
                                                                                setCatSearch('');
                                                                            }}
                                                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${formData.category === cat._id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-blue-50 hover:text-primary'}`}
                                                                        >
                                                                            {cat.name}
                                                                        </button>
                                                                    ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsCatModalOpen(true)}
                                                className="shrink-0 h-[42px] w-[42px] bg-white text-primary rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center border border-primary/20 shadow-sm active:scale-95"
                                                title="Create New Category"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description (Optional)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium h-24 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Add more context about this document..."
                                    />
                                </div>


                                <label className="flex items-start gap-2 pt-2 cursor-pointer">
                                    <input type="checkbox" required checked={formData.termsAccepted} onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })} className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary" />
                                    <span className="text-xs text-slate-600 leading-tight">I declare this file contains no prohibited content and I take responsibility for its accuracy.</span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors mt-2"
                                >
                                    {isUploading ? 'Uploading...' : 'Submit Contribution'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Clean inline preview modal wrapper */}
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
                                            src={`${baseUrl}/documents/${previewDoc._id}/view?token=${user.token}`}
                                            title="Native Document Viewer"
                                            className="w-full h-full"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Category Modal (Reused) */}
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

                {/* Success/Celebration Modal */}
                {isSuccessModalOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center relative animate-in zoom-in-95 duration-300">
                            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                {isFirstContribution ? <CheckCircle2 size={40} /> : <CheckCircle size={40} />}
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-2">
                                {isFirstContribution ? "Welcome to the Community! 🎉" : "Upload Successful!"}
                            </h3>

                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                {isFirstContribution
                                    ? "Thank you for your very first contribution! You're making our resource library better for everyone. Our team will review it shortly."
                                    : "Thank you for contributing! Your document has been sent to the review queue. We'll notify you once it's approved."}
                            </p>

                            <button
                                onClick={() => {
                                    setIsSuccessModalOpen(false)
                                    setIsFirstContribution(false)
                                }}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                            >
                                Got it, Thanks!
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </VleLayout>
    )
}

export default VleContributionsPage

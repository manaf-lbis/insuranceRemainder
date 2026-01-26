import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    useCreateAnnouncementMutation,
    useUpdateAnnouncementMutation,
    useGetAnnouncementByIdAdminQuery
} from '../../features/announcements/announcementsApiSlice';
import {
    useGetNewsCategoriesQuery,
    useCreateNewsCategoryMutation
} from '../../features/announcements/newsCategoriesApiSlice';
import TiptapEditor from '../../components/TiptapEditor';
import { useToast } from '../../components/ToastContext';
import { ArrowLeft, Save, Loader, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageAnnouncement = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft');
    const [priority, setPriority] = useState('cold');
    const [showInTicker, setShowInTicker] = useState(false);
    const [expiryDuration, setExpiryDuration] = useState('never');
    const [category, setCategory] = useState('');

    // Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Queries & Mutations
    const { data: announcement, isLoading: isFetching } = useGetAnnouncementByIdAdminQuery(id, {
        skip: !isEditMode
    });
    const { data: categories, isLoading: isLoadingCategories } = useGetNewsCategoriesQuery();

    const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
    const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
    const [createCategory, { isLoading: isCreatingCategory }] = useCreateNewsCategoryMutation();

    useEffect(() => {
        if (announcement && isEditMode) {
            setTitle(announcement.title);
            setContent(announcement.content);
            setStatus(announcement.status);
            setPriority(announcement.priority || 'cold');
            setShowInTicker(announcement.showInTicker || false);
            setCategory(announcement.category || '');

            if (!announcement.expiresAt) setExpiryDuration('never');
        }
    }, [announcement, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let expiresAt = null;
            if (expiryDuration !== 'never') {
                const date = new Date();
                const days = parseInt(expiryDuration);
                date.setDate(date.getDate() + days);
                expiresAt = date;
            }

            const data = { title, content, status, priority, showInTicker, expiresAt, category: category || null };
            if (isEditMode) {
                await updateAnnouncement({ id, ...data }).unwrap();
                showToast({ message: 'Announcement updated successfully', type: 'success' });
            } else {
                await createAnnouncement(data).unwrap();
                showToast({ message: 'Announcement created successfully', type: 'success' });
            }
            navigate('/admin/announcements');
        } catch (err) {
            showToast({ message: 'Failed to save announcement', type: 'error' });
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const res = await createCategory({ name: newCategoryName }).unwrap();
            showToast({ message: 'Category created!', type: 'success' });
            setCategory(res._id); // Auto-select new category
            setNewCategoryName('');
            setIsCategoryModalOpen(false);
        } catch (err) {
            showToast({ message: err?.data?.message || 'Failed to create category', type: 'error' });
        }
    };

    if (isEditMode && isFetching) {
        return <div className="flex justify-center py-10"><Loader className="animate-spin text-blue-600" /></div>;
    }

    const isSaving = isCreating || isUpdating;

    return (
        <div className="max-w-4xl mx-auto pb-20 relative">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/announcements" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                    {isEditMode ? 'Edit Announcement' : 'New Announcement'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Enter announcement title..."
                            className="w-full px-4 py-2 text-lg font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:font-normal"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${status === 'draft' ? 'bg-gray-100 border-gray-300 ring-1 ring-gray-300' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="draft"
                                        checked={status === 'draft'}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="sr-only"
                                    />
                                    <span className="font-medium text-gray-600">Draft</span>
                                </label>
                                <label className={`flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${status === 'published' ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="published"
                                        checked={status === 'published'}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="sr-only"
                                    />
                                    <span className={`font-medium ${status === 'published' ? 'text-emerald-700' : 'text-gray-600'}`}>Publish</span>
                                </label>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                            <div className="flex gap-2">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Select Category...</option>
                                    {categories?.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="Add New Category"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="cold">❄️ Cold (Normal)</option>
                                <option value="warm">⚡ Warm (Important)</option>
                                <option value="hot">🔥 Hot (Urgent)</option>
                            </select>
                        </div>
                    </div>

                    {/* Expiry Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <input
                                type="checkbox"
                                id="showInTicker"
                                checked={showInTicker}
                                onChange={(e) => setShowInTicker(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="showInTicker" className="flex-1 cursor-pointer">
                                <span className="font-bold text-gray-900 block">Show in Scrolling Ticker</span>
                                <span className="text-xs text-gray-600">Display this announcement in the top scrolling news bar</span>
                            </label>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <div className="flex-1">
                                <label className="block text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Auto-Expiry</label>
                                <select
                                    value={expiryDuration}
                                    onChange={(e) => setExpiryDuration(e.target.value)}
                                    className="w-full bg-white/50 border border-amber-200 rounded-md py-1.5 px-2 text-sm font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="never">♾️ Never Expire</option>
                                    <option value="1">⏱️ 1 Day</option>
                                    <option value="3">⏱️ 3 Days</option>
                                    <option value="7">⏱️ 1 Week</option>
                                    <option value="30">⏱️ 1 Month</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                        <TiptapEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Write your announcement content here..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 sticky bottom-4 z-10">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/announcements')}
                        className="px-6 py-2.5 font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                        {isEditMode ? 'Update Announcement' : 'Save Announcement'}
                    </button>
                </div>
            </form>

            {/* Create Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-900">Add New Category</h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreateCategory}>
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category Name</label>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="e.g. Technology"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryModalOpen(false)}
                                        className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingCategory || !newCategoryName.trim()}
                                        className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                                    >
                                        {isCreatingCategory ? 'Creating...' : 'Create Category'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAnnouncement;

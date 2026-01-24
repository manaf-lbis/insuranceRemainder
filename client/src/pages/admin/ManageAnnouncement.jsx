import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    useCreateAnnouncementMutation,
    useUpdateAnnouncementMutation,
    useGetAnnouncementByIdAdminQuery
} from '../../features/announcements/announcementsApiSlice';
import RichTextEditor from '../../components/RichTextEditor';
import { useToast } from '../../components/ToastContext';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageAnnouncement = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft');
    const [priority, setPriority] = useState('cold');
    const [showInTicker, setShowInTicker] = useState(false);

    const { data: announcement, isLoading: isFetching } = useGetAnnouncementByIdAdminQuery(id, {
        skip: !isEditMode
    });

    const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
    const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();

    useEffect(() => {
        if (announcement && isEditMode) {
            setTitle(announcement.title);
            setContent(announcement.content);
            setStatus(announcement.status);
            setPriority(announcement.priority || 'cold');
            setShowInTicker(announcement.showInTicker || false);
        }
    }, [announcement, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { title, content, status, priority, showInTicker };
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

    if (isEditMode && isFetching) {
        return <div className="flex justify-center py-10"><Loader className="animate-spin text-blue-600" /></div>;
    }

    const isSaving = isCreating || isUpdating;

    return (
        <div className="max-w-4xl mx-auto pb-20">
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
                                <span className="font-medium text-gray-600">Save as Draft</span>
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
                                <span className={`font-medium ${status === 'published' ? 'text-emerald-700' : 'text-gray-600'}`}>Publish Immediately</span>
                            </label>
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="cold">❄️ Cold (Normal)</option>
                            <option value="warm">⚡ Warm (Important)</option>
                            <option value="hot">🔥 Hot (Urgent)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hot items appear first, then Warm, then Cold</p>
                    </div>

                    {/* Show in Ticker */}
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

                    {/* Editor */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                        <RichTextEditor
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
        </div>
    );
};

export default ManageAnnouncement;

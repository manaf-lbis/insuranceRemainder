import React from 'react';
import { Link } from 'react-router-dom';
import { useGetAllAnnouncementsQuery, useDeleteAnnouncementMutation } from '../../features/announcements/announcementsApiSlice';
import { PlusCircle, Edit, Trash2, Loader, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../components/ToastContext';

const AnnouncementList = () => {
    const { data: announcements, isLoading, error } = useGetAllAnnouncementsQuery();
    const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();
    const { showToast } = useToast();

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await deleteAnnouncement(id).unwrap();
            showToast({ message: 'Announcement deleted', type: 'success' });
        } catch (err) {
            showToast({ message: 'Failed to delete announcement', type: 'error' });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-10"><Loader className="animate-spin text-blue-600" /></div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">Error loading announcements: {error.data?.message || error.error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">Announcements</h1>
                <Link
                    to="/admin/announcements/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <PlusCircle size={18} />
                    New Announcement
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Title</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Author</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Last Updated</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {announcements?.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                    No announcements found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            announcements?.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.thumbnailUrl && (
                                                <img src={item.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover border border-gray-200" />
                                            )}
                                            <span className="font-medium text-gray-900">{item.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${item.status === 'published'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {item.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {item.author?.username || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(item.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/announcements/edit/${item._id}`}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                disabled={isDeleting}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
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
    );
};

export default AnnouncementList;

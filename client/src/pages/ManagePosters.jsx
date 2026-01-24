import React, { useState, useCallback } from 'react';
import { useUploadPosterMutation, useGetAllPostersQuery, useTogglePosterStatusMutation, useDeletePosterMutation } from '../features/posters/postersApiSlice';
import { Upload, Check, Trash2, Loader, Image as ImageIcon, AlertCircle, X, Crop as CropIcon, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropUtils';

const ManagePosters = () => {
    // Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [title, setTitle] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    // Cropper State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);

    // API Hooks
    const { data: posters, isLoading, refetch } = useGetAllPostersQuery();
    const [uploadPoster, { isLoading: isUploading }] = useUploadPosterMutation();
    const [togglePoster, { isLoading: isToggling }] = useTogglePosterStatusMutation();
    const [deletePoster, { isLoading: isDeleting }] = useDeletePosterMutation();

    const { showToast } = useToast();

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setIsCropping(true); // Open cropper immediately
        }
    };

    const handleCropSave = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
            const file = new File([croppedImageBlob], "cropped-poster.jpg", { type: "image/jpeg" });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Update preview to cropped version
            setIsCropping(false);
            showToast({ message: 'Image cropped successfully', type: 'success' });
        } catch (e) {
            console.error(e);
            showToast({ message: 'Failed to crop image', type: 'error' });
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        // Reset file input value if needed (using ref) or just rely on state
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('title', title);

        try {
            await uploadPoster(formData).unwrap();
            showToast({ message: 'Poster uploaded successfully', type: 'success' });
            setSelectedFile(null);
            setTitle('');
            setPreviewUrl(null);
            refetch();
        } catch (err) {
            showToast({ message: 'Failed to upload poster: ' + (err.data?.message || err.message), type: 'error' });
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await togglePoster(id).unwrap();
            showToast({ message: currentStatus ? 'Poster deactivated' : 'Poster activated', type: 'success' });
            refetch();
        } catch (err) {
            showToast({ message: 'Failed to update poster status', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this poster?')) return;
        try {
            await deletePoster(id).unwrap();
            showToast({ message: 'Poster deleted', type: 'success' });
            refetch();
        } catch (err) {
            showToast({ message: 'Failed to delete poster', type: 'error' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Manage Posters</h1>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-blue-600" />
                    Upload New Poster
                </h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Poster Title (Optional)</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Summer Promo"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onClick={(e) => { e.target.value = null }} // clear checks
                                />
                                <ImageIcon size={32} className="text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Click to upload image</span>
                                <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, AVIF</span>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center h-48 md:h-auto border border-gray-200 relative">
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                    {/* Obscure if cropping? No, cropping is modal */}
                                </>
                            ) : (
                                <span className="text-gray-400 text-sm">Image Preview</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!selectedFile || isUploading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isUploading ? <Loader className="animate-spin" size={18} /> : <Upload size={18} />}
                            Upload Poster
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Existing Posters</h2>

                {isLoading ? (
                    <div className="text-center py-8"><Loader className="animate-spin h-8 w-8 text-blue-500 mx-auto" /></div>
                ) : posters?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-100 p-8">No posters found. Upload one to get started.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posters.map((poster) => (
                            <div key={poster._id} className={`bg-white rounded-xl shadow-sm border overflow-hidden relative group transition-all duration-300 ${poster.isActive ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 opacity-90 hover:opacity-100'}`}>
                                {poster.isActive && (
                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10 flex items-center gap-1 animate-in fade-in zoom-in">
                                        <Check size={12} /> Live
                                    </div>
                                )}

                                <div className="h-40 bg-gray-100 relative overflow-hidden">
                                    <img src={poster.imageUrl} alt={poster.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 truncate">{poster.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Uploaded by {poster.uploadedBy?.username} on {new Date(poster.createdAt).toLocaleDateString()}</p>

                                    <div className="mt-4 flex gap-2 justify-between items-center bg-gray-50 p-2 rounded-lg">
                                        <button
                                            onClick={() => handleToggleStatus(poster._id, poster.isActive)}
                                            disabled={isToggling}
                                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${poster.isActive
                                                    ? 'bg-white border border-gray-200 text-gray-600 hover:text-red-500 hover:bg-red-50'
                                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                                                }`}
                                        >
                                            {isToggling ? (
                                                <Loader size={12} className="animate-spin" />
                                            ) : poster.isActive ? (
                                                <>
                                                    <EyeOff size={14} /> Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <Eye size={14} /> Set Active
                                                </>
                                            )}
                                        </button>

                                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                                        <button
                                            onClick={() => handleDelete(poster._id)}
                                            disabled={isDeleting}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cropping Modal */}
            {isCropping && previewUrl && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <CropIcon size={20} className="text-blue-600" />
                                Crop Poster
                            </h3>
                            <button onClick={handleCropCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="relative flex-1 bg-gray-900">
                            <Cropper
                                image={previewUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                showGrid={true}
                            />
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white">
                            <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Zoom</span>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(e.target.value)}
                                        className="w-full md:w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={handleCropCancel}
                                        className="flex-1 md:flex-none px-6 py-2.5 text-gray-700 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCropSave}
                                        className="flex-1 md:flex-none px-8 py-2.5 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                                    >
                                        Crop & Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePosters;

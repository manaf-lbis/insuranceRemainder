import React, { useState, useEffect } from 'react';
import { useUploadPosterMutation, useGetAllPostersQuery, useTogglePosterStatusMutation, useDeletePosterMutation } from '../features/posters/postersApiSlice';
import { Upload, Loader, Image as ImageIcon, Shield, Monitor, Smartphone, CheckCircle2, Trash2, ArrowRight, MessageCircle } from 'lucide-react';
import { useToast } from '../components/ToastContext';

const ManagePosters = () => {
    // Form State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [headline, setHeadline] = useState('');
    const [description, setDescription] = useState('');
    const [showButton, setShowButton] = useState(true);
    const [buttonText, setButtonText] = useState('Quick Apply');
    const [whatsappNumber, setWhatsappNumber] = useState('9633565414');
    const [messageTemplate, setMessageTemplate] = useState('Hello, I would like to apply for insurance.');
    const [isActive, setIsActive] = useState(false);

    // View State
    const [previewMode, setPreviewMode] = useState('desktop');

    // API Hooks
    const { data: posters, isLoading, refetch } = useGetAllPostersQuery();
    const [uploadPoster, { isLoading: isUploading }] = useUploadPosterMutation();
    const [toggleStatus, { isLoading: isToggling }] = useTogglePosterStatusMutation();
    const [deletePoster, { isLoading: isDeleting }] = useDeletePosterMutation();

    const { showToast } = useToast();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            showToast({ message: 'Select your poster design first', type: 'error' });
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('headline', headline);
        formData.append('description', description);
        formData.append('showButton', showButton);
        formData.append('buttonText', buttonText);
        formData.append('whatsappNumber', whatsappNumber);
        formData.append('messageTemplate', messageTemplate);
        formData.append('isActive', isActive);

        try {
            await uploadPoster(formData).unwrap();
            showToast({ message: 'Universal Hero Published!', type: 'success' });
            resetForm();
            refetch();
        } catch (err) {
            showToast({ message: err.data?.message || 'Upload failed', type: 'error' });
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setHeadline('');
        setDescription('');
        setIsActive(false);
    };

    const handleToggle = async (id) => {
        try {
            await toggleStatus(id).unwrap();
            showToast({ message: 'Visibility updated', type: 'success' });
            refetch();
        } catch (err) {
            showToast({ message: 'Toggle failed', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this hero poster?')) return;
        try {
            await deletePoster(id).unwrap();
            showToast({ message: 'Removed successfully', type: 'success' });
            refetch();
        } catch (err) {
            showToast({ message: 'Delete failed', type: 'error' });
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-6 min-h-screen bg-slate-50/50">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 font-poppins tracking-tight">Hero Engine</h1>
                    <p className="text-slate-500 mt-1 font-medium italic underline decoration-blue-500/30 underline-offset-4">Universal Poster-Safe Architecture</p>
                </div>
                <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
                    <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${previewMode === 'desktop' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Monitor size={18} />
                        <span className="text-xs font-black uppercase">Desktop View</span>
                    </button>
                    <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${previewMode === 'mobile' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Smartphone size={18} />
                        <span className="text-xs font-black uppercase">Mobile View</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* 1. ARCHITECT PANEL */}
                <div className="lg:col-span-4 space-y-6">
                    <form onSubmit={handleUpload} className="bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden sticky top-8">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
                            <h2 className="font-black text-slate-900 flex items-center gap-2 text-xl">
                                <Shield size={24} className="text-blue-600" />
                                Architect
                            </h2>
                            <button type="button" onClick={resetForm} className="text-[10px] font-black uppercase text-slate-300 hover:text-slate-600">Reset</button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                            {/* Group: Core Asset */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                    The Poster Asset
                                </label>
                                <div
                                    className={`relative aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group overflow-hidden ${previewUrl ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                    {previewUrl ? (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img src={previewUrl} className="max-w-full max-h-full object-contain" alt="Preview" />
                                            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <span className="text-xs font-black text-slate-900 bg-white px-4 py-2 rounded-full shadow-lg">Change Design</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="text-slate-200 group-hover:text-blue-500 transition-colors" size={40} />
                                            <p className="text-sm font-bold text-slate-400 mt-2">Any aspect ratio supported</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Group: Messaging */}
                            <div className="space-y-5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                    The Messaging
                                </label>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={headline}
                                        onChange={(e) => setHeadline(e.target.value)}
                                        placeholder="Catching Headline (Max 2 lines)..."
                                        className="w-full bg-slate-50/50 px-5 py-4 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-800"
                                    />
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={2}
                                        placeholder="Short description..."
                                        className="w-full bg-slate-50/50 px-5 py-4 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Group: Call to Action */}
                            <div className="space-y-5 p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Button</label>
                                    <div className="relative">
                                        <input type="checkbox" checked={showButton} onChange={(e) => setShowButton(e.target.checked)} className="sr-only" />
                                        <button
                                            type="button"
                                            onClick={() => setShowButton(!showButton)}
                                            className={`w-10 h-5 rounded-full transition-all border ${showButton ? 'bg-blue-600 border-blue-500' : 'bg-slate-200 border-slate-300'}`}
                                        >
                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${showButton ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                                {showButton && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <input
                                            type="text"
                                            value={buttonText}
                                            onChange={(e) => setButtonText(e.target.value)}
                                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                                            placeholder="Button Text..."
                                        />
                                        <div className="grid grid-cols-1 gap-2">
                                            <input
                                                type="text"
                                                value={whatsappNumber}
                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                                className="w-full bg-white/50 border border-slate-100 px-4 py-2 rounded-lg text-slate-600 font-mono text-[10px]"
                                                placeholder="Support Number"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Group: Status */}
                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl">
                                <span className="text-[10px] font-black text-white/50 uppercase">Go Live Status</span>
                                <label className="relative cursor-pointer">
                                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only" />
                                    <div className={`w-8 h-4 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                                    <div className={`absolute top-1 left-1 bg-white w-2 h-2 rounded-full transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </label>
                            </div>
                        </div>

                        <div className="p-8 bg-white border-t border-slate-50">
                            <button
                                type="submit"
                                disabled={isUploading || !selectedFile}
                                className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isUploading ? <Loader size={24} className="animate-spin text-white" /> : <CheckCircle2 size={24} />}
                                <span className="uppercase tracking-widest text-sm">Deploy Universal Hero</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* 2. SIMULATION PANEL */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="relative bg-black rounded-[48px] shadow-2xl overflow-hidden min-h-[600px] flex items-center justify-center border border-white/5">

                        {/* THE ENGINE SIMULATOR (Matches PremiumHero Logic) */}

                        {/* Universal Blurred Background */}
                        <div className="absolute inset-0 z-0">
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} className="w-full h-full object-cover blur-[50px] scale-[1.3] opacity-50" alt="" />
                                    <div className="absolute inset-0 bg-black/60"></div>
                                </>
                            ) : (
                                <div className="w-full h-full bg-slate-900"></div>
                            )}
                        </div>

                        {/* Layout Layers */}
                        <div className={`relative z-10 w-full flex ${previewMode === 'mobile' ? 'flex-col p-6' : 'flex-row'}`}>

                            {/* --- Desktop Preview Area --- */}
                            {previewMode === 'desktop' && (
                                <div className="flex w-full min-h-[500px]">
                                    <div className="w-[55%] flex flex-col justify-center px-16 text-left">
                                        <div className="w-2 h-12 bg-white/20 mb-6 rounded-full"></div>
                                        <h3 className="text-4xl lg:text-5xl font-black text-white mb-6 font-poppins leading-tight">
                                            {headline || 'Headline Preview'}
                                        </h3>
                                        <p className="text-white/60 mb-10 text-lg max-w-sm line-clamp-2">
                                            {description || 'Description will naturally wrap and clamp after two lines.'}
                                        </p>
                                        {showButton && (
                                            <div className="px-10 h-[56px] rounded-full bg-white text-slate-950 font-black text-lg flex items-center gap-3 w-fit shadow-2xl">
                                                <MessageCircle size={20} className="text-emerald-500" />
                                                {buttonText}
                                                <ArrowRight size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex items-center justify-center p-12">
                                        {previewUrl ? (
                                            <img src={previewUrl} className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl" alt="" />
                                        ) : (
                                            <div className="w-32 h-48 border-2 border-dashed border-white/20 rounded-2xl" />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- Mobile Preview Area --- */}
                            {previewMode === 'mobile' && (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-full h-[280px] flex items-center justify-center mb-8">
                                        {previewUrl ? (
                                            <img src={previewUrl} className="w-[80%] h-auto max-h-full object-contain shadow-2xl rounded-xl border border-white/10" alt="" />
                                        ) : (
                                            <div className="w-32 h-48 border-2 border-dashed border-white/20 rounded-xl" />
                                        )}
                                    </div>
                                    <div className="space-y-3 mb-8">
                                        <h3 className="text-[18px] font-bold text-white font-poppins leading-tight px-4">
                                            {headline || 'Mobile Headline'}
                                        </h3>
                                        <p className="text-[13px] text-white/70 font-medium px-6">
                                            {description || 'Tight mobile app-like description preview.'}
                                        </p>
                                    </div>
                                    {showButton && (
                                        <div className="px-8 h-[40px] rounded-full bg-white text-slate-950 font-black text-sm shadow-xl flex items-center gap-2">
                                            <MessageCircle size={16} className="text-emerald-500" />
                                            {buttonText}
                                            <ArrowRight size={16} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Deployment Stack */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Deployment Infrastructure</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {posters?.map(p => (
                                <div key={p._id} className="bg-white p-4 rounded-[24px] border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0">
                                        <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 truncate text-[11px]">{p.headline || p.title}</h4>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <button
                                                onClick={() => handleToggle(p._id)}
                                                className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${p.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                                                    }`}
                                            >
                                                {p.isActive ? 'LIVE' : 'IDLE'}
                                            </button>
                                            <button onClick={() => handleDelete(p._id)} className="p-1 text-slate-200 hover:text-red-500 transition-colors">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagePosters;

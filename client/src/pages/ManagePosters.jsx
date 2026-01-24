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
        <div className="max-w-[1600px] mx-auto min-h-screen">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 font-poppins tracking-tighter">Hero Engine</h1>
                    <p className="text-slate-500 mt-1 font-bold italic underline decoration-blue-500/30 underline-offset-4">Universal Poster-Safe Architect</p>
                </div>
                <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
                    <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${previewMode === 'desktop' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Monitor size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Desktop</span>
                    </button>
                    <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${previewMode === 'mobile' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Smartphone size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Mobile</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* 1. ARCHITECT CONTROL PANEL */}
                <div className="xl:col-span-4 space-y-6">
                    <form onSubmit={handleUpload} className="bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden sticky top-8">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
                            <h2 className="font-black text-slate-900 flex items-center gap-2 text-xl">
                                <Shield size={24} className="text-blue-600" />
                                Architect
                            </h2>
                            <button type="button" onClick={resetForm} className="text-[10px] font-black uppercase text-slate-300 hover:text-slate-600">Reset</button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                            {/* Visual Asset Group */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Visual Asset
                                </label>
                                <div
                                    className={`relative aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group overflow-hidden ${previewUrl ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 hover:border-blue-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                    {previewUrl ? (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img src={previewUrl} className="max-w-full max-h-full object-contain" alt="Preview" />
                                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-2xl">
                                                <span className="text-xs font-black text-slate-900 bg-white px-6 py-2 rounded-full shadow-2xl">Replace Asset</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="text-slate-200 group-hover:text-blue-500 transition-colors" size={40} />
                                            <p className="text-sm font-bold text-slate-400 mt-3 italic">Any Aspect Ratio (A4, Portrait, Landscape)</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Messaging Group */}
                            <div className="space-y-5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Messaging
                                </label>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={headline}
                                        onChange={(e) => setHeadline(e.target.value)}
                                        placeholder="Headline (Max 2 lines)..."
                                        className="w-full bg-slate-50/50 px-5 py-4 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-800"
                                    />
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={2}
                                        placeholder="Complementary description..."
                                        className="w-full bg-slate-50/50 px-5 py-4 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-slate-800 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div className="space-y-5 p-6 bg-slate-50/80 rounded-[32px] border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Call to Action</label>
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
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <input
                                            type="text"
                                            value={buttonText}
                                            onChange={(e) => setButtonText(e.target.value)}
                                            className="w-full bg-white border border-slate-200 px-5 py-3 rounded-xl text-slate-900 font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm shadow-sm"
                                            placeholder="Button Text..."
                                        />
                                        <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Action</span>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-1.5">
                                                <MessageCircle size={12} />
                                                WhatsApp
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Infrastructure Group */}
                            <div className="flex items-center justify-between p-5 bg-slate-950 rounded-[28px] shadow-xl shadow-slate-900/20">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></div>
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Deploy Status</span>
                                </div>
                                <label className="relative cursor-pointer">
                                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only" />
                                    <div className={`w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-md ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </label>
                            </div>
                        </div>

                        <div className="p-8 bg-white border-t border-slate-50">
                            <button
                                type="submit"
                                disabled={isUploading || !selectedFile}
                                className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-500/40 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {isUploading ? <Loader size={24} className="animate-spin text-white" /> : <CheckCircle2 size={24} />}
                                <span className="uppercase tracking-widest text-sm">Deploy Universal Hero</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* 2. UNIVERSAL ENGINE SIMULATOR */}
                <div className="xl:col-span-8 space-y-10">
                    <div className={`relative bg-black rounded-[48px] shadow-2xl overflow-hidden border border-white/5 transition-all duration-700 ${previewMode === 'mobile' ? 'max-w-[420px] mx-auto' : 'w-full'}`}>

                        {/* Simulation Logic - Mirror of PremiumHero.jsx */}

                        {/* Unified Blurred Forest */}
                        <div className="absolute inset-0 z-0">
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} className="w-full h-full object-cover blur-[50px] scale-[1.3] opacity-60 transition-all duration-1000" alt="" />
                                    <div className="absolute inset-0 bg-black/60"></div>
                                </>
                            ) : (
                                <div className="w-full h-full bg-slate-900"></div>
                            )}
                        </div>

                        {/* Layout Content */}
                        <div className={`relative z-10 w-full flex ${previewMode === 'mobile' ? 'flex-col px-6 py-12' : 'flex-row min-h-[550px]'}`}>

                            {/* --- Desktop Simulation Frame --- */}
                            {previewMode === 'desktop' && (
                                <div className="flex w-full h-full">
                                    {/* Sidebar Content Mock */}
                                    <div className="w-[58%] flex flex-col justify-center px-16 lg:px-24">
                                        <div className="w-2 h-14 bg-white/10 mb-8 rounded-full border border-white/20"></div>
                                        <h3 className="text-4xl xl:text-5xl font-black text-white mb-6 font-poppins leading-tight tracking-tight drop-shadow-xl">
                                            {headline || 'Secure Your Journey Today'}
                                        </h3>
                                        <p className="text-white/60 mb-10 text-lg xl:text-xl font-medium max-w-sm line-clamp-2 leading-relaxed">
                                            {description || 'Get professional insurance support with our simplified application process.'}
                                        </p>
                                        {showButton && (
                                            <div className="px-10 h-[56px] rounded-full bg-white text-slate-950 font-black text-lg flex items-center gap-3 w-fit shadow-2xl">
                                                <MessageCircle size={20} className="text-emerald-500" />
                                                {buttonText}
                                                <ArrowRight size={20} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Poster Mock */}
                                    <div className="flex-1 flex items-center justify-center p-12 overflow-hidden">
                                        {previewUrl ? (
                                            <img src={previewUrl} className="max-w-full max-h-full object-contain shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] rounded-2xl transition-all" alt="" />
                                        ) : (
                                            <div className="w-48 h-64 border-2 border-dashed border-white/20 rounded-[32px] flex items-center justify-center opacity-30">
                                                <ImageIcon className="text-white" size={48} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- Mobile Simulation Frame --- */}
                            {previewMode === 'mobile' && (
                                <div className="flex flex-col items-center text-center">
                                    {/* Mobile Poster Focus */}
                                    <div className="w-full flex items-center justify-center mb-10 min-h-[300px]">
                                        {previewUrl ? (
                                            <img src={previewUrl} className="w-[85%] h-auto max-h-[380px] object-contain shadow-2xl rounded-2xl border border-white/10" alt="" />
                                        ) : (
                                            <div className="w-32 h-48 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center opacity-20">
                                                <ImageIcon className="text-white" size={32} />
                                            </div>
                                        )}
                                    </div>
                                    {/* Mobile Text Focus */}
                                    <div className="space-y-4 mb-10">
                                        <h3 className="text-2xl font-bold text-white font-poppins leading-tight tracking-tight px-4">
                                            {headline || 'Secure Your Journey'}
                                        </h3>
                                        <p className="text-[15px] text-white/70 font-medium px-8 leading-relaxed line-clamp-2">
                                            {description || 'Simplified insurance solutions at your fingertips.'}
                                        </p>
                                    </div>
                                    {showButton && (
                                        <div className="px-8 h-[44px] rounded-full bg-white text-slate-950 font-black text-sm shadow-xl flex items-center gap-2">
                                            <MessageCircle size={18} className="text-emerald-500" />
                                            {buttonText}
                                            <ArrowRight size={16} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Infrastructure Overview */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Asset Deployment Stack</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {posters?.map(p => (
                                <div key={p._id} className="bg-white p-5 rounded-[32px] border border-slate-100 flex items-center gap-5 shadow-sm hover:shadow-2xl hover:translate-y-[-4px] transition-all group relative overflow-hidden">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 shadow-inner">
                                        <img src={p.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-8">
                                        <h4 className="font-black text-slate-900 truncate text-xs uppercase tracking-tight">{p.headline || p.title}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => handleToggle(p._id)}
                                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${p.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                                                    }`}
                                            >
                                                {p.isActive ? 'LIVE' : 'IDLE'}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(p._id)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
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

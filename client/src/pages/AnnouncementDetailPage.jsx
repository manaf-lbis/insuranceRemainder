import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetAnnouncementByIdQuery, useGetPublicAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';
import { Calendar, User, ArrowLeft, Loader, Share2, Copy, Check } from 'lucide-react';
import DOMPurify from 'dompurify';
import Navbar from '../components/Navbar';
import { extractFirstImage } from '../utils/stringUtils';
import { useToast } from '../components/ToastContext';

const AnnouncementDetailPage = () => {
    const { id } = useParams();
    const { showToast } = useToast();
    const { data: announcement, isLoading, isError } = useGetAnnouncementByIdQuery(id);
    const { data: allAnnouncements } = useGetPublicAnnouncementsQuery();
    const [copied, setCopied] = React.useState(false);

    const handleShare = async () => {
        const shareData = {
            title: announcement?.title,
            text: `Check out this update: ${announcement?.title}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share failed', err);
            }
        } else {
            // Copy to clipboard fallback
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            showToast({ message: 'Link copied to clipboard!', type: 'success' });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const suggestions = React.useMemo(() => {
        if (!allAnnouncements || !announcement) return [];
        return allAnnouncements
            .filter(a => a._id !== announcement._id)
            .slice(0, 3);
    }, [allAnnouncements, announcement]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center custom-min-h-screen pt-20">
                <Loader className="animate-spin text-blue-600 w-12 h-12" />
            </div>
        );
    }

    if (isError || !announcement) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Announcement not found</h2>
                <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2">
                    <ArrowLeft size={18} /> Back to Home
                </Link>
            </div>
        );
    }

    // Sanitize HTML content while allowing styles, classes and link targets for rich text fidelity
    const sanitizedContent = DOMPurify.sanitize(announcement.content, {
        ADD_ATTR: ['style', 'class', 'target'],
        ADD_TAGS: ['iframe'] // Preparation for future video embeds
    });

    return (
        <article className="min-h-screen bg-white">
            <Navbar variant="solid" />
            <header className="bg-slate-50 border-b border-gray-100 py-24 md:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-12">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 font-poppins leading-tight mb-6">
                                {announcement.title}
                            </h1>

                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-emerald-500" />
                                    <span>{new Date(announcement.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-blue-500" />
                                    <span className="capitalize">{announcement.author?.username || 'Notify CSC Team'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Share Button */}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
                        >
                            {copied ? (
                                <>
                                    <Check size={18} className="text-emerald-500" />
                                    <span>Link Copied</span>
                                </>
                            ) : (
                                <>
                                    <Share2 size={18} className="text-blue-500 group-hover:rotate-12 transition-transform" />
                                    <span>Share Update</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div
                    className="prose prose-lg md:prose-xl prose-slate max-w-none 
                        prose-headings:font-poppins prose-headings:font-bold 
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-2xl prose-img:shadow-md border-b border-slate-100 pb-16"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                {/* Suggestions Section */}
                {suggestions.length > 0 && (
                    <div className="mt-20">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 font-poppins tracking-tight">More from <span className="text-blue-600">Notify CSC</span></h2>
                            <Link to="/news" className="text-sm font-bold text-blue-600 hover:underline">View Registry</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {suggestions.map((s) => (
                                <Link key={s._id} to={`/announcements/${s._id}`} className="group block h-full">
                                    <div className="bg-slate-50 rounded-3xl p-5 h-full border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all">
                                        {extractFirstImage(s.content) ? (
                                            <div className="aspect-video rounded-xl overflow-hidden mb-4">
                                                <img src={extractFirstImage(s.content)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        ) : (
                                            <div className="aspect-video rounded-xl bg-slate-200 flex items-center justify-center text-4xl mb-4">📢</div>
                                        )}
                                        <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                            {s.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Share Button - Above WhatsApp */}
            <button
                onClick={handleShare}
                className="fixed bottom-24 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-110 group"
                aria-label="Share this news"
            >
                {copied ? <Check size={24} /> : <Share2 size={24} className="group-hover:rotate-12 transition-transform" />}
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {copied ? 'Copied' : 'Share Now'}
                </span>
            </button>
        </article>
    );
};

export default AnnouncementDetailPage;

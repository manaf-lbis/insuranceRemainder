import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetAnnouncementByIdQuery, useGetPublicAnnouncementsQuery, useIncrementAnnouncementViewsMutation } from '../features/announcements/announcementsApiSlice';
import { Calendar, User, ArrowLeft, Loader, Share2, Copy, Check, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import Navbar from '../components/Navbar';
import { extractFirstImage } from '../utils/stringUtils';
import { useToast } from '../components/ToastContext';
import { AnnouncementCard } from '../components/AnnouncementsSection';
import PageShimmer from '../components/PageShimmer';

const AnnouncementDetailPage = () => {
    const { id } = useParams();
    const { showToast } = useToast();
    const { data: announcement, isLoading, isError } = useGetAnnouncementByIdQuery(id);
    const { data: allAnnouncements } = useGetPublicAnnouncementsQuery(undefined, {
        refetchOnMountOrArgChange: true, // Force refresh to ensure no stale/blocked news is shown
        pollingInterval: 0 // Don't poll, just fetch fresh on mount
    });
    const [copied, setCopied] = React.useState(false);
    const [incrementViews] = useIncrementAnnouncementViewsMutation();

    // Track view when article loads
    React.useEffect(() => {
        if (id && announcement) {
            incrementViews(id).catch(err => console.error('Failed to track view:', err));
        }
    }, [id, announcement, incrementViews]);

    const handleShare = async () => {
        // Use backend proxy URL for correct social preview generation
        const proxyUrl = `${import.meta.env.VITE_API_URL}/announcements/share/${id}`;

        const shareData = {
            title: announcement?.title,
            text: `Check out this update: ${announcement?.title}`,
            url: proxyUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share failed', err);
            }
        } else {
            // Copy to clipboard fallback
            navigator.clipboard.writeText(proxyUrl);
            setCopied(true);
            showToast({ message: 'Link copied to clipboard!', type: 'success' });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const suggestions = React.useMemo(() => {
        if (!allAnnouncements || !announcement) return [];
        return allAnnouncements
            .filter(a => a._id !== announcement._id && !a.isBlocked)  // Exclude current and blocked
            .slice(0, 10);
    }, [allAnnouncements, announcement]);

    if (isLoading) {
        return <PageShimmer variant="detail" />;
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

    const firstImage = extractFirstImage(announcement.content);
    const pageTitle = `${announcement.title} | Notify CSC`;
    const shareDescription = `Check out this update from Notify CSC: ${announcement.title}`;

    return (
        <article className="min-h-screen bg-white">
            <Helmet>
                <title>{pageTitle}</title>
                <meta property="og:title" content={announcement.title} />
                <meta property="og:description" content={shareDescription} />
                {firstImage && <meta property="og:image" content={firstImage} />}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
                {firstImage && <meta name="twitter:image" content={firstImage} />}
                <meta name="twitter:title" content={announcement.title} />
                <meta name="twitter:description" content={shareDescription} />
            </Helmet>
            <Navbar variant="solid" />
            <header className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8 md:pt-16 md:pb-12 text-left relative">
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest animate-fade-in-up">
                    <Calendar size={12} className="text-blue-500" />
                    <span>{new Date(announcement.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 font-poppins leading-tight mb-6 tracking-tight animate-fade-in-up md:max-w-4xl" style={{ animationDelay: '100ms' }}>
                    {announcement.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-500 font-medium animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] md:text-xs shadow-md shadow-blue-500/20">
                            {announcement.author?.username?.[0]?.toUpperCase() || 'N'}
                        </div>
                        <span className="text-slate-900 font-bold text-sm md:text-base">{announcement.author?.username || 'Notify CSC Team'}</span>
                    </div>
                    <span className="hidden md:block w-1 h-1 rounded-full bg-slate-300"></span>
                    <button
                        onClick={handleShare}
                        className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-sm md:text-base"
                    >
                        {copied ? (
                            <>
                                <Check size={16} className="text-emerald-500" />
                                <span className="text-emerald-600">Copied</span>
                            </>
                        ) : (
                            <>
                                <Share2 size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                                <span className="underline decoration-slate-200 group-hover:decoration-blue-200 underline-offset-4">Share</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div
                    className="announcement-content max-w-none text-slate-700 border-b border-slate-100 pb-12"
                    style={{
                        fontSize: '16px',
                        lineHeight: '1.75',
                        letterSpacing: '0.01em'
                    }}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .announcement-content {
                        letter-spacing: 0.01em;
                    }
                    .announcement-content p {
                        margin-top: 0.75em;
                        margin-bottom: 0.75em;
                        line-height: 1.75;
                        letter-spacing: 0.01em;
                    }
                    .announcement-content p:empty {
                        min-height: 1.75em;
                        margin: 0.75em 0;
                    }
                    .announcement-content p br {
                        display: block;
                        content: "";
                        margin: 0.75em 0;
                    }
                    .announcement-content ul {
                        list-style-type: disc;
                        padding-left: 1.5rem;
                        margin-top: 1em;
                        margin-bottom: 1em;
                    }
                    .announcement-content ol {
                        list-style-type: decimal;
                        padding-left: 1.5rem;
                        margin-top: 1em;
                        margin-bottom: 1em;
                    }
                    .announcement-content li {
                        margin-top: 0.375em;
                        margin-bottom: 0.375em;
                        line-height: 1.65;
                        letter-spacing: 0.01em;
                    }
                    .announcement-content a {
                        color: #2563eb;
                        text-decoration: underline;
                    }
                    .announcement-content img {
                        border-radius: 1rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        max-width: 100%;
                        height: auto;
                        margin: 1.5em 0;
                    }
                    .announcement-content h1, 
                    .announcement-content h2, 
                    .announcement-content h3 {
                        font-family: 'Poppins', sans-serif;
                        font-weight: bold;
                        margin-top: 2em;
                        margin-bottom: 0.75em;
                        line-height: 1.3;
                        letter-spacing: -0.01em;
                    }
                    .announcement-content h1 {
                        font-size: 2em;
                    }
                    .announcement-content h2 {
                        font-size: 1.5em;
                    }
                    .announcement-content h3 {
                        font-size: 1.25em;
                    }
                `}} />

                {/* Quick Actions - Minimalist */}
                <div className="my-8 py-6 border-y border-slate-100 flex flex-wrap items-center justify-center gap-4">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mr-2">Quick Access:</span>
                    <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors">
                        <span>🏠</span> Home
                    </Link>
                    <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors">
                        <span>🛡️</span> Check Insurance
                    </Link>
                </div>

                {suggestions.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 font-poppins tracking-tight">More from <span className="text-blue-600">Notify CSC</span></h2>
                            <Link to="/news" className="text-sm font-bold text-blue-600 hover:underline">View Registry</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {suggestions.map((s) => (
                                <AnnouncementCard key={s._id} announcement={s} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Floating Share Button - Repositioned to Right Side Above WhatsApp */}
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

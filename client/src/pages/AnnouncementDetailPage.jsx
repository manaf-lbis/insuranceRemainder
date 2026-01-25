import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetAnnouncementByIdQuery } from '../features/announcements/announcementsApiSlice';
import { Calendar, User, ArrowLeft, Loader } from 'lucide-react';
import DOMPurify from 'dompurify';
import Navbar from '../components/Navbar';

const AnnouncementDetailPage = () => {
    const { id } = useParams();
    const { data: announcement, isLoading, isError } = useGetAnnouncementByIdQuery(id);

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
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <div
                    className="prose prose-lg md:prose-xl prose-slate max-w-none 
                        prose-headings:font-poppins prose-headings:font-bold 
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-2xl prose-img:shadow-md"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
            </div>
        </article>
    );
};

export default AnnouncementDetailPage;

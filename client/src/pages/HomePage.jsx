import React from 'react';
import { useGetActivePostersQuery } from '../features/posters/postersApiSlice';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnnouncementsSection from '../components/AnnouncementsSection';
import NewsTicker from '../components/NewsTicker';
import QuickLinks from '../components/QuickLinks';

const HeroPoster = () => {
    const { data: posters, isLoading, isError } = useGetActivePostersQuery();
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const scrollRef = React.useRef(null);
    const intervalRef = React.useRef(null);

    React.useEffect(() => {
        if (posters && posters.length > 1) {
            intervalRef.current = setInterval(() => {
                if (scrollRef.current) {
                    const nextIndex = (currentIndex + 1) % posters.length;
                    const scrollAmount = scrollRef.current.clientWidth * nextIndex;
                    scrollRef.current.scrollTo({
                        left: scrollAmount,
                        behavior: 'smooth'
                    });
                    setCurrentIndex(nextIndex);
                }
            }, 5000);
            return () => clearInterval(intervalRef.current);
        }
    }, [posters, currentIndex]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
            if (index !== currentIndex) {
                setCurrentIndex(index);
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="w-full aspect-video md:h-[80vh] bg-slate-200 animate-pulse flex items-center justify-center">
                <span className="text-slate-400 font-medium">Loading Banner...</span>
            </div>
        );
    }

    if (isError || !posters || posters.length === 0) {
        return (
            <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-[80vh] bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="text-center px-4 relative z-10 py-12 md:py-0">
                    <h1 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-6 font-poppins tracking-tight drop-shadow-xl">
                        Secure Your Journey
                    </h1>
                    <p className="text-blue-100 text-sm md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 font-light">
                        Professional insurance services and instant status verification at your fingertips.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                        <Link to="/check-insurance" className="px-6 py-3 md:px-8 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base">
                            <Search size={18} />
                            Check Status
                        </Link>
                        <Link to="/services" className="px-6 py-3 md:px-8 md:py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold backdrop-blur-sm border border-white/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base">
                            <Info size={18} />
                            Our Services
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full group">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex w-full overflow-x-auto snap-x snap-mandatory aspect-[16/9] md:h-[80vh] md:aspect-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}
            >
                {posters.map((poster, index) => (
                    <div
                        key={poster._id}
                        className="w-full flex-shrink-0 snap-center relative"
                    >
                        <img
                            src={poster.imageUrl}
                            alt={poster.title}
                            className="w-full h-full object-cover"
                            loading={index === 0 ? "eager" : "lazy"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {posters.length > 1 && (
                <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {posters.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (scrollRef.current) {
                                    scrollRef.current.scrollTo({
                                        left: scrollRef.current.clientWidth * idx,
                                        behavior: 'smooth'
                                    });
                                    setCurrentIndex(idx);
                                }
                            }}
                            className={`h-2 md:h-2.5 rounded-full transition-all shadow-sm ${idx === currentIndex
                                ? 'bg-white w-6 md:w-8'
                                : 'bg-white/50 w-2 md:w-2.5 hover:bg-white/80'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};



const HomePage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Note: Header/Navbar is handled by layout if we wrap it, but public page might need its own header if it's standalone.
                 Based on App.jsx, the root "/" is NOT wrapped in Layout. So we need a Header here or reuse a PublicHeader component.
                 CheckInsurancePage had its own header. I should likely extract that or include it here. 
                 For now, I'll add a PublicHeader here similar to CheckInsurancePage.
             */}
            <header className="bg-blue-900 shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-white/10 p-1.5 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white font-poppins tracking-wide">
                            Notify CSC
                        </span>
                    </Link>
                    <div className="flex gap-4">
                        <Link
                            to="/news"
                            className="text-sm font-medium text-blue-100 hover:text-white transition-colors px-4 py-2 hover:bg-white/10 rounded-lg"
                        >
                            Latest News
                        </Link>
                        <Link
                            to="/services"
                            className="text-sm font-medium text-blue-100 hover:text-white transition-colors px-4 py-2 hover:bg-white/10 rounded-lg"
                        >
                            Our Services
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* News Ticker */}
                <NewsTicker />

                {/* Hero Section */}
                <HeroPoster />

                {/* Quick Links Section */}
                <QuickLinks />

                {/* Announcements Section */}
                <AnnouncementsSection limit={4} />
            </main>

            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm mb-3">&copy; {new Date().getFullYear()} Notify CSC. Serving you with trust.</p>
                    <Link to="/login" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                        Admin Login
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;

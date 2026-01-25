import React, { useState, useEffect } from 'react';
import { useGetActivePostersQuery } from '../features/posters/postersApiSlice';
import { ArrowRight, MessageCircle, ShieldCheck, Loader, ChevronLeft, ChevronRight } from 'lucide-react';

const PremiumHero = () => {
    const { data: posters, isLoading, isError } = useGetActivePostersQuery();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Auto-rotation
    useEffect(() => {
        if (!posters || posters.length <= 1) return;

        const timer = setInterval(() => {
            handleNext();
        }, 6000);

        return () => clearInterval(timer);
    }, [posters, currentIndex]);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrev();
        }
    };

    const handleNext = () => {
        if (isAnimating || !posters) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % posters.length);
            setIsAnimating(false);
        }, 500);
    };

    const handlePrev = () => {
        if (isAnimating || !posters) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
            setIsAnimating(false);
        }, 500);
    };

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] md:h-[80vh] bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="animate-spin text-blue-500" size={40} />
                    <p className="text-slate-400 font-bold animate-pulse">Initializing Hero Engine...</p>
                </div>
            </div>
        );
    }

    if (isError || !posters || posters.length === 0) {
        return (
            <div className="relative w-full h-[60vh] md:h-[80vh] bg-blue-900 flex items-center justify-center overflow-hidden">
                <div className="text-center px-6 relative z-10">
                    <h1 className="text-4xl md:text-7xl font-black text-white mb-6 font-poppins tracking-tighter">
                        Secure Your Future
                    </h1>
                </div>
            </div>
        );
    }

    const currentPoster = posters[currentIndex];
    const {
        headline,
        description,
        imageUrl,
        showButton,
        buttonText,
        whatsappNumber,
        messageTemplate
    } = currentPoster;

    const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageTemplate || 'Hello, I would like to apply for insurance.')}`;

    return (
        <section
            className="relative w-full overflow-hidden bg-slate-950 h-auto md:h-[750px] min-h-[550px]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >

            {/* Unified Blurred Background System */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img
                    src={imageUrl}
                    className={`w-full h-full object-cover blur-[40px] scale-[1.2] opacity-50 transition-all duration-1000 ${isAnimating ? 'opacity-0' : 'opacity-50'}`}
                    alt=""
                />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Content & Poster Layer */}
            <div className={`relative z-10 w-full h-full flex flex-col md:flex-row transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

                {/* --- DESKTOP VIEW --- */}
                <div className="hidden lg:flex flex-1 items-stretch h-full">
                    {/* Content (Left) */}
                    <div className="flex-1 flex flex-col justify-center px-20 xl:px-32">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mb-8 w-fit">
                            <ShieldCheck className="text-emerald-400" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Secure Portal</span>
                        </div>

                        <h1 className="text-5xl xl:text-7xl font-black leading-[1.1] mb-6 font-poppins tracking-tight text-white drop-shadow-2xl line-clamp-2">
                            {headline || 'Secure Your Journey Today'}
                        </h1>

                        <p className="text-lg xl:text-xl mb-10 font-medium leading-relaxed max-w-xl text-white/80 line-clamp-2">
                            {description || 'Get professional insurance support with our simplified application process.'}
                        </p>

                        {showButton && (
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-3 px-10 h-[56px] rounded-full bg-white text-slate-950 font-black text-lg transition-all active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] w-fit"
                            >
                                <MessageCircle size={22} className="text-emerald-500 fill-emerald-500/10" />
                                {buttonText || 'Quick Apply'}
                                <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={20} />
                            </a>
                        )}
                    </div>

                    {/* Poster (Right) */}
                    <div className="w-[45%] flex items-center justify-center p-12">
                        <img
                            src={imageUrl}
                            className="max-w-full max-h-full object-contain shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] rounded-2xl"
                            alt={headline || "Hero Poster"}
                        />
                    </div>
                </div>

                {/* --- TABLET/MOBILE VIEW (Maximized V4) --- */}
                <div className="lg:hidden flex flex-col pt-12">

                    {/* Immersive Poster (Maximized) */}
                    <div className="relative w-full px-4 mb-10">
                        <img
                            src={imageUrl}
                            className="w-full h-auto max-h-[65vh] object-contain shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] rounded-2xl"
                            alt={headline || "Hero Poster"}
                        />
                        <div className="absolute top-8 left-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/90 text-white backdrop-blur-md shadow-lg border border-white/20">
                                <ShieldCheck size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Official</span>
                            </div>
                        </div>
                    </div>

                    {/* Clean Messaging Stack */}
                    <div className="px-6 pb-20 text-center space-y-6">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-5xl font-black text-white font-poppins leading-tight tracking-tight drop-shadow-xl">
                                {headline || 'Secure Your Future Today'}
                            </h1>
                            <p className="text-sm md:text-xl text-white/70 font-medium leading-relaxed max-w-md mx-auto line-clamp-3">
                                {description || 'Access dedicated insurance support through our streamlined digital registry.'}
                            </p>
                        </div>

                        {showButton && (
                            <div className="pt-2">
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-3 px-10 h-[56px] rounded-full bg-white text-slate-950 font-black text-sm shadow-2xl active:scale-95 transition-all shadow-white/10"
                                >
                                    <MessageCircle size={20} className="text-emerald-500 fill-emerald-500/10" />
                                    {buttonText || 'Quick Apply'}
                                    <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={18} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Carousel Navigation (Universal) */}
            {posters.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 z-30 flex items-center justify-center md:justify-end md:right-10 md:left-auto gap-4">
                    {/* Dots Container */}
                    <div className="flex gap-2">
                        {posters.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (idx === currentIndex) return;
                                    setIsAnimating(true);
                                    setTimeout(() => {
                                        setCurrentIndex(idx);
                                        setIsAnimating(false);
                                    }, 500);
                                }}
                                className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentIndex ? 'w-10 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>

                    {/* Desktop Arrows */}
                    <div className="hidden md:flex gap-2">
                        <button onClick={handlePrev} className="p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={handleNext} className="p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PremiumHero;

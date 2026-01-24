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
        <section className="relative w-full overflow-hidden bg-slate-950 h-auto md:h-[750px] min-h-[550px]">

            {/* 1. Global Background (Unified Blur Ecosystem) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img
                    src={imageUrl}
                    className={`w-full h-full object-cover blur-[40px] scale-[1.2] opacity-50 transition-all duration-1000 ${isAnimating ? 'opacity-0' : 'opacity-50'}`}
                    alt=""
                />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* 2. Layout Wrapper */}
            <div className={`relative z-10 w-full h-full flex flex-col md:flex-row transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

                {/* --- DESKTOP VIEW (Breakpoints applied internally) --- */}
                <div className="hidden md:flex flex-1 flex-row h-full">
                    {/* Content Layer (Left) */}
                    <div className="w-[55%] lg:w-[60%] flex flex-col justify-center px-16 lg:px-24 xl:px-32">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mb-8 w-fit">
                            <ShieldCheck className="text-emerald-400" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Universal Hero Engine</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-6 font-poppins tracking-tight text-white drop-shadow-2xl line-clamp-2">
                            {headline || 'Secure Your Journey Today'}
                        </h1>

                        <p className="text-lg lg:text-xl mb-10 font-medium leading-relaxed max-w-xl text-white/80 line-clamp-2">
                            {description || 'Professional insurance solutions preserved in their original visual design.'}
                        </p>

                        {showButton && (
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-3 px-10 h-[56px] rounded-full bg-white text-slate-950 font-black text-lg transition-all active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-white/10 w-fit"
                            >
                                <MessageCircle size={22} className="text-emerald-500 fill-emerald-500/10" />
                                {buttonText || 'Quick Apply'}
                                <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={20} />
                            </a>
                        )}
                    </div>

                    {/* Poster Layer (Right) */}
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={imageUrl}
                                className="max-w-full max-h-full object-contain shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] rounded-2xl animate-in zoom-in-95 duration-1000"
                                alt={headline || "Hero Poster"}
                            />
                        </div>
                    </div>
                </div>

                {/* --- MOBILE VIEW (Stacked Vertical) --- */}
                <div className="flex md:hidden flex-col h-full py-8 px-6 overflow-y-auto">
                    {/* 1. Mobile Poster (Centered, Scaled down) */}
                    <div className="flex-shrink-0 flex items-center justify-center mb-8">
                        <div className="relative w-[80%] aspect-auto flex items-center justify-center">
                            <img
                                src={imageUrl}
                                className="w-full h-auto max-h-[320px] object-contain shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] rounded-xl border border-white/10"
                                alt={headline || "Mobile Hero Poster"}
                            />
                        </div>
                    </div>

                    {/* 2. Mobile Text (Centered, App-like) */}
                    <div className="text-center space-y-3 mb-8">
                        <h1 className="text-[18px] font-bold text-white font-poppins leading-tight tracking-tight px-2">
                            {headline || 'Secure Your Journey'}
                        </h1>
                        <p className="text-[13px] text-white/70 font-medium leading-normal max-w-[95%] mx-auto opacity-90">
                            {description || 'Simplified insurance solutions at your fingertips.'}
                        </p>
                    </div>

                    {/* 3. Mobile Button (Small Pill) */}
                    {showButton && (
                        <div className="flex justify-center mt-auto">
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 h-[40px] rounded-full bg-white text-slate-900 font-bold text-sm shadow-xl active:scale-95 transition-all"
                            >
                                <MessageCircle size={16} className="text-emerald-500" />
                                {buttonText || 'Quick Apply'}
                                <ArrowRight size={14} />
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Carousel Navigation (Discrete) */}
            {posters.length > 1 && (
                <div className="absolute bottom-4 md:bottom-10 right-6 md:right-10 z-30 flex items-center gap-4">
                    {/* Dots */}
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
                                className={`h-1 transition-all duration-500 rounded-full ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/20'}`}
                            />
                        ))}
                    </div>

                    {/* Desktop Arrows */}
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={handlePrev}
                            className="p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PremiumHero;

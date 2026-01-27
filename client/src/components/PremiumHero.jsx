import React, { useState, useEffect, useRef } from 'react';
import { useGetActivePostersQuery } from '../features/posters/postersApiSlice';
import { ArrowRight, MessageCircle, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

const PremiumHero = () => {
    const { data: posters, isLoading, isError } = useGetActivePostersQuery();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const DEFAULT_OFFSET = -100 / 3;
    const [offset, setOffset] = useState(DEFAULT_OFFSET); // Start at -33.33%

    // Touch handling state
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);
    const minSwipeDistance = 50;

    // Auto-rotation
    useEffect(() => {
        if (!posters || posters.length <= 1) return;

        const timer = setInterval(() => {
            handleNext();
        }, 6000);

        return () => clearInterval(timer);
    }, [posters, currentIndex, isAnimating]);

    const handleTouchStart = (e) => {
        touchEndX.current = null;
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext(); // Swipe Left -> Show Next
        } else if (isRightSwipe) {
            handlePrev(); // Swipe Right -> Show Prev
        }
    };

    const handleNext = () => {
        if (isAnimating || !posters) return;
        setIsAnimating(true);
        setOffset(DEFAULT_OFFSET * 2); // Slide to Next (-66.66%)

        setTimeout(() => {
            setIsAnimating(false);
            setOffset(DEFAULT_OFFSET); // Reset to center without animation
            setCurrentIndex((prev) => (prev + 1) % posters.length);
        }, 500);
    };

    const handlePrev = () => {
        if (isAnimating || !posters) return;
        setIsAnimating(true);
        setOffset(0); // Slide to Prev (0%)

        setTimeout(() => {
            setIsAnimating(false);
            setOffset(DEFAULT_OFFSET); // Reset to center without animation
            setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
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

    const prevIndex = (currentIndex - 1 + posters.length) % posters.length;
    const nextIndex = (currentIndex + 1) % posters.length;

    const prevPoster = posters[prevIndex];
    const currentPoster = posters[currentIndex];
    const nextPoster = posters[nextIndex];

    const renderSlide = (poster, key) => {
        const {
            headline,
            description,
            imageUrl,
            showButton,
            buttonText,
            whatsappNumber,
            messageTemplate
        } = poster;

        const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageTemplate || 'Hello, I would like to apply for insurance.')}`;

        return (
            <div key={key} className="h-full flex-shrink-0 flex flex-col md:flex-row" style={{ width: '33.333333%' }}>
                {/* --- DESKTOP VIEW --- */}
                <div className="hidden lg:flex flex-1 items-stretch h-full">
                    {/* Content (Left) */}
                    <div className="flex-1 flex flex-col justify-center px-20 xl:px-32">
                        <h1 className="text-5xl xl:text-7xl font-black leading-[1.1] mb-6 font-poppins tracking-tight text-white drop-shadow-2xl line-clamp-2">
                            {headline || 'Your Digital Hub for Citizen Services'}
                        </h1>

                        <p className="text-lg xl:text-xl mb-10 font-medium leading-relaxed max-w-xl text-white/80 line-clamp-2">
                            {description || 'Efficiently access Government (G2C), Business (B2C), and Digital India e-Services at your doorstep.'}
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
                    </div>

                    {/* Clean Messaging Stack */}
                    <div className="px-6 pb-20 text-center space-y-6">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-5xl font-black text-white font-poppins leading-tight tracking-tight drop-shadow-xl">
                                {headline || 'Your Digital Hub for Citizen Services'}
                            </h1>
                            <p className="text-sm md:text-xl text-white/70 font-medium leading-relaxed max-w-md mx-auto line-clamp-3">
                                {description || 'Efficiently access Government (G2C), Business (B2C), and Digital India e-Services at your doorstep.'}
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
        );
    };

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
                    src={currentPoster.imageUrl}
                    className={`w-full h-full object-cover blur-[40px] scale-[1.2] opacity-50 transition-all duration-1000 ${isAnimating ? 'opacity-30' : 'opacity-50'}`}
                    style={{ transition: 'opacity 0.5s ease-in-out' }}
                    alt=""
                />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* 
                Infinite Carousel Track - 3 Panels
                [Prev] [Current] [Next]
                We start at -33.333% (Current)
                Next -> Animate to -66.666%, then instant reset to -33.333% with new index
                Prev -> Animate to 0%, then instant reset to -33.333% with new index
            */}
            <div className="relative z-10 w-full h-full overflow-hidden">
                <div
                    className="flex h-full w-full"
                    style={{
                        width: '300%', // 3 slides wide
                        transform: `translateX(${offset}%)`,
                        transition: isAnimating ? 'transform 0.5s ease-in-out' : 'none',
                        marginLeft: '0' // Align start
                    }}
                >
                    {/* Previous Slide (-1) */}
                    {renderSlide(posters.length > 1 ? prevPoster : currentPoster, 'prev')}

                    {/* Current Slide (0) - Initially Visible */}
                    {renderSlide(currentPoster, 'curr')}

                    {/* Next Slide (+1) */}
                    {renderSlide(posters.length > 1 ? nextPoster : currentPoster, 'next')}
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
                                    if (idx === currentIndex || isAnimating) return;

                                    // Determine shortest path direction
                                    const diff = idx - currentIndex;
                                    const total = posters.length;
                                    // Handles wrap-around logic for shortest path
                                    const isNext = (diff > 0 && diff <= total / 2) || (diff < 0 && Math.abs(diff) > total / 2);

                                    if (isNext) {
                                        handleNext();
                                        // If jumping multiple steps, we just animate one step then set index (simplified)
                                        setTimeout(() => setCurrentIndex(idx), 500);
                                    } else {
                                        handlePrev();
                                        setTimeout(() => setCurrentIndex(idx), 500);
                                    }
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

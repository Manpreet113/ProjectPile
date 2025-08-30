import React, { useState, useMemo, useEffect } from "react";
import { ExternalLink, Github } from "lucide-react";
import { PROJECTS } from '../data/projects.js';
import { useTheme } from '../hooks/useTheme.js';
import '../styles/pilegrid.css';

const PileGrid = ({ cards, theme, onImageLoad, imageLoadingStates }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [cardAnimations, setCardAnimations] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    const selected = useMemo(() => cards.find((card) => card.id === selectedId), [cards, selectedId]);

    const handleOutsideClick = () => {
        setSelectedId(null);
    };

    // Detect mobile devices
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize card animations with stagger effect
    useEffect(() => {
        const timer = setTimeout(() => {
            cards.forEach((card, index) => {
                setTimeout(() => {
                    setCardAnimations(prev => ({ ...prev, [card.id]: true }));
                }, index * (isMobile ? 100 : 150)); // Faster on mobile
            });
        }, isMobile ? 100 : 200);
        return () => clearTimeout(timer);
    }, [cards, isMobile]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setSelectedId(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleLinkClick = (e, url) => {
        e.stopPropagation();
        // Add subtle haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={`w-full h-full px-4 pt-0 max-w-6xl mx-auto relative ${
            isMobile 
                ? 'flex flex-col space-y-6' 
                : 'grid grid-cols-1 md:grid-cols-2 gap-6'
        }`}>
            {cards.map((card, index) => {
                const isVisible = cardAnimations[card.id];
                const imageLoaded = imageLoadingStates[card.id];
                
                return (
                    <div
                        key={card.id}
                        className={`group cursor-pointer relative transform transition-all duration-700 ${
                            isVisible 
                                ? 'opacity-100 translate-y-0 scale-100' 
                                : 'opacity-0 translate-y-8 scale-95'
                        } ${
                            isMobile 
                                ? 'w-full h-80 hover:scale-102' 
                                : 'aspect-square hover:-translate-y-2 hover:scale-105'
                        }`}
                        onClick={() => setSelectedId(card.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedId(card.id);
                            }
                        }}
                        aria-label={`View details for ${card.name}`}
                    >
                        <div className={`rounded-2xl h-full w-full overflow-hidden relative border-2 border-border/20 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 ${
                            isMobile ? 'flex' : ''
                        }`}>
                            {/* Mobile Layout */}
                            {isMobile ? (
                                <>
                                    {/* Left side - Image */}
                                    <div className="w-2/5 relative">
                                        <img
                                            src={card.thumbnail}
                                            className={`object-cover absolute inset-0 h-full w-full transition-all duration-700 ${
                                                imageLoaded ? 'opacity-100' : 'opacity-0'
                                            }`}
                                            alt={card.name}
                                            onLoad={() => onImageLoad?.(card.id)}
                                            loading="lazy"
                                        />
                                        {!imageLoaded && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
                                        )}
                                    </div>
                                    
                                    {/* Right side - Content */}
                                    <div className="w-3/5 p-6 flex flex-col justify-between bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm">
                                        <div>
                                            <h3 className="text-foreground font-bold text-xl mb-3 line-clamp-2">
                                                {card.name}
                                            </h3>
                                            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                                {PROJECTS.find(p => p.id === card.id)?.description}
                                            </p>
                                        </div>
                                        
                                        {/* Mobile Action buttons */}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={(e) => handleLinkClick(e, card.deployedAt)}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg active:scale-95"
                                                aria-label={`Visit ${card.name} live site`}
                                            >
                                                <ExternalLink size={16} />
                                                Live Site
                                            </button>
                                            <button
                                                onClick={(e) => handleLinkClick(e, card.repo)}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg active:scale-95"
                                                aria-label={`View ${card.name} source code`}
                                            >
                                                <Github size={16} />
                                                Code
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Desktop Layout - Keep existing */
                                <>
                                    {/* Image with loading state */}
                                    <div className="relative h-full w-full">
                                        <img
                                            src={card.thumbnail}
                                            height="500"
                                            width="500"
                                            className={`object-cover object-center absolute inset-0 h-full w-full transition-all duration-700 group-hover:scale-110 ${
                                                imageLoaded ? 'opacity-100' : 'opacity-0'
                                            }`}
                                            alt={card.name}
                                            onLoad={() => onImageLoad?.(card.id)}
                                            loading="lazy"
                                        />
                                        
                                        {/* Loading shimmer */}
                                        {!imageLoaded && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
                                        )}
                                    </div>
                                    
                                    {/* Enhanced gradient overlay with theme transition */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-all duration-500 ${
                                        theme === 'dark' ? 'opacity-70' : 'opacity-60'
                                    } group-hover:opacity-90`} />
                                    
                                    {/* Subtle border glow effect */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                                    
                                    {/* Project info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="text-foreground font-bold text-2xl mb-3 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 drop-shadow-lg">
                                            {card.name}
                                        </h3>
                                        
                                        {/* Action buttons with enhanced styling */}
                                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                            <button
                                                onClick={(e) => handleLinkClick(e, card.deployedAt)}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-primary/90 hover:bg-primary hover:scale-105 text-primary-foreground rounded-xl text-sm font-semibold transition-all duration-200 backdrop-blur-md shadow-lg hover:shadow-primary/25 active:scale-95"
                                                aria-label={`Visit ${card.name} live site`}
                                            >
                                                <ExternalLink size={16} className="transition-transform group-hover:rotate-12" />
                                                Live Site
                                            </button>
                                            <button
                                                onClick={(e) => handleLinkClick(e, card.repo)}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-secondary/90 hover:bg-secondary hover:scale-105 text-secondary-foreground rounded-xl text-sm font-semibold transition-all duration-200 backdrop-blur-md shadow-lg hover:shadow-secondary/25 active:scale-95"
                                                aria-label={`View ${card.name} source code`}
                                            >
                                                <Github size={16} className="transition-transform group-hover:scale-110" />
                                                Code
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Theme indicator dot */}
                                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full transition-all duration-300 ${
                                        theme === 'dark' ? 'bg-purple-400 shadow-purple-400/50' : 'bg-amber-400 shadow-amber-400/50'
                                    } shadow-lg opacity-0 group-hover:opacity-100`} />
                                </>
                            )}
                        </div>
                    </div>
                );
            })}

            {selected && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-muted/50 rounded-t-4xl backdrop-blur-sm transition-opacity duration-300"
                        onClick={handleOutsideClick}
                    />
                    
                    {/* Modal */}
                    <div 
                        className={`
                            relative w-full max-w-4xl mx-4 
                            ${isMobile 
                                ? 'h-[85vh] rounded-3xl bg-background shadow-2xl transform transition-transform duration-500 ease-out' 
                                : 'h-[80vh] rounded-2xl bg-transparent overflow-hidden shadow-2xl transform transition-all duration-500 ease-out scale-100'
                            }
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isMobile ? (
                            <MobileModalContent 
                                selected={selected} 
                                onClose={() => setSelectedId(null)}
                                theme={theme}
                            />
                        ) : (
                            <DesktopModalContent 
                                selected={selected} 
                                onClose={() => setSelectedId(null)}
                                theme={theme}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// --- Mobile Modal Component ---
const MobileModalContent = ({ selected, onClose, theme }) => {
    const [contentVisible, setContentVisible] = useState(false);
    const project = PROJECTS.find(p => p.id === selected.id);
    
    useEffect(() => {
        const timer = setTimeout(() => setContentVisible(true), 200);
        return () => clearTimeout(timer);
    }, []);
    
    const handleLinkClick = (url) => {
        if (navigator.vibrate) navigator.vibrate(100);
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    
    return (
        <div className="h-full flex flex-col bg-background rounded-3xl border-2 border-border">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>
            
            {/* Header with close button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">
                    {selected.name}
                </h2>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors group"
                    aria-label="Close modal"
                >
                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {/* Project screenshot */}
                <div className="relative h-64 mx-6 my-6 rounded-2xl overflow-hidden">
                    <img
                        src={selected.thumbnail}
                        className="w-full h-full object-cover"
                        alt={selected.name}
                    />
                    <div className="absolute top-4 right-4">
                        <div className={`w-3 h-3 rounded-full ${
                            theme === 'dark' ? 'bg-purple-400 shadow-purple-400/50' : 'bg-amber-400 shadow-amber-400/50'
                        } shadow-lg`} />
                    </div>
                </div>
                
                {/* Project details */}
                <div className={`px-6 transition-all duration-500 ${
                    contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                    <div className="mb-6">
                        <div className="prose prose-sm dark:prose-invert">
                            {selected.content}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Fixed bottom actions */}
            <div className="p-6 border-t rounded-b-3xl border-border bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleLinkClick(selected.deployedAt)}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold transition-all duration-200 shadow-lg active:scale-98"
                    >
                        <ExternalLink size={20} />
                        <span>Visit Live Site</span>
                    </button>
                    <button
                        onClick={() => handleLinkClick(selected.repo)}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-2xl font-semibold transition-all duration-200 shadow-lg active:scale-98"
                    >
                        <Github size={20} />
                        <span>View Source Code</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Desktop Modal Component ---
const DesktopModalContent = ({ selected, onClose, theme }) => {
    const [contentVisible, setContentVisible] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setContentVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);
    
    const handleLinkClick = (url) => {
        if (navigator.vibrate) navigator.vibrate(100);
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    
    return (
        <div className="h-full w-full relative rounded-2xl overflow-hidden">
            {/* Background image */}
            <img
                src={selected.thumbnail}
                className="absolute inset-0 w-full h-full object-cover"
                alt={selected.name}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
            
            {/* Close button */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={onClose}
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group"
                    aria-label="Close modal"
                >
                    <svg 
                        className="w-6 h-6 text-white transition-transform group-hover:rotate-90" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            {/* Theme indicator */}
            <div className="absolute top-6 left-6">
                <div className={`w-4 h-4 rounded-full ${
                    theme === 'dark' ? 'bg-purple-400 shadow-purple-400/50' : 'bg-amber-400 shadow-amber-400/50'
                } shadow-lg animate-pulse`} />
            </div>
            
            {/* Content */}
            <div className={`absolute inset-0 flex flex-col justify-end p-8 transition-all duration-700 ${
                contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
                <div className="mb-8">
                    <div className="prose prose-lg prose-invert max-w-none">
                        {selected.content}
                    </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => handleLinkClick(selected.deployedAt)}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-primary/90 hover:bg-primary hover:scale-105 text-primary-foreground rounded-2xl font-semibold transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-primary/40 active:scale-95 group"
                    >
                        <ExternalLink size={22} className="transition-transform group-hover:rotate-12" />
                        <span>Visit Live Site</span>
                    </button>
                    <button
                        onClick={() => handleLinkClick(selected.repo)}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-secondary/90 hover:bg-secondary hover:scale-105 text-secondary-foreground rounded-2xl font-semibold transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-secondary/40 active:scale-95 group"
                    >
                        <Github size={22} className="transition-transform group-hover:scale-110" />
                        <span>View Source Code</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Enhanced Modal Content Component ---
const SelectedCardContent = ({ selected, onClose }) => {
    const [contentVisible, setContentVisible] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setContentVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);
    
    const handleModalLinkClick = (url) => {
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bg-transparent h-full w-full flex flex-col justify-between rounded-lg shadow-2xl relative z-10">
            {/* Enhanced backdrop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 backdrop-blur-sm" />
            
            {/* Close button */}
            <div className="relative z-20 flex justify-end p-4">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 group"
                    aria-label="Close modal"
                >
                    <svg 
                        className="w-5 h-5 text-white transition-transform group-hover:rotate-90" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            {/* Modal content */}
            <div className={`relative z-20 p-8 pb-6 transition-all duration-700 transform ${
                contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
                <div className="mb-6">
                    {selected.content}
                </div>
                
                {/* Enhanced action buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => handleModalLinkClick(selected.deployedAt)}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground rounded-2xl font-semibold transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-primary/30 active:scale-95 group"
                        aria-label={`Visit ${selected.name} live site`}
                    >
                        <ExternalLink size={20} className="transition-transform group-hover:rotate-12" />
                        <span>Visit Live Site</span>
                    </button>
                    <button
                        onClick={() => handleModalLinkClick(selected.repo)}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-secondary hover:bg-secondary/90 hover:scale-105 text-secondary-foreground rounded-2xl font-semibold transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-secondary/30 active:scale-95 group"
                        aria-label={`View ${selected.name} source code`}
                    >
                        <Github size={20} className="transition-transform group-hover:scale-110" />
                        <span>View Code</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Demo Data ---
const SkeletonOne = () => (
    <div>
        <p className="font-bold md:text-4xl text-xl text-foreground">HyprL</p>
        <p className="font-normal text-base my-4 max-w-lg text-muted-foreground">
            HyprL takes the power of Hyprland and makes it approachable for everyone by providing one-command installation and beginner friendly guides.
        </p>
    </div>
);

const SkeletonTwo = () => (
    <div>
        <p className="font-bold md:text-4xl text-xl text-foreground">Portfolio</p>
        <p className="font-normal text-base my-4 max-w-lg text-muted-foreground">
            A showcase of my work, featuring projects that demonstrate my skills and expertise.
        </p>
    </div>
);

const SkeletonThree = () => (
    <div>
        <p className="font-bold md:text-4xl text-xl text-foreground">Pile root</p>
        <p className="font-normal text-base my-4 max-w-lg text-muted-foreground">
            The root domain for Project Pile, a collection of my projects and experiments in web development and design.
        </p>
    </div>
);

const SkeletonFour = () => (
    <div>
        <p className="font-bold md:text-4xl text-xl text-foreground">NoteHole</p>
        <p className="font-normal text-base my-4 max-w-lg text-muted-foreground">
            A secure encrypted note-taking app built from using React, Tailwind CSS, and Supabase.
        </p>
    </div>
);



// Create content components mapping
const contentComponents = {
    "HyprL": SkeletonOne,
    "Portfolio": SkeletonTwo, 
    "Project Pile": SkeletonThree,
    "NoteHole": SkeletonFour
};

// Loading skeleton component
const LoadingSkeleton = () => {
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    return (
        <div className={`w-full h-full px-4 pt-0 max-w-6xl mx-auto relative ${
            isMobile ? 'flex flex-col space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-6'
        }`}>
            {[1, 2, 3, 4].map((index) => (
                <div 
                    key={index} 
                    className={`relative animate-pulse ${
                        isMobile ? 'w-full h-80' : 'aspect-square'
                    }`}
                >
                    <div className={`rounded-2xl h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 ${
                        isMobile ? 'flex' : ''
                    }`}>
                        {isMobile ? (
                            <>
                                {/* Mobile skeleton - horizontal */}
                                <div className="w-2/5 bg-gray-300 dark:bg-gray-600 rounded-l-2xl" />
                                <div className="w-3/5 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-lg mb-3" />
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-xl" />
                                        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-xl" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Desktop skeleton - keep existing */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <div className="h-8 bg-white/20 rounded-lg mb-3 animate-pulse" />
                                    <div className="flex gap-3">
                                        <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse" />
                                        <div className="h-10 w-20 bg-white/10 rounded-lg animate-pulse" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Wrapper Component used in Astro ---
export function PileGridDemo() {
    const { theme, isLoading } = useTheme();
    const [imageLoadingStates, setImageLoadingStates] = useState({});
    const [gridVisible, setGridVisible] = useState(false);
    
    // Generate cards from shared project data with theme-aware thumbnails
    const cards = useMemo(() => PROJECTS.map((project, index) => ({
        id: project.id,
        name: project.name,
        content: React.createElement(contentComponents[project.name]),
        className: "col-span-1",
        thumbnail: project.thumbnails[theme] || project.thumbnails.light, // Fallback to light
        thumbnails: project.thumbnails, // Keep all thumbnails for modal
        deployedAt: project.url,
        repo: project.repo,
        animationDelay: index * 100 // Stagger animations
    })), [theme]);
    
    // Handle image loading states
    const handleImageLoad = (cardId) => {
        setImageLoadingStates(prev => ({ ...prev, [cardId]: true }));
    };
    
    // Show grid with animation after theme loads
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => setGridVisible(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);
    
    // Show loading skeleton while theme is being detected
    if (isLoading) {
        return (
            <div className="h-full py-20 w-full">
                <LoadingSkeleton />
            </div>
        );
    }
    
    return (
        <div className={`h-full py-20 w-full transition-all duration-700 ${
            gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
            <PileGrid 
                cards={cards} 
                theme={theme} 
                onImageLoad={handleImageLoad}
                imageLoadingStates={imageLoadingStates}
            />
        </div>
    );
}

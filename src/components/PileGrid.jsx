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
        <div className="w-full h-full p-4 pt-0 grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto gap-6 relative">
            {cards.map((card, index) => {
                const isVisible = cardAnimations[card.id];
                const imageLoaded = imageLoadingStates[card.id];
                
                return (
                    <div
                        key={card.id}
                        className={`group cursor-pointer aspect-square relative transform transition-all duration-700 ${
                            isVisible 
                                ? 'opacity-100 translate-y-0 scale-100' 
                                : 'opacity-0 translate-y-8 scale-95'
                        } hover:-translate-y-2 hover:scale-105`}
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
                        <div className="rounded-2xl h-full w-full overflow-hidden relative border-2 border-border/20 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
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
                                <h3 className="text-white font-bold text-2xl mb-3 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 drop-shadow-lg">
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
                        </div>
                    </div>
                );
            })}

            {selected && (
                <>
                    <div
                        className="modal-backdrop bg-black/50 backdrop-blur-sm"
                    />
                    <div className="modal-container"
                        onClick={handleOutsideClick}>
                        <div className="modal-card"
                            onClick={(e) => e.stopPropagation()}>
                            <img
                                src={selected.thumbnail}
                                height="500"
                                width="500"
                                className="object-cover object-center absolute inset-0 h-full w-full"
                                alt={selected.name}
                            />
                            <SelectedCardContent selected={selected} onClose={() => setSelectedId(null)} />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

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
        <p className="font-bold md:text-4xl text-xl text-white">HyprL</p>
        <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
            HyprL takes the power of Hyprland and makes it approachable for everyone by providing one-command installation and beginner friendly guides.
        </p>
    </div>
);

const SkeletonTwo = () => (
    <div>
        <p className="font-bold md:text-4xl text-xl text-white">Portfolio</p>
        <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
            A showcase of my work, featuring projects that demonstrate my skills and expertise.
        </p>
    </div>
);

const SkeletonThree = () => (
    <div>
        <p className="font-bold md:text-4xl text-xl text-white">Pile root</p>
        <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
            The root domain for Project Pile, a collection of my projects and experiments in web development and design.
        </p>
    </div>
);

const SkeletonFour = () => (
    <div>
        <p className="font-bold md:text-4xl text-xl text-white">NoteHole</p>
        <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
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
    return (
        <div className="w-full h-full p-4 pt-0 grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto gap-6 relative">
            {[1, 2, 3, 4].map((index) => (
                <div key={index} className="aspect-square relative animate-pulse">
                    <div className="rounded-2xl h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="h-8 bg-white/20 rounded-lg mb-3 animate-pulse" />
                            <div className="flex gap-3">
                                <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse" />
                                <div className="h-10 w-20 bg-white/10 rounded-lg animate-pulse" />
                            </div>
                        </div>
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

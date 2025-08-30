import React, { useState, useMemo, useEffect } from "react";
import { ExternalLink, Github } from "lucide-react";
import { PROJECTS } from '../data/projects.js';
import '../styles/pilegrid.css';

const PileGrid = ({ cards }) => {
    const [selectedId, setSelectedId] = useState(null);

    const selected = useMemo(() => cards.find((card) => card.id === selectedId), [cards, selectedId]);

    const handleOutsideClick = () => {
        setSelectedId(null);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setSelectedId(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleLinkClick = (e, url) => {
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="w-full h-full p-4 pt-0 grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto gap-6 relative">
            {cards.map((card) => (
                <div
                    key={card.id}
                    className="group cursor-pointer aspect-square relative"
                    onClick={() => setSelectedId(card.id)}
                >
                    <div className="rounded-2xl h-full w-full overflow-hidden relative border-2 border-border/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                        <img
                            src={card.thumbnail}
                            height="500"
                            width="500"
                            className="object-cover object-center absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
                            alt={card.name}
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                        
                        {/* Project name */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-white font-bold text-2xl mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                {card.name}
                            </h3>
                            
                            {/* Action buttons */}
                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                <button
                                    onClick={(e) => handleLinkClick(e, card.deployedAt)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors duration-200 backdrop-blur-sm"
                                >
                                    <ExternalLink size={16} />
                                    Live Site
                                </button>
                                <button
                                    onClick={(e) => handleLinkClick(e, card.repo)}
                                    className="flex items-center gap-2 px-4 py-2 bg-secondary/90 hover:bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-colors duration-200 backdrop-blur-sm"
                                >
                                    <Github size={16} />
                                    Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

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
                            <SelectedCardContent selected={selected} />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

// --- Content for the Selected Card ---
const SelectedCardContent = ({ selected }) => {
    const handleModalLinkClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-10">
            <div className="absolute inset-0 bg-black/60" />
            <div className="modal-content-container">
                {selected.content}
                
                {/* Modal action buttons */}
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => handleModalLinkClick(selected.deployedAt)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors duration-200"
                    >
                        <ExternalLink size={18} />
                        Visit Live Site
                    </button>
                    <button
                        onClick={() => handleModalLinkClick(selected.repo)}
                        className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg font-medium transition-colors duration-200"
                    >
                        <Github size={18} />
                        View Code
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

// Generate cards from shared project data
const cards = PROJECTS.map(project => ({
    id: project.id,
    name: project.name,
    content: React.createElement(contentComponents[project.name]),
    className: "col-span-1",
    thumbnail: project.thumbnail,
    deployedAt: project.url,
    repo: project.repo
}));

// --- Wrapper Component used in Astro ---
export function PileGridDemo() {
    return (
        <div className="h-full py-20 w-full">
            <PileGrid cards={cards} />
        </div>
    );
}
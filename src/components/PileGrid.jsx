import React, { useState, useMemo, useEffect } from "react";
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

    return (
        <div className="w-full h-full p-4 pt-0 grid grid-cols-1 max-w-7xl mx-auto gap-4 relative">
            {cards.map((card) => (
                <div
                    key={card.id}
                    className={`${card.className} cursor-pointer min-h-[300px]`}
                    onClick={() => setSelectedId(card.id)}
                >
                    <div className="rounded-xl h-full w-full overflow-hidden relative border-4 border-muted">
                        <img
                            src={card.thumbnail}
                            height="500"
                            width="500"
                            className="object-cover object-top absolute inset-0 h-full w-full"
                            alt={card.name}
                        />
                    </div>
                </div>
            ))}

            {selected && (
                <>
                    <div
                        className="modal-backdrop bg-muted/30"
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
    return (
        <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-10">
            <div className="absolute inset-0 bg-black/60" />
            <div className="modal-content-container">
                {selected.content}
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



const cards = [
    {
        id: 1,
        content: <SkeletonOne />,
        className: "col-span-1",
        thumbnail: "/assets/hyprl.png",
        deployedAt:"https://hyprl.projectpile.tech",
        repo: "https://github.com/Manpreet113/hyprL"
    },
    {
        id: 2,
        content: <SkeletonTwo />,
        className: "col-span-1",
        thumbnail: "/assets/portfolio.png",
        deployedAt:"https://manpreet.tech",
        repo: "https://github.com/Manpreet113/portfolio-site"
    },
    {
        id: 3,
        content: <SkeletonThree />,
        className: "col-span-1",
        thumbnail: "/assets/projectpile.png",
        deployedAt:"https://projectpile.tech",
        repo: "https://github.com/Manpreet113/ProjectPile"
    },
    {
        id: 4,
        name: "NoteHole",
        content: <SkeletonFour />,
        className: "col-span-1",
        thumbnail: "/assets/notehole.png",
        deployedAt: "https://notehole.projectpile.tech",
        repo: "https://github.com/Manpreet113/NoteHole",
    },
];

// --- Wrapper Component used in Astro ---
export function PileGridDemo() {
    return (
        <div className="h-full py-20 w-full">
            <PileGrid cards={cards} />
        </div>
    );
}
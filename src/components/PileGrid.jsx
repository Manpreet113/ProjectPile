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
                    <div className="rounded-xl h-full w-full overflow-hidden relative">
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
        <p className="font-bold md:text-4xl text-xl text-white">House in the woods</p>
        <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
            A serene and tranquil retreat, offering a peaceful escape from the hustle and bustle of city life.
        </p>
    </div>
);

const SkeletonTwo = () => (
    <div>
        <p className="font-bold md:text-4xl text-xl text-white">House above the clouds</p>
        <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
            Perched high above the world, this house offers breathtaking views and a unique living experience.
        </p>
    </div>
);

const SkeletonThree = () => (
    <div>
        <p className="font-bold md:text-4xl text-xl text-white">Greens all over</p>
        <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
            A house surrounded by greenery and nature's beauty. It's the perfect place to relax and unwind.
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
        thumbnail: "https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=1920&auto=format&fit=crop",
        deployedAt:"https://.projectpile.tech",
        repo: "https://github.com/Manpreet113/"
    },
    {
        id: 2,
        content: <SkeletonTwo />,
        className: "col-span-1",
        thumbnail: "https://images.unsplash.com/photo-1464457312035-3d7d0e0c058e?q=80&w=1920&auto=format&fit=crop",
        deployedAt:"https://.projectpile.tech",
        repo: "https://github.com/Manpreet113/"
    },
    {
        id: 3,
        content: <SkeletonThree />,
        className: "col-span-1",
        thumbnail: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?q=80&w=1920&auto=format&fit=crop",
        deployedAt:"https://.projectpile.tech",
        repo: "https://github.com/Manpreet113/"
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
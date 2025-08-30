// Shared project configuration
// This is used by both the PileGrid component and screenshot generation

export const PROJECTS = [
    {
        id: 1,
        name: "HyprL",
        url: "https://hyprl.projectpile.tech",
        repo: "https://github.com/Manpreet113/hyprL",
        thumbnail: "/assets/hyprl.png",
        description: "HyprL takes the power of Hyprland and makes it approachable for everyone by providing one-command installation and beginner friendly guides."
    },
    {
        id: 2,
        name: "Portfolio",
        url: "https://manpreet.tech",
        repo: "https://github.com/Manpreet113/portfolio-site",
        thumbnail: "/assets/portfolio.png",
        description: "A showcase of my work, featuring projects that demonstrate my skills and expertise."
    },
    {
        id: 3,
        name: "Project Pile",
        url: "https://projectpile.tech",
        repo: "https://github.com/Manpreet113/ProjectPile",
        thumbnail: "/assets/projectpile.png",
        description: "The root domain for Project Pile, a collection of my projects and experiments in web development and design."
    },
    {
        id: 4,
        name: "NoteHole",
        url: "https://notehole.projectpile.tech",
        repo: "https://github.com/Manpreet113/NoteHole",
        thumbnail: "/assets/notehole.png",
        description: "A secure encrypted note-taking app built from using React, Tailwind CSS, and Supabase."
    }
];

// For screenshot generation compatibility
export function getScreenshotConfig() {
    return PROJECTS.map(project => ({
        id: project.id,
        name: project.name,
        url: project.url,
        filename: project.thumbnail.replace('/assets/', ''),
    }));
}

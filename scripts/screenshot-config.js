// Screenshot generation configuration
export const SCREENSHOT_CONFIG = {
    // Screenshot dimensions
    viewport: {
        width: 1200,
        height: 800,
        deviceScaleFactor: 2, // High DPI for crisp images
    },
    
    // Timing configuration
    timeout: 30000, // 30 seconds timeout
    waitAfterLoad: 2000, // Additional wait after page load
    delayBetweenCaptures: 1000, // Delay between each screenshot
    
    // Browser configuration
    browser: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    },
    
    // Output configuration
    outputDir: 'public/assets',
    imageFormat: 'png',
    fullPage: false,
    
    // Retry configuration
    maxRetries: 3,
    retryDelay: 5000,
};

// Import shared project data
import { getScreenshotConfig } from '../src/data/projects.js';

// Get base project data and add screenshot-specific configuration
const baseProjects = getScreenshotConfig();

export const PROJECTS = baseProjects.map(project => ({
    ...project,
    // Add custom screenshot configs for specific projects
    customConfig: project.name === "HyprL" ? {
        waitAfterLoad: 3000, // HyprL might need more time to load
    } : {}
}));

// Export a function to get merged config for a specific project
export function getProjectConfig(project) {
    return {
        ...SCREENSHOT_CONFIG,
        ...project.customConfig,
        // Merge viewport configs if they exist
        viewport: {
            ...SCREENSHOT_CONFIG.viewport,
            ...project.customConfig?.viewport
        }
    };
}

import { useState, useEffect } from 'react';

/**
 * Hook to detect and track the current theme
 * Supports various theme detection methods commonly used in web apps
 */
export function useTheme() {
    const [theme, setTheme] = useState('light');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        function detectTheme() {
            // Method 1: Check document class
            if (document.documentElement.classList.contains('dark')) {
                return 'dark';
            }
            if (document.documentElement.classList.contains('light')) {
                return 'light';
            }

            // Method 2: Check data attributes
            const dataTheme = document.documentElement.getAttribute('data-theme');
            if (dataTheme === 'dark' || dataTheme === 'light') {
                return dataTheme;
            }

            // Method 3: Check localStorage
            const storedThemes = ['theme', 'darkMode', 'colorScheme', 'preferred-theme'];
            for (const key of storedThemes) {
                const stored = localStorage.getItem(key);
                if (stored === 'dark' || stored === 'light') {
                    return stored;
                }
                if (stored === 'true' && key === 'darkMode') {
                    return 'dark';
                }
                if (stored === 'false' && key === 'darkMode') {
                    return 'light';
                }
            }

            // Method 4: Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }

            // Default to light
            return 'light';
        }

        function updateTheme() {
            const currentTheme = detectTheme();
            setTheme(currentTheme);
            setIsLoading(false);
        }

        // Initial detection
        updateTheme();

        // Set up observers for theme changes
        const observers = [];

        // Observer 1: Watch for class changes on document
        if (window.MutationObserver) {
            const classObserver = new MutationObserver(updateTheme);
            classObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class', 'data-theme']
            });
            observers.push(classObserver);
        }

        // Observer 2: Listen for localStorage changes
        const handleStorageChange = (e) => {
            const themeKeys = ['theme', 'darkMode', 'colorScheme', 'preferred-theme'];
            if (themeKeys.includes(e.key)) {
                updateTheme();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Observer 3: Listen for system theme preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleMediaChange = () => updateTheme();
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleMediaChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleMediaChange);
        }

        // Observer 4: Listen for custom theme change events
        const handleThemeEvent = (e) => updateTheme();
        window.addEventListener('themechange', handleThemeEvent);

        // Cleanup function
        return () => {
            observers.forEach(observer => observer.disconnect());
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('themechange', handleThemeEvent);
            
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleMediaChange);
            } else {
                mediaQuery.removeListener(handleMediaChange);
            }
        };
    }, []);

    return { theme, isLoading };
}

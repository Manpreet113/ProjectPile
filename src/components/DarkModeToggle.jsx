import { useEffect, useState, useCallback } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // On mount, set initial state from localStorage or system preference
  useEffect(() => {
    const rootElement = document.documentElement;
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    
    setDark(isDark);
    setMounted(true);
    
    // Avoid unnecessary DOM manipulation if class already matches
    if (isDark !== rootElement.classList.contains("dark")) {
      rootElement.classList.toggle("dark", isDark);
    }
  }, []);

  // Memoized toggle function to avoid recreating on every render
  const toggleTheme = useCallback(() => {
    setDark(prevDark => {
      const newDark = !prevDark;
      
      // Use requestAnimationFrame to defer DOM manipulation
      requestAnimationFrame(() => {
        if (newDark) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
        }
      });
      
      return newDark;
    });
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="p-3 rounded-xl bg-muted/30 border border-border/30 w-11 h-11" />
    );
  }

  return (
    <button
      aria-label="Toggle dark mode"
      className="relative p-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border transition-all duration-300 hover:scale-105 hover:shadow-md"
      onClick={toggleTheme}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon container with rotation animation */}
      <div className="relative w-5 h-5 transition-transform duration-500 ease-out">
        {/* Sun icon */}
        <svg 
          className={`absolute inset-0 w-5 h-5 text-muted-foreground group-hover:text-foreground transition-all duration-500 ${
            dark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" strokeWidth="2" />
          <path strokeWidth="2" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41" />
        </svg>
        
        {/* Moon icon */}
        <svg 
          className={`absolute inset-0 w-5 h-5 text-muted-foreground group-hover:text-foreground transition-all duration-500 ${
            dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
        </svg>
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-card border border-border rounded-md text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
        {dark ? 'Switch to light mode' : 'Switch to dark mode'}
      </div>
    </button>
  );
} 
import React, { useState, useEffect } from "react";
import "../styles/typewriter.css";

export default function Typewriter({ text, typingSpeed = 300 }) {
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!text) return;

    const startTyping = setInterval(() => {
      if (charIndex >= text.length) {
        clearInterval(startTyping);
        return;
      }

      setDisplayText((prevText) => prevText + text[charIndex]);
      setCharIndex((prevIndex) => prevIndex + 1);
    }, typingSpeed);

    return () => clearInterval(startTyping);
  }, [charIndex, text, typingSpeed]);

  return (
    <p>
      {displayText}
      {<span className="cursor-blinker text-heading-1 mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent drop-shadow-lg bg-[length:200%_auto]">|</span>}
    </p>
  );
}
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
      {/* Show blinking cursor only while typewriting */}
      {<span className="cursor-blinker">|</span>}
    </p>
  );
}
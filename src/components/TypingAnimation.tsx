"use client";

import { useEffect, useState } from "react";

interface TypingAnimationProps {
  words: string[];
  className?: string;
}

export default function TypingAnimation({
  words,
  className = "text-cyan-300",
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timer: NodeJS.Timeout;

    const typingSpeed = 80; // Smooth typing speed
    const deletingSpeed = 40; // Smooth deleting speed
    const pauseTime = 2500; // Pause before deleting

    if (!isDeleting) {
      // Typing phase
      if (displayedText.length < currentWord.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Word is complete, pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      // Deleting phase
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deletingSpeed);
      } else {
        // Move to next word
        setWordIndex((prev) => (prev + 1) % words.length);
        setIsDeleting(false);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, wordIndex, isDeleting, words]);

  return (
    <span className={className}>
      {displayedText}
      <span 
        className="ml-1 inline-block w-0.5 h-[1em] bg-cyan-300 animate-pulse"
        style={{
          animation: "blink 0.7s steps(2, start) infinite",
        }}
      />
      <style>{`
        @keyframes blink {
          to {
            visibility: hidden;
          }
        }
      `}</style>
    </span>
  );
}

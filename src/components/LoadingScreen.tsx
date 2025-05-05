import React, { useEffect, useState } from 'react';

// Define constants for timings for easier adjustment
const FADE_START_DELAY = 1800; // ms - When fade-out transition starts
const HIDE_DELAY = 2200;       // ms - When component hides completely and calls onFinish
const FADE_OUT_DURATION_MS = HIDE_DELAY - FADE_START_DELAY; // Duration of the fade-out CSS transition

export default function LoadingScreen({
  logoUrl = '/logo.png', // Default logo path remains
  onFinish,
}: {
  logoUrl?: string;
  onFinish?: () => void;
}) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out before hiding
    const timer1 = setTimeout(() => setFadeOut(true), FADE_START_DELAY);
    // Hide component and trigger callback
    const timer2 = setTimeout(() => {
      setShow(false);
      onFinish?.();
    }, HIDE_DELAY);

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  // Don't render anything if show is false
  if (!show) return null;

  return (
    <div
      // Full screen overlay with background gradient
      // Opacity transition handles the final fade-out of the whole screen
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#232526] to-[#414345] transition-opacity ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_OUT_DURATION_MS}ms` }} // Set duration dynamically
    >
      {/* Logo Image */}
      <img
        src={logoUrl}
        alt="Loading Logo" // Updated alt text
        // Base styles + animation class
        className="w-32 h-32 sm:w-40 sm:h-40 object-contain logo-animate"
      />

      {/* Inline style tag for custom Keyframes animations */}
      <style>{`
        @keyframes fade-in-scale-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95); /* Start slightly down and smaller */
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1); /* End at normal position and size */
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            /* Use drop-shadow for better effect on transparent logos */
            filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.4)); /* Subtle gold glow */
          }
          50% {
            transform: scale(1.04); /* Slightly larger scale */
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.7)); /* More intense gold glow */
          }
        }

        .logo-animate {
          /* Apply initial fade-in animation */
          /* 'forwards' keeps the state of the last keyframe */
          /* 'cubic-bezier' provides a smooth easing function */
          /* Delay can be added if needed, e.g., 0.1s */
          animation: fade-in-scale-up 0.8s cubic-bezier(.4,0,.2,1) forwards;

          /* Apply continuous pulse/glow animation AFTER the fade-in is complete */
          /* Starts after 0.8s (duration of fade-in), runs infinitely */
          animation-delay: 0s, 0.8s; /* Delay for fade-in, delay for pulse-glow */
          animation-name: fade-in-scale-up, pulse-glow;
          animation-duration: 0.8s, 2.5s; /* Duration for fade-in, duration for pulse-glow cycle */
          animation-iteration-count: 1, infinite; /* Run fade-in once, pulse forever */
          animation-timing-function: cubic-bezier(.4,0,.2,1), ease-in-out; /* Easing for both */
          animation-fill-mode: forwards, none; /* Keep fade-in end state, pulse resets each cycle */

          /* Hint for browser performance optimization */
          will-change: transform, opacity, filter;
        }
      `}</style>
    </div>
  );
}

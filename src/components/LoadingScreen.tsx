import React, { useEffect, useState } from 'react';

// Define constants for timings for easier adjustment
const FADE_START_DELAY = 1800; // ms - When fade-out transition starts (Keep as is or adjust)
// INCREASED HIDE_DELAY for slower fade-out
const HIDE_DELAY = 3000;       // ms - Increase this value for a slower fade (e.g., 3000ms = 3 seconds total visibility before hiding)
const FADE_OUT_DURATION_MS = HIDE_DELAY - FADE_START_DELAY; // Duration of the fade-out CSS transition (Now 1200ms)

export default function LoadingScreen({
  logoUrl = '/logo.png', // Default logo path remains
  onFinish,
}: {
  logoUrl?: string;
  onFinish?: () => void;
}) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [initialRender, setInitialRender] = useState(true); // To control initial style

  useEffect(() => {
    // Use a minimal timeout or requestAnimationFrame to ensure initial styles apply first
    const initTimer = requestAnimationFrame(() => {
        setInitialRender(false); // Allow animation class to take full effect
    });

    // Start fade out before hiding
    const timer1 = setTimeout(() => setFadeOut(true), FADE_START_DELAY);
    // Hide component and trigger callback
    const timer2 = setTimeout(() => {
      setShow(false);
      onFinish?.();
    }, HIDE_DELAY);

    // Cleanup timers on component unmount
    return () => {
      cancelAnimationFrame(initTimer); // Clean up animation frame request
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
        alt="Loading Logo" // Alt text is important for accessibility
        // Apply animation class conditionally + base styles
        className={`w-32 h-32 sm:w-40 sm:h-40 object-contain ${!initialRender ? 'logo-animate' : ''}`}
        // --- KEY CHANGE HERE ---
        // Set initial opacity to 0 and color to transparent inline
        // This prevents flicker of alt text or broken image icon
        style={{
            opacity: initialRender ? 0 : undefined, // Start fully transparent
            color: 'transparent', // Hide alt text color just in case
        }}
      />

      {/* Inline style tag for custom Keyframes animations */}
      {/* (Keyframes definitions remain the same as before) */}
      <style>{`
        @keyframes fade-in-scale-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.4));
          }
          50% {
            transform: scale(1.04);
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.7));
          }
        }

        .logo-animate {
          /* Animations applied via this class */
          animation:
            fade-in-scale-up 0.8s cubic-bezier(.4,0,.2,1) forwards,
            pulse-glow 2.5s infinite ease-in-out 0.8s;
          will-change: transform, opacity, filter;

           /* Explicitly set opacity to 1 to override inline style if needed, though 'forwards' should handle it */
           /* opacity: 1; */ /* Usually not needed due to animation 'forwards' */
        }
      `}</style>
    </div>
  );
}

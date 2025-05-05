import React, { useEffect, useState } from 'react';

export default function LoadingScreen({
  logoUrl = '/logo.png',
  storeName = 'متجر العطور',
  onFinish,
}: {
  logoUrl?: string;
  storeName?: string;
  onFinish?: () => void;
}) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1800); // Start fade out before hide
    const timer2 = setTimeout(() => {
      setShow(false);
      onFinish?.();
    }, 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#232526] to-[#414345] transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-down"
          style={{
            animation: 'fade-in-down 0.7s cubic-bezier(.4,0,.2,1) both',
          }}
        >
          مرحباً بك في <span className="text-[#FFD700]">{storeName}</span>
        </h1>
        <img
          src={logoUrl}
          alt="شعار المتجر"
          className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-full shadow-lg border-4 border-[#FFD700] animate-fade-in-up"
          style={{
            animation: 'fade-in-up 0.9s 0.3s cubic-bezier(.4,0,.2,1) both',
          }}
        />
      </div>
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-40px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px);}
          100% { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}

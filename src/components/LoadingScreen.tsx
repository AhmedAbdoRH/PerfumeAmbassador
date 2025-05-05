import React, { useEffect, useState } from 'react';

// --- التوقيت المعدل ---
const FADE_START_DELAY = 1500; // مللي ثانية - بدء التلاشي للخارج مبكرًا
const HIDE_DELAY = 3000;       // مللي ثانية - المدة الإجمالية للظهور هي 3 ثوانٍ
const FADE_OUT_DURATION_MS = HIDE_DELAY - FADE_START_DELAY; // مدة التلاشي للخارج (الآن 1500 مللي ثانية = 1.5 ثانية)

export default function LoadingScreen({
  logoUrl = '/logo.png',
  onFinish,
}: {
  logoUrl?: string;
  onFinish?: () => void;
}) {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  // --- حالة جديدة لتحميل الصورة ---
  const [imageLoaded, setImageLoaded] = useState(false);

  // Effect للمؤقتات وتحميل الصورة المسبق
  useEffect(() => {
    let isMounted = true; // علم لمنع تحديثات الحالة على مكون غير مُركّب

    // --- منطق تحميل الصورة المسبق ---
    const img = new Image();
    img.onload = () => {
      if (isMounted) {
        setImageLoaded(true); // تعيين الحالة عند تحميل الصورة
      }
    };
    img.onerror = () => {
      // اختياري: معالجة خطأ تحميل الصورة، ربما عرض أيقونة افتراضية أو إخفاء أسرع
      console.error("فشل تحميل شعار شاشة التحميل:", logoUrl);
      if (isMounted) {
        // قرر كيفية التعامل مع الخطأ: ربما المتابعة بدون شعار، أو استخدام بديل
         setImageLoaded(true); // أو تعيين حالة أخرى لإظهار خطأ/بديل
      }
    };
    img.src = logoUrl; // بدء تحميل الصورة

    // --- المؤقتات ---
    const timer1 = setTimeout(() => {
        if (isMounted) setFadeOut(true);
    }, FADE_START_DELAY);

    const timer2 = setTimeout(() => {
      if (isMounted) {
        setShow(false);
        onFinish?.();
      }
    }, HIDE_DELAY);

    // دالة التنظيف
    return () => {
      isMounted = false; // وضع علامة على أنه غير مُركّب
      clearTimeout(timer1);
      clearTimeout(timer2);
      // اختياري: مسح معالجات الصور إذا لزم الأمر
      img.onload = null;
      img.onerror = null;
    };
  }, [logoUrl, onFinish]); // إضافة logoUrl إلى مصفوفة الاعتماديات

  // لا تعرض أي شيء إذا كانت show خاطئة
  if (!show) return null;

  return (
    <div
      // الحاوية الرئيسية: تعالج الخلفية والتلاشي الكلي للخارج
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#232526] to-[#414345] transition-opacity ease-in-out ${ // التأكد من استخدام easing سلس
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_OUT_DURATION_MS}ms` }} // استخدام المدة الأبطأ المحسوبة
    >
      {/* --- عرض الصورة بشكل شرطي فقط عند تحميلها --- */}
      {imageLoaded && (
        <img
          src={logoUrl}
          alt="Loading Logo"
          // تطبيق الرسوم المتحركة مباشرة الآن بعد أن علمنا أن الصورة قد تم تحميلها
          className="w-32 h-32 sm:w-40 sm:h-40 object-contain logo-animate"
          // لا حاجة لحيل الشفافية المضمنة بعد الآن
        />
      )}

      {/* --- الأنماط (تبقى keyframes كما هي) --- */}
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

        /* فئة الرسوم المتحركة المطبقة على وسم img بمجرد عرضه */
        .logo-animate {
          animation:
            fade-in-scale-up 0.8s cubic-bezier(.4,0,.2,1) forwards, /* رسوم الدخول */
            pulse-glow 2.5s infinite ease-in-out 0.8s; /* النبض المستمر، يبدأ بعد الدخول */
          will-change: transform, opacity, filter;
        }
      `}</style>
    </div>
  );
}

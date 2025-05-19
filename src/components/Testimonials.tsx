import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Testimonial } from '../types/database';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('id, image_url, is_active, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setTestimonials(data || []);
      } catch (err) {
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // تصفية التقييمات التي لها صورة فقط
  const testimonialsWithImages = testimonials.filter(t => t.image_url);

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonialsWithImages.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsWithImages.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (testimonialsWithImages.length <= 1) return;
    
    const timer = setInterval(() => {
      nextTestimonial();
    }, 5000);
    
    return () => clearInterval(timer);
  }, [testimonialsWithImages.length, currentIndex]);

  if (loading) return (
    <div className="relative py-12 px-4 md:px-0 border-t border-gray-700/30 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md -z-10"></div>
      <div className="text-center text-white py-8 backdrop-blur-xl bg-white/10 max-w-4xl mx-auto rounded-xl p-8 border border-white/20">
        جاري تحميل آراء العملاء...
      </div>
    </div>
  );

  if (testimonialsWithImages.length === 0) {
    return (
      <section className="relative py-12 px-4 md:px-0 border-t border-gray-700/30 mt-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md -z-10"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold text-center text-white mb-10 drop-shadow-lg">آراء عملائنا</h2>
          <div className="text-center text-gray-200 backdrop-blur-xl bg-white/10 rounded-xl shadow-2xl p-8 border border-white/20">
            لا توجد صور آراء لعرضها حالياً.
          </div>
        </div>
      </section>
    );
  }

  const currentTestimonial = testimonialsWithImages[currentIndex];

  return (
    <section className="relative py-12 px-4 md:px-0 border-t border-gray-700/30 mt-16 overflow-hidden">
      {/* Frosted Glass Background */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md -z-10"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-3xl font-bold text-center text-white mb-10 drop-shadow-lg">آراء عملائنا</h2>
        
        <div className="relative">
          {/* Navigation Arrows */}
          {testimonialsWithImages.length > 1 && (
            <>
              <button 
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none border border-white/20 shadow-lg"
                aria-label="التعليق السابق"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              <button 
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none border border-white/20 shadow-lg"
                aria-label="التعليق التالي"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Single Testimonial */}
          <div 
            key={currentTestimonial.id}
            className={`backdrop-blur-xl bg-white/10 rounded-xl shadow-2xl p-6 flex flex-col items-center text-center border border-white/20 transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            style={{
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)'
            }}
          >
            <div className="w-full flex justify-center items-center p-2">
              <div className="w-full max-w-2xl overflow-hidden rounded-xl border-2 border-white/20 bg-white/10">
                <img
                  src={currentTestimonial.image_url}
                  alt="testimonial image"
                  className="w-full h-auto object-cover"
                  style={{
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          {testimonialsWithImages.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {testimonialsWithImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAnimating(true);
                    setTimeout(() => setIsAnimating(false), 500);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white w-6 backdrop-blur-sm' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`انتقل إلى التعليق ${index + 1}`}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
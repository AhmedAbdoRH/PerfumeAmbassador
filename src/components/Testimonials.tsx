import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Testimonial } from '../types/database';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center text-white py-8">جاري تحميل آراء العملاء...</div>;

  // تصفية التقييمات التي لها صورة فقط
  const testimonialsWithImages = testimonials.filter(t => t.image_url);

  if (testimonialsWithImages.length === 0) {
    return (
      <section className="bg-black/70 py-12 px-4 md:px-0 border-t border-gray-700 mt-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-10">آراء عملائنا</h2>
          <div className="text-center text-gray-300 bg-black/40 rounded-lg py-10 text-lg">لا توجد صور آراء لعرضها حالياً.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-black/70 py-12 px-4 md:px-0 border-t border-gray-700 mt-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-10">آراء عملائنا</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonialsWithImages.map(t => (
            <div key={t.id} className="bg-gradient-to-br from-gray-800/60 to-black/80 rounded-lg shadow-lg p-6 flex flex-col items-center text-center border border-gray-700/60">
                <div className="w-full flex justify-center items-center">
                  <div className="w-full flex justify-center items-center">
                    <img
                      src={t.image_url}
                      alt="testimonial image"
                      className="rounded-2xl"
                      style={{ display: 'block', maxWidth: '100%', height: 'auto', background: 'white' }}
                    />
                  </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
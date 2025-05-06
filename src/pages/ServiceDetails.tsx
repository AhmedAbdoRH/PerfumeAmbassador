import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Service } from '../types/database';
import { MessageCircle } from 'lucide-react';

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchService(parseInt(id, 10));
    }
  }, [id]);

  const fetchService = async (serviceId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('الخدمة غير موجودة');

      setService(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = () => {
    if (!service) return;
    const serviceUrl = window.location.href;
    const message = `استفسار عن : ${service.title}\nرابط المنتج: ${serviceUrl}`;
    window.open(`https://wa.me/201027381559?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-xl text-secondary">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center gap-4">
        <div className="text-xl text-secondary">{error || 'الخدمة غير موجودة'}</div> {/* تم تغيير لون نص الخطأ إلى الأبيض */}
        <button
          onClick={() => navigate('/')}
          className="bg-secondary text-primary px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-secondary hover:text-accent"
        >
          ← العودة للرئيسية
        </button>

        <div className="rounded-lg shadow-lg overflow-hidden glass"> {/* تطبيق كلاس الجلاس مورفيزم هنا */}
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={service.image_url || ''}
                alt={service.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                  {service.category?.name}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-secondary">{service.title}</h1>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                {service.description}
              </p>
              <div className="border-t border-gray-700 pt-6 mb-6">
                <div className="text-2xl font-bold text-accent mb-6">
                  {service.price}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleContact}
                    className="flex-1 bg-[#25D366] text-white py-3 px-6 rounded-lg font-bold hover:bg-opacity-90 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    تواصل معنا للطلب
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-secondary text-primary text-center py-4 mt-8">
        جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Service } from '../types/database';
import { MessageCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<Service[]>([]);

  useEffect(() => {
    if (id) {
      fetchService(id);
    }
  }, [id]);

  useEffect(() => {
    if (service?.category_id && service?.id) {
      fetchSuggested(service.category_id, service.id);
    }
  }, [service]);

  const fetchService = async (serviceId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('المنتج غير موجود');

      setService(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggested = async (categoryId: string, excludeId: string | number) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .limit(4);
    if (!error && data) setSuggested(data);
    else setSuggested([]);
  };

  const handleContact = () => {
    if (!service) return;
    const productUrl = window.location.href;
    const message = `استفسار عن المنتج: ${service.title}
رابط المنتج: ${productUrl}`;
    window.open(`https://wa.me/201027381559?text=${encodeURIComponent(message)}`, '_blank');
  };

  const backgroundStyles = {
    background: 'var(--background-gradient, var(--background-color, #232526))',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center pt-24"
        style={backgroundStyles}
      >
        <div className="text-xl text-secondary">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24"
        style={backgroundStyles}
      >
        <div className="text-xl text-secondary">{error || 'المنتج غير موجود'}</div>
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
    <div className="min-h-screen flex flex-col pt-24" style={backgroundStyles}>
      <div className="flex items-center justify-center flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl lg:max-w-5xl">
          <div className="rounded-lg shadow-lg overflow-hidden glass">
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
                    {/* يمكن جلب اسم القسم باستعلام منفصل إذا رغبت */}
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-4 text-secondary">{service.title}</h1>
                <p className="text-white mb-6 text-lg leading-relaxed">
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
      </div>

      {/* منتجات مقترحة من نفس القسم */}
      {suggested.length > 0 && (
        <div className="container mx-auto px-4 max-w-5xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-accent text-center">منتجات مقترحة من نفس القسم</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {suggested.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description || ''}
                imageUrl={item.image_url || ''}
                price={item.price || ''}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center pb-8">
        <button
          onClick={() => navigate('/')}
          className="text-secondary hover:text-accent px-4 py-2 rounded-lg border border-secondary hover:border-accent"
        >
          ← العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
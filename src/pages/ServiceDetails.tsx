import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';
import { MessageCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id, 10));
    }
  }, [id]);

  useEffect(() => {
    if (product?.category_id && product?.id) {
      fetchSuggestedProducts(product.category_id, product.id);
    }
  }, [product]);

  const fetchProduct = async (productId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('المنتج غير موجود');

      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedProducts = async (categoryId: string, excludeId: number) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .limit(4);
    if (!error && data) setSuggestedProducts(data);
    else setSuggestedProducts([]);
  };

  const handleContact = () => {
    if (!product) return;
    const productUrl = window.location.href;
    const message = `استفسار عن المنتج: ${product.title}
رابط المنتج: ${productUrl}`;
    window.open(`https://wa.me/201027381559?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-xl text-secondary">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center gap-4">
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
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-secondary hover:text-accent"
        >
          ← العودة للرئيسية
        </button>

        <div className="rounded-lg shadow-lg overflow-hidden glass">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={product.image_url || ''}
                alt={product.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                  {product.category?.name}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-secondary">{product.title}</h1>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                {product.description}
              </p>
              <div className="border-t border-gray-700 pt-6 mb-6">
                <div className="text-2xl font-bold text-accent mb-6">
                  {product.price}
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
        {/* Suggested products section */}
        {suggestedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-accent text-center">منتجات مقترحة من نفس القسم</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {suggestedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  description={p.description || ''}
                  imageUrl={p.image_url || ''}
                  price={p.price || ''}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <footer className="bg-secondary text-primary text-center py-4 mt-8">
        جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
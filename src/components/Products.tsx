import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types/database';

const lightGold = '#FFD700';
const brownDark = '#3d2c1d';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category_id === selectedCategory)
    : products;

  if (isLoading) {
    return (
      <div className={`py-16 bg-gradient-to-br from-[${brownDark}] to-black`}>
        <div className="container mx-auto px-4 text-center text-secondary">
          جاري تحميل العطور...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-16 bg-gradient-to-br from-[${brownDark}] to-black`}>
        <div className="container mx-auto px-4 text-center text-red-600">
          حدث خطأ أثناء تحميل العطور
        </div>
      </div>
    );
  }

  return (
    <section className={`py-16 bg-gradient-to-br from-[${brownDark}] to-black`} id="products">
      <div className="container mx-auto px-4
                   bg-white/5
                   backdrop-blur-xl
                   rounded-2xl
                   p-8
                   border border-white/10
                   shadow-2xl shadow-black/40">
        <h2 className={`text-3xl font-bold text-center mb-12 text-[${lightGold}]`}>
          تشكيلة العطور
        </h2>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`p-4 rounded-xl transition-all duration-300 ${
              !selectedCategory
                ? `bg-[${lightGold}] text-black font-bold`
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            جميع العطور
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-xl transition-all duration-300 ${
                selectedCategory === category.id
                  ? `bg-[${lightGold}] text-black font-bold`
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
              {category.description && (
                <p className="text-sm opacity-80">{category.description}</p>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description || ''}
              imageUrl={product.image_url || ''}
              price={product.price || ''}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
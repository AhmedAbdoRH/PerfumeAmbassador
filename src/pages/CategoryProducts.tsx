import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import type { Category } from '../types/database';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
}

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null) ;

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndServices();
    }
  }, [categoryId]);

  const fetchCategoryAndServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch products for this category from Firestore
      const productsQuery = query(
        collection(db, 'products'),
        where('category_id', '==', `categories/${categoryId}`)
      );

      const productsSnapshot = await getDocs(productsQuery);
      const productsData: Product[] = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description || '',
        imageUrl: doc.data().image_url || '',
        price: doc.data().price || '',
      }));
      setProducts(productsData);

      const categoryQuery = query(
        collection(db, 'categories'),
        where('id', '==', categoryId)
      );
      const categorySnapshot = await getDocs(categoryQuery)
      const categoryData = categorySnapshot.docs.map((doc) => doc.data())[0] as Category
      
      if (!categoryData) throw Error()
      setCategory(categoryData);

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary pt-24 flex items-center justify-center">
        <div className="text-xl text-secondary">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-primary pt-24 flex flex-col items-center justify-center gap-4">
        <div className="text-xl text-secondary">{error || 'القسم غير موجود'}</div>
        <Link
          to="/"
          className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-light transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="text-secondary hover:text-accent transition-colors">
            ← العودة للرئيسية
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl shadow-black/40">
          <h1 className="text-3xl font-bold mb-2 text-accent">{category.name}</h1>
          {category.description && (
            <p className="text-secondary/70 mb-8">{category.description}</p>
          )}

          {products.length === 0 ? (
            <p className="text-center text-secondary/70 py-8">
              لا توجد منتجات في هذا القسم حالياً
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  description={product.description || ''}
                  imageUrl={product.imageUrl || ''}
                  price={product.price || ''}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
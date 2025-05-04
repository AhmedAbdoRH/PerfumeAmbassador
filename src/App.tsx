import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ServiceDetails from './pages/ServiceDetails';
import type { StoreSettings } from './types/database';
import { ThemeProvider } from './theme/ThemeContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  }

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

function App() {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#c7a17a');

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    const { data } = await supabase
      .from('store_settings')
      .select('*')
      .single();
    
    if (data) {
      setStoreSettings(data);
      if (data.primary_color) setPrimaryColor(data.primary_color);
    }
  };

  return (
    <ThemeProvider value={{ primaryColor, setPrimaryColor }}>
      <Helmet>
        <title>{storeSettings?.meta_title || storeSettings?.store_name || 'سفير العطور'}</title>
        <meta name="description" content={storeSettings?.meta_description || storeSettings?.store_description || ''} />
        {storeSettings?.keywords && storeSettings.keywords.length > 0 && (
          <meta name="keywords" content={storeSettings.keywords.join(', ')} />
        )}
        {storeSettings?.favicon_url && (
          <link rel="icon" href={storeSettings.favicon_url} />
        )}
        {storeSettings?.og_image_url && (
          <meta property="og:image" content={storeSettings.og_image_url} />
        )}
        <meta property="og:title" content={storeSettings?.meta_title || storeSettings?.store_name || ''} />
        <meta property="og:description" content={storeSettings?.meta_description || storeSettings?.store_description || ''} />
        <meta property="og:type" content="website" />
      </Helmet>
      <Router>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <PrivateRoute>
              <AdminDashboard onSettingsUpdate={fetchStoreSettings} setPrimaryColor={setPrimaryColor} />
            </PrivateRoute>
          } />
          <Route path="/service/:id" element={
            <>
              <Header storeSettings={storeSettings} />
              <ServiceDetails />
              <Footer storeSettings={storeSettings} />
              <WhatsAppButton />
            </>
          } />
          <Route path="/" element={
            <div className="min-h-screen bg-beige font-cairo">
              <Header storeSettings={storeSettings} />
              <Hero storeSettings={storeSettings} />
              <Services />
              <Footer storeSettings={storeSettings} />
              <WhatsAppButton />
            </div>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
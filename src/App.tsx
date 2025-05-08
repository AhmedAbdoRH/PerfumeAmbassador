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
import CategoryProducts from './pages/CategoryProducts';
import ProductDetails from './pages/ProductDetails';
import LoadingScreen from './components/LoadingScreen';
import type { StoreSettings, Banner } from './types/database';
import { ThemeProvider } from './theme/ThemeContext';

// PrivateRoute component remains unchanged
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
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">جاري التحميل...</div>; // Added basic styling
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

function App() {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  // Banner state for main banner (to preload during loading)
  const [mainBanner, setMainBanner] = useState<Banner | null>(null);
  const [mainContentLoaded, setMainContentLoaded] = useState(false); // New state to track main content loading

  // Fetch settings and main banner before showing main content
  useEffect(() => {
    let isMounted = true;
    async function initApp() {
      await fetchStoreSettings();
      // جلب البانر الرئيسي أثناء شاشة التحميل
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .single();
      if (isMounted) setMainBanner(data || null);

      // Wait for at least 2 seconds OR until settings are fetched, whichever is longer
      const timer = setTimeout(() => {
        if (isMounted) setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    initApp();
    return () => { isMounted = false; };
  }, []); // Empty dependency array means this runs once on mount

  // Apply theme settings to CSS variables
  useEffect(() => {
    if (storeSettings) {
      const theme = (storeSettings as any).theme_settings || {};
      const primary = theme.primaryColor || '#c7a17a';
      const secondary = theme.secondaryColor || '#fff';
      const fontFamily = theme.fontFamily || 'Cairo, sans-serif';
      const backgroundGradient = theme.backgroundGradient || '';
      const backgroundColor = theme.backgroundColor || '#000';

      const root = document.documentElement;
      root.style.setProperty('--color-primary', primary);
      root.style.setProperty('--color-secondary', secondary);
      root.style.setProperty('--color-accent', '#d99323');
      root.style.setProperty('--color-accent-light', '#e0a745');
      root.style.setProperty('--font-family', fontFamily);

      if (backgroundGradient && backgroundGradient.trim() !== '') {
        root.style.setProperty('--background-gradient', backgroundGradient);
        root.style.setProperty('--background-color', '');
      } else {
        root.style.setProperty('--background-gradient', '');
        root.style.setProperty('--background-color', backgroundColor);
      }
    }
  }, [storeSettings]);

  // Function to re-fetch settings (used by AdminDashboard)
  const fetchStoreSettings = async () => {
    const { data } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (data) {
      setStoreSettings(data);
    }
  };

  // Layout component remains the same
  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div
      className="min-h-screen font-cairo"
      style={{
        background: (storeSettings && (storeSettings as any).theme_settings?.backgroundGradient)
          ? (storeSettings as any).theme_settings.backgroundGradient
          : (storeSettings && (storeSettings as any).theme_settings?.backgroundColor)
            ? (storeSettings as any).theme_settings.backgroundColor
            : "linear-gradient(135deg, #232526 0%, #414345 100%)",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <Header storeSettings={storeSettings} />
      <MainFade>{children}</MainFade>
      <Footer storeSettings={storeSettings} />
      <WhatsAppButton />
    </div>
  );

  // Render loading screen while loading is true
  if (loading) {
    return (
      <LoadingScreen
        logoUrl={storeSettings?.logo_url || '/logo.png'}
        storeName={
          mainBanner?.type === 'text'
            ? mainBanner.title || storeSettings?.store_name || 'متجر العطور'
            : storeSettings?.store_name || 'متجر العطور'
        }
      />
    );
  }

  // Render main application content when loading is false
  return (
    <ThemeProvider>
      {/* Helmet for SEO meta tags */}
      <Helmet>
        <title>{storeSettings?.meta_title || storeSettings?.store_name || ' '}</title>
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
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <PrivateRoute>
              <AdminDashboard onSettingsUpdate={fetchStoreSettings} />
            </PrivateRoute>
          } />

          {/* Public Routes using the Layout component */}
          <Route path="/service/:id" element={
            <Layout>
              <ServiceDetails />
            </Layout>
          } />
          <Route path="/product/:id" element={
            <Layout>
              <ProductDetails />
            </Layout>
          } />
          <Route path="/category/:categoryId" element={
            <Layout>
              <CategoryProducts />
            </Layout>
          } />
          <Route path="/" element={
            <Layout>
              <StaggeredHome
                storeSettings={storeSettings}
                mainBanner={mainBanner}
                setMainContentLoaded={setMainContentLoaded}
              />
            </Layout>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// مكون جديد لعرض عناصر الصفحة الرئيسية بتتالي
function StaggeredHome({
  storeSettings,
  mainBanner,
  setMainContentLoaded,
}: {
  storeSettings: StoreSettings | null;
  mainBanner: Banner | null;
  setMainContentLoaded: (v: boolean) => void;
}) {
  useEffect(() => {
    setMainContentLoaded(true);
  }, [setMainContentLoaded]);

  return (
    <>
      <Hero storeSettings={storeSettings} banner={mainBanner} />
      <Services onLoaded={() => {}} />
    </>
  );
}

// مكون لتأثير الظهور التدريجي السريع
function MainFade({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 1200ms cubic-bezier(.4,0,.2,1), transform 700ms cubic-bezier(.4,0,.2,1)',
      }}
    >
      {children}
    </div>
  );
}

export default App;

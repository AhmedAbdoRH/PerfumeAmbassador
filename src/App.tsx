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
import type { StoreSettings } from './types/database';
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
  // New state to control the visibility/opacity of the main content
  const [contentVisible, setContentVisible] = useState(false);

  // Fetch settings and manage initial loading state
  useEffect(() => {
    async function initApp() {
        await fetchStoreSettings();
        // Wait for at least 2 seconds OR until settings are fetched, whichever is longer
        const timer = setTimeout(() => {
            setLoading(false); // Hide the loading screen
        }, 2000); // Minimum 2 seconds
        return () => clearTimeout(timer); // Cleanup timer
    }
    initApp();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to trigger the fade-in transition when loading is complete
  useEffect(() => {
      if (!loading) {
          // Set contentVisible to true right after loading becomes false
          // This triggers the CSS transition from opacity 0 to 1
          setContentVisible(true);
      }
  }, [loading]); // Depend on the loading state

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
    // Background styles are applied here based on fetched settings
    <div
      className="min-h-screen font-cairo"
      style={{
        // Always use the same logic as the homepage for background
        background: (storeSettings && (storeSettings as any).theme_settings?.backgroundGradient)
          ? (storeSettings as any).theme_settings.backgroundGradient
          : (storeSettings && (storeSettings as any).theme_settings?.backgroundColor)
            ? (storeSettings as any).theme_settings.backgroundColor
            : "linear-gradient(135deg, #232526 0%, #414345 100%)", // fallback to homepage gradient
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <Header storeSettings={storeSettings} />
      {/* The actual page content goes here */}
      {children}
      <Footer storeSettings={storeSettings} />
      <WhatsAppButton />
    </div>
  );

  // Render loading screen while loading is true
  if (loading) {
    return (
      <LoadingScreen
        logoUrl={storeSettings?.logo_url || '/logo.png'}
        storeName={storeSettings?.store_name || 'متجر العطور'}
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

      {/* Wrapper div for the fade-in transition */}
      {/* Apply opacity and transition based on contentVisible state */}
      <div
          style={{
              opacity: contentVisible ? 1 : 0, // Opacity is 0 initially, 1 when contentVisible is true
              transition: 'opacity 1500ms ease-in-out', // Apply a 1.5 second fade transition
              // Ensure the wrapper doesn't collapse and covers the screen if needed
              minHeight: '100vh',
              width: '100%',
          }}
      >
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
                <Hero storeSettings={storeSettings} />
                <Services />
              </Layout>
            } />
          </Routes>
        </Router>
      </div> {/* End of fade-in wrapper */}
    </ThemeProvider>
  );
}

export default App;

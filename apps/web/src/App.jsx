import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { Toaster } from './components/ui/toaster.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute.jsx';
import useScrollReveal from '@/hooks/useScrollReveal.js';
import IntroSplash from '@/components/IntroSplash.jsx';
import WhatsAppWidget from '@/components/WhatsAppWidget.jsx';

/* ─── Existing pages ─── */
import HomePage from './pages/HomePage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import SciencePage from './pages/SciencePage.jsx';
import { ShopPage } from './pages/ShopPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import VedicPointsPage from './pages/VedicPointsPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import { LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

/* ─── New pages ─── */
import BlogPage from './pages/BlogPage.jsx';
import AdminBlogPage from './pages/AdminBlogPage.jsx';
import SocialImpactPage from './pages/SocialImpactPage.jsx';
import DoctorDiscoveryPage from './pages/DoctorDiscoveryPage.jsx';
import AdminDoctorsPage from './pages/AdminDoctorsPage.jsx';
import AdminInfluencersPage from './pages/AdminInfluencersPage.jsx';
import AdminProductsPage from './pages/AdminProductsPage.jsx';
import AdminCouponsPage from './pages/AdminCouponsPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import ReturnsPage from './pages/ReturnsPage.jsx';
import CookiePolicyPage from './pages/CookiePolicyPage.jsx';
// import InfluencerPortalPage from './pages/InfluencerPortalPage.jsx';

/* ─── Scroll reveal wired at router level so it re-runs on navigation ─── */
function ScrollReveal() {
  useScrollReveal();
  return null;
}

function App() {
  return (
    <Router>
      <IntroSplash />
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <ScrollReveal />
          <Routes>
            {/* Core */}
            <Route path="/"        element={<HomePage />} />
            <Route path="/about"   element={<AboutPage />} />
            <Route path="/science" element={<SciencePage />} />
            <Route path="/shop"    element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart"    element={<CartPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/doctors" element={<DoctorDiscoveryPage />} />

            <Route path="/blog"       element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPage />} />
            <Route path="/admin/blog" element={<ProtectedAdminRoute><AdminBlogPage /></ProtectedAdminRoute>} />
            <Route path="/social-impact" element={<SocialImpactPage />} />
            {/* <Route path="/influencer" element={<InfluencerPortalPage />} /> */}

            {/* Legal */}
            <Route path="/terms"   element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />

            {/* Auth */}
            <Route path="/login"            element={<LoginPage />} />
            <Route path="/signup"           element={<SignupPage />} />
            <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute><CheckoutPage /></ProtectedRoute>
            } />
            <Route path="/order-confirmation/:id" element={
              <ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>
            } />
            <Route path="/vedic-points" element={
              <ProtectedRoute><VedicPointsPage /></ProtectedRoute>
            } />
            
            {/* Admin Protected */}
            <Route path="/admin" element={
              <ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>
            } />
            <Route path="/admin/doctors" element={
              <ProtectedAdminRoute><AdminDoctorsPage /></ProtectedAdminRoute>
            } />
            <Route path="/admin/influencers" element={
              <ProtectedAdminRoute><AdminInfluencersPage /></ProtectedAdminRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedAdminRoute><AdminProductsPage /></ProtectedAdminRoute>
            } />
            <Route path="/admin/coupons" element={
              <ProtectedAdminRoute><AdminCouponsPage /></ProtectedAdminRoute>
            } />
          </Routes>
          <Toaster />
          <WhatsAppWidget />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
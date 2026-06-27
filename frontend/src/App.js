import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './LandingPage';
import EditorPage from './EditorPage';
import Dashboard from './Dashboard';
import Pricing from './Pricing';
import QRCodeTypes from './QRCodeTypes';
import DynamicQR from './DynamicQR';
import StaticQR from './StaticQR';
import Features from './Features';
import Weddings from './Weddings';
import Contact from './Contact';
import FAQ from './FAQ';
import Disclaimer from './Disclaimer';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';
import RefundPolicy from './RefundPolicy';
import About from './About';
import Footer from './Footer';

function AppContent() {
  const navigate = useNavigate();
  const [qrCodeToEdit, setQrCodeToEdit] = useState(null);

  return (
    <Routes>
      <Route path="/" element={
        <LandingPage 
          onViewDashboard={() => navigate('/dashboard')}
          onViewPricing={() => navigate('/pricing')}
          qrCodeToEdit={qrCodeToEdit}
          onClearQrCodeToEdit={() => setQrCodeToEdit(null)}
        />
      } />
      <Route path="/dashboard" element={
        <Dashboard 
          onCreate={() => navigate('/')}
          onViewPricing={() => navigate('/pricing')}
          onBack={() => navigate('/')}
          onEditQrCode={(qrCode, options = {}) => {
            setQrCodeToEdit({ ...qrCode, openSocialModal: !!options.openSocialModal });
            navigate('/');
          }}
        />
      } />
      <Route path="/pricing" element={
        <Pricing onViewDashboard={() => navigate('/dashboard')} onBack={() => navigate('/')} />
      } />
      <Route path="/types" element={
        <QRCodeTypes
          onViewDashboard={() => navigate('/dashboard')}
          onViewPricing={() => navigate('/pricing')}
        />
      } />
      <Route path="/use-cases/weddings" element={
        <Weddings
          onViewDashboard={() => navigate('/dashboard')}
          onViewPricing={() => navigate('/pricing')}
        />
      } />
      <Route path="/dynamic-qr-codes" element={
        <DynamicQR
          onViewDashboard={() => navigate('/dashboard')}
          onViewPricing={() => navigate('/pricing')}
        />
      } />
      <Route path="/static-qr-codes" element={
        <StaticQR
          onViewDashboard={() => navigate('/dashboard')}
          onViewPricing={() => navigate('/pricing')}
        />
      } />
      <Route path="/features" element={
        <Features
          onViewDashboard={() => navigate('/dashboard')}
          onViewPricing={() => navigate('/pricing')}
        />
      } />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={
        <FAQ onViewDashboard={() => navigate('/dashboard')} onViewPricing={() => navigate('/pricing')} onBack={() => navigate('/')} />
      } />
      <Route path="/disclaimer" element={
        <Disclaimer onViewDashboard={() => navigate('/dashboard')} onViewPricing={() => navigate('/pricing')} onBack={() => navigate('/')} />
      } />
      <Route path="/terms" element={
        <TermsOfService onViewDashboard={() => navigate('/dashboard')} onViewPricing={() => navigate('/pricing')} onBack={() => navigate('/')} />
      } />
      <Route path="/privacy" element={
        <PrivacyPolicy onViewDashboard={() => navigate('/dashboard')} onViewPricing={() => navigate('/pricing')} onBack={() => navigate('/')} />
      } />
      <Route path="/refund" element={
        <RefundPolicy onViewDashboard={() => navigate('/dashboard')} onViewPricing={() => navigate('/pricing')} onBack={() => navigate('/')} />
      } />
      <Route path="/about" element={
        <About onViewDashboard={() => navigate('/dashboard')} onViewPricing={() => navigate('/pricing')} onBack={() => navigate('/')} />
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

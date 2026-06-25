import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './LandingPage';
import EditorPage from './EditorPage';
import Dashboard from './Dashboard';
import Pricing from './Pricing';
import QRCodeTypes from './QRCodeTypes';
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

import React from 'react';
import EditorPage from './EditorPage';
import TopBar from './TopBar';
import { useAuth } from './contexts/AuthContext';

const LandingPage = ({ onViewDashboard, onViewPricing, qrCodeToEdit, onClearQrCodeToEdit }) => {
  const { setUser } = useAuth();

  const handlePricingClick = () => {
    if (onViewPricing) {
      onViewPricing();
    } else {
      console.log('Pricing clicked');
    }
  };

  const handleSignUpClick = () => {
    console.log('Sign Up clicked');
  };

  const handleLoginClick = () => {
    console.log('Login clicked');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      color: '#fff',
      padding: '0',
      margin: '0',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      overflow: 'hidden',
    }}>
      <TopBar 
        onViewDashboard={onViewDashboard}
        onViewPricing={handlePricingClick}
        onSignUp={handleSignUpClick}
        onLogin={handleLoginClick}
        onGoToLanding={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Hero Section */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px 120px',
      }}>
        {/* Subtitle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '18px',
          padding: '10px 20px',
          border: '1px solid rgba(0, 217, 255, 0.3)',
          borderRadius: '30px',
          color: '#00D9FF',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          <span style={{ fontSize: '16px' }}>✨</span>
          Next-Gen QR Code Generator
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: '56px',
          fontWeight: '900',
          lineHeight: '1.1',
          margin: '0 0 18px 0',
          letterSpacing: '-1px',
        }}>
          <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
            Create QR Codes 
          </span>
          <span style={{ color: '#ffffff' }}> That Pop</span>
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#a0a0a0',
          maxWidth: '700px',
          marginBottom: '10px',
        }}>
          Generate fully customized QR codes with{' '}
          <span style={{ color: '#00D9FF' }}>stunning stickers</span>, vibrant colors, and advanced features for your brand.
        </p>

        <div style={{ width: '100%', maxWidth: '1200px', marginTop: '10px' }}>
          <EditorPage embedded qrCodeToEdit={qrCodeToEdit} onClearQrCodeToEdit={onClearQrCodeToEdit} />
        </div>

        {/* Benefits Section */}
        <div style={{
          marginTop: '80px',
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          maxWidth: '1200px',
          padding: '0 40px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            textAlign: 'right',
            maxWidth: '700px',
          }}>
            <h2 style={{
              fontSize: '42px',
              fontWeight: '900',
              color: '#ffffff',
              margin: '0 0 20px 0',
              letterSpacing: '-1px',
            }}>
              Benefits of <span style={{ color: '#00D9FF' }}>stiQR.top</span>
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#a0a0a0',
              lineHeight: '1.7',
              margin: '0 0 30px 0',
            }}>
              By using stiQR.top you will be able attract people to your business, making them easily choose you over the competitors.
            </p>
            <p style={{
              fontSize: '16px',
              color: '#a0a0a0',
              lineHeight: '1.7',
              margin: '0 0 30px 0',
            }}>
              <strong style={{ color: '#FF00FF' }}>Why?</strong><br />
              Because stiQR allows you to add stickers or logos over your QR codes, making it different from the usual bland black and white QR code. Do you want to get noticed instantly? Change the colors, add frames and place your logo over the QR code.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '12px',
            }}>
              {[
                'Dynamic QR Codes',
                'Static QR Codes',
                'QR Code Statistics',
                'Customized Colors & Shapes for QR Codes',
                'No Coding Required',
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  color: '#ffffff',
                  fontWeight: '500',
                }}>
                  <span>{item}</span>
                  <span style={{
                    color: '#00D9FF',
                    fontSize: '20px',
                    fontWeight: '700',
                  }}>✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
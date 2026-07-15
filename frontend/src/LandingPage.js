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
          Smart QR Code Generator with Analytics
        </div>

        {/* Main Heading - Single H1 */}
        <h1 className="landing-hero-title" style={{
          fontSize: '56px',
          fontWeight: '900',
          lineHeight: '1.1',
          margin: '0 0 18px 0',
          letterSpacing: '-1px',
        }}>
          <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
            Create Smart QR Codes 
          </span>
          <span style={{ color: '#ffffff' }}> with Analytics</span>
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#a0a0a0',
          maxWidth: '700px',
          marginBottom: '10px',
        }}>
          Generate dynamic, trackable QR codes with{' '}
          <span style={{ color: '#00D9FF' }}>stunning stickers</span>, vibrant colors, and real-time analytics for your brand.
        </p>

        <div style={{ width: '100%', maxWidth: '1200px', marginTop: '10px' }}>
          <EditorPage embedded qrCodeToEdit={qrCodeToEdit} onClearQrCodeToEdit={onClearQrCodeToEdit} />
        </div>

        {/* ===== How Does It Work? Section ===== */}
        <section style={{
          width: '100%',
          maxWidth: '1200px',
          padding: '80px 40px 40px',
          boxSizing: 'border-box',
          position: 'relative',
        }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '900',
            color: '#ffffff',
            textAlign: 'center',
            margin: '0 0 60px 0',
            letterSpacing: '-1px',
          }}>
            How Our Dynamic QR Code Generator <span style={{ color: '#00D9FF' }}>Works</span>
          </h2>

          {/* Phase 1: Creating a QR Code */}
          <div style={{ marginBottom: '80px' }}>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#FF00FF',
              margin: '0 0 40px 0',
              textAlign: 'center',
              textShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
            }}>
              ✨ Creating a QR Code
            </h3>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '0',
              position: 'relative',
              flexWrap: 'wrap',
            }}>
              {/* Light string connector */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #00D9FF, #FF00FF, #00D9FF, transparent)',
                opacity: '0.4',
                zIndex: '0',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: '6px',
                background: 'linear-gradient(90deg, transparent, #00D9FF, #FF00FF, #00D9FF, transparent)',
                opacity: '0.15',
                filter: 'blur(4px)',
                zIndex: '0',
              }} />

              {/* Step 1: Select Type */}
              <div style={{
                flex: '1',
                minWidth: '220px',
                maxWidth: '280px',
                margin: '0 10px',
                position: 'relative',
                zIndex: '1',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  height: '100%',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00D9FF';
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 217, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 217, 255, 0.05))',
                    border: '2px solid rgba(0, 217, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '36px',
                  }}>
                    📋
                  </div>
                  <h4 style={{ color: '#00D9FF', fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>
                    1. Choose Your Content
                  </h4>
                  <p style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: '1.5', margin: '0' }}>
                    Pick from URLs, events, social media pages, WiFi credentials, and more. There's a QR type for every need.
                  </p>
                </div>
              </div>

              {/* Step 2: Type Content */}
              <div style={{
                flex: '1',
                minWidth: '220px',
                maxWidth: '280px',
                margin: '0 10px',
                position: 'relative',
                zIndex: '1',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 0, 255, 0.3)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  height: '100%',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF00FF';
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 0, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 0, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(255, 0, 255, 0.05))',
                    border: '2px solid rgba(255, 0, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '36px',
                  }}>
                    ✏️
                  </div>
                  <h4 style={{ color: '#FF00FF', fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>
                    2. Type the Content
                  </h4>
                  <p style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: '1.5', margin: '0' }}>
                    Enter your URL, text, or any data. Our smart editor will generate a QR code instantly.
                  </p>
                </div>
              </div>

              {/* Step 3: Add Colors & Logos */}
              <div style={{
                flex: '1',
                minWidth: '220px',
                maxWidth: '280px',
                margin: '0 10px',
                position: 'relative',
                zIndex: '1',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  height: '100%',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00D9FF';
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 217, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 217, 255, 0.05))',
                    border: '2px solid rgba(0, 217, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '36px',
                  }}>
                    🎨
                  </div>
                  <h4 style={{ color: '#00D9FF', fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>
                    3. Add Colors & Logos
                  </h4>
                  <p style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: '1.5', margin: '0' }}>
                    Customize with vibrant colors, stickers, and your own logo. Make your QR code stand out!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2: Managing a QR Code (Pro & Ultra) */}
          <div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#00D9FF',
              margin: '0 0 40px 0',
              textAlign: 'center',
              textShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
            }}>
              🚀 Managing a QR Code <span style={{ fontSize: '16px', fontWeight: '500', color: '#FF00FF' }}>Pro & Ultra</span>
            </h3>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '0',
              position: 'relative',
              flexWrap: 'wrap',
            }}>
              {/* Light string connector */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '15%',
                right: '15%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #FF00FF, #00D9FF, transparent)',
                opacity: '0.4',
                zIndex: '0',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '15%',
                right: '15%',
                height: '6px',
                background: 'linear-gradient(90deg, transparent, #FF00FF, #00D9FF, transparent)',
                opacity: '0.15',
                filter: 'blur(4px)',
                zIndex: '0',
              }} />

              {/* Step 1: Dashboard */}
              <div style={{
                flex: '1',
                minWidth: '260px',
                maxWidth: '340px',
                margin: '0 15px',
                position: 'relative',
                zIndex: '1',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 0, 255, 0.3)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  height: '100%',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF00FF';
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 0, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 0, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(255, 0, 255, 0.05))',
                    border: '2px solid rgba(255, 0, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '36px',
                  }}>
                    📊
                  </div>
                  <h4 style={{ color: '#FF00FF', fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>
                    1. Go to Dashboard
                  </h4>
                  <p style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: '1.5', margin: '0' }}>
                    Access your personal dashboard where all your QR codes are stored and organized.
                  </p>
                </div>
              </div>

              {/* Step 2: Change Metadata */}
              <div style={{
                flex: '1',
                minWidth: '260px',
                maxWidth: '340px',
                margin: '0 15px',
                position: 'relative',
                zIndex: '1',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  height: '100%',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00D9FF';
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 217, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 217, 255, 0.05))',
                    border: '2px solid rgba(0, 217, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '36px',
                  }}>
                    🔄
                  </div>
                  <h4 style={{ color: '#00D9FF', fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>
                    2. Change Metadata
                  </h4>
                  <p style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: '1.5', margin: '0' }}>
                    Update the destination URL or content anytime. No need to regenerate the QR code!
                  </p>
                </div>
              </div>

              {/* Step 3: Check Statistics */}
              <div style={{
                flex: '1',
                minWidth: '260px',
                maxWidth: '340px',
                margin: '0 15px',
                position: 'relative',
                zIndex: '1',
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 0, 255, 0.3)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  height: '100%',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF00FF';
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 0, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 0, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(255, 0, 255, 0.05))',
                    border: '2px solid rgba(255, 0, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '36px',
                  }}>
                    📈
                  </div>
                  <h4 style={{ color: '#FF00FF', fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>
                    3. Check Statistics
                  </h4>
                  <p style={{ color: '#a0a0a0', fontSize: '13px', lineHeight: '1.5', margin: '0' }}>
                    Track scans, locations, and devices. See how your audience interacts with your QR codes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section - Two Columns */}
        <div style={{
          marginTop: '80px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          padding: '0 40px',
          boxSizing: 'border-box',
          gap: '60px',
        }}
          className="benefits-section"
        >
          <style>{`
            .benefits-section {
              flex-direction: row;
            }
            @media (max-width: 768px) {
              .benefits-section {
                flex-direction: column !important;
                text-align: center !important;
                gap: 30px !important;
                padding: 0 20px !important;
              }
              .benefits-section .benefits-gif-wrapper {
                min-height: auto !important;
                margin-bottom: 0 !important;
              }
              .benefits-section .benefits-text-column {
                text-align: center !important;
                max-width: 100% !important;
              }
              .benefits-section .benefits-text-column h2 {
                text-align: center !important;
              }
              .benefits-section .benefits-text-column p {
                text-align: center !important;
              }
              .benefits-section .benefits-checkmarks {
                align-items: center !important;
              }
            }
          `}</style>
          {/* Left Column - Animated QR Cards */}
          <div className="benefits-gif-wrapper" style={{
            flex: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '500px',
            position: 'relative',
          }}>
            {/* Dim glow behind the cards */}
            <div style={{
              position: 'absolute',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 217, 255, 0.12) 0%, rgba(255, 0, 255, 0.08) 40%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }} />
            <style>{`
              .wrap_card {
                position: relative;
                overflow: hidden;
                width: var(--w-wrap-card);
                height: calc(var(--h-card) / 1.25);
                display: flex;
                align-items: center;
                justify-content: center;
                --w-card: 225px;
                --h-card: 300px;
                --rotate-card: 15deg;
                --insetX-card: 42px;
                --t-card: calc(var(--insetX-card) * 1.25);
                --w-wrap-card: calc(var(--w-card) + calc(calc(var(--w-card) / 2) * 2));
              }

              .content {
                background-color: #ffffff50;
                overflow: hidden;
                position: relative;
                width: calc(100% - calc(var(--pd) * 2));
                height: calc(100% - calc(var(--pd) * 2));
                border-radius: calc(var(--round) - var(--pd));
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .content > img {
                width: 80%;
                height: 80%;
                object-fit: contain;
                position: absolute;
                inset: 50% 0 0 50%;
                opacity: 1;
                transform: translate(-50%, -50%);
              }

              .card {
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                overflow: hidden;
                animation: rotating 9s cubic-bezier(0.75, 0, 0, 1.01) infinite 0s;
                border-radius: var(--round);
                background: var(--bg);
                order: var(--order);
                width: var(--w-card);
                height: var(--h-card);
                z-index: var(--z1);
                top: var(--t1);
                left: var(--l1);
                right: var(--r1);
                transform: var(--trans1);
                --pd: 4px;
                --round: 16px;
                --x1: var(--insetX-card);
                --x2: calc(var(--w-wrap-card) - calc(var(--w-card) + var(--insetX-card)));
                --to-left: rotate(calc(var(--rotate-card) * -1));
                --to-center: calc(var(--w-card) / 2);
                --to-right: rotate(calc(var(--rotate-card) * 1));
              }

              .card:nth-child(1) {
                --order: 2;
                --bg: radial-gradient(
                  circle,
                  rgba(252, 240, 142, 1) 0%,
                  rgba(246, 173, 32, 1) 40%,
                  rgba(192, 142, 8, 1) 100%
                );
                --z1: 2;
                --t1: 0;
                --l1: var(--to-center);
                --r1: var(--to-center);
                --trans1: rotate(calc(var(--rotate-card) * 0));
                --z2: 0;
                --t2: var(--t-card);
                --l2: var(--x1);
                --r2: var(--x2);
                --trans2: var(--to-left);
                --z3: 0;
                --t3: var(--t-card);
                --l3: var(--x2);
                --r3: var(--x1);
                --trans3: var(--to-right);
              }
              .card:nth-child(2) {
                --order: 3;
                --bg: radial-gradient(
                  circle,
                  rgba(142, 249, 252, 1) 0%,
                  rgba(32, 164, 246, 1) 40%,
                  rgba(8, 81, 192, 1) 100%
                );
                --z1: 0;
                --t1: var(--t-card);
                --l1: var(--x2);
                --r1: var(--x1);
                --trans1: var(--to-right);
                --z2: 2;
                --t2: 0;
                --l2: var(--to-center);
                --r2: var(--to-center);
                --trans2: rotate(calc(var(--rotate-card) * 0));
                --z3: 0;
                --t3: var(--t-card);
                --l3: var(--x1);
                --r3: var(--x2);
                --trans3: var(--to-left);
              }
              .card:nth-child(3) {
                --order: 1;
                --bg: radial-gradient(
                  circle,
                  rgba(222, 128, 233, 1) 0%,
                  rgba(213, 32, 246, 1) 40%,
                  rgba(139, 6, 157, 1) 100%
                );
                --z1: 0;
                --t1: var(--t-card);
                --l1: var(--x1);
                --r1: var(--x2);
                --trans1: var(--to-left);
                --z2: 0;
                --t2: var(--t-card);
                --l2: var(--x2);
                --r2: var(--x1);
                --trans2: var(--to-right);
                --z3: 2;
                --t3: 0;
                --l3: var(--to-center);
                --r3: var(--to-center);
                --trans3: rotate(calc(var(--rotate-card) * 0));
              }
              @keyframes rotating {
                0%,
                99.99% {
                  z-index: var(--z1);
                  top: var(--t1);
                  left: var(--l1);
                  right: var(--r1);
                  transform: var(--trans1);
                }
                33.33% {
                  z-index: var(--z2);
                  top: var(--t2);
                  left: var(--l2);
                  right: var(--r2);
                  transform: var(--trans2);
                }
                66.66% {
                  z-index: var(--z3);
                  top: var(--t3);
                  left: var(--l3);
                  right: var(--r3);
                  transform: var(--trans3);
                }
              }

              .lines {
                position: absolute;
                inset: auto 0 0;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 4;
              }
              .lines::after {
                content: "";
                width: 100%;
                height: 0px;
                position: absolute;
                z-index: 2;
                inset: 0;
                --mask-bg: #e8e8e8;
                background: var(--mask-bg);
                mask-image: radial-gradient(
                  50% 200px at top,
                  transparent 20%,
                  var(--mask-bg)
                );
              }

              .line {
                position: absolute;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .line::before,
              .line::after {
                content: "";
                position: absolute;
                inset: auto;
                background: linear-gradient(
                  to right,
                  var(--gradient-a-line, #0000),
                  var(--gradient-b-line, #0000),
                  var(--gradient-c-line, #0000)
                );
                filter: var(--blur-line);
                width: var(--w-line);
                height: var(--h-line);
              }
              .line:nth-child(1)::before {
                --blur-line: blur(4px);
                --w-line: 100%;
                --h-line: 5px;
                --gradient-b-line: #2f69f2;
              }
              .line:nth-child(1)::after {
                --w-line: 100%;
                --h-line: 1px;
                --gradient-b-line: #6366f1;
              }
              .line:nth-child(2)::before {
                --blur-line: blur(4px);
                --w-line: 50%;
                --h-line: 5px;
                --gradient-b-line: #84ccfc;
              }
              .line:nth-child(2)::after {
                --w-line: 50%;
                --h-line: 1px;
                --gradient-b-line: #14d3f5;
              }
            `}</style>
            <div className="wrap_card">
              <div className="card">
                <div className="content">
                  <img src="/assets/stiqr-qrcode.png" alt="Dynamic QR code generator with analytics dashboard" />
                </div>
              </div>
              <div className="card">
                <div className="content">
                  <img src="/assets/stiqr-qrcode.png" alt="Trackable QR code with real-time scan tracking" />
                </div>
              </div>
              <div className="card">
                <div className="content">
                  <img src="/assets/stiqr-qrcode.png" alt="Custom QR code with stickers and branding" />
                </div>
              </div>
              <div className="lines">
                <div className="line"></div>
                <div className="line"></div>
              </div>
            </div>
          </div>

          {/* Right Column - Benefits Content */}
          <div className="benefits-text-column" style={{
            flex: '1',
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
              QR Code Analytics & <span style={{ color: '#00D9FF' }}>Benefits</span>
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#a0a0a0',
              lineHeight: '1.7',
              margin: '0 0 30px 0',
            }}>
              By using stiQR.top you will be able attract people to your business with dynamic QR codes and real-time analytics, making them easily choose you over the competitors.
            </p>
            <p style={{
              fontSize: '16px',
              color: '#a0a0a0',
              lineHeight: '1.7',
              margin: '0 0 30px 0',
            }}>
              <strong style={{ color: '#FF00FF' }}>Why?</strong><br />
              Because stiQR allows you to add stickers or logos over your QR codes, making it different from the usual bland black and white QR code. Do you want to get noticed instantly? Change the colors, add frames and place your logo over the QR code. Our QR code generator with analytics helps you track every scan.
            </p>
            <div className="benefits-checkmarks" style={{
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

      {/* ===== Our Logos Section ===== */}
      <section style={{
        padding: '60px 20px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderTop: '1px solid rgba(0, 217, 255, 0.1)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#00D9FF',
          marginBottom: '16px',
        }}>
          Our Logos
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#a0a0a0',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: '1.6',
        }}>
          We thank <a href="https://www.flaticon.com" target="_blank" rel="noopener noreferrer" style={{ color: '#FF00FF', textDecoration: 'underline' }}>Flaticon</a> for providing the commonly used logos. 
          Click on a logo below to copy the original attribution link.
        </p>

        <style>{`
          .logo-container-items {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
            transform-style: preserve-3d;
            transform: perspective(1000px);
            max-width: 800px;
            margin: 0 auto;
          }

          .logo-item {
            position: relative;
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            border: none;
            outline: none;
            transition: 500ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
            cursor: pointer;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
          }

          .logo-item img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            pointer-events: none;
          }

          .logo-item::before {
            position: absolute;
            content: attr(data-tooltip);
            left: 50%;
            bottom: 58px;
            font-size: 10px;
            line-height: 14px;
            transform: translateX(-50%);
            padding: 4px 8px;
            background-color: #ffffff;
            color: #000;
            border-radius: 6px;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            transition: 500ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
            white-space: nowrap;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .logo-item:hover {
            transform: scale(1.5);
            z-index: 99999;
          }

          .logo-item:hover::before {
            opacity: 1;
            visibility: visible;
          }

          .logo-item:active {
            transform: scale(1.1);
          }

          .logo-item:hover + .logo-item {
            transform: scale(1.3);
            z-index: 9999;
          }

          .logo-item:hover + .logo-item + .logo-item {
            transform: scale(1.15);
            z-index: 999;
          }

          .logo-item:has(+ .logo-item:hover) {
            transform: scale(1.3);
            z-index: 9999;
          }

          .logo-item:has(+ .logo-item + .logo-item:hover) {
            transform: scale(1.15);
            z-index: 999;
          }

          .logo-toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #00D9FF;
            color: #000;
            padding: 10px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 99999;
            animation: fadeInUp 0.3s ease, fadeOut 0.3s ease 2s forwards;
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }

          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `}</style>

        <div className="logo-container-items">
          {[
            { name: 'whatsapp', file: 'whatsapp.png', link: 'https://www.flaticon.com/free-icons/whatsapp', attribution: 'Whatsapp icons created by cobynecz - Flaticon' },
            { name: 'wechat', file: 'wechat.png', link: 'https://www.flaticon.com/free-icons/wechat', attribution: 'Wechat icons created by Ruslan Babkin - Flaticon' },
            { name: 'wifi', file: 'wifi.png', link: 'https://www.flaticon.com/free-icons/wifi-signal', attribution: 'Wifi signal icons created by Flat Icons - Flaticon' },
            { name: 'paypal', file: 'paypal.png', link: 'https://www.flaticon.com/free-icons/payments', attribution: 'Payments icons created by Andrew Dynamite - Flaticon' },
            { name: 'link', file: 'link.png', link: 'https://www.flaticon.com/free-icons/link', attribution: 'Link icons created by Rizki Ahmad Fauzi - Flaticon' },
            { name: 'bitcoin', file: 'bitcoin.png', link: 'https://www.flaticon.com/free-icons/cryptocurrency', attribution: 'Cryptocurrency icons created by Freepik - Flaticon' },
            { name: 'mail', file: 'mail.png', link: 'https://www.flaticon.com/free-icons/inbox', attribution: 'Inbox icons created by meaicon - Flaticon' },
            { name: 'instagram', file: 'instagram.png', link: 'https://www.flaticon.com/free-icons/instagram', attribution: 'Instagram icons created by cobynecz - Flaticon' },
            { name: 'tiktok', file: 'tiktok.png', link: 'https://www.flaticon.com/free-icons/tik-tok', attribution: 'Tik tok icons created by Rakib Hassan Rahim - Flaticon' },
            { name: 'facebook', file: 'facebook.png', link: 'https://www.flaticon.com/free-icons/facebook', attribution: 'Facebook icons created by Enamo Studios - Flaticon' },
            { name: 'linkedin', file: 'linkedin.png', link: 'https://www.flaticon.com/free-icons/linkedin', attribution: 'Linkedin icons created by riajulislam - Flaticon' },
            { name: 'youtube', file: 'youtube.png', link: 'https://www.flaticon.com/free-icons/youtube', attribution: 'Youtube icons created by Freepik - Flaticon' },
            { name: 'pinterest', file: 'pinterest.png', link: 'https://www.flaticon.com/free-icons/pinterest', attribution: 'Pinterest icons created by Smashicons - Flaticon' },
            { name: 'reddit', file: 'reddit.png', link: 'https://www.flaticon.com/free-icons/reddit', attribution: 'Reddit icons created by Md Tanvirul Haque - Flaticon' },
            { name: 'telegram', file: 'telegram.png', link: 'https://www.flaticon.com/free-icons/telegram', attribution: 'Telegram icons created by Pixel perfect - Flaticon' },
            { name: 'github', file: 'github.png', link: 'https://www.flaticon.com/free-icons/github', attribution: 'Github icons created by Pixel perfect - Flaticon' },
            { name: 'spotify', file: 'spotify.png', link: 'https://www.flaticon.com/free-icons/spotify-sketch', attribution: 'Spotify sketch icons created by Fathema Khanom - Flaticon' },
            { name: 'messenger', file: 'messenger.png', link: 'https://www.flaticon.com/free-icons/facebook', attribution: 'Facebook icons created by Pixel perfect - Flaticon' },
            { name: 'venmo', file: 'venmo.png', link: 'https://www.flaticon.com/free-icons/venmo', attribution: 'Venmo icons created by Freepik - Flaticon' },
            { name: 'x', file: 'x.png', link: 'https://www.flaticon.com/free-icons/brands-and-logotypes', attribution: 'Brands and logotypes icons created by Freepik - Flaticon' },
          ].map((logo) => (
            <LogoCard key={logo.name} logo={logo} />
          ))}
        </div>
      </section>

      {/* ===== What Do People Think? Section ===== */}
      <section style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
      }}
        className="testimonials-section"
      >
        <style>{`
          .testimonials-section .testimonials-container {
            display: flex;
            justify-content: center;
            align-items: stretch;
            gap: 0;
            overflow: visible;
            padding: 20px 0;
            position: relative;
          }
          @media (max-width: 768px) {
            .testimonials-section .testimonials-container {
              overflow-x: auto !important;
              overflow-y: hidden !important;
              justify-content: flex-start !important;
              gap: 16px !important;
              padding: 20px 4px 16px !important;
              scroll-snap-type: x mandatory !important;
              -webkit-overflow-scrolling: touch !important;
              scrollbar-width: thin !important;
              scrollbar-color: #00D9FF rgba(0, 217, 255, 0.1) !important;
            }
            .testimonials-section .testimonials-container::-webkit-scrollbar {
              height: 4px;
            }
            .testimonials-section .testimonials-container::-webkit-scrollbar-track {
              background: rgba(0, 217, 255, 0.1);
              border-radius: 2px;
            }
            .testimonials-section .testimonials-container::-webkit-scrollbar-thumb {
              background: #00D9FF;
              border-radius: 2px;
            }
            .testimonials-section .testimonial-group {
              flex: 0 0 auto !important;
              width: 280px !important;
              margin-left: 0 !important;
              scroll-snap-align: start !important;
            }
          }
        `}</style>
        <h2 style={{
          textAlign: 'center',
          fontSize: '36px',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '60px',
          letterSpacing: '1px',
        }}>
          What do people <span style={{ color: '#00D9FF' }}>think?</span>
        </h2>

        <div className="testimonials-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: '0',
          overflow: 'visible',
          padding: '20px 0',
          position: 'relative',
        }}>

          {[
            {
              category: 'Restaurant',
              color: '#FF6B35',
              gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)',
              emoji: '🍽️',
              reviews: [
                {
                  text: '"I switched my restaurant to StiQR menus 3 months ago. Before, I was spending €200/month on printing new menus every time we changed dishes. Now I just update the QR code from my laptop and customers see the changes instantly. My waiters love it because they don\'t have to memorize the daily specials anymore. Best investment I made this year."',
                  author: 'Marco R.',
                  title: 'Restaurant Owner, Rome'
                },
                {
                  text: '"Our cafe is small and we don\'t have a website. StiQR gave us a digital menu that customers can scan at their table. We added photos of our pastries and now people order more. We\'re a local spot, but this makes us feel modern."',
                  author: 'Sarah K.',
                  title: 'Cafe Owner, London'
                },
                {
                  text: '"I run a food truck and move locations every day. With StiQR, I just update the menu from my phone when I change locations. Customers scan and see where I am, what\'s available, and what\'s sold out. It\'s eliminated so many questions."',
                  author: 'Diego M.',
                  title: 'Food Truck Operator, Barcelona'
                }
              ]
            },
            {
              category: 'Wedding',
              color: '#FF69B4',
              gradient: 'linear-gradient(135deg, #FF69B4 0%, #FF8DC7 100%)',
              emoji: '💒',
              reviews: [
                {
                  text: '"For our wedding, we used StiQR for the RSVPs, the photo gallery, and the seating plan. Instead of printing 150 paper invitations with QR codes, we sent one digital invite. Guests scanned it to see the wedding website, RSVP, and even upload their photos to our wedding gallery. It made everything so much simpler for us and our guests."',
                  author: 'Emma T.',
                  title: 'Bride, Dublin'
                },
                {
                  text: '"I organize corporate events and conferences. Before StiQR, I was printing thousands of flyers and brochures. Now I just print one QR code on the welcome sign. Attendees scan and get the schedule, speaker bios, venue map, and all updates in real-time. If the schedule changes, I just update it on StiQR and everyone sees it instantly."',
                  author: 'James W.',
                  title: 'Event Planner, Sydney'
                },
                {
                  text: '"I\'ve been a wedding planner for 8 years. StiQR has become my secret weapon. I create one QR code for each wedding and put it on the invitation. Guests scan to see the venue map, accommodation options, gift registry, and the couple\'s story. The couples love it because they don\'t have to answer the same questions 50 times."',
                  author: 'Lisa H.',
                  title: 'Wedding Planner, LA'
                }
              ]
            },
            {
              category: 'Retail',
              color: '#4CAF50',
              gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
              emoji: '🛍️',
              reviews: [
                {
                  text: '"I sell handmade jewelry at markets. People want to see my full collection online, but they never remember my website. Now I have a QR code on my booth that takes them directly to my online shop. After they scan, they can order later or follow me on Instagram. My online sales have doubled since I started using StiQR."',
                  author: 'Amara J.',
                  title: 'Jewelry Maker, Cape Town'
                },
                {
                  text: '"I\'m a real estate agent. I used to print 100 brochures for each property, and most ended up in the bin. Now I put a StiQR code on the \'For Sale\' sign. Buyers scan it and see all the photos, the floor plan, and the virtual tour. The agent gets a notification when someone is interested. It\'s better for the environment and my wallet. I\'ve had 30% more inquiries since I switched."',
                  author: 'Robert L.',
                  title: 'Realtor, Austin'
                },
                {
                  text: '"We send proposals and case studies to clients. StiQR lets us put a QR code on our business cards and reports. Clients scan it and go straight to our portfolio. We can see exactly which clients are interested because StiQR tracks the scans."',
                  author: 'Mei L.',
                  title: 'Consulting Agency, Singapore'
                }
              ]
            },
            {
              category: 'Marketing',
              color: '#9C27B0',
              gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
              emoji: '📱',
              reviews: [
                {
                  text: '"We have a small marketing team and limited budget. StiQR helped us create landing pages for our campaigns quickly. Instead of using expensive landing page builders, we just update our QR codes with new content."',
                  author: 'Anna M.',
                  title: 'Marketing Manager, NYC'
                },
                {
                  text: '"I use StiQR on my portfolio. I add a QR code to my business card and it shows potential clients my latest work. I can update it easily and track if people are actually looking at it."',
                  author: 'Jake P.',
                  title: 'Graphic Designer, Berlin'
                },
                {
                  text: '"For our new book release, we used QR codes on posters and in the book itself. Readers scanned the code to get a free chapter. This helped us build our email list and connect with readers. We even got reviews from them. We\'ll definitely use this for future publications."',
                  author: 'Sarah L.',
                  title: 'Publisher, Toronto'
                }
              ]
            }
          ].map((group, groupIndex) => (
            <div
              key={group.category}
              className="testimonial-group"
              style={{
                flex: '0 0 auto',
                width: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginLeft: groupIndex === 0 ? '0' : '-60px',
                zIndex: groupIndex === 1 ? 3 : groupIndex === 2 ? 2 : 1,
                position: 'relative',
                transition: 'all 0.3s ease',
              }}

              onMouseEnter={(e) => {
                const cards = e.currentTarget.parentElement.children;
                for (let i = 0; i < cards.length; i++) {
                  if (i <= groupIndex) {
                    cards[i].style.marginLeft = i === 0 ? '0' : '8px';
                  } else {
                    cards[i].style.marginLeft = '8px';
                  }
                }
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.zIndex = '10';
              }}
              onMouseLeave={(e) => {
                const cards = e.currentTarget.parentElement.children;
                for (let i = 0; i < cards.length; i++) {
                  if (i === 0) {
                    cards[i].style.marginLeft = '0';
                  } else {
                    cards[i].style.marginLeft = '-60px';
                  }
                }
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = groupIndex === 1 ? 3 : groupIndex === 2 ? 2 : 1;
              }}
            >
              {/* Category Header */}
              <div style={{
                background: group.gradient,
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: `0 4px 20px ${group.color}40`,
              }}>
                <span style={{ fontSize: '36px' }}>{group.emoji}</span>
                <h3 style={{
                  margin: '8px 0 0 0',
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: '700',
                }}>
                  {group.category}
                </h3>
              </div>

              {/* Review Cards */}
              {group.reviews.map((review, reviewIndex) => (
                <div
                  key={reviewIndex}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${group.color}30`,
                    borderRadius: '12px',
                    padding: '16px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `rgba(255, 255, 255, 0.1)`;
                    e.currentTarget.style.borderColor = `${group.color}60`;
                    e.currentTarget.style.transform = 'translateX(8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = `${group.color}30`;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <p style={{
                    margin: '0 0 12px 0',
                    color: '#ddd',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                  }}>
                    {review.text}
                  </p>
                  <div style={{
                    borderTop: `1px solid ${group.color}30`,
                    paddingTop: '10px',
                  }}>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                      {review.author}
                    </div>
                    <div style={{ color: group.color, fontSize: '11px', fontWeight: '500' }}>
                      {review.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ===== Trust Badges Footer ===== */}
      <section style={{
        padding: '60px 20px 40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '32px 48px',
        }}>
          
          {/* SSL Secured */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#aaa',
            fontSize: '13px',
            fontWeight: '500',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>SSL Secured</span>
          </div>

          {/* Payment Logos */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <img src="/assets/payment/visa.svg" alt="Visa" style={{ height: '48px', opacity: 0.5 }} />
            <img src="/assets/payment/mastercard.svg" alt="Mastercard" style={{ height: '48px', opacity: 0.5 }} />
            <img src="/assets/payment/paypal.svg" alt="PayPal" style={{ height: '48px', opacity: 0.5 }} />
            <img src="/assets/payment/stripe.svg" alt="Stripe" style={{ height: '48px', opacity: 0.5 }} />
          </div>

          {/* GDPR Compliant */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#aaa',
            fontSize: '13px',
            fontWeight: '500',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>GDPR Compliant</span>
          </div>

          {/* 7-Day Free Trial */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.12) 0%, rgba(255, 0, 255, 0.12) 100%)',
            border: '1px solid rgba(0, 217, 255, 0.2)',
            fontSize: '13px',
            fontWeight: '600',
            color: '#00D9FF',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>7-Day Free Trial</span>
          </div>

        </div>
      </section>

    </div>
  );
};

function LogoCard({ logo }) {
  const [toast, setToast] = React.useState(null);

  const handleClick = async () => {
    const fullLink = `<a href="${logo.link}" title="${logo.name} icons">${logo.attribution}</a>`;
    try {
      await navigator.clipboard.writeText(fullLink);
      setToast(`✅ Copied: ${logo.name} attribution link!`);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = fullLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setToast(`✅ Copied: ${logo.name} attribution link!`);
    }
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <>
      <button
        className="logo-item"
        data-tooltip={logo.name}
        onClick={handleClick}
        aria-label={`Copy attribution link for ${logo.name}`}
      >
        <img src={`/logos/${logo.file}`} alt={logo.name} />
      </button>
      {toast && <div className="logo-toast">{toast}</div>}
    </>
  );
}

export default LandingPage;

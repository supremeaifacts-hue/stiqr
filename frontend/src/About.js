import React from 'react';
import TopBar from './TopBar';
import { useAuth } from './contexts/AuthContext';

const About = ({ onViewDashboard, onViewPricing, onBack }) => {
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
      overflowX: 'hidden',
    }}>
      <TopBar 
        onViewDashboard={onViewDashboard}
        onViewPricing={handlePricingClick}
        onSignUp={handleSignUpClick}
        onLogin={handleLoginClick}
        onGoToLanding={onBack}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Section 1: Hero Section */}
      <section style={{
        position: 'relative',
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Background gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.85) 0%, rgba(26, 10, 46, 0.5) 50%, rgba(10, 10, 10, 0.85) 100%)',
          zIndex: 1,
        }} />
        
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(0, 217, 255, 0.04)',
          filter: 'blur(60px)',
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '8%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 0, 255, 0.03)',
          filter: 'blur(80px)',
          zIndex: 0,
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 20px',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
            padding: '10px 20px',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            borderRadius: '30px',
            color: '#00D9FF',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            <span style={{ fontSize: '16px' }}>✨</span>
            The Genesis
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: '900',
            lineHeight: '1.1',
            margin: '0 0 24px 0',
            letterSpacing: '-1px',
          }}>
            The Story Behind{' '}
            <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
              Stiqr Precision
            </span>
          </h1>

          <p style={{
            fontSize: '18px',
            lineHeight: '1.7',
            color: '#a0a0a0',
            maxWidth: '650px',
            margin: '0 auto',
          }}>
            A vision born in the high-tech streets of Shanghai, refined with the precision of Italian design, to connect the physical world to digital excellence.
          </p>

          <div style={{ marginTop: '48px' }}>
            <a
              href="#inspiration"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('inspiration');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#fff',
                textDecoration: 'none',
                animation: 'bounce 2s infinite',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '24px' }}>↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* Section 2: The Inspiration */}
      <section id="inspiration" style={{
        padding: '96px 20px',
        background: 'rgba(0, 0, 0, 0.15)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '64px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          {/* Left Content */}
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#fff',
                margin: '0 0 16px 0',
              }}>
                The 2026 Realization
              </h2>
              <div style={{
                width: '80px',
                height: '4px',
                background: '#00D9FF',
                borderRadius: '4px',
              }} />
            </div>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#a0a0a0',
              margin: '0 0 20px 0',
            }}>
              In early 2026, our founder lived in the heart of China's digital revolution. It was there that the profound impact of the QR code became impossible to ignore. From a casual espresso at a neighborhood cafe to settling utility bills and purchasing high-end fashion, the QR code wasn't just a tool—it was the infrastructure of life.
            </p>

            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#a0a0a0',
              margin: '0 0 32px 0',
            }}>
              However, most global implementations felt fragmented and utilitarian. The inspiration for <strong style={{ color: '#00D9FF' }}>Stiqr Precision</strong> came from a desire to take this seamless integration and elevate it with a layer of Italian aesthetic sensibilities and technical reliability.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
            }}>
              <div style={{
                padding: '24px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
              }}>
                <span style={{ fontSize: '28px', color: '#00D9FF', marginBottom: '8px', display: 'block' }}>💳</span>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' }}>Universal Payments</h4>
                <p style={{ fontSize: '13px', color: '#a0a0a0', margin: 0 }}>Frictionless transactions integrated everywhere.</p>
              </div>
              <div style={{
                padding: '24px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
              }}>
                <span style={{ fontSize: '28px', color: '#00D9FF', marginBottom: '8px', display: 'block' }}>🛍️</span>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' }}>Luxury Retail</h4>
                <p style={{ fontSize: '13px', color: '#a0a0a0', margin: 0 }}>Elevating the customer touchpoint experience.</p>
              </div>
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div style={{
            flex: '1 1 400px',
            position: 'relative',
          }}>
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              aspectRatio: '4/5',
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.08), rgba(255, 0, 255, 0.04))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📱</span>
                <p style={{ fontSize: '14px', color: '#a0a0a0', margin: 0 }}>
                  Premium QR Experience
                </p>
              </div>
            </div>
            {/* Decorative blurs */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '192px',
              height: '192px',
              borderRadius: '50%',
              background: 'rgba(0, 217, 255, 0.06)',
              filter: 'blur(60px)',
              zIndex: -1,
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: '-40px',
              width: '256px',
              height: '256px',
              borderRadius: '50%',
              background: 'rgba(255, 0, 255, 0.03)',
              filter: 'blur(60px)',
              zIndex: -1,
            }} />
          </div>
        </div>
      </section>

      {/* Section 3: The Stiqr Manifesto (Bento Layout) */}
      <section style={{
        padding: '96px 20px',
        background: 'rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#fff',
              margin: '0 0 16px 0',
            }}>
              The Stiqr Manifesto
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#a0a0a0',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}>
              We don't just generate codes; we engineer the bridge between physical touchpoints and digital ecosystems.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            {/* Mission Card - spans 2 cols */}
            <div style={{
              gridColumn: 'span 2',
              padding: '40px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.08), rgba(255, 0, 255, 0.03))',
              border: '1px solid rgba(0, 217, 255, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: '#00D9FF',
                  color: '#0a0a0a',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '32px',
                }}>
                  OUR MISSION
                </span>
                <h3 style={{
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: '800',
                  color: '#fff',
                  margin: '0 0 24px 0',
                  lineHeight: '1.1',
                  maxWidth: '500px',
                }}>
                  Bridging physical touchpoints with digital ecosystems.
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: '#a0a0a0',
                  maxWidth: '450px',
                  margin: 0,
                }}>
                  We leverage Italian design principles and precision technology to ensure every QR interaction is beautiful, secure, and instantaneous.
                </p>
              </div>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                padding: '48px',
                opacity: 0.08,
                fontSize: '120px',
                color: '#00D9FF',
                pointerEvents: 'none',
              }}>
                🏛️
              </div>
            </div>

            {/* Vision Card */}
            <div style={{
              padding: '40px',
              borderRadius: '24px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: '#FF00FF',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '32px',
                }}>
                  OUR VISION
                </span>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#fff',
                  margin: '0 0 16px 0',
                }}>
                  A Seamless Global Market
                </h3>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#a0a0a0',
                  margin: 0,
                }}>
                  Bringing the universal QR experience to the global stage, focused on the elite performance requirements of luxury brands and enterprise logistics.
                </p>
              </div>
              <div style={{
                marginTop: '32px',
                paddingTop: '32px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(0, 217, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00D9FF',
                  fontSize: '20px',
                }}>
                  ✓
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                  Precision Guaranteed
                </span>
              </div>
            </div>

            {/* Core Values Card */}
            <div style={{
              padding: '40px',
              borderRadius: '24px',
              background: '#00D9FF',
              color: '#0a0a0a',
            }}>
              <h4 style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                margin: '0 0 24px 0',
                opacity: 0.8,
              }}>
                Core Values
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>💎</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>Italian Aesthetic</p>
                    <p style={{ fontSize: '13px', margin: 0, opacity: 0.8 }}>Design-first approach to tech utility.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>⚡</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>High-Performance</p>
                    <p style={{ fontSize: '13px', margin: 0, opacity: 0.8 }}>Sub-100ms processing times.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>🛡️</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>Military Grade</p>
                    <p style={{ fontSize: '13px', margin: 0, opacity: 0.8 }}>Enterprise-level encryption.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Card - spans 2 cols */}
            <div style={{
              gridColumn: 'span 2',
              padding: '40px',
              borderRadius: '24px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}>
              <div style={{ maxWidth: '400px' }}>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#fff',
                  margin: '0 0 12px 0',
                }}>
                  Ready to start your journey?
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#a0a0a0',
                  margin: 0,
                  lineHeight: '1.6',
                }}>
                  Join the precision revolution at stiqr.top and redefine your physical connectivity.
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #00D9FF, #00D9FF80)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#0a0a0a',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Explore Platform <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Back button */}
      {onBack && (
        <div style={{ textAlign: 'center', padding: '40px 20px 60px' }}>
          <button onClick={onBack} style={{
            padding: '12px 30px',
            background: 'transparent',
            border: '1px solid #00D9FF',
            borderRadius: '20px',
            color: '#00D9FF',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            fontFamily: '"Inter", "Segoe UI", sans-serif',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ← Back to Home
          </button>
        </div>
      )}

      {/* Bounce animation keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default About;

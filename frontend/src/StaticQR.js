import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const StaticQR = ({ onViewDashboard, onViewPricing }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      color: '#fff',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
    }}>
      <TopBar
        onViewDashboard={onViewDashboard}
        onViewPricing={onViewPricing}
        onGoToLanding={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Hero Section */}
      <section style={{
        padding: '80px 20px 60px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-80px',
          left: '-80px',
          width: '300px',
          height: '300px',
          background: 'rgba(0, 217, 255, 0.05)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />
        <div style={{ flex: '1', minWidth: '300px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(0, 217, 255, 0.1)',
            borderRadius: '30px',
            color: '#00D9FF',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '14px' }}>🔒</span>
            PERMANENT SOLUTION
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            lineHeight: '1.1',
            margin: '0 0 20px',
            letterSpacing: '-1px',
          }}>
            Reliable. Simple. Permanent.<br />
            <span style={{ color: '#00D9FF', textShadow: '0 0 24px rgba(0, 217, 255, 0.5)' }}>
              Static QR Codes.
            </span>
          </h1>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            maxWidth: '500px',
            marginBottom: '30px',
          }}>
            The foundation of physical connectivity. Simple to create, permanent by design, and forever free. Perfect for one-time links and permanent information.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                color: '#0a0a0a',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.boxShadow = '0 8px 24px rgba(0, 217, 255, 0.3)'; }}
              onMouseLeave={(e) => { e.target.style.boxShadow = 'none'; }}
            >
              Create Free Static QR
            </button>
            <button
              onClick={() => navigate('/dynamic-qr-codes')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = '#00D9FF'; e.target.style.color = '#00D9FF'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.target.style.color = '#fff'; }}
            >
              Learn Dynamic Benefits
            </button>
          </div>
        </div>
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '540px', position: 'relative', zIndex: 1 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            padding: '8px',
            transform: 'rotate(-1deg)',
            transition: 'transform 0.5s',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(-1deg)'; }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe2GdZw3mBLBC9ZHCFLQh4fSEpVtMWAMyFdWBrRgeyp_n7zsL-CPkq8bQZWho2q5y5pmcnbkMtrtStCY3VTgx05Dry4oJ7Lt0BtaObW-BPuVwp5rEnuB0uHmXfiuaUwfuCU9TQXXXqMa5twUwISv1eKUh3W9_Z5f8LoiOFu4tioGPJZo5qYcVn2EaIt4x5YMmuWlUIALogkRgxU_V2pWwgcnJJA6y8NND_ADTjEhf8hZ6QvMrJuAfLXViVcav2nDgKSfg9RCQAWyOt"
              alt="Static QR Code in museum"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '18px',
                display: 'block',
                aspectRatio: '4/3',
                objectFit: 'cover',
              }}
            />
          </div>
          {/* MonaLisa overlay - positioned at lower-right corner of the main image */}
          <div style={{
            position: 'absolute',
            bottom: '-70px',
            right: '-20px',
            width: '55%',
            maxWidth: '280px',
            borderRadius: '24px',
            border: '3px solid #00D9FF',
            overflow: 'hidden',
            transform: 'rotate(3deg)',
            transition: 'transform 0.5s, box-shadow 0.5s',
            zIndex: 2,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.03)'; e.currentTarget.style.boxShadow = '0 24px 80px rgba(0, 217, 255, 0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(3deg)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.6)'; }}
          >
            <img
              src="/assets/MonaLisa.png"
              alt="Mona Lisa with QR code"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                aspectRatio: '1/1',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{
        padding: '80px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
          }}>
            {[
              {
                icon: '🕰️',
                title: 'Zero Maintenance',
                desc: 'Once printed, they never expire. No subscription required. Ideal for physical assets where information stays the same forever.',
              },
              {
                icon: '⚡',
                title: 'Instant Access',
                desc: 'High-contrast designs for rapid scanning in any environment—even in low-light galleries or outdoor signage.',
              },
              {
                icon: '🏛️',
                title: 'Offline Reliability',
                desc: 'Perfect for museum labels, book covers, and permanent installations where the connection must be as solid as the stone it\'s printed on.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '24px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  fontSize: '32px',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                >
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '16px',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: '#a0a0a0',
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Static QR Types Grid */}
      <section style={{
        padding: '80px 20px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '16px',
            }}>
              Static QR Solutions
            </h2>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#a0a0a0',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Everything you need to bridge the physical-digital gap permanently.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {[
              { icon: '🔗', name: 'Link', desc: 'Direct your audience to any URL permanently.' },
              { icon: '📝', name: 'Text', desc: 'Display plain text on scan without internet.' },
              { icon: '✉️', name: 'Email', desc: 'Pre-fill emails with subject lines and body text.' },
              { icon: '💬', name: 'SMS', desc: 'Trigger text messages instantly.' },
              { icon: '💭', name: 'WhatsApp', desc: 'Open direct WhatsApp conversations.' },
              { icon: '📶', name: 'Wi-Fi', desc: 'Allow guests to join networks with one scan.' },
              { icon: '📄', name: 'PDF', desc: 'Share documents and menus permanently.' },
              { icon: '🔗', name: 'Social Media', desc: 'Link to profiles and increase your following.' },
              { icon: '📅', name: 'Event', desc: 'Save event dates directly to user calendars.' },
            ].map((type, i) => (
              <div key={i} style={{
                padding: '32px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(0, 217, 255, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#00D9FF',
                  }}>
                    {type.icon}
                  </div>
                  <h4 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                  }}>
                    {type.name}
                  </h4>
                </div>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#a0a0a0',
                  marginBottom: '24px',
                }}>
                  {type.desc}
                </p>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    color: '#00D9FF',
                    fontSize: '14px',
                    fontWeight: '700',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0',
                    transition: 'gap 0.2s',
                  }}
                  onMouseEnter={(e) => { e.target.style.gap = '12px'; }}
                  onMouseLeave={(e) => { e.target.style.gap = '8px'; }}
                >
                  Create <span style={{ fontSize: '18px' }}>→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upsell Section */}
      <section style={{
        padding: '80px 20px',
        background: '#1E304F',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '60px',
          }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h2 style={{
                fontSize: '48px',
                fontWeight: '900',
                lineHeight: '1.1',
                marginBottom: '24px',
                letterSpacing: '-1px',
              }}>
                Upgrade to{' '}
                <span style={{ color: '#00D9FF', textShadow: '0 0 24px rgba(0, 217, 255, 0.5)' }}>
                  Dynamic
                </span>
                {' '}for Ultimate Control
              </h2>
              <p style={{
                fontSize: '18px',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '32px',
              }}>
                While static codes are great for permanency, dynamic codes offer post-print editing, scan tracking, and higher density layouts that make your business smarter.
              </p>
              <div style={{ marginBottom: '32px' }}>
                {[
                  'Change destination URL even after printing',
                  'Advanced scan analytics and location tracking',
                  'Reduced data density for faster scanning',
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}>
                    <span style={{ color: '#72d9b6', fontSize: '20px' }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/dynamic-qr-codes')}
                style={{
                  background: '#4db695',
                  color: '#004333',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.background = '#72d9b6'; e.target.style.boxShadow = '0 8px 24px rgba(77, 182, 149, 0.3)'; }}
                onMouseLeave={(e) => { e.target.style.background = '#4db695'; e.target.style.boxShadow = 'none'; }}
              >
                Explore Dynamic Codes
              </button>
            </div>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '48px',
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{
                    height: '16px',
                    background: 'rgba(114, 217, 182, 0.2)',
                    borderRadius: '8px',
                    width: '75%',
                  }} />
                  <div style={{
                    height: '16px',
                    background: 'rgba(114, 217, 182, 0.4)',
                    borderRadius: '8px',
                    width: '100%',
                  }} />
                  <div style={{
                    height: '16px',
                    background: 'rgba(114, 217, 182, 0.1)',
                    borderRadius: '8px',
                    width: '50%',
                  }} />
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '16px',
                    paddingTop: '16px',
                  }}>
                    <div style={{ height: '80px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
                    <div style={{ height: '80px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
                    <div style={{ height: '80px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '100px 20px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '24px',
            letterSpacing: '-1px',
          }}>
            Ready to Start Simple?
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            marginBottom: '40px',
          }}>
            Generate your first permanent static QR code in seconds. No account needed to get started.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
              color: '#0a0a0a',
              border: 'none',
              padding: '20px 48px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 8px 32px rgba(0, 217, 255, 0.2)',
            }}
            onMouseEnter={(e) => { e.target.style.boxShadow = '0 12px 40px rgba(0, 217, 255, 0.4)'; e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.target.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.2)'; e.target.style.transform = 'scale(1)'; }}
          >
            Generate My First Static QR Code
          </button>
        </div>
      </section>
    </div>
  );
};

export default StaticQR;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const DynamicQR = ({ onViewDashboard, onViewPricing }) => {
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
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
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
            <span style={{ fontSize: '16px' }}>✦</span>
            DYNAMIC QR SOLUTIONS
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            lineHeight: '1.1',
            margin: '0 0 20px',
            letterSpacing: '-1px',
          }}>
            Edit anything,{' '}
            <span style={{ color: '#00D9FF', textShadow: '0 0 24px rgba(0, 217, 255, 0.5)' }}>
              anytime
            </span>
            . Without reprinting.
          </h1>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            maxWidth: '500px',
            marginBottom: '30px',
          }}>
            Switch from static limitations to dynamic freedom. Update your menu, change your link, or track every single scan in real-time. Your QR codes are now as flexible as your business.
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
              Create Dynamic Code
            </button>
          </div>
        </div>
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '540px', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 217, 255, 0.08)',
            borderRadius: '16px',
            filter: 'blur(60px)',
          }} />
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            padding: '8px',
            transform: 'rotate(2deg)',
            transition: 'transform 0.5s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(2deg)'; }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSz8q4HX3nojllV-Tea9WnqyCWH9QAGYR61wOEU6R3P5zgNsxlogjFTPCY1dgow1fyZtCZn9lD55WquehCedPtgEloCYR9JxB90eXTq5Wp-DnHeORsZ0yXIXYBXvEzU6yteoJ8KN0AEqit4jNoRo7SrzRcuUltq2HTxSChEw7CYhq4Vz4QwBd7CxX5pR1Qj5Fnc-1_UwC0QBtAfAk2hAH-S-XUeZ29NiA0z38YNPO1YqnlMEN8h354pbW8bAJae4Hbd9gz1dYoYff7"
              alt="Dynamic QR Code scanning"
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
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '24px',
            border: '2px solid #00D9FF',
            overflow: 'hidden',
            padding: '8px',
            marginTop: '-40px',
            marginLeft: '40px',
            transform: 'rotate(-2deg)',
            transition: 'transform 0.5s',
            position: 'relative',
            zIndex: 2,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(-2deg)'; }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2TQz2NF9VWSLPKiIgTk5VIQFKlJD1dYngq8nwLO5ZvUfMxkxAtcD9nE0tk-hcAqYm_8qaWoXv3F1yzYWB1Z0eHOpGQWqRVQh8Dbnutk046C-OJ5KXDLrVRolBnpNsVEtBzZFrjGi4FIfW_MbAZd7sBNgeO0G0LTFYw--l9MyCNZ9BHEDeKM-xw8E9S6gTT_qQBBLFv64o7r2s0VoYiU4gk7QshOEs09CfxPdb72nVdwHRif8C1t4Nex5l6F8-kWmAmLkI9jGSl6Xs"
              alt="Dynamic QR Code dashboard"
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
        </div>
      </section>

      {/* Why go Dynamic Section */}
      <section style={{
        padding: '80px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '16px',
            }}>
              Why go Dynamic?
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#a0a0a0',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Static codes are locked forever once printed. Dynamic codes use a short URL redirect, giving you ultimate control over the destination.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                icon: '✎',
                title: 'Post-Print Editing',
                desc: 'Made a typo? Changing your campaign URL? Simply update the destination in your dashboard without touching your printed materials.',
              },
              {
                icon: '📊',
                title: 'Precision Analytics',
                desc: 'Track scans by location, time, and device type. Understand exactly which touchpoints are driving the most engagement for your brand.',
              },
              {
                icon: '📈',
                title: 'Scalable Content',
                desc: 'Host large PDF files, video playlists, or complex social links. The QR code stays simple and fast-scanning while the payload grows.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '32px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(0, 217, 255, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  fontSize: '24px',
                  color: '#00D9FF',
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '12px',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '15px',
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

      {/* Dynamic Types Grid */}
      <section style={{
        padding: '80px 20px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '60px',
            gap: '24px',
          }}>
            <div style={{ maxWidth: '500px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '16px',
              }}>
                A Dynamic Type for Every Need
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#a0a0a0',
              }}>
                Our generator supports a vast array of dynamic destinations, optimized for instant recognition and high-speed loading.
              </p>
            </div>
            <a
              href="/types"
              style={{
                color: '#00D9FF',
                fontSize: '14px',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'gap 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.gap = '12px'; }}
              onMouseLeave={(e) => { e.target.style.gap = '8px'; }}
            >
              View All Types <span style={{ fontSize: '18px' }}>→</span>
            </a>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}>
            {[
              { icon: '🔗', name: 'Link' },
              { icon: '📝', name: 'Text' },
              { icon: '✉️', name: 'Email' },
              { icon: '💬', name: 'SMS' },
              { icon: '💭', name: 'WhatsApp' },
              { icon: '📶', name: 'Wi-Fi' },
              { icon: '📄', name: 'PDF' },
              { icon: '🔗', name: 'Social Media' },
              { icon: '📅', name: 'Event' },
            ].map((type, i) => (
              <div key={i} style={{
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00D9FF'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '36px', marginBottom: '16px', color: '#888' }}>{type.icon}</div>
                <h4 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '16px',
                }}>
                  {type.name}
                </h4>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    marginTop: 'auto',
                    width: '100%',
                    padding: '10px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#a0a0a0',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.target.style.background = '#00D9FF'; e.target.style.color = '#0a0a0a'; e.target.style.borderColor = '#00D9FF'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.05)'; e.target.style.color = '#a0a0a0'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                >
                  Create
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '80px 20px',
        background: 'rgba(0, 217, 255, 0.03)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(0, 217, 255, 0.2)',
            borderRadius: '24px',
            marginBottom: '32px',
            position: 'relative',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              padding: '8px',
            }}>
              <div style={{ background: '#fff', borderRadius: '2px' }} />
              <div style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '2px' }} />
              <div style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '2px' }} />
              <div style={{ background: '#fff', borderRadius: '2px' }} />
            </div>
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '32px',
              height: '32px',
              background: '#F3B036',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(243, 176, 54, 0.4)',
            }}>
              ★
            </div>
          </div>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '20px',
            letterSpacing: '-1px',
          }}>
            Ready to go{' '}
            <span style={{ color: '#00D9FF', textShadow: '0 0 24px rgba(0, 217, 255, 0.5)' }}>
              Dynamic
            </span>
            ?
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            marginBottom: '30px',
          }}>
            Join 10,000+ businesses using StiQR to manage their physical-to-digital connections with surgical precision.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
              color: '#0a0a0a',
              border: 'none',
              padding: '18px 48px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.4)'; e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.target.style.boxShadow = 'none'; e.target.style.transform = 'scale(1)'; }}
          >
            Generate My First Dynamic QR Code
          </button>
        </div>
      </section>
    </div>
  );
};

export default DynamicQR;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const Weddings = ({ onViewDashboard, onViewPricing }) => {
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
        onGoToLanding={() => navigate('/')}
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
            Use Case: Events
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            lineHeight: '1.1',
            margin: '0 0 20px',
            letterSpacing: '-1px',
          }}>
            QR Codes for{' '}
            <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
              Weddings
            </span>
          </h1>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            maxWidth: '500px',
            marginBottom: '30px',
          }}>
            Elevate your wedding experience with smart, elegant QR solutions. Bridge the physical beauty of your ceremony with a seamless digital guest journey.
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
              Create Your Wedding QR
            </button>
            <button
              style={{
                background: 'transparent',
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
              View Demo
            </button>
          </div>
        </div>
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '540px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            padding: '8px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAkttvuqpWnXzdK_t0ns5W1iUZCetEsHJ4b-sB1tw9FhhAm7t8xqpj1ZW7k2eZMDPYKuq4yH4-yan9U-hSZfeAbIXtpIvJiej2x4SFS4vX60tnveW7IP-GR4BwPFUXynUCaL6zIg75g11MDNbWfhWdd21K0OCI2bryk1DHBpWl6AB2qztFh55-EgaOrUYLtExRB4NZKpBbqVn0bNfqK3ko2nB4nt12_EDZK9F3g6CvFGCK1ojAXejkevKfF4EI2TD09aYV6ZDvVAq0"
              alt="Wedding QR Code on smartphone"
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

      {/* Benefits Grid */}
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
              Why using QR codes for wedding planning
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#a0a0a0',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Wedding planning requires equal doses of marketing skills and event organization. QR codes allow you to simplify processes and guarantee guest satisfaction.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                icon: 'event_available',
                title: 'Simplify RSVPs',
                desc: 'Allow guests to scan and instantly access dates, dress codes, and menus. Collect dietary requirements and confirmation in one centralized dashboard.',
              },
              {
                icon: 'location_on',
                title: 'Share Locations',
                desc: 'Avoid confusion with direct integration into Google Maps or Apple Maps. One scan provides precise directions to the ceremony and reception venues.',
              },
              {
                icon: 'video_library',
                title: 'Capture Memories',
                desc: 'Share high-quality video highlights or digital photo galleries after the event. Keep the celebration alive for guests who couldn\'t attend.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '32px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
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
                  <span style={{ fontSize: '24px' }}>✦</span>
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

      {/* Planner's Edge Section */}
      <section style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '60px',
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            padding: '8px',
          }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZPCez23LRrj9l_YYcf1XIx3mmg7A2YXAGNtscHUFBZ0aOtrVQ60o3zqvQAU-p407K946dRrbQTRAY6FX_k07jixjTt02W3_oUP1CoW-FjPJz8ALvE5hvHackj5bMrUo_gEwj07r0y8JPRwSTawm4dRPSDVF-gtBgDrzs1KxoRnQEMpi-vaXcYX3w_CMIezc2Gch6PQoC10jb6-9eSOzJ2HyiUFX3dw-ncvLSJj9oFU7n2lMelzwgISX_wmATC5bWun232Zw0O5q4Y"
              alt="Wedding planner dashboard"
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
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '16px',
          }}>
            Promote Your Wedding Planning Business
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#a0a0a0',
            marginBottom: '24px',
          }}>
            Wedding planners can leverage StiQR to scale their brand. Create social media QR codes to grow your follower base, showcase your portfolio through gallery codes, and turn prospects into clients with seamless digital touchpoints.
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {[
              'Custom branding on every landing page',
              'Real-time scan tracking & analytics',
              'Dynamic updates without reprinting codes',
            ].map((item, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#ccc',
                fontSize: '15px',
              }}>
                <span style={{ color: '#00D9FF', fontSize: '20px' }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Premium Preview Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{
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
              background: 'rgba(255, 0, 255, 0.15)',
              borderRadius: '30px',
              color: '#FF00FF',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              <span style={{ fontSize: '16px' }}>✦</span>
              PREMIUM TEMPLATES
            </div>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '900',
              lineHeight: '1.1',
              marginBottom: '20px',
              letterSpacing: '-1px',
            }}>
              Your vision,{' '}
              <span style={{ color: '#00D9FF' }}>perfectly executed</span>.
            </h2>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#b0b0b0',
              marginBottom: '30px',
            }}>
              Experience the example landing page—designed for the most discerning couples. Fully customizable, responsive, and breathtakingly elegant.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <div style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#00D9FF', marginBottom: '4px' }}>100%</div>
                <div style={{ fontSize: '13px', color: '#888' }}>Mobile Optimized</div>
              </div>
              <div style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#00D9FF', marginBottom: '4px' }}>Instant</div>
                <div style={{ fontSize: '13px', color: '#888' }}>Content Loading</div>
              </div>
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '320px',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 217, 255, 0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)',
              }} />
              <div style={{
                position: 'relative',
                border: '8px solid #1a1a1a',
                borderRadius: '40px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                aspectRatio: '9/19',
              }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGo49FdVrCQ4uZocseofyI35zbSsKJKa3_N2ODw-L4HlArvCqzWEl5PUVwYic-Sdc3HnI-zCVM2G_s0YqVj7xwJlPgLKgjBj-MJjXVkovASWr-1dyMngHx6hP1ig1cB869HtH9sLZaqr4zKX1CZBI1LbmIejPyjHBowXacc9_tLYbePqrU3hw5_7OPbgq-iCbjC46lBCWibCrgt8Qus82HcweiuSi4Xg-yKdZSVwGEbxO07OsUmZwipbvBvJieukK79jOpIKNzlgbV"
                  alt="Wedding landing page preview on phone"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '80px 20px',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '60px 40px',
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
            filter: 'blur(60px)',
          }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '16px',
            }}>
              Ready to start your digital wedding journey?
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#a0a0a0',
              maxWidth: '500px',
              margin: '0 auto 30px',
            }}>
              Join thousands of couples and planners using StiQR to create unforgettable, frictionless wedding experiences.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                  color: '#0a0a0a',
                  border: 'none',
                  padding: '16px 36px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.boxShadow = '0 8px 24px rgba(0, 217, 255, 0.3)'; }}
                onMouseLeave={(e) => { e.target.style.boxShadow = 'none'; }}
              >
                Create Your Wedding QR Code
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: '#1a0a2e',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '16px 36px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = '#00D9FF'; e.target.style.color = '#00D9FF'; }}
                onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.target.style.color = '#fff'; }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Weddings;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const Features = ({ onViewDashboard, onViewPricing }) => {
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
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 20px 60px',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.2,
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 30% 30%, rgba(0, 217, 255, 0.15) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute',
            top: '-96px',
            right: '-96px',
            width: '384px',
            height: '384px',
            background: 'rgba(0, 217, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)',
            animation: 'pulse 3s ease-in-out infinite',
          }} />
        </div>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              background: 'rgba(0, 217, 255, 0.1)',
              borderRadius: '30px',
              color: '#00D9FF',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              <span style={{ fontSize: '16px' }}>★</span>
              PRECISION QR ECOSYSTEM
            </div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '900',
              lineHeight: '1.1',
              margin: '0 0 20px',
              letterSpacing: '-1px',
            }}>
              The Power of{' '}
              <span style={{ color: '#00D9FF', textShadow: '0 0 24px rgba(0, 217, 255, 0.5)' }}>
                Precision
              </span>
              {' '}QR Technology
            </h1>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#a0a0a0',
              maxWidth: '500px',
              marginBottom: '30px',
            }}>
              Stiqr transforms every physical touchpoint into a high-performance digital gateway. From urban scale advertising to intimate dining experiences, we provide the tools to connect, engage, and convert.
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
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.boxShadow = '0 8px 24px rgba(0, 217, 255, 0.3)'; }}
                onMouseLeave={(e) => { e.target.style.boxShadow = 'none'; }}
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/types')}
                style={{
                  background: 'transparent',
                  color: '#a0a0a0',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = '#00D9FF'; e.target.style.color = '#00D9FF'; }}
                onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.target.style.color = '#a0a0a0'; }}
              >
                Explore Solutions
                <span style={{ fontSize: '18px' }}>→</span>
              </button>
            </div>
          </div>
          <div style={{
            position: 'relative',
            perspective: '1000px',
          }}>
            <div style={{
              position: 'absolute',
              inset: '-16px',
              background: 'linear-gradient(to top right, rgba(0, 217, 255, 0.2), transparent)',
              filter: 'blur(40px)',
              transition: 'filter 0.5s',
            }} />
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '32px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              transition: 'transform 0.7s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotateY(6deg) rotateX(-2deg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)'; }}
            >
              <div style={{
                aspectRatio: '1/1',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '2px dashed rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB35GN-XSaKW26r3OKbdsNGL8aJATHTf7kS3wuJ5eEcdB4QcGxoCCvjoiON_GjHfDN0HEPJ_y-y0DBdPSeHOVcQf2mr1vtFvB8vGZNIYNNQk8nVTtvu8k5csbvp4vhlQTWEG7SaBYPSWQdU52b0nu0YN6ZvfVEpEjmyJdH4CW_8Jg5KRCr2FitdqU8VqriTnPsIomswAcoKZ52z6wwffLRh9Nb_gxfMS2RSE-1S4W7lLU0gBBzqXwR1fajUjqfU3DjrlLfDQriQy1_V"
                  alt="Precision QR Code"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <div style={{
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#00D9FF',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: '#a0a0a0',
                  }}>
                    SCAN LIVE
                  </span>
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#00D9FF',
                }}>
                  v2.4 Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section style={{
        padding: '80px 20px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px' }}>
          {/* Urban Reach */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '64px',
          }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative',
              }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCm8pyVfeMCE2Vg-_yB9KlhbuiFVdEeqRQhOolT85SB4VWfUQpE-EXaU3I9eQucTOcCbztiNtOCz8BfBRmF77G65QXOK815yRiZUSdIToAADgDxLMhlYLVAgvYkvtPNfLQeuWbDveG1Edm0tfBdmbtNrSLMiuP9EphP13Rd1TnTRTmnQEPTD9y6W5J-RXmbMFrvSQbdqvntCQyseg5C0-IYs63wuro7wDgJ5_AS41znks3DFq0sniffJVYAngtcIAhh9bi_pGJRUac"
                  alt="Urban Reach"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    transition: 'transform 1s',
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                }}
                onMouseEnter={(e) => { e.target.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '0'; }}
                />
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '24px',
              }}>
                Urban Reach & Scale
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#a0a0a0',
                marginBottom: '24px',
              }}>
                Deploy large-scale campaigns across transit hubs and city centers. Stiqr's high-contrast codes are optimized for rapid scanning in high-traffic environments, ensuring your message lands every time.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '✓', text: 'High-speed recognition' },
                  { icon: '✓', text: 'Precision tracking' },
                  { icon: '✓', text: 'Scalable content' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}>
                    <span style={{ color: '#00D9FF', fontSize: '20px' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Digital Dining */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row-reverse',
            alignItems: 'center',
            gap: '64px',
          }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative',
              }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIpT2zDra4-tcQkVc7eRdM5jjVcfTJeWuowzxTLidQyrHnx5Xuw3HMC72-u9EQgrMjHhr33TSN4VdAoLBS1eDYDyhutJLEF-Cf8SFWVtbHaUWoHELh9RBb3uEtx2Ia0Xi6gMa1vaXMo120dcgCAqXT1Qzr1-DkWF1m7dB5WE2QL28qujz_nfGf__vYt-LgzYaxtEKA1IIYOhyU8nIMdZ_z6s5NDd1mqxh4d2uy0fEif0y-8jxXyX1M4QZufG5LbPdQPIZwKQmgxqk2"
                  alt="Digital Dining"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    transition: 'transform 1s',
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                />
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '24px',
              }}>
                The New Standard in Dining
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#a0a0a0',
                marginBottom: '24px',
              }}>
                Replace static menus with dynamic digital experiences. Allow guests to browse, order, and pay with a single scan, reducing wait times and increasing table turnover.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '🍽️', text: 'Real-time menu updates' },
                  { icon: '🛒', text: 'Integrated ordering' },
                  { icon: '🎨', text: 'Elegant table presentation' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Frictionless Payments */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '64px',
          }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative',
              }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFBRj0e-mIqs3efKBHoCjhhUoU2knpBGfKyg-hHuKWCNWqxMjxgGWl2Bang1PTt8S585rwuTGWZMp8uCia5-7WdozgdiWLE7td_gRgzJAO0LXnXrFbrqgRspf0RAp3AESgvVUFi2xBn3Qv5Rk-uq2rhf7Ou1bH-MU9D42lsE3Z2cW72Ma7bs5S5glbgpMpKikregf7t3U0DZHjF_cYupNpXbEZGvXKzCw4HhGZCHKMU7YS5IcA-ANcR3-qjINYSCKhTCYW6vhbIsc6"
                  alt="Seamless Payments"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    transition: 'transform 1s',
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                />
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '24px',
              }}>
                The Future of Frictionless Payments
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#a0a0a0',
                marginBottom: '24px',
              }}>
                Integrate secure, branded payment gateways similar to global leaders like WeChat Pay and Alipay. Stiqr provides the security and speed required for the modern retail landscape.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '🔒', text: 'Encrypted transactions' },
                  { icon: '⚡', text: 'Instant confirmation' },
                  { icon: '🏷️', text: 'Branded checkout flow' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Grid */}
      <section style={{
        padding: '80px 20px',
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '16px',
            }}>
              Versatility Across Every Industry
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#a0a0a0',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Our precision QR technology is engineered to solve complex connectivity challenges across diverse sectors.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {[
              { icon: '🏢', title: 'Real Estate', desc: 'Instantly launch immersive virtual tours and detailed property specs with a single yard-sign scan.', color: '#00D9FF' },
              { icon: '🎓', title: 'Education', desc: 'Connect students to digital resources, lecture notes, and interactive portals directly from campus posters.', color: '#F3B036' },
              { icon: '🏥', title: 'Healthcare', desc: 'Securely link patients to health portals and pre-visit information in a HIPAA-compliant environment.', color: '#4d5f80' },
            ].map((item, i) => (
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
                  width: '48px',
                  height: '48px',
                  background: `${item.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  fontSize: '32px',
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '12px',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#a0a0a0',
                  marginBottom: '24px',
                }}>
                  {item.desc}
                </p>
                <button
                  onClick={() => navigate('/types')}
                  style={{
                    color: '#00D9FF',
                    fontSize: '14px',
                    fontWeight: '700',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0',
                    transition: 'gap 0.2s',
                  }}
                  onMouseEnter={(e) => { e.target.style.gap = '8px'; }}
                  onMouseLeave={(e) => { e.target.style.gap = '4px'; }}
                >
                  Learn more <span style={{ fontSize: '16px' }}>›</span>
                </button>
              </div>
            ))}
          </div>

          {/* Retail Growth Banner */}
          <div style={{
            marginTop: '24px',
            background: '#1E304F',
            borderRadius: '24px',
            padding: '48px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-128px',
              right: '-128px',
              width: '320px',
              height: '320px',
              background: 'rgba(0, 217, 255, 0.2)',
              borderRadius: '50%',
              filter: 'blur(60px)',
              animation: 'pulse 3s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: 'rgba(0, 217, 255, 0.15)',
                  borderRadius: '30px',
                  color: '#72d9b6',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}>
                  PRO FEATURE
                </div>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: '#fff',
                }}>
                  Retail Growth Engines
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.7)',
                  maxWidth: '400px',
                  marginBottom: '24px',
                }}>
                  Drive foot traffic and loyalty with dynamic coupons and exclusive member-only offers that update in real-time.
                </p>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    background: '#4db695',
                    color: '#004333',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.target.style.background = '#72d9b6'; e.target.style.boxShadow = '0 8px 24px rgba(77, 182, 149, 0.3)'; }}
                  onMouseLeave={(e) => { e.target.style.background = '#4db695'; e.target.style.boxShadow = 'none'; }}
                >
                  Launch Campaign
                </button>
              </div>
              <div style={{ display: 'none' }} className="md:block">
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(16px)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transform: 'rotate(6deg)',
                  transition: 'transform 0.5s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(6deg)'; }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>Engagement Rate</span>
                    <span style={{ color: '#72d9b6', fontSize: '24px', fontWeight: '700' }}>+42%</span>
                  </div>
                  <div style={{
                    height: '96px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '8px',
                  }}>
                    {[8, 12, 20, 24].map((h, i) => (
                      <div key={i} style={{
                        flex: '1',
                        height: `${h * 4}px`,
                        background: i === 3 ? '#4db695' : 'rgba(77, 182, 149, 0.6)',
                        borderRadius: '4px',
                        animation: i === 3 ? 'pulse 1s ease-in-out infinite' : 'none',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '80px 20px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '16px',
          }}>
            Ready to scale your reach?
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            marginBottom: '32px',
          }}>
            Join over 1,500 forward-thinking businesses using StiQR to bridge the physical and digital world.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                color: '#0a0a0a',
                border: 'none',
                padding: '16px 40px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.boxShadow = '0 8px 24px rgba(0, 217, 255, 0.3)'; }}
              onMouseLeave={(e) => { e.target.style.boxShadow = 'none'; }}
            >
              Get Started Now
            </button>
            <button
              onClick={() => navigate('/contact')}
              style={{
                background: 'transparent',
                color: '#a0a0a0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '16px 40px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = '#00D9FF'; e.target.style.color = '#00D9FF'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.target.style.color = '#a0a0a0'; }}
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;

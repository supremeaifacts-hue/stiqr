import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const Events = ({ onViewDashboard, onViewPricing }) => {
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
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIupbWCVCIld5xJVwoWP1z66izwlJHOgOeP83yoFUczkA3acELV2pvIuEjjSrxOyrp7wrm1LPW5AubA5amvzxdGVncKBqgsYRsjw2MZ6_TzI9Vr0vwccWq0nOCEzS-PNQOgtY77o3IWyVq6WiSoFQ_4RdVwiDfplIvI0JQFpKez_WIsDM5Byh5ZDIPoJAucwxp4o_PYBiwrOn8KMY_vkpHGhY-UE2mJREqY7TDs8uGkvXbN1b9orDGrw"
            alt="Event professional scanning QR code"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(20%)',
              opacity: 0.9,
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(30, 48, 79, 0.8) 0%, rgba(30, 48, 79, 0.4) 50%, transparent 100%)',
          }} />
        </div>
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          padding: '96px 64px',
          maxWidth: '1280px',
          margin: '0 auto',
        }}>
          <div style={{ maxWidth: '600px' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: '#4DB695',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '9999px',
              marginBottom: '24px',
            }}>
              NEW: EVENT SOLUTIONS
            </span>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
            }}>
              Transform Your Event Experience in a Single Scan
            </h1>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#e6e8ea',
              opacity: 0.9,
              marginBottom: '40px',
            }}>
              From town festivals to intimate birthdays, provide your guests with instant access to schedules, maps, and live updates with our precision-engineered QR ecosystem.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: '#4DB695',
                  color: '#fff',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(77, 182, 149, 0.3)',
                }}
                onMouseEnter={(e) => { e.target.style.filter = 'brightness(1.1)'; e.target.style.transform = 'scale(0.95)'; }}
                onMouseLeave={(e) => { e.target.style.filter = 'brightness(1)'; e.target.style.transform = 'scale(1)'; }}
              >
                Create Your Event Code
                <span style={{ fontSize: '18px' }}>→</span>
              </button>
              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: '#191c1e',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.9)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.7)'; }}
              >
                View Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section style={{
        padding: '96px 64px',
        background: '#fff',
        color: '#191c1e',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 80px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#1E304F',
              marginBottom: '16px',
            }}>
              A Streamlined 3-Step Workflow
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#3e4944',
            }}>
              Launch your event connectivity in minutes, not hours. StiQR handles the complexity so you can focus on the experience.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '48px',
            position: 'relative',
          }}>
            {[
              {
                icon: '✎',
                title: 'Create',
                desc: 'Design your custom Event QR code in seconds with our intuitive dashboard.',
              },
              {
                icon: '↗',
                title: 'Share',
                desc: 'Place it on invites, posters, or digital screens across your venue.',
              },
              {
                icon: '⟳',
                title: 'Update',
                desc: 'Change logistics in real-time without reprinting a single piece of material.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '32px',
                borderRadius: '12px',
                background: '#fff',
                border: '1px solid #bdc9c2',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#4DB695',
                  color: '#004333',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  fontSize: '32px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1E304F',
                  marginBottom: '12px',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#3e4944',
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Use QR Codes for Events? Section */}
      <section style={{
        padding: '96px 64px',
        background: '#f2f4f6',
        color: '#191c1e',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#1E304F',
              marginBottom: '16px',
            }}>
              Why Use QR Codes for Events?
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#3e4944',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Modernize your attendee experience with technology that eliminates friction and bridges the gap between digital planning and physical reality.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
          }}>
            {[
              {
                icon: '⏱',
                title: 'Real-Time Updates',
                desc: 'Change schedules or venues instantly. Your guests see the latest version with every scan, eliminating confusion during last-minute shifts.',
              },
              {
                icon: '📍',
                title: 'Seamless Logistics',
                desc: 'Share locations, WiFi credentials, and contact info in one structured landing page designed for mobile efficiency.',
              },
              {
                icon: '🎉',
                title: 'Enhanced Engagement',
                desc: 'Link to RSVP forms, social media tags, or photo galleries to keep the momentum going before, during, and after the event.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '32px',
                borderRadius: '16px',
                background: '#fff',
                border: '1px solid #bdc9c2',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(77, 182, 149, 0.2)',
                  color: '#006c53',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  fontSize: '24px',
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1E304F',
                  marginBottom: '16px',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#3e4944',
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data-Driven Event Planning Section */}
      <section style={{
        padding: '96px 64px',
        background: '#1E304F',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '33%',
          height: '100%',
          opacity: 0.1,
          pointerEvents: 'none',
        }}>
          <svg fill="none" viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <circle cx="400" cy="400" r="399" stroke="white" strokeWidth="2" />
            <circle cx="400" cy="400" r="299" stroke="white" strokeWidth="2" />
            <circle cx="400" cy="400" r="199" stroke="white" strokeWidth="2" />
          </svg>
        </div>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '64px',
          alignItems: 'center',
        }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              background: 'rgba(114, 217, 182, 0.3)',
              color: '#8ef6d2',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              borderRadius: '9999px',
              marginBottom: '24px',
            }}>
              <span style={{ fontSize: '14px' }}>📊</span>
              DATA-DRIVEN INSIGHTS
            </div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              marginBottom: '24px',
            }}>
              Data-Driven Event Planning
            </h2>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#e6e8ea',
              opacity: 0.8,
              marginBottom: '40px',
            }}>
              Stop guessing how your event touchpoints are performing. StiQR provides granular analytics to help you optimize the guest experience and plan better future events.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { label: 'SCAN VOLUME', desc: 'Identify which posters or locations drove the most engagement.' },
                { label: 'PEAK ATTENDANCE', desc: 'Track when scans peak to understand high-traffic event windows.' },
                { label: 'GEOGRAPHIC DATA', desc: 'Visualize guest locations to refine regional marketing efforts.' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  borderLeft: `4px solid ${i === 0 ? '#4DB695' : 'rgba(77, 182, 149, 0.5)'}`,
                  padding: '8px 24px',
                  borderRadius: '0 8px 8px 0',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: i === 0 ? '#4DB695' : '#e6e8ea',
                      display: 'block',
                      marginBottom: '2px',
                    }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: 'rgba(255,255,255,0.7)',
                    }}>
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '32px',
                borderRadius: '16px',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: '#4DB695',
                  marginBottom: '8px',
                }}>
                  4.8k
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  opacity: 0.6,
                }}>
                  TOTAL SCANS
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '32px',
                borderRadius: '16px',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: '#4DB695',
                  marginBottom: '8px',
                }}>
                  82%
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  opacity: 0.6,
                }}>
                  CONVERSION
                </div>
              </div>
              <div style={{
                gridColumn: 'span 2',
                background: 'rgba(255,255,255,0.1)',
                padding: '24px',
                borderRadius: '16px',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{
                  height: '128px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}>
                  {[40, 60, 85, 45, 100, 70, 90].map((h, i) => (
                    <div key={i} style={{
                      flex: '1',
                      background: '#4DB695',
                      borderRadius: '4px 4px 0 0',
                      height: `${h}%`,
                      transition: 'height 0.5s',
                    }} />
                  ))}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  opacity: 0.4,
                }}>
                  <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Event Templates Section */}
      <section style={{
        padding: '128px 64px',
        background: '#fff',
        color: '#191c1e',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '64px',
          alignItems: 'center',
        }}>
          <div style={{ flex: '5', minWidth: '300px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#1E304F',
              marginBottom: '24px',
            }}>
              Premium Event Templates
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#3e4944',
              marginBottom: '32px',
            }}>
              StiQR Event codes don't just point to a URL—they lead to a premium, mobile-optimized landing page designed specifically for event logistics.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {[
                'Dynamic Google Maps integration',
                'One-tap contact for organizers',
                'Service icons for Parking, Restrooms, and WiFi',
                'Countdown timers for key sessions',
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
                }}>
                  <span style={{ color: '#4DB695', fontSize: '20px' }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/types')}
              style={{
                border: '2px solid #1E304F',
                color: '#1E304F',
                background: 'transparent',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.background = '#1E304F'; e.target.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#1E304F'; }}
            >
              Explore Template Gallery
            </button>
          </div>
          <div style={{ flex: '7', minWidth: '300px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '48px' }}>
              <div style={{
                borderRadius: '12px',
                border: '1px solid #bdc9c2',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLP_xZ8j2vrI287xWxvSKYIjO7yeI63kocXicOtfgF1MkXnMNQ7klp5SARzyohwfO14OhAAtojgMuV0zHHUK9ykCbamTLUjVBNH_dB3NM1cKLOYy2vh96rn4oNg1iRcA7uL36jkO-lwPNniV-aF-UzfoeU7r_X0y34x-h7SzeDxZlzA1ANaztg7AMekwKBT0ZuSt_eAi8olidsB1LCYukyRRQd06CI0S3LgOxc1z7cWUwAg-19wK_xPA"
                  alt="Bespoke Weddings"
                  style={{
                    width: '100%',
                    height: '320px',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s',
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                />
                <div style={{
                  padding: '16px',
                  background: '#fff',
                  textAlign: 'center',
                  borderTop: '1px solid #bdc9c2',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  Bespoke Weddings
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                borderRadius: '12px',
                border: '1px solid #bdc9c2',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5K0Wx3CitqGjaQ9IchiI-2aGIdh8xzYxNwSHyI0K7WtDwLt0CwgyaLbX7p_X9Kie-BQ25r9XRkvaWMdbjRMTsB3No1zmjHLcN1KOb9Y1BZoWFgjei9RQOpclJaQaAA8kS0XPdeaHpK0g3cmVd_4T6137ETjJ3yxfD8n0czPXyj6PMtr5jtkk6Leg__V83GqZupFjIopSXWJ3iPQC8XI8O6rWJbaYIEKtVvdfEqDeDkWQEduqwOT7nUg"
                  alt="Tech Conferences"
                  style={{
                    width: '100%',
                    height: '320px',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s',
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                />
                <div style={{
                  padding: '16px',
                  background: '#fff',
                  textAlign: 'center',
                  borderTop: '1px solid #bdc9c2',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  Tech Conferences
                </div>
              </div>
              <div style={{
                borderRadius: '12px',
                border: '1px solid #bdc9c2',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHbQE6eRkxPLzIhhP4zPKB5h3rCkE-jUAFXNSNBOGwuLymxNL8o2YBL98_WjdqIWPLuSAPapfwUqybaMZvEe8veG55Omdm_sUvmYo3p3LBRh1aDwUuJGQmIetBdnxQlqfKU7SKv2bXpAKGvmkZqlBv4DxyZVyby9Yg0MaZeWKF6aYFppDbjOrpKWJCQf4QPv0tDoTrlO9f-nsmjLcdeWWtJ2OafYo4paNZ5CXNlAClK1LZbMr1PrFd5w"
                  alt="Public Festivals"
                  style={{
                    width: '100%',
                    height: '256px',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s',
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                />
                <div style={{
                  padding: '16px',
                  background: '#fff',
                  textAlign: 'center',
                  borderTop: '1px solid #bdc9c2',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  Public Festivals
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '96px 64px',
        background: 'rgba(77, 182, 149, 0.1)',
        borderTop: '1px solid rgba(189, 201, 194, 0.3)',
        borderBottom: '1px solid rgba(189, 201, 194, 0.3)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '600',
            color: '#1E304F',
            marginBottom: '24px',
          }}>
            Ready to upgrade your guest experience?
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#3e4944',
            marginBottom: '40px',
            maxWidth: '500px',
            margin: '0 auto 40px',
          }}>
            Join over 5,000 organizers who trust StiQR for their event connectivity.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: '#4DB695',
                color: '#fff',
                border: 'none',
                padding: '16px 40px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(77, 182, 149, 0.3)',
              }}
              onMouseEnter={(e) => { e.target.style.filter = 'brightness(1.05)'; }}
              onMouseLeave={(e) => { e.target.style.filter = 'brightness(1)'; }}
            >
              Create Your First Code
            </button>
            <button
              onClick={() => navigate('/contact')}
              style={{
                background: '#fff',
                border: '2px solid #6e7a74',
                color: '#191c1e',
                padding: '16px 40px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.background = '#f2f4f6'; }}
              onMouseLeave={(e) => { e.target.style.background = '#fff'; }}
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;

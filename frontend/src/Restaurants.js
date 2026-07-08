import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const Restaurants = ({ onViewDashboard, onViewPricing }) => {
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
            RESTAURANT SOLUTIONS
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            lineHeight: '1.1',
            margin: '0 0 20px',
            letterSpacing: '-1px',
          }}>
            Update Your Entire{' '}
            <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
              Menu in Seconds
            </span>
          </h1>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            maxWidth: '500px',
            marginBottom: '30px',
          }}>
            No more reprints. No more outdated prices. Just upload a new PDF to your dynamic QR code and your guests see the changes instantly.
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
              Get Started
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
              See it in Action
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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBovg1ud4gD2nfKmBB7Gco-m2Uxyvzm9F-vy-tFzkT6FAa5D2rI_n1NsECjEY4k1JpRLZ-_AnajCZA0KuEby4DtBO6plC-kmOzxC4dDgb-5gTaYBsUi0hZcrQC6wFy3fRMkvD696_NLhUoYRcwMQ2dg8hnN5v8sO1ZNMujw7ifHMJO07jAmDg4DMDCQ7lFgs7GlUtlvcCpOM8AyNq3dSr1TTlu63IwCbgzYfGnFFncVXAF50NBwE0L3Yg"
              alt="Restaurant owner managing digital menu on tablet"
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

      {/* Three Steps Section */}
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
              Three Steps to Digital Freedom
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#a0a0a0',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Simplify your hospitality operations with our streamlined three-step workflow designed for high-paced environments.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                icon: '✦',
                title: 'Create your Dynamic QR Code',
                desc: 'Generate a high-fidelity code that stays permanent. One physical print is all you\'ll ever need for each table.',
              },
              {
                icon: '✦',
                title: 'Upload your PDF Menu',
                desc: 'Seamlessly link your current menu to the code. We handle the heavy lifting of hosting and optimization.',
              },
              {
                icon: '✦',
                title: 'Update Anytime',
                desc: 'When your menu changes, just upload the new version. Your physical QR code remains exactly the same.',
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
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
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

      {/* Benefits Grid Section */}
      <section style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {/* Image Card */}
          <div style={{
            gridColumn: 'span 2',
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            minHeight: '400px',
          }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmgnReHnDBN_x_1aW8Jbr-kSQaj3R0uBOW_-eP9vUZfYfJ1gJq3IXd129VYpdMyybK9UqSNhSFJorR9FJ9SZvPcNVHzEIOVCEJpUqBMZh8t2QGEu4ByOwB1CXRwyGtVYJW68xIIN7qEXM6i0atsDsya49sPkt4Fx-TggMYhQxA1D5kTyL7Ny851QJ9xhYWqgCKZxotieajjlK_tev0dm2pxUTVyhcGRBopVMwAToQ0krzWS9D3JNNzCA"
              alt="QR code on restaurant table"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                position: 'absolute',
                inset: 0,
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(26, 10, 46, 0.85) 0%, transparent 60%)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              maxWidth: '400px',
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '8px',
              }}>
                The Aesthetic Choice
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#ccc',
              }}>
                Our QR codes are designed to complement luxury interiors, replacing cluttered paper menus with elegant, minimal touchpoints.
              </p>
            </div>
          </div>

          {/* Benefit 1 */}
          <div style={{
            background: 'rgba(0, 217, 255, 0.08)',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(0, 217, 255, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                fontSize: '24px',
                color: '#00D9FF',
              }}>
                ⚡
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '12px',
              }}>
                Instant Updates
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#a0a0a0',
              }}>
                Prices, seasonal specials, or daily rotations are updated in real-time. Sold out of the daily special? Remove it in three clicks before the next guest sits down.
              </p>
            </div>
            <div style={{
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#00D9FF',
                animation: 'pulse 2s infinite',
              }} />
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                color: '#00D9FF',
              }}>
                LIVE SYNCHRONIZATION
              </span>
            </div>
          </div>

          {/* Benefit 2 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '32px',
          }}>
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
              🌱
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '12px',
            }}>
              Sustainability
            </h3>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#a0a0a0',
            }}>
              Eliminate the cost and waste of paper menu reprints. Save thousands annually while reducing your environmental footprint.
            </p>
          </div>

          {/* Benefit 3 */}
          <div style={{
            gridColumn: 'span 2',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(0, 217, 255, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '32px',
          }}>
            <div style={{ flex: '2', minWidth: '250px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(243, 176, 54, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                fontSize: '24px',
                color: '#F3B036',
              }}>
                ⭐
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '12px',
              }}>
                Guest Satisfaction
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#a0a0a0',
              }}>
                Ensure guests always have accurate information about availability and allergens. A transparent menu experience leads to higher trust and better reviews.
              </p>
            </div>
            <div style={{
              flex: '1',
              minWidth: '150px',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div style={{
                fontSize: '42px',
                fontWeight: '900',
                color: '#00D9FF',
                marginBottom: '4px',
              }}>
                4.9/5
              </div>
              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                color: '#888',
              }}>
                GUEST SATISFACTION
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why QR Codes Section */}
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
              Why QR Codes in Your Restaurant?
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#a0a0a0',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Modernize your service with technology that works for you and your guests.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                icon: '🔄',
                title: 'Dynamic Flexibility',
                desc: 'Update your menu in real-time for seasonal dishes or price changes without reprinting.',
              },
              {
                icon: '⚡',
                title: 'Operational Efficiency',
                desc: 'Reduce staff overhead and wait times by giving guests instant access to the menu.',
              },
              {
                icon: '🧼',
                title: 'Enhanced Hygiene',
                desc: 'Provide a contactless dining experience that guests trust and appreciate.',
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
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
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

      {/* Analytics Section */}
      <section style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '60px',
      }}>
        <div style={{ flex: '1', minWidth: '300px', order: 2 }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '32px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '32px',
            }}>
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '1.5px',
                  color: '#00D9FF',
                  marginBottom: '4px',
                }}>
                  SCAN VOLUME
                </div>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '900',
                  color: '#fff',
                }}>
                  12,482
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'flex-end',
                height: '48px',
              }}>
                <div style={{ width: '8px', background: 'rgba(0, 217, 255, 0.4)', height: '50%', borderRadius: '4px 4px 0 0' }} />
                <div style={{ width: '8px', background: 'rgba(0, 217, 255, 0.6)', height: '75%', borderRadius: '4px 4px 0 0' }} />
                <div style={{ width: '8px', background: '#00D9FF', height: '100%', borderRadius: '4px 4px 0 0' }} />
                <div style={{ width: '8px', background: 'rgba(0, 217, 255, 0.8)', height: '65%', borderRadius: '4px 4px 0 0' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
              }}>
                <span style={{ color: '#aaa', fontSize: '14px' }}>Peak Time</span>
                <span style={{ color: '#00D9FF', fontWeight: '700', fontSize: '14px' }}>7:00 PM - 9:00 PM</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
              }}>
                <span style={{ color: '#aaa', fontSize: '14px' }}>Top Location</span>
                <span style={{ color: '#00D9FF', fontWeight: '700', fontSize: '14px' }}>Main Dining Room</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: '1', minWidth: '300px', order: 1 }}>
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
            DATA-DRIVEN INSIGHTS
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '16px',
          }}>
            Promote Your Restaurant with Analytics
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#a0a0a0',
            marginBottom: '24px',
          }}>
            Understand your guests better than ever. Track scan volume, geographic locations, and peak times to optimize your staffing and marketing efforts.
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
              'Real-time scan tracking',
              'Guest demographic insights',
              'Peak hour performance reports',
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

      {/* Beyond the Menu Section */}
      <section style={{
        padding: '80px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(0, 217, 255, 0.05)',
            borderRadius: '32px',
            padding: '60px 40px',
            border: '1px solid rgba(0, 217, 255, 0.1)',
          }}>
            <div style={{ maxWidth: '700px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '16px',
              }}>
                Beyond the Menu
              </h2>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#a0a0a0',
                marginBottom: '40px',
              }}>
                Our templates are more than just a PDF viewer. Tell your brand's story by including your restaurant's history, social media links, reservation buttons, and high-quality photography that makes guests crave your signature dishes.
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#00D9FF',
                  fontWeight: '700',
                  fontSize: '15px',
                }}>
                  <span style={{ fontSize: '20px' }}>📖</span>
                  Brand Story
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#00D9FF',
                  fontWeight: '700',
                  fontSize: '15px',
                }}>
                  <span style={{ fontSize: '20px' }}>🔗</span>
                  Social Integration
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#00D9FF',
                  fontWeight: '700',
                  fontSize: '15px',
                }}>
                  <span style={{ fontSize: '20px' }}>📅</span>
                  Reservations
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
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '900',
            lineHeight: '1.2',
            marginBottom: '16px',
            letterSpacing: '-1px',
          }}>
            Ready to Modernize Your Dining Room?
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            maxWidth: '600px',
            margin: '0 auto 30px',
          }}>
            Join hundreds of restaurants using StiQR to create better guest experiences and more efficient operations.
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
              Get Started Now
            </button>
            <button
              style={{
                background: 'transparent',
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
              Book a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Restaurants;

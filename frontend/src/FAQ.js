import React, { useState } from 'react';
import TopBar from './TopBar';
import { useAuth } from './contexts/AuthContext';

const FAQ = ({ onViewDashboard, onViewPricing, onBack }) => {
  const { setUser } = useAuth();
  const [openIndex, setOpenIndex] = useState(null);

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

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      id: 'general',
      icon: 'ℹ️',
      title: 'General',
      items: [
        {
          q: 'What is Stiqr and how does it work?',
          a: 'Stiqr is a precision-focused QR code platform designed for enterprise-grade connectivity. We bridge physical touchpoints with digital experiences through secure, scalable, and highly customizable QR technology. Simply create a code, link it to your destination, and track performance in real-time.'
        },
        {
          q: 'Do Stiqr QR codes ever expire?',
          a: 'Stiqr codes do not have a forced expiration date. Static codes are permanent and will work as long as the destination URL is active. Dynamic codes remain active as long as your account is in good standing. We prioritize reliability so your physical prints never lose their digital connection.'
        }
      ]
    },
    {
      id: 'dynamic',
      icon: '🔄',
      title: 'Dynamic QR Codes',
      items: [
        {
          q: 'Can I edit my QR code after it has been printed?',
          a: 'Yes! This is the primary advantage of Stiqr Dynamic QR codes. You can change the destination URL, update campaign parameters, or redirect the traffic at any time through your dashboard without needing to reprint the physical QR code.'
        },
        {
          q: 'How do I track the performance of my QR codes?',
          a: 'Every Dynamic QR code comes with a built-in analytics suite. You can track total scans, unique scans, geolocation data, device types, and operating systems. This data is updated in real-time within your Stiqr Analytics dashboard.'
        }
      ]
    },
    {
      id: 'static',
      icon: '🔒',
      title: 'Static QR Codes',
      items: [
        {
          q: 'What is the difference between static and dynamic QR codes?',
          a: 'Static QR codes hardcode the data directly into the pattern; once created, they cannot be changed and do not offer analytics. Dynamic QR codes use a short redirect URL, which allows for destination editing and comprehensive scan tracking after printing.'
        }
      ]
    },
    {
      id: 'pricing',
      icon: '💳',
      title: 'Pricing & Billing',
      items: [
        {
          q: 'Is there a free trial for the Pro features?',
          a: 'Absolutely. We offer a 7-day free trial on all paid plans, giving you full access to advanced customization, bulk creation, and deep analytics. No credit card is required to start your trial.'
        }
      ]
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      color: '#fff',
      padding: '0',
      margin: '0',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
    }}>
      <TopBar 
        onViewDashboard={onViewDashboard}
        onViewPricing={handlePricingClick}
        onSignUp={handleSignUpClick}
        onLogin={handleLoginClick}
        onGoToLanding={onBack}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Hero Section */}
      <section style={{
        padding: '80px 20px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Floating decorative elements */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '10%',
          fontSize: '64px',
          opacity: '0.15',
          color: '#00D9FF',
          pointerEvents: 'none',
        }}>
          ❓
        </div>
        <div style={{
          position: 'absolute',
          bottom: '60px',
          right: '8%',
          fontSize: '48px',
          opacity: '0.12',
          color: '#FF00FF',
          pointerEvents: 'none',
        }}>
          💬
        </div>
        <div style={{
          position: 'absolute',
          top: '120px',
          right: '25%',
          fontSize: '32px',
          opacity: '0.1',
          color: '#00D9FF',
          pointerEvents: 'none',
        }}>
          📱
        </div>

        <div style={{
          display: 'inline-flex',
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
          <span style={{ fontSize: '16px' }}>❓</span>
          Frequently Asked Questions
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: '900',
          lineHeight: '1.1',
          margin: '0 0 18px 0',
          letterSpacing: '-1px',
        }}>
          <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
            Got Questions?
          </span>
          <br />
          <span style={{ color: '#ffffff' }}> We've Got Answers</span>
        </h1>

        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#a0a0a0',
          maxWidth: '700px',
          margin: '0 auto 40px',
        }}>
          Everything you need to know about creating, managing, and optimizing your connectivity with Stiqr precision QR technology.
        </p>
      </section>

      {/* FAQ Content */}
      <main style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 20px 80px',
        display: 'flex',
        gap: '40px',
      }}>
        {/* Sidebar Navigation */}
        <aside style={{
          flex: '0 0 220px',
          position: 'sticky',
          top: '100px',
          alignSelf: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {faqCategories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(category.id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                color: '#a0a0a0',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.08)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#a0a0a0';
              }}
            >
              <span style={{ fontSize: '18px' }}>{category.icon}</span>
              <span>{category.title}</span>
            </a>
          ))}
        </aside>

        {/* FAQ Items */}
        <div style={{ flex: '1', minWidth: '0' }}>
          {faqCategories.map((category) => (
            <section
              key={category.id}
              id={category.id}
              style={{
                marginBottom: '50px',
                scrollMarginTop: '100px',
              }}
            >
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#00D9FF',
                margin: '0 0 24px 0',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(0, 217, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span>{category.icon}</span>
                {category.title}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {category.items.map((item, idx) => {
                  const globalIndex = `${category.id}-${idx}`;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div
                      key={globalIndex}
                      style={{
                        border: `1px solid ${isOpen ? 'rgba(0, 217, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '12px',
                        background: isOpen ? 'rgba(0, 217, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <button
                        onClick={() => toggleAccordion(globalIndex)}
                        style={{
                          width: '100%',
                          padding: '20px 24px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontFamily: '"Inter", "Segoe UI", sans-serif',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        <span>{item.q}</span>
                        <span style={{
                          fontSize: '24px',
                          color: isOpen ? '#00D9FF' : '#666',
                          transition: 'transform 0.3s ease, color 0.3s ease',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          flexShrink: 0,
                          marginLeft: '16px',
                        }}>
                          ▼
                        </span>
                      </button>

                      <div style={{
                        maxHeight: isOpen ? '500px' : '0',
                        opacity: isOpen ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out, padding 0.3s ease-out',
                        padding: isOpen ? '0 24px 20px' : '0 24px',
                      }}>
                        <p style={{
                          color: '#a0a0a0',
                          fontSize: '15px',
                          lineHeight: '1.7',
                          margin: 0,
                        }}>
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* CTA Section */}
      <section style={{
        padding: '60px 20px',
        borderTop: '1px solid rgba(0, 217, 255, 0.1)',
        borderBottom: '1px solid rgba(0, 217, 255, 0.1)',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#fff',
            margin: '0 0 12px 0',
          }}>
            Still have questions?
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#a0a0a0',
            margin: '0 0 30px 0',
            lineHeight: '1.6',
          }}>
            Our precision-focused support team is here to help you solve any connectivity challenges.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => window.location.href = '/contact'}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #FF00FF 0%, #FF00FF80 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: '"Inter", "Segoe UI", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 0, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Contact Support
            </button>
            <button
              onClick={() => window.location.href = '/pricing'}
              style={{
                padding: '14px 32px',
                background: 'transparent',
                border: '2px solid #00D9FF',
                borderRadius: '10px',
                color: '#00D9FF',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
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
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Back button */}
      {onBack && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
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
    </div>
  );
};

export default FAQ;

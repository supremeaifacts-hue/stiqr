import React from 'react';
import TopBar from './TopBar';
import { useAuth } from './contexts/AuthContext';

const PrivacyPolicy = ({ onViewDashboard, onViewPricing, onBack }) => {
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

  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'definitions', title: 'Definitions' },
    { id: 'information-collect', title: 'Information we collect' },
    { id: 'how-use', title: 'How we use information' },
    { id: 'protection', title: 'Protection of data' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'third-party', title: 'Third Party Disclosure' },
    { id: 'contact', title: 'Contact' },
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
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '10%',
          fontSize: '64px',
          opacity: '0.12',
          color: '#00D9FF',
          pointerEvents: 'none',
        }}>
          🔒
        </div>
        <div style={{
          position: 'absolute',
          bottom: '60px',
          right: '8%',
          fontSize: '48px',
          opacity: '0.1',
          color: '#FF00FF',
          pointerEvents: 'none',
        }}>
          🛡️
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
          <span style={{ fontSize: '16px' }}>🔒</span>
          Privacy & Security
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: '900',
          lineHeight: '1.1',
          margin: '0 0 18px 0',
          letterSpacing: '-1px',
        }}>
          <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
            Privacy Policy
          </span>
        </h1>

        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#a0a0a0',
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          Updated at 2024-10-16
        </p>
      </section>

      {/* Content Layout */}
      <div style={{
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
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(0, 217, 255, 0.15)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#00D9FF',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 12px 0',
            }}>
              Contents
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(section.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    color: '#a0a0a0',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    borderLeft: '2px solid transparent',
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
                  <span style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#00D9FF',
                    flexShrink: 0,
                  }} />
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <article style={{
          flex: '1',
          minWidth: '0',
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          padding: '48px',
        }}>
          {/* Introduction */}
          <section id="introduction" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Introduction</h2>
            <p style={paragraphStyle}>
              Stiqr Precision ('we,' 'our,' or 'us') is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Stiqr Precision.
            </p>
            <p style={paragraphStyle}>
              This Privacy Policy applies to our website, and its associated subdomains (collectively, our 'Service') alongside our application, Stiqr Precision. By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy and our Terms of Service.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Definitions */}
          <section id="definitions" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Definitions and key terms</h2>
            <p style={paragraphStyle}>
              To help explain things as clearly as possible in this Privacy Policy, every time any of these terms are referenced, they are strictly defined as:
            </p>
            <ul style={listStyle}>
              <li style={listItemStyle}><strong>Cookie:</strong> small amount of data generated by a website and saved by your web browser. It is used to identify your browser, provide analytics, remember information about you such as your language preference or login information.</li>
              <li style={listItemStyle}><strong>Company:</strong> when this policy mentions 'Company,' 'we,' 'our,' or 'us' it refers to Stiqr Precision, that is responsible for your information under this Privacy Policy.</li>
              <li style={listItemStyle}><strong>Country:</strong> where Stiqr Precision or the owners/founders of Stiqr Precision are based, in this case is Spain.</li>
              <li style={listItemStyle}><strong>Customer:</strong> refers to the company, organization or person that signs up to use the Stiqr Precision Service to manage the relationships with your consumers or service users.</li>
              <li style={listItemStyle}><strong>Device:</strong> any internet connected device such as a phone, tablet, computer or any other device that can be used to visit Stiqr Precision and use the services.</li>
              <li style={listItemStyle}><strong>IP address:</strong> Every device connected to the Internet is assigned a number known as an Internet protocol (IP) address.</li>
              <li style={listItemStyle}><strong>Personal Data:</strong> any information that directly, indirectly, or in connection with other information allows for the identification or identifiability of a natural person.</li>
              <li style={listItemStyle}><strong>Website:</strong> Stiqr Precision's site, which can be accessed via this URL: <a href="https://www.stiqr.top" style={{ color: '#00D9FF', textDecoration: 'underline' }}>https://www.stiqr.top</a></li>
            </ul>
          </section>

          <div style={dividerStyle} />

          {/* Information we collect */}
          <section id="information-collect" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Information we collect</h2>
            <p style={paragraphStyle}>
              We collect information from you when you visit our website, register on our site, place an order, subscribe to our newsletter, respond to a survey or fill out a form.
            </p>
            <ul style={listStyle}>
              <li style={listItemStyle}>Name / username</li>
              <li style={listItemStyle}>Phone numbers</li>
              <li style={listItemStyle}>Email addresses</li>
              <li style={listItemStyle}>Mailing addresses</li>
              <li style={listItemStyle}>Billing addresses</li>
              <li style={listItemStyle}>Debit/credit card numbers</li>
              <li style={listItemStyle}>Passwords</li>
            </ul>
            <p style={paragraphStyle}>
              We also collect information from mobile devices for a better user experience, although these features are completely optional.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* How we use information */}
          <section id="how-use" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>How do we use the information we collect?</h2>
            <p style={paragraphStyle}>
              Any of the information we collect from you may be used in one of the following ways:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}>
              {[
                { icon: '👤', text: 'To personalize your experience' },
                { icon: '📈', text: 'To improve our website' },
                { icon: '🎧', text: 'To improve customer service' },
                { icon: '💳', text: 'To process transactions' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '24px', color: '#00D9FF' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', color: '#a0a0a0', lineHeight: '1.4' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          <div style={dividerStyle} />

          {/* Protection */}
          <section id="protection" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>How do we protect your information?</h2>
            <p style={paragraphStyle}>
              We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. We offer the use of a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database only to be accessible by those authorized with special access rights to such systems.
            </p>
            <div style={{
              background: 'rgba(0, 217, 255, 0.04)',
              borderLeft: '4px solid #00D9FF',
              borderRadius: '0 10px 10px 0',
              padding: '24px',
              margin: '24px 0',
            }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#00D9FF',
                margin: '0 0 8px 0',
              }}>
                Important Security Note
              </p>
              <p style={{
                fontSize: '14px',
                fontStyle: 'italic',
                color: '#a0a0a0',
                margin: 0,
                lineHeight: '1.6',
              }}>
                After a transaction, your private information (credit cards, social security numbers, financials, etc.) is never kept on file.
              </p>
            </div>
          </section>

          <div style={dividerStyle} />

          {/* Cookies */}
          <section id="cookies" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Do we use 'cookies'?</h2>
            <p style={paragraphStyle}>
              Yes. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser (if you allow) that enables the site's or service provider's systems to recognize your browser and capture and remember certain information.
            </p>
            <p style={paragraphStyle}>
              We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so we can offer better site experiences and tools in the future.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Third Party */}
          <section id="third-party" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Third Party Disclosure</h2>
            <p style={paragraphStyle}>
              We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information unless we provide you with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Contact */}
          <section id="contact" style={{ scrollMarginTop: '100px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.06), rgba(255, 0, 255, 0.03))',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '16px',
              padding: '40px',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}>
                <div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#fff',
                    margin: '0 0 8px 0',
                  }}>
                    Questions regarding our privacy policy?
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: '#a0a0a0',
                    margin: 0,
                    lineHeight: '1.6',
                  }}>
                    Our dedicated compliance team is ready to assist you with any inquiries about how we handle your data and maintain precision in security.
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}>
                  <a
                    href="mailto:support@stiqr.top"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '14px 28px',
                      background: '#00D9FF',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#0a0a0a',
                      fontWeight: '700',
                      fontSize: '14px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <span>✉️</span>
                    support@stiqr.top
                  </a>
                  <a
                    href="/contact"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '14px 28px',
                      background: 'transparent',
                      border: '1px solid rgba(0, 217, 255, 0.5)',
                      borderRadius: '10px',
                      color: '#00D9FF',
                      fontWeight: '700',
                      fontSize: '14px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 217, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>💬</span>
                    Help Center
                  </a>
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>

      {/* Back button */}
      {onBack && (
        <div style={{ textAlign: 'center', padding: '0 20px 60px' }}>
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

// Shared styles
const sectionH2Style = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#00D9FF',
  margin: '0 0 16px 0',
};

const paragraphStyle = {
  fontSize: '15px',
  lineHeight: '1.8',
  color: '#a0a0a0',
  margin: '0 0 16px 0',
};

const listStyle = {
  listStyle: 'none',
  padding: 0,
  margin: '0 0 20px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const listItemStyle = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#a0a0a0',
  paddingLeft: '20px',
  position: 'relative',
};

const dividerStyle = {
  height: '1px',
  background: 'rgba(0, 217, 255, 0.1)',
  margin: '40px 0',
};

export default PrivacyPolicy;

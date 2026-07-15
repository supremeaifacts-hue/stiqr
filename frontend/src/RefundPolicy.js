import React from 'react';
import TopBar from './TopBar';
import { useAuth } from './contexts/AuthContext';

const RefundPolicy = ({ onViewDashboard, onViewPricing, onBack }) => {
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
    { id: 'definitions', title: 'Definitions', icon: '⚖️' },
    { id: 'eligibility', title: 'Refund Eligibility', icon: '📋' },
    { id: 'subscriptions', title: 'Subscription Refunds', icon: '🔄' },
    { id: 'plans', title: 'Annual & Monthly Plans', icon: '📅' },
    { id: 'non-refundable', title: 'Non-Refundable Items', icon: '🚫' },
    { id: 'request', title: 'How to Request', icon: '✉️' },
    { id: 'refunds', title: 'Refunds', icon: '💳' },
    { id: 'canceling', title: 'Canceling', icon: '⏹️' },
    { id: 'consent', title: 'Your Consent', icon: '✅' },
    { id: 'changes', title: 'Changes To Our Refund Policy', icon: '📝' },
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
          💰
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
          🔄
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
          <span style={{ fontSize: '16px' }}>💰</span>
          Policies & Transparency
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: '900',
          lineHeight: '1.1',
          margin: '0 0 18px 0',
          letterSpacing: '-1px',
        }}>
          <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
            Refund Policy
          </span>
        </h1>

        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#a0a0a0',
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          Last updated: June 15, 2024
        </p>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .legal-content-layout {
            flex-direction: column !important;
          }
          .legal-sidebar {
            order: -1 !important;
            position: static !important;
            flex: none !important;
            width: 100% !important;
            margin-bottom: 24px !important;
          }
        }
      `}</style>
      {/* Content Layout */}
      <div className="legal-content-layout" style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 20px 80px',
        display: 'flex',
        gap: '40px',
      }}>
        {/* Sidebar Navigation */}
        <aside className="legal-sidebar" style={{
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
              Legal Center
            </h4>
            <p style={{
              fontSize: '12px',
              color: '#a0a0a0',
              margin: '0 0 12px 0',
              opacity: '0.7',
            }}>
              Last updated June 15, 2024
            </p>
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
                  <span style={{ fontSize: '14px', color: '#00D9FF', flexShrink: 0 }}>{section.icon}</span>
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
          {/* Satisfaction Guarantee Banner */}
          <div style={{
            background: 'rgba(0, 217, 255, 0.06)',
            border: '1px solid rgba(0, 217, 255, 0.2)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
          }}>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#ccc',
              margin: 0,
            }}>
              We believe in our product and its ability to help individuals and businesses create, manage, and track QR codes effortlessly. Your satisfaction is our top priority, and we stand behind our software with a <strong style={{ color: '#00D9FF' }}>100% customer satisfaction guarantee</strong>.
            </p>
          </div>

          <p style={paragraphStyle}>
            As with any shopping experience, there are terms and conditions that apply to transactions at Stiqr Precision. The main thing to remember is that by placing an order or making a purchase at Stiqr Precision, you agree to the terms set forth below along with our Privacy Policy.
          </p>

          {/* Definitions */}
          <section id="definitions" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Definitions and key terms</h2>
            <p style={paragraphStyle}>
              To help explain things as clearly as possible in this Refund Policy, every time any of these terms are referenced, are strictly defined as:
            </p>
            <ul style={listStyle}>
              <li style={listItemStyle}><strong>Cookie:</strong> small amount of data generated by a website and saved by your web browser. It is used to identify your browser, provide analytics, remember information about you such as your language preference or login information.</li>
              <li style={listItemStyle}><strong>Company:</strong> when this policy mentions 'Company,' 'we,' 'us,' or 'our,' it refers to Stiqr Precision, that is responsible for your information under this Refund Policy.</li>
              <li style={listItemStyle}><strong>Customer:</strong> refers to the company, organization or person that signs up to use the Stiqr Precision Service to manage the relationships with your consumers or service users.</li>
              <li style={listItemStyle}><strong>Device:</strong> any internet connected device such as a phone, tablet, computer or any other device that can be used to visit stiqr.top and use the services.</li>
              <li style={listItemStyle}><strong>Service:</strong> refers to the service provided by Stiqr Precision as described in the relative terms and on this platform.</li>
              <li style={listItemStyle}><strong>Website:</strong> Stiqr Precision's site, which can be accessed via this URL: <a href="https://stiqr.top" style={{ color: '#00D9FF', textDecoration: 'underline' }}>https://stiqr.top</a></li>
              <li style={listItemStyle}><strong>You:</strong> a person or entity that is registered with Stiqr Precision to use the Services.</li>
            </ul>
          </section>

          <div style={dividerStyle} />

          {/* Refund Eligibility */}
          <section id="eligibility" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Refund Eligibility</h2>
            <p style={paragraphStyle}>
              Our commitment to transparency means we want you to understand exactly when you are eligible for a refund.
            </p>

            <h3 style={sectionH3Style}>Subscription Refunds</h3>
            <ul style={listStyle}>
              <li style={listItemStyle}>If you request a refund within <strong style={{ color: '#00D9FF' }}>7 days</strong> of your initial purchase, you are eligible for a full refund, no questions asked.</li>
              <li style={listItemStyle}>Refund requests made after 7 days will be reviewed on a case-by-case basis. While we do not guarantee refunds beyond this period, we will always do our best to resolve any issues.</li>
            </ul>

            <h3 style={sectionH3Style}>Annual & Monthly Plans</h3>
            <ul style={listStyle}>
              <li style={listItemStyle}><strong>Annual plans:</strong> Full refunds are available within the first 7 days of purchase.</li>
              <li style={listItemStyle}><strong>Monthly plans:</strong> If canceled within 7 days, a full refund will be issued. After this period, the subscription will remain active until the end of the billing cycle, with no further charges.</li>
            </ul>

            <h3 style={sectionH3Style}>Non-Refundable Items</h3>
            <ul style={listStyle}>
              <li style={listItemStyle}>Refunds do not apply to renewals or promotional discounts unless there is a clear service issue that we are unable to resolve.</li>
              <li style={listItemStyle}>If the user has excessive usage of Stiqr Precision services within the refund period, we reserve the right to decline the refund request.</li>
            </ul>
          </section>

          <div style={dividerStyle} />

          {/* How to Request */}
          <section id="request" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>How to Request a Refund</h2>
            <p style={paragraphStyle}>
              To request a refund, simply contact our customer support team at <strong style={{ color: '#00D9FF' }}>support@stiqr.top</strong> with your order details. Our friendly team will review your request and process the refund if eligible.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Refunds */}
          <section id="refunds" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Refunds</h2>
            <p style={paragraphStyle}>
              We are committed to providing our customers with the highest level of satisfaction. If you are not satisfied with your purchase, we offer a <strong style={{ color: '#00D9FF' }}>100% money-back guarantee</strong>. To request for a refund, please contact our customer service team at support@stiqr.top with your email address associated with your Stiqr Precision account and reason for the refund, and we will process the refund right away.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Canceling */}
          <section id="canceling" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Canceling</h2>
            <p style={paragraphStyle}>
              Stiqr Precision allows you to cancel your membership at any time by contacting us and asking for a cancellation or you can cancel it by yourself from your dashboard. After you cancel your membership, your QR Codes will go into paused mode and you can activate them again whenever you want by resubscribing.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Consent */}
          <section id="consent" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Your Consent</h2>
            <p style={paragraphStyle}>
              By using our website, registering an account, or making a purchase, you hereby consent to our Refund Policy and agree to its terms.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Changes */}
          <section id="changes" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Changes To Our Refund Policy</h2>
            <p style={paragraphStyle}>
              Should we update, amend or make any changes to this document so that they accurately reflect our Service and policies, those changes will be prominently posted here. If you continue to use the Service, you will be bound by the updated Return & Refund Policy.
            </p>
          </section>

          {/* Support Card */}
          <div style={{
            marginTop: '64px',
            padding: '32px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#fff',
                margin: '0 0 8px 0',
              }}>
                Questions about refunds?
              </h4>
              <p style={{
                fontSize: '15px',
                color: '#a0a0a0',
                margin: 0,
                lineHeight: '1.6',
              }}>
                Our support team is available 24/7 to help you with any billing inquiries.
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
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
                Email Support
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

const sectionH3Style = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#FF00FF',
  margin: '24px 0 12px 0',
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

export default RefundPolicy;

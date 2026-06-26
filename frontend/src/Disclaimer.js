import React from 'react';
import TopBar from './TopBar';
import { useAuth } from './contexts/AuthContext';

const Disclaimer = ({ onViewDashboard, onViewPricing, onBack }) => {
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
    {
      id: 'interpretation',
      title: 'Interpretation and Definitions',
      content: (
        <>
          <h3 style={sectionH3Style}>Interpretation</h3>
          <p style={paragraphStyle}>
            The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
          </p>
          <h3 style={sectionH3Style}>Definitions</h3>
          <p style={paragraphStyle}>For the purposes of this Disclaimer:</p>
          <ul style={listStyle}>
            <li style={listItemStyle}><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Disclaimer) refers to Stiqr Precision.</li>
            <li style={listItemStyle}><strong>Service</strong> refers to the Website and the QR code generation platform.</li>
            <li style={listItemStyle}><strong>You</strong> means the individual accessing the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
            <li style={listItemStyle}><strong>Website</strong> refers to Stiqr Precision, accessible from <a href="https://stiqr.top" style={{ color: '#00D9FF', textDecoration: 'underline' }}>https://stiqr.top</a></li>
          </ul>
        </>
      )
    },
    {
      id: 'general',
      title: 'General Disclaimer',
      content: (
        <>
          <p style={paragraphStyle}>
            The information contained on the Service is for general information purposes only. The Company assumes no responsibility for errors or omissions in the contents of the Service.
          </p>
          <p style={paragraphStyle}>
            In no event shall the Company be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service. The Company reserves the right to make additions, deletions, or modifications to the contents on the Service at any time without prior notice.
          </p>
        </>
      )
    },
    {
      id: 'external',
      title: 'External Links Disclaimer',
      content: (
        <p style={paragraphStyle}>
          The Service may contain links to external websites that are not provided or maintained by or in any way affiliated with the Company. Please note that the Company does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
        </p>
      )
    },
    {
      id: 'errors',
      title: 'Errors and Omissions Disclaimer',
      content: (
        <>
          <p style={paragraphStyle}>
            The information given by the Service is for general guidance on matters of interest only. Even if the Company takes every precaution to ensure that the content of the Service is both current and accurate, errors can occur. Plus, given the changing nature of laws, rules and regulations, there may be delays, omissions or inaccuracies in the information contained on the Service.
          </p>
          <p style={paragraphStyle}>
            The Company is not responsible for any errors or omissions, or for the results obtained from the use of this information.
          </p>
        </>
      )
    },
    {
      id: 'fairuse',
      title: 'Fair Use Disclaimer',
      content: (
        <>
          <p style={paragraphStyle}>
            The Company may use copyrighted material which has not always been specifically authorized by the copyright owner. The Company is making such material available for criticism, comment, news reporting, teaching, scholarship, or research.
          </p>
          <p style={paragraphStyle}>
            The Company believes this constitutes a "fair use" of any such copyrighted material as provided for in section 107 of the United States Copyright law.
          </p>
        </>
      )
    },
    {
      id: 'liability',
      title: '"As Is" and "As Available" Disclaimer',
      content: (
        <p style={paragraphStyle}>
          The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service.
        </p>
      )
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
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '10%',
          fontSize: '64px',
          opacity: '0.12',
          color: '#00D9FF',
          pointerEvents: 'none',
        }}>
          ⚖️
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
          📜
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
          <span style={{ fontSize: '16px' }}>⚖️</span>
          Legal Documentation
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: '900',
          lineHeight: '1.1',
          margin: '0 0 18px 0',
          letterSpacing: '-1px',
        }}>
          <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
            Disclaimer
          </span>
        </h1>

        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#a0a0a0',
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          Last updated: June 15, 2024. Please read this disclaimer carefully before using Stiqr Precision services.
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
              Table of Contents
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    padding: '8px 10px',
                    borderRadius: '8px',
                    color: '#a0a0a0',
                    textDecoration: 'none',
                    fontSize: '13px',
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
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#00D9FF',
                    flexShrink: 0,
                  }} />
                  {section.title}
                </a>
              ))}
            </nav>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.08), rgba(255, 0, 255, 0.05))',
            border: '1px solid rgba(0, 217, 255, 0.15)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#00D9FF',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 8px 0',
            }}>
              Need help?
            </p>
            <p style={{
              fontSize: '14px',
              color: '#ccc',
              margin: '0 0 16px 0',
              lineHeight: '1.5',
            }}>
              Contact our legal team for specific questions regarding our terms.
            </p>
            <button
              onClick={() => window.location.href = '/contact'}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: '1px solid #00D9FF',
                borderRadius: '8px',
                color: '#00D9FF',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: '"Inter", "Segoe UI", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Support Center
            </button>
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
          {sections.map((section, idx) => (
            <React.Fragment key={section.id}>
              <section
                id={section.id}
                style={{
                  scrollMarginTop: '100px',
                }}
              >
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#00D9FF',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  {section.title}
                </h2>
                {section.content}
              </section>
              {idx < sections.length - 1 && (
                <div style={{
                  height: '1px',
                  background: 'rgba(0, 217, 255, 0.1)',
                  margin: '40px 0',
                }} />
              )}
            </React.Fragment>
          ))}

          {/* Contact Section */}
          <div style={{
            marginTop: '48px',
            padding: '32px',
            background: 'rgba(0, 217, 255, 0.04)',
            border: '1px solid rgba(0, 217, 255, 0.2)',
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '32px', color: '#00D9FF', flexShrink: 0 }}>ℹ️</span>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#fff',
                  margin: '0 0 8px 0',
                }}>
                  Contact Us
                </h2>
                <p style={{
                  fontSize: '15px',
                  color: '#a0a0a0',
                  margin: '0 0 16px 0',
                  lineHeight: '1.6',
                }}>
                  If you have any questions about this Disclaimer, You can contact us:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#00D9FF', fontSize: '20px' }}>✉️</span>
                    <span style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>legal@stiqr.top</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#00D9FF', fontSize: '20px' }}>🌐</span>
                    <a href="https://stiqr.top/contact" style={{ color: '#00D9FF', fontWeight: '600', fontSize: '15px', textDecoration: 'underline' }}>
                      stiqr.top/contact
                    </a>
                  </div>
                </div>
              </div>
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
const sectionH3Style = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#FF00FF',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
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

export default Disclaimer;

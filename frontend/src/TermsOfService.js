import React from 'react';
import TopBar from './TopBar';
import { useAuth } from './contexts/AuthContext';

const TermsOfService = ({ onViewDashboard, onViewPricing, onBack }) => {
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
    { id: 'general', title: 'General Terms' },
    { id: 'license', title: 'License' },
    { id: 'definitions', title: 'Definitions & Key Terms' },
    { id: 'restrictions', title: 'Restrictions' },
    { id: 'refunds', title: 'Return & Refund Policy' },
    { id: 'suggestions', title: 'Your Suggestions' },
    { id: 'consent', title: 'Your Consent' },
    { id: 'links', title: 'Links to Other Websites' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'modifications', title: 'Modifications to Website' },
    { id: 'updates', title: 'Updates to Website' },
    { id: 'ownership', title: 'Ownership of Product' },
    { id: 'third-party', title: 'Third-Party Services' },
    { id: 'termination', title: 'Term & Termination' },
    { id: 'copyright', title: 'Copyright Notice' },
    { id: 'indemnification', title: 'Indemnification' },
    { id: 'warranties', title: 'No Warranties' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'contact', title: 'Contact Us' },
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
          📄
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
            Terms of Service
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
          {/* General Terms */}
          <section id="general" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>General Terms</h2>
            <p style={paragraphStyle}>
              By accessing and placing an order with Stiqr Precision, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and Stiqr Precision.
            </p>
            <p style={paragraphStyle}>
              Under no circumstances shall Stiqr Precision team be liable for any direct, indirect, special, incidental or consequential damages, including, but not limited to, loss of data or profit, arising out of the use, or the inability to use, the materials on this site, even if Stiqr Precision team or an authorized representative has been advised of the possibility of such damages.
            </p>
            <p style={paragraphStyle}>
              Stiqr Precision will not be responsible for any outcome that may occur during the course of usage of our resources. We reserve the rights to change prices and revise the resources usage policy in any moment.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* License */}
          <section id="license" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>License</h2>
            <p style={paragraphStyle}>
              Stiqr Precision grants you a revocable, non-exclusive, non-transferable, limited license to download, install and use the website strictly in accordance with the terms of this Agreement.
            </p>
            <p style={paragraphStyle}>
              These Terms & Conditions are a contract between you and Stiqr Precision (referred to in these Terms & Conditions as 'Stiqr Precision', 'us', 'we' or 'our'), the provider of the stiqr.top website and the services accessible from the stiqr.top website.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Definitions */}
          <section id="definitions" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Definitions and key terms</h2>
            <p style={paragraphStyle}>
              To help explain things as clearly as possible in this Terms & Conditions, every time any of these terms are referenced, are strictly defined as:
            </p>
            <ul style={listStyle}>
              <li style={listItemStyle}><strong>Cookie:</strong> small amount of data generated by a website and saved by your web browser. It is used to identify your browser, provide analytics, remember information about you.</li>
              <li style={listItemStyle}><strong>Company:</strong> when this policy mentions 'Company,' 'we,' 'us,' or 'our,' it refers to Stiqr Precision, responsible for your information under this Terms & Conditions.</li>
              <li style={listItemStyle}><strong>Country:</strong> where Stiqr Precision or the owners/founders are based.</li>
              <li style={listItemStyle}><strong>Device:</strong> any internet connected device such as a phone, tablet, computer or any other device that can be used to visit stiqr.top.</li>
              <li style={listItemStyle}><strong>Website:</strong> Stiqr Precision's site, which can be accessed via this URL: <a href="https://stiqr.top" style={{ color: '#00D9FF', textDecoration: 'underline' }}>https://stiqr.top</a></li>
              <li style={listItemStyle}><strong>You:</strong> a person or entity that is registered with Stiqr Precision to use the Services.</li>
            </ul>
          </section>

          <div style={dividerStyle} />

          {/* Restrictions */}
          <section id="restrictions" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Restrictions</h2>
            <p style={paragraphStyle}>You agree not to, and you will not permit others to:</p>
            <ul style={listStyle}>
              <li style={listItemStyle}>License, sell, rent, lease, assign, distribute, transmit, host, outsource, disclose or otherwise commercially exploit the website.</li>
              <li style={listItemStyle}>Modify, make derivative works of, disassemble, decrypt, reverse compile or reverse engineer any part of the website.</li>
              <li style={listItemStyle}>Remove, alter or obscure any proprietary notice (including any notice of copyright or trademark) of Stiqr Precision or its affiliates.</li>
            </ul>
          </section>

          <div style={dividerStyle} />

          {/* Refunds */}
          <section id="refunds" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Return and Refund Policy</h2>
            <p style={paragraphStyle}>
              We believe in our product and its ability to help individuals and businesses create, manage, and track QR codes effortlessly. Your satisfaction is our top priority, and we stand behind our software with a 100% customer satisfaction guarantee.
            </p>
            <p style={paragraphStyle}>
              As with any shopping experience, there are terms and conditions that apply to transactions at Stiqr Precision. By placing an order or making a purchase at Stiqr Precision, you agree to the terms set forth along with our Privacy Policy.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Suggestions */}
          <section id="suggestions" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Your Suggestions</h2>
            <p style={paragraphStyle}>
              Any feedback, comments, ideas, improvements or suggestions provided by you to Stiqr Precision with respect to the website shall remain the sole and exclusive property of Stiqr Precision.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Consent */}
          <section id="consent" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Your Consent</h2>
            <p style={paragraphStyle}>
              We've updated our Terms & Conditions to provide you with complete transparency into what is being set when you visit our site and how it's being used. By using our website, registering an account, or making a purchase, you hereby consent to our Terms & Conditions.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Links */}
          <section id="links" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Links to Other Websites</h2>
            <p style={paragraphStyle}>
              The Services may contain links to other websites not operated or controlled by Stiqr Precision. We are not responsible for the content, accuracy or opinions expressed in such websites. Your browsing and interaction on any other website is subject to that website's own rules and policies.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Cookies */}
          <section id="cookies" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Cookies</h2>
            <p style={paragraphStyle}>
              Stiqr Precision uses 'Cookies' to identify the areas of our website that you have visited. We use Cookies to enhance the performance and functionality of our website but are non-essential to their use.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Changes */}
          <section id="changes" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Changes To Our Terms & Conditions</h2>
            <p style={paragraphStyle}>
              Stiqr Precision may stop (permanently or temporarily) providing the Service at Stiqr Precision's sole discretion, without prior notice to you. If we decide to change our Terms & Conditions, we will post those changes on this page.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Modifications */}
          <section id="modifications" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Modifications to Our website</h2>
            <p style={paragraphStyle}>
              Stiqr Precision reserves the right to modify, suspend or discontinue, temporarily or permanently, the website or any service to which it connects, with or without notice.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Updates */}
          <section id="updates" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Updates to Our website</h2>
            <p style={paragraphStyle}>
              Stiqr Precision may from time to time provide enhancements or improvements to the features/functionality of the website, which may include patches, bug fixes, updates, upgrades and other modifications.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Ownership */}
          <section id="ownership" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Ownership of the end product</h2>
            <p style={paragraphStyle}>
              The data and IP from the codes you generate are owned by you. Precision and clarity in ownership are core to the Stiqr Precision philosophy.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Third-Party */}
          <section id="third-party" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Third-Party Services</h2>
            <p style={paragraphStyle}>
              We may display, include or make available third-party content. You acknowledge and agree that Stiqr Precision shall not be responsible for any Third-Party Services, including their accuracy, completeness, or any other aspect thereof.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Termination */}
          <section id="termination" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Term and Termination</h2>
            <p style={paragraphStyle}>
              This Agreement shall remain in effect until terminated by you or Stiqr Precision. Stiqr Precision may, in its sole discretion, at any time and for any or no reason, suspend or terminate this Agreement with or without prior notice.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Copyright */}
          <section id="copyright" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Copyright Infringement Notice</h2>
            <p style={paragraphStyle}>
              If you believe any material on our website constitutes an infringement on your copyright, please contact us with the relevant identification and contact information for immediate review.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Indemnification */}
          <section id="indemnification" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Indemnification</h2>
            <p style={paragraphStyle}>
              You agree to indemnify and hold Stiqr Precision and its parents, subsidiaries, affiliates, officers, employees, agents, partners and licensors harmless from any claim or demand, including reasonable attorneys' fees.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Warranties */}
          <section id="warranties" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>No Warranties</h2>
            <p style={paragraphStyle}>
              The website is provided to you 'AS IS' and 'AS AVAILABLE' and with all faults and defects without warranty of any kind. Stiqr Precision provides no warranty or undertaking that the website will meet your requirements or achieve any intended results.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* Liability */}
          <section id="liability" style={{ scrollMarginTop: '100px' }}>
            <h2 style={sectionH2Style}>Limitation of Liability</h2>
            <p style={paragraphStyle}>
              Notwithstanding any damages that you might incur, the entire liability of Stiqr Precision and any of its suppliers under any provision of this Agreement shall be limited to the amount actually paid by you for the website.
            </p>
          </section>

          {/* Contact Us Card */}
          <section id="contact" style={{ scrollMarginTop: '100px', marginTop: '64px', paddingTop: '32px', borderTop: '1px solid rgba(0, 217, 255, 0.15)' }}>
            <div style={{
              background: 'rgba(0, 217, 255, 0.04)',
              borderRadius: '12px',
              padding: '32px',
              border: '1px solid rgba(0, 217, 255, 0.2)',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#fff',
                margin: '0 0 8px 0',
              }}>
                Questions about these terms?
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#a0a0a0',
                margin: '0 0 24px 0',
                lineHeight: '1.6',
              }}>
                Our legal and support teams are here to help clarify any aspect of our service agreement.
              </p>
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
                    gap: '12px',
                    padding: '16px 20px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    minWidth: '200px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00D9FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <span style={{ fontSize: '24px', color: '#00D9FF' }}>✉️</span>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0' }}>
                      Email Support
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#00D9FF', margin: 0 }}>
                      support@stiqr.top
                    </p>
                  </div>
                </a>
                <a
                  href="/contact"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    minWidth: '200px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00D9FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <span style={{ fontSize: '24px', color: '#00D9FF' }}>💬</span>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0' }}>
                      Help Center
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#00D9FF', margin: 0 }}>
                      View Documentation
                    </p>
                  </div>
                </a>
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
  margin: '0 0 ',
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

export default TermsOfService;

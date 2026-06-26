import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const QRCodeTypes = ({ onViewDashboard, onViewPricing }) => {
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
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            borderRadius: '30px',
            color: '#00D9FF',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            Product Catalog
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            lineHeight: '1.1',
            margin: '0 0 20px',
            letterSpacing: '-1px',
          }}>
            <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
              QR Code Types
            </span>
            <br />
            <span style={{ color: '#ffffff' }}>Select According to Your Needs</span>
          </h1>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            maxWidth: '700px',
            margin: '0 auto 30px',
          }}>
            From simple URL redirection to complex multi-platform social hubs, choose the perfect QR engine for your physical-to-digital bridge.
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            maxWidth: '700px',
            margin: '0 auto',
          }}>
            {['Website URL', 'Wi-Fi', 'PDF', 'Social Media', 'Event'].map((tag) => (
              <a key={tag} href={`#${tag.toLowerCase().replace(/\s+/g, '-')}`} style={{
                padding: '8px 20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '30px',
                color: '#888',
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#00D9FF';
                e.target.style.color = '#00D9FF';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = '#888';
              }}
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* QR Code Types Sections */}
      <main style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '100px' }}>

          {/* Website URL */}
          <Section id="website-url"
            badge="DYNAMIC URL"
            badgeColor="#00D9FF"
            title="Website URL"
            description="Increase website traffic by adding the website URL QR code to your marketing mix. You can share any link, from your socials to any landing page, tracking every single engagement along the way."
            features={['Real-time scan analytics', 'Change destinations without reprinting']}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDAdaLjShiN7UnjAYycg2uQbgV-kO9MXM3yaAx3u6jwf-vYlNr8UYz9Y1zIbvXxNU7Djb-YJgAlZlW2B9zF4zV4IrxpP3S8bo_u3z-yOCdtoTXvLJ-dDmSD5qhTKrJEBO9WoaZ001e53K_iWBx_57ktPFmJNC9iqLb6aO01uT9o_O8baAHItbBJMcwn492yZ2Nr1j4yS5_f0tkaXw1hKrwoykVpJ4YmKALBrx4ZHBcvcsjeJIaBwsHobTBvfhd0JQR_rhJNGAEE7zOu"
            stat="+124%"
            statLabel="Avg. growth in traffic"
            reversed={false}
            onGenerateCode={() => navigate('/')}
          />

          {/* Wi-Fi */}
          <Section id="wifi"
            badge="INSTANT ACCESS"
            badgeColor="#00D9FF"
            title="Wi-Fi Connectivity"
            description="Provide instant access to high-speed internet without the friction of typing complex passwords. Perfect for hotels, cafes, and corporate lounges looking for a premium touch."
            features={['Secure WPA2 encryption', 'One-tap connect experience']}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCI0RJyu6eoGBXGdqnDxWJ2q6tDDyTXY2HfevsqcN7adNGIUrcndNPP0icmEuBnfNApAzcVjKvRspXzkvbtz2ksTht4tdCt92Zo6TivHPmDkhr0wvZCPaQSm1NqP7ntmowqvnTPb_4y3DdjJMMiR9o02MfwNBFW9Ez-xNEwfj4CR68Ikpq12Nh3NK-z2sLTUgfgWnKkZt4yGORAzLnYF1QimTM0RS1t_7bGsmXeuPyvNzV6P0ukstUbKsTMM_HBRCvSj1ofSt0XWmMD"
            reversed={true}
            onGenerateCode={() => navigate('/')}
          />

          {/* PDF */}
          <Section id="pdf"
            badge="DOCUMENT SHARING"
            badgeColor="#FF00FF"
            title="PDF Documents"
            description="The enormous practicality of PDF files can also be accessed via a QR code for PDF. This is perfect to share menus at restaurants or for academic reports and whitepapers."
            features={['Mobile-optimized PDF viewer', 'Your documents look great on every device']}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuB1QSgC3S3Nc5wJGfkaPr5nZ2ms0r62Vp8jgLK_J5i2GTHISJQs1_evUX2C5vowv-l31hytqvI4lV-zlTLRHtF4ZlCZLFJzvYi5wbFoEkDluQJl7UIxBq-ZTyG__VOWKqimFxCRBXtlTfhEZM50e_gc_CyHWCWAUmj9UKlLVef2_uKDYk9IAW_14AGMRzBonT6dc300SzPiLufE24PGQHHKJ12tTC4ZQL4kLYugBwzXF1iHpRUcAlIEkEkx5XstPTWTmeB5LWbzhe34"
            reversed={false}
            onGenerateCode={() => navigate('/')}
          />

          {/* Social Media */}
          <Section id="social-media"
            badge="OMNI-CHANNEL"
            badgeColor="#FF00FF"
            title="Social Media Link-in-Bio"
            description="The perfect code to increase engagement and grow your follower base. Host all your profiles—from Instagram to LinkedIn—in one unified, customizable landing page."
            features={['Unified social hub', 'Grow your follower base across platforms']}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCCYBJ9QyWnTtQ70DHFaTlwGLQUd-vQmjKmBY5Zk2XSMg6SkM2sMoGIm3ZLHVEcxta0KVSLTRR9g0leGIQx0PeVWgx-5bhgTBOrf_yHPJcNYp0nFzUf0tzgVITqjWhop2LrlQYRvQIBdK97Gyn8p0DbZNehhAN1q5x3pDH06R54dCjw3tuRFeDaEzeY-zmBUlmrgCKZr7uDx6y3c9Vv7D3At7n5mH_UKfLSWaSCt0043YzqwNOGTDzFOaTbFHrX_ZOvZRrL_xcHZgsF"
            reversed={true}
            darkBg={true}
            onGenerateCode={() => navigate('/')}
          />

          {/* Event */}
          <Section id="event"
            badge="LIVE EVENTS"
            badgeColor="#F3B036"
            title="Event Management"
            description="Spice up your event marketing with a QR code for events. Share the name, location, date, and time, and even allow users to add it directly to their calendar with a single scan."
            features={[
              'Google Maps Integration: Provide direct navigation to your venue',
              'Auto-Reminders: Help attendees save the date instantly',
            ]}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDpKfS6xeBtJ5OLqeB3Y0QhJEmAr1fUizadQUVtyeGoy4wWmx2tPp2MRszg7WQkiThciG_Lfe1vFmlORnQ08U4WrT44VNhrWzpbriBkR7PcY1YF2fkT1X2RhgtymM6q6y_QpNNIPs0VvHqm5ik6vVc2GWRC4gED3UigbDm-rKLw-IlQ-QAD9aFA2Y_ezJBQBYYJMILOKaA6kDqq5JrrempeNT2yWwet1B-NsHV0hzrHG4_bCJiAfJb2lrB2cqFR6jbKj23uzN6Hpc1p"
            reversed={false}
            onGenerateCode={() => navigate('/')}
          />

        </div>
      </main>

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '20px',
          }}>
            Ready to Bridge the Gap?
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            marginBottom: '30px',
          }}>
            Join thousands of businesses using StiQR to track engagement and drive conversions through precision QR technology.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/')}
              style={{
              background: '#00D9FF',
              color: '#0a0a0a',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              Create Your First Code
            </button>
            <button
              onClick={() => navigate('/pricing')}
              style={{
              background: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '16px 40px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = '#00D9FF'; e.target.style.color = '#00D9FF'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.target.style.color = '#fff'; }}
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

/* Reusable Section Component */
const Section = ({ id, badge, badgeColor, title, description, features, image, stat, statLabel, reversed, darkBg, onGenerateCode }) => {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: reversed ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: '80px',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {/* Text Side */}
      <div style={{ flex: '1', minWidth: '300px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: darkBg ? 'rgba(0, 217, 255, 0.15)' : 'rgba(0, 217, 255, 0.1)',
          borderRadius: '30px',
          color: badgeColor,
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '16px' }}>✦</span>
          {badge}
        </div>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '16px',
          color: darkBg ? '#fff' : '#fff',
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: '16px',
          lineHeight: '1.7',
          color: darkBg ? '#b0b0b0' : '#a0a0a0',
          marginBottom: '24px',
        }}>
          {description}
        </p>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {features.map((f, i) => (
            <li key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: darkBg ? '#d0d0d0' : '#ccc',
              fontSize: '15px',
            }}>
              <span style={{ color: '#00D9FF', fontSize: '18px' }}>✓</span>
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={onGenerateCode}
          style={{
          background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
          color: '#0a0a0a',
          border: 'none',
          padding: '14px 32px',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.target.style.boxShadow = '0 8px 24px rgba(0, 217, 255, 0.3)'; }}
        onMouseLeave={(e) => { e.target.style.boxShadow = 'none'; }}
        >
          Generate Code
          <span style={{ fontSize: '18px' }}>→</span>
        </button>
      </div>

      {/* Image Side */}
      <div style={{ flex: '1', minWidth: '300px', maxWidth: '540px', position: 'relative' }}>
        {darkBg && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 217, 255, 0.08)',
            borderRadius: '16px',
            filter: 'blur(60px)',
          }} />
        )}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          padding: '8px',
        }}>
          <img
            src={image}
            alt={title}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '12px',
              display: 'block',
              aspectRatio: '4/3',
              objectFit: 'cover',
            }}
          />
        </div>
        {stat && (
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: reversed ? 'auto' : '-20px',
            right: reversed ? '-20px' : 'auto',
            background: '#1a0a2e',
            border: '1px solid rgba(0, 217, 255, 0.2)',
            padding: '20px',
            borderRadius: '12px',
            display: 'none',
          }}>
            <div style={{ fontSize: '11px', color: '#888', letterSpacing: '1px', marginBottom: '4px' }}>SCAN RATE</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#00D9FF' }}>{stat}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{statLabel}</div>
          </div>
        )}
      </div>
    </div>
  );

  if (darkBg) {
    return (
      <section id={id} style={{
        padding: '80px',
        margin: '0 -80px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
      }}>
        {content}
      </section>
    );
  }

  return (
    <section id={id}>
      {content}
    </section>
  );
};

export default QRCodeTypes;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';

const CancelSubscription = () => {
  const navigate = useNavigate();

  const featuresToLose = [
    {
      icon: '📊',
      title: 'Real Time Analytics & Reporting',
      description: 'Live scan tracking, location insights, and detailed performance reports for every QR code.',
    },
    {
      icon: '🔄',
      title: 'Editable QR Codes',
      description: 'Change the destination URL or content anytime without regenerating your QR codes.',
    },
    {
      icon: '🎨',
      title: 'Customization of the QR Codes',
      description: 'Vibrant colors, stickers, logos, and frames to make your QR codes stand out.',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      color: '#fff',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
    }}>
      <TopBar
        onViewDashboard={() => window.location.href = '/dashboard'}
        onViewPricing={() => window.location.href = '/pricing'}
        onGoToLanding={() => navigate('/')}
      />

      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '60px 20px 100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        {/* Crying QR Code Image */}
        <div style={{
          width: '200px',
          height: '200px',
          marginBottom: '30px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            inset: '-20px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 0, 255, 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }} />
          <img
            src="/assets/crying-qr-code.svg"
            alt="A sad crying QR code"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
            }}
          />
        </div>

        {/* Apology Section */}
        <h1 style={{
          fontSize: '42px',
          fontWeight: '900',
          margin: '0 0 16px 0',
          letterSpacing: '-1px',
          lineHeight: '1.2',
        }}>
          We're Sorry to See You Go{' '}
          <span style={{ color: '#FF00FF', textShadow: '0 0 20px rgba(255, 0, 255, 0.4)' }}>💔</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#a0a0a0',
          lineHeight: '1.7',
          maxWidth: '650px',
          margin: '0 0 12px 0',
        }}>
          We're truly sorry that you're considering leaving us. At <strong style={{ color: '#00D9FF' }}>StiQR</strong>, 
          we're constantly working to improve our platform, and your feedback is invaluable to us.
        </p>

        <p style={{
          fontSize: '16px',
          color: '#a0a0a0',
          lineHeight: '1.7',
          maxWidth: '650px',
          margin: '0 0 50px 0',
        }}>
          If there's anything we could have done better, please let us know. We'd love to hear your thoughts 
          and make StiQR a better experience for everyone.
        </p>

        {/* Features You'll Lose Card */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 0, 255, 0.2)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '40px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 40px rgba(255, 0, 255, 0.05)',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#FF00FF',
            margin: '0 0 8px 0',
          }}>
            ⚠️ You Will Lose Access To
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#a0a0a0',
            margin: '0 0 30px 0',
          }}>
            These premium features will no longer be available after cancellation
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {featuresToLose.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(0, 217, 255, 0.15)',
                borderRadius: '12px',
                padding: '18px 20px',
                textAlign: 'left',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.4)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.15)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{
                  fontSize: '28px',
                  lineHeight: '1',
                  flexShrink: 0,
                }}>
                  {feature.icon}
                </span>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#00D9FF',
                    margin: '0 0 4px 0',
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#a0a0a0',
                    lineHeight: '1.5',
                    margin: '0',
                  }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Cancel */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(0, 217, 255, 0.15)',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '40px',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#ffffff',
            margin: '0 0 12px 0',
          }}>
            📧 How to Cancel
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#a0a0a0',
            lineHeight: '1.6',
            margin: '0 0 16px 0',
          }}>
            To cancel your subscription, please send us an email from the account associated with your subscription to:
          </p>
          <a
            href="mailto:support@stiqr.top"
            style={{
              display: 'inline-block',
              fontSize: '20px',
              fontWeight: '700',
              color: '#00D9FF',
              textDecoration: 'none',
              padding: '10px 24px',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              borderRadius: '10px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00D9FF';
              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            support@stiqr.top
          </a>
          <p style={{
            fontSize: '13px',
            color: '#666',
            lineHeight: '1.5',
            margin: '16px 0 0 0',
          }}>
            We'll process your request within 24 hours and send you a confirmation email.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '500px',
        }}>
          <button
            onClick={() => navigate('/contact')}
            style={{
              width: '100%',
              padding: '18px 32px',
              fontSize: '18px',
              fontWeight: '700',
              color: '#fff',
              background: 'linear-gradient(135deg, #FF00FF, #cc00cc)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(255, 0, 255, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 0, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 0, 255, 0.3)';
            }}
          >
            Cancel Subscription
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '18px 32px',
              fontSize: '18px',
              fontWeight: '700',
              color: '#00D9FF',
              background: 'transparent',
              border: '2px solid rgba(0, 217, 255, 0.4)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00D9FF';
              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 217, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.4)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            I Changed My Mind, Keep My Account
          </button>
        </div>
      </main>
    </div>
  );
};

export default CancelSubscription;

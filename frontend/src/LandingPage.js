import React from 'react';
import EditorPage from './EditorPage';
import TopBar from './TopBar';
import { useAuth } from './contexts/AuthContext';

const LandingPage = ({ onViewDashboard, onViewPricing, qrCodeToEdit, onClearQrCodeToEdit }) => {
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      color: '#fff',
      padding: '0',
      margin: '0',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      overflow: 'hidden',
    }}>
      <TopBar 
        onViewDashboard={onViewDashboard}
        onViewPricing={handlePricingClick}
        onSignUp={handleSignUpClick}
        onLogin={handleLoginClick}
        onGoToLanding={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Hero Section */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px 120px',
      }}>
        {/* Subtitle */}
        <div style={{
          display: 'flex',
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
          <span style={{ fontSize: '16px' }}>✨</span>
          Next-Gen QR Code Generator
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: '56px',
          fontWeight: '900',
          lineHeight: '1.1',
          margin: '0 0 18px 0',
          letterSpacing: '-1px',
        }}>
          <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
            Create QR Codes 
          </span>
          <span style={{ color: '#ffffff' }}> That Pop</span>
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          color: '#a0a0a0',
          maxWidth: '700px',
          marginBottom: '10px',
        }}>
          Generate fully customized QR codes with{' '}
          <span style={{ color: '#00D9FF' }}>stunning stickers</span>, vibrant colors, and advanced features for your brand.
        </p>

        <div style={{ width: '100%', maxWidth: '1200px', marginTop: '10px' }}>
          <EditorPage embedded qrCodeToEdit={qrCodeToEdit} onClearQrCodeToEdit={onClearQrCodeToEdit} />
        </div>

        {/* Benefits Section */}
        <div style={{
          marginTop: '80px',
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          maxWidth: '1200px',
          padding: '0 40px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            textAlign: 'right',
            maxWidth: '700px',
          }}>
            <h2 style={{
              fontSize: '42px',
              fontWeight: '900',
              color: '#ffffff',
              margin: '0 0 20px 0',
              letterSpacing: '-1px',
            }}>
              Benefits of <span style={{ color: '#00D9FF' }}>stiQR.top</span>
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#a0a0a0',
              lineHeight: '1.7',
              margin: '0 0 30px 0',
            }}>
              By using stiQR.top you will be able attract people to your business, making them easily choose you over the competitors.
            </p>
            <p style={{
              fontSize: '16px',
              color: '#a0a0a0',
              lineHeight: '1.7',
              margin: '0 0 30px 0',
            }}>
              <strong style={{ color: '#FF00FF' }}>Why?</strong><br />
              Because stiQR allows you to add stickers or logos over your QR codes, making it different from the usual bland black and white QR code. Do you want to get noticed instantly? Change the colors, add frames and place your logo over the QR code.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '12px',
            }}>
              {[
                'Dynamic QR Codes',
                'Static QR Codes',
                'QR Code Statistics',
                'Customized Colors & Shapes for QR Codes',
                'No Coding Required',
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  color: '#ffffff',
                  fontWeight: '500',
                }}>
                  <span>{item}</span>
                  <span style={{
                    color: '#00D9FF',
                    fontSize: '20px',
                    fontWeight: '700',
                  }}>✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Our Logos Section ===== */}
      <section style={{
        padding: '60px 20px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderTop: '1px solid rgba(0, 217, 255, 0.1)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#00D9FF',
          marginBottom: '16px',
        }}>
          Our Logos
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#a0a0a0',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: '1.6',
        }}>
          We thank <a href="https://www.flaticon.com" target="_blank" rel="noopener noreferrer" style={{ color: '#FF00FF', textDecoration: 'underline' }}>Flaticon</a> for providing the commonly used logos. 
          Click on a logo below to copy the original attribution link.
        </p>

        <style>{`
          .logo-container-items {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
            transform-style: preserve-3d;
            transform: perspective(1000px);
            max-width: 800px;
            margin: 0 auto;
          }

          .logo-item {
            position: relative;
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            border: none;
            outline: none;
            transition: 500ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
            cursor: pointer;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
          }

          .logo-item img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            pointer-events: none;
          }

          .logo-item::before {
            position: absolute;
            content: attr(data-tooltip);
            left: 50%;
            bottom: 58px;
            font-size: 10px;
            line-height: 14px;
            transform: translateX(-50%);
            padding: 4px 8px;
            background-color: #ffffff;
            color: #000;
            border-radius: 6px;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            transition: 500ms cubic-bezier(0.175, 0.885, 0.32, 1.1);
            white-space: nowrap;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .logo-item:hover {
            transform: scale(1.5);
            z-index: 99999;
          }

          .logo-item:hover::before {
            opacity: 1;
            visibility: visible;
          }

          .logo-item:active {
            transform: scale(1.1);
          }

          .logo-item:hover + .logo-item {
            transform: scale(1.3);
            z-index: 9999;
          }

          .logo-item:hover + .logo-item + .logo-item {
            transform: scale(1.15);
            z-index: 999;
          }

          .logo-item:has(+ .logo-item:hover) {
            transform: scale(1.3);
            z-index: 9999;
          }

          .logo-item:has(+ .logo-item + .logo-item:hover) {
            transform: scale(1.15);
            z-index: 999;
          }

          .logo-toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #00D9FF;
            color: #000;
            padding: 10px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 99999;
            animation: fadeInUp 0.3s ease, fadeOut 0.3s ease 2s forwards;
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }

          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `}</style>

        <div className="logo-container-items">
          {[
            { name: 'whatsapp', file: 'whatsapp.png', link: 'https://www.flaticon.com/free-icons/whatsapp', attribution: 'Whatsapp icons created by cobynecz - Flaticon' },
            { name: 'wechat', file: 'wechat.png', link: 'https://www.flaticon.com/free-icons/wechat', attribution: 'Wechat icons created by Ruslan Babkin - Flaticon' },
            { name: 'wifi', file: 'wifi.png', link: 'https://www.flaticon.com/free-icons/wifi-signal', attribution: 'Wifi signal icons created by Flat Icons - Flaticon' },
            { name: 'paypal', file: 'paypal.png', link: 'https://www.flaticon.com/free-icons/payments', attribution: 'Payments icons created by Andrew Dynamite - Flaticon' },
            { name: 'link', file: 'link.png', link: 'https://www.flaticon.com/free-icons/link', attribution: 'Link icons created by Rizki Ahmad Fauzi - Flaticon' },
            { name: 'bitcoin', file: 'bitcoin.png', link: 'https://www.flaticon.com/free-icons/cryptocurrency', attribution: 'Cryptocurrency icons created by Freepik - Flaticon' },
            { name: 'mail', file: 'mail.png', link: 'https://www.flaticon.com/free-icons/inbox', attribution: 'Inbox icons created by meaicon - Flaticon' },
            { name: 'instagram', file: 'instagram.png', link: 'https://www.flaticon.com/free-icons/instagram', attribution: 'Instagram icons created by cobynecz - Flaticon' },
            { name: 'tiktok', file: 'tiktok.png', link: 'https://www.flaticon.com/free-icons/tik-tok', attribution: 'Tik tok icons created by Rakib Hassan Rahim - Flaticon' },
            { name: 'facebook', file: 'facebook.png', link: 'https://www.flaticon.com/free-icons/facebook', attribution: 'Facebook icons created by Enamo Studios - Flaticon' },
            { name: 'linkedin', file: 'linkedin.png', link: 'https://www.flaticon.com/free-icons/linkedin', attribution: 'Linkedin icons created by riajulislam - Flaticon' },
            { name: 'youtube', file: 'youtube.png', link: 'https://www.flaticon.com/free-icons/youtube', attribution: 'Youtube icons created by Freepik - Flaticon' },
            { name: 'pinterest', file: 'pinterest.png', link: 'https://www.flaticon.com/free-icons/pinterest', attribution: 'Pinterest icons created by Smashicons - Flaticon' },
            { name: 'reddit', file: 'reddit.png', link: 'https://www.flaticon.com/free-icons/reddit', attribution: 'Reddit icons created by Md Tanvirul Haque - Flaticon' },
            { name: 'telegram', file: 'telegram.png', link: 'https://www.flaticon.com/free-icons/telegram', attribution: 'Telegram icons created by Pixel perfect - Flaticon' },
            { name: 'github', file: 'github.png', link: 'https://www.flaticon.com/free-icons/github', attribution: 'Github icons created by Pixel perfect - Flaticon' },
            { name: 'spotify', file: 'spotify.png', link: 'https://www.flaticon.com/free-icons/spotify-sketch', attribution: 'Spotify sketch icons created by Fathema Khanom - Flaticon' },
            { name: 'messenger', file: 'messenger.png', link: 'https://www.flaticon.com/free-icons/facebook', attribution: 'Facebook icons created by Pixel perfect - Flaticon' },
            { name: 'venmo', file: 'venmo.png', link: 'https://www.flaticon.com/free-icons/venmo', attribution: 'Venmo icons created by Freepik - Flaticon' },
            { name: 'x', file: 'x.png', link: 'https://www.flaticon.com/free-icons/brands-and-logotypes', attribution: 'Brands and logotypes icons created by Freepik - Flaticon' },
          ].map((logo) => (
            <LogoCard key={logo.name} logo={logo} />
          ))}
        </div>
      </section>
    </div>
  );
};

function LogoCard({ logo }) {
  const [toast, setToast] = React.useState(null);

  const handleClick = async () => {
    const fullLink = `<a href="${logo.link}" title="${logo.name} icons">${logo.attribution}</a>`;
    try {
      await navigator.clipboard.writeText(fullLink);
      setToast(`✅ Copied: ${logo.name} attribution link!`);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = fullLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setToast(`✅ Copied: ${logo.name} attribution link!`);
    }
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <>
      <button
        className="logo-item"
        data-tooltip={logo.name}
        onClick={handleClick}
        aria-label={`Copy attribution link for ${logo.name}`}
      >
        <img src={`/logos/${logo.file}`} alt={logo.name} />
      </button>
      {toast && <div className="logo-toast">{toast}</div>}
    </>
  );
}

export default LandingPage;

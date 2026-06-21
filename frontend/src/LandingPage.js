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

        {/* Benefits Section - Two Columns */}
        <div style={{
          marginTop: '80px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          padding: '0 40px',
          boxSizing: 'border-box',
          gap: '60px',
        }}>
          {/* Left Column - QR Code Stack */}
          <div style={{
            flex: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <style>{`
              .qr-stack {
                width: 55%;
                max-width: 400px;
                transition: 0.25s ease;
              }
              .qr-stack:hover {
                transform: rotate(5deg);
              }
              .qr-stack:hover .qr-card:before {
                transform: translatey(-2%) rotate(-4deg);
              }
              .qr-stack:hover .qr-card:after {
                transform: translatey(2%) rotate(4deg);
              }
              .qr-card {
                aspect-ratio: 3 / 2;
                border: 4px solid #00D9FF;
                background-color: #fff;
                position: relative;
                transition: 0.15s ease;
                cursor: pointer;
                padding: 5% 5% 15% 5%;
                border-radius: 8px;
              }
              .qr-card:before,
              .qr-card:after {
                content: "";
                display: block;
                position: absolute;
                height: 100%;
                width: 100%;
                border: 4px solid #00D9FF;
                background-color: #fff;
                transform-origin: center center;
                z-index: -1;
                transition: 0.15s ease;
                top: 0;
                left: 0;
                border-radius: 8px;
              }
              .qr-card:before {
                transform: translatey(-2%) rotate(-6deg);
              }
              .qr-card:after {
                transform: translatey(2%) rotate(6deg);
              }
              .qr-image {
                width: 100%;
                border: 4px solid #00D9FF;
                background-color: #eee;
                aspect-ratio: 1 / 1;
                position: relative;
                border-radius: 4px;
                object-fit: contain;
              }
            `}</style>
            <div className="qr-stack">
              <div className="qr-card">
                <img
                  className="qr-image"
                  src="/assets/stiqr-qrcode.png"
                  alt="stiQR QR Code"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Benefits Content */}
          <div style={{
            flex: '1',
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

      {/* ===== What Do People Think? Section ===== */}
      <section style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '36px',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '60px',
          letterSpacing: '1px',
        }}>
          What do people <span style={{ color: '#00D9FF' }}>think?</span>
        </h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: '0',
          overflow: 'visible',
          padding: '20px 0',
          position: 'relative',
        }}>
          {[
            {
              category: 'Restaurant',
              color: '#FF6B35',
              gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)',
              emoji: '🍽️',
              reviews: [
                {
                  text: '"I switched my restaurant to StiQR menus 3 months ago. Before, I was spending €200/month on printing new menus every time we changed dishes. Now I just update the QR code from my laptop and customers see the changes instantly. My waiters love it because they don\'t have to memorize the daily specials anymore. Best investment I made this year."',
                  author: 'Marco R.',
                  title: 'Restaurant Owner, Rome'
                },
                {
                  text: '"Our cafe is small and we don\'t have a website. StiQR gave us a digital menu that customers can scan at their table. We added photos of our pastries and now people order more. We\'re a local spot, but this makes us feel modern."',
                  author: 'Sarah K.',
                  title: 'Cafe Owner, London'
                },
                {
                  text: '"I run a food truck and move locations every day. With StiQR, I just update the menu from my phone when I change locations. Customers scan and see where I am, what\'s available, and what\'s sold out. It\'s eliminated so many questions."',
                  author: 'Diego M.',
                  title: 'Food Truck Operator, Barcelona'
                }
              ]
            },
            {
              category: 'Wedding',
              color: '#FF69B4',
              gradient: 'linear-gradient(135deg, #FF69B4 0%, #FF8DC7 100%)',
              emoji: '💒',
              reviews: [
                {
                  text: '"For our wedding, we used StiQR for the RSVPs, the photo gallery, and the seating plan. Instead of printing 150 paper invitations with QR codes, we sent one digital invite. Guests scanned it to see the wedding website, RSVP, and even upload their photos to our wedding gallery. It made everything so much simpler for us and our guests."',
                  author: 'Emma T.',
                  title: 'Bride, Dublin'
                },
                {
                  text: '"I organize corporate events and conferences. Before StiQR, I was printing thousands of flyers and brochures. Now I just print one QR code on the welcome sign. Attendees scan and get the schedule, speaker bios, venue map, and all updates in real-time. If the schedule changes, I just update it on StiQR and everyone sees it instantly."',
                  author: 'James W.',
                  title: 'Event Planner, Sydney'
                },
                {
                  text: '"I\'ve been a wedding planner for 8 years. StiQR has become my secret weapon. I create one QR code for each wedding and put it on the invitation. Guests scan to see the venue map, accommodation options, gift registry, and the couple\'s story. The couples love it because they don\'t have to answer the same questions 50 times."',
                  author: 'Lisa H.',
                  title: 'Wedding Planner, LA'
                }
              ]
            },
            {
              category: 'Retail',
              color: '#4CAF50',
              gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
              emoji: '🛍️',
              reviews: [
                {
                  text: '"I sell handmade jewelry at markets. People want to see my full collection online, but they never remember my website. Now I have a QR code on my booth that takes them directly to my online shop. After they scan, they can order later or follow me on Instagram. My online sales have doubled since I started using StiQR."',
                  author: 'Amara J.',
                  title: 'Jewelry Maker, Cape Town'
                },
                {
                  text: '"I\'m a real estate agent. I used to print 100 brochures for each property, and most ended up in the bin. Now I put a StiQR code on the \'For Sale\' sign. Buyers scan it and see all the photos, the floor plan, and the virtual tour. The agent gets a notification when someone is interested. It\'s better for the environment and my wallet. I\'ve had 30% more inquiries since I switched."',
                  author: 'Robert L.',
                  title: 'Realtor, Austin'
                },
                {
                  text: '"We send proposals and case studies to clients. StiQR lets us put a QR code on our business cards and reports. Clients scan it and go straight to our portfolio. We can see exactly which clients are interested because StiQR tracks the scans."',
                  author: 'Mei L.',
                  title: 'Consulting Agency, Singapore'
                }
              ]
            },
            {
              category: 'Marketing',
              color: '#9C27B0',
              gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
              emoji: '📱',
              reviews: [
                {
                  text: '"We have a small marketing team and limited budget. StiQR helped us create landing pages for our campaigns quickly. Instead of using expensive landing page builders, we just update our QR codes with new content."',
                  author: 'Anna M.',
                  title: 'Marketing Manager, NYC'
                },
                {
                  text: '"I use StiQR on my portfolio. I add a QR code to my business card and it shows potential clients my latest work. I can update it easily and track if people are actually looking at it."',
                  author: 'Jake P.',
                  title: 'Graphic Designer, Berlin'
                },
                {
                  text: '"For our new book release, we used QR codes on posters and in the book itself. Readers scanned the code to get a free chapter. This helped us build our email list and connect with readers. We even got reviews from them. We\'ll definitely use this for future publications."',
                  author: 'Sarah L.',
                  title: 'Publisher, Toronto'
                }
              ]
            }
          ].map((group, groupIndex) => (
            <div
              key={group.category}
              style={{
                flex: '0 0 auto',
                width: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginLeft: groupIndex === 0 ? '0' : '-60px',
                zIndex: groupIndex === 1 ? 3 : groupIndex === 2 ? 2 : 1,
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                const cards = e.currentTarget.parentElement.children;
                for (let i = 0; i < cards.length; i++) {
                  if (i <= groupIndex) {
                    cards[i].style.marginLeft = i === 0 ? '0' : '8px';
                  } else {
                    cards[i].style.marginLeft = '8px';
                  }
                }
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.zIndex = '10';
              }}
              onMouseLeave={(e) => {
                const cards = e.currentTarget.parentElement.children;
                for (let i = 0; i < cards.length; i++) {
                  if (i === 0) {
                    cards[i].style.marginLeft = '0';
                  } else {
                    cards[i].style.marginLeft = '-60px';
                  }
                }
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = groupIndex === 1 ? 3 : groupIndex === 2 ? 2 : 1;
              }}
            >
              {/* Category Header */}
              <div style={{
                background: group.gradient,
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: `0 4px 20px ${group.color}40`,
              }}>
                <span style={{ fontSize: '36px' }}>{group.emoji}</span>
                <h3 style={{
                  margin: '8px 0 0 0',
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: '700',
                }}>
                  {group.category}
                </h3>
              </div>

              {/* Review Cards */}
              {group.reviews.map((review, reviewIndex) => (
                <div
                  key={reviewIndex}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${group.color}30`,
                    borderRadius: '12px',
                    padding: '16px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `rgba(255, 255, 255, 0.1)`;
                    e.currentTarget.style.borderColor = `${group.color}60`;
                    e.currentTarget.style.transform = 'translateX(8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = `${group.color}30`;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <p style={{
                    margin: '0 0 12px 0',
                    color: '#ddd',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                  }}>
                    {review.text}
                  </p>
                  <div style={{
                    borderTop: `1px solid ${group.color}30`,
                    paddingTop: '10px',
                  }}>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                      {review.author}
                    </div>
                    <div style={{ color: group.color, fontSize: '11px', fontWeight: '500' }}>
                      {review.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

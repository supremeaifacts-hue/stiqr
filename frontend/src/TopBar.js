import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from './contexts/AuthContext';
import SignUpModal from './SignUpModal';
import LoginModal from './LoginModal';
import './TopBar.css';

const TopBar = ({ onViewDashboard, onViewPricing, onSignUp, onLogin, onGoToLanding, onLoginSuccess }) => {
  const { user, logout } = useAuth();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignUpClick = () => {
    setShowSignUpModal(true);
    if (onSignUp) {
      onSignUp();
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
    if (onLogin) {
      onLogin();
    }
  };

  const handleModalClose = () => {
    setShowSignUpModal(false);
    setShowLoginModal(false);
  };

  const handleLoginFromModal = () => {
    setShowSignUpModal(false);
    setShowLoginModal(true);
  };

  const handleSignUpFromModal = () => {
    setShowLoginModal(false);
    setShowSignUpModal(true);
  };

  // Fetch subscription status when component mounts or user changes
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (user && !user?.isDemo) {
        setLoadingSubscription(true);
        try {
          console.log('TopBar: Fetching subscription status...');
          const token = localStorage.getItem('jwtToken');
          console.log('TopBar: Token exists:', !!token);
          console.log('TopBar: Token length:', token ? token.length : 0);
          const response = await fetch(`${API_BASE_URL}/api/user/subscription`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('TopBar: Subscription data received:', data);
            setSubscriptionData(data);
          } else {
            console.error('TopBar: Failed to fetch subscription status:', response.status);
          }
        } catch (error) {
          console.error('TopBar: Error fetching subscription status:', error);
        } finally {
          setLoadingSubscription(false);
        }
      } else {
        setSubscriptionData(null);
      }
    };
    
    fetchSubscriptionStatus();
  }, [user]);

  return (
    <>
      <header className="topbar-header">
        <div className="topbar-logo">
          <img 
            src="/assets/logo.png" 
            alt="StiQR" 
            className="topbar-logo-img"
            onClick={onGoToLanding}
          />
          <span 
            className="topbar-logo-text"
            onClick={onGoToLanding}
          >
            StiQR
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="topbar-nav">
          <a onClick={onViewDashboard} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', cursor: 'pointer' }}>
            Dashboard
          </a>
          <a onClick={onViewPricing} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', cursor: 'pointer' }}>
            Pricing
          </a>
          
          {user ? (
            // User is logged in - show user info and logout
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.displayName}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}>
                    {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div style={{ color: '#fff', fontSize: '14px' }}>
                    {user.displayName || user.email}
                  </div>
                  {!loadingSubscription && subscriptionData?.subscriptionStatus === 'active' && 
                   (subscriptionData?.planType === 'pro' || subscriptionData?.planType === 'ultra') && (
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: subscriptionData.planType === 'pro' ? '#FF00FF' : '#00FF00',
                      background: 'rgba(0, 0, 0, 0.5)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginTop: '2px',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      {subscriptionData.planType === 'pro' ? '⭐ Pro' : '👑 Ultra'}
                    </div>
                  )}
                  {/* Trial countdown badge for free users */}
                  {!loadingSubscription && subscriptionData?.planType === 'free' && subscriptionData?.isTrialActive && (
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#FF00FF',
                      background: 'rgba(255, 0, 255, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      whiteSpace: 'nowrap',
                    }}>
                      ⭐ Trial: {subscriptionData.trialDaysLeft}d left
                    </div>
                  )}
                  {/* Trial ended badge for free users */}
                  {!loadingSubscription && subscriptionData?.planType === 'free' && !subscriptionData?.isTrialActive && (
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#FF4444',
                      background: 'rgba(255, 68, 68, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      whiteSpace: 'nowrap',
                    }}>
                      ⏰ Trial ended
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={logout}
                style={{ 
                  color: '#0a0a0a', 
                  textDecoration: 'none', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  background: '#ff6b6b',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: 'none',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            // User is not logged in - show Sign Up and Login buttons
            <>
              <a onClick={handleSignUpClick} style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', cursor: 'pointer' }}>
                Sign Up
              </a>
              <a onClick={handleLoginClick} style={{ 
                color: '#0a0a0a', 
                textDecoration: 'none', 
                fontSize: '16px', 
                cursor: 'pointer',
                background: '#00D9FF',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: '600',
              }}>
                Login
              </a>
            </>
          )}
        </nav>

        {/* Mobile: Sign Up button + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!user && (
            <button
              onClick={handleSignUpClick}
              className="topbar-mobile-signup-btn"
            >
              Sign Up
            </button>
          )}
          <button
            className={`topbar-hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="topbar-hamburger-line" />
            <span className="topbar-hamburger-line" />
            <span className="topbar-hamburger-line" />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`topbar-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile dropdown menu */}
      <div className={`topbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <a
          className="topbar-mobile-link"
          onClick={() => { onViewDashboard(); setMobileMenuOpen(false); }}
        >
          Dashboard
        </a>
        <a
          className="topbar-mobile-link"
          onClick={() => { onViewPricing(); setMobileMenuOpen(false); }}
        >
          Pricing
        </a>
        {user ? (
          <>
            <div style={{
              borderTop: '1px solid rgba(0, 217, 255, 0.2)',
              paddingTop: '16px',
              marginTop: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.displayName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#000', fontWeight: 'bold', fontSize: '16px',
                  }}>
                    {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div style={{ color: '#fff', fontSize: '14px' }}>{user.displayName || user.email}</div>
                  {!loadingSubscription && subscriptionData?.subscriptionStatus === 'active' && 
                   (subscriptionData?.planType === 'pro' || subscriptionData?.planType === 'ultra') && (
                    <div style={{
                      fontSize: '10px', fontWeight: '600',
                      color: subscriptionData.planType === 'pro' ? '#FF00FF' : '#00FF00',
                      background: 'rgba(0, 0, 0, 0.5)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px',
                      textTransform: 'uppercase',
                    }}>
                      {subscriptionData.planType === 'pro' ? '⭐ Pro' : '👑 Ultra'}
                    </div>
                  )}
                  {/* Trial countdown badge for free users (mobile) */}
                  {!loadingSubscription && subscriptionData?.planType === 'free' && subscriptionData?.isTrialActive && (
                    <div style={{
                      fontSize: '10px', fontWeight: '600',
                      color: '#FF00FF',
                      background: 'rgba(255, 0, 255, 0.15)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px',
                    }}>
                      ⭐ Trial: {subscriptionData.trialDaysLeft}d left
                    </div>
                  )}
                  {/* Trial ended badge for free users (mobile) */}
                  {!loadingSubscription && subscriptionData?.planType === 'free' && !subscriptionData?.isTrialActive && (
                    <div style={{
                      fontSize: '10px', fontWeight: '600',
                      color: '#FF4444',
                      background: 'rgba(255, 68, 68, 0.15)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px',
                    }}>
                      ⏰ Trial ended
                    </div>
                  )}
                </div>
              </div>
            </div>
            <a
              className="topbar-mobile-link logout"
              onClick={() => { logout(); setMobileMenuOpen(false); }}
            >
              Logout
            </a>
          </>
        ) : (
          <a
            className="topbar-mobile-link login"
            onClick={() => { handleLoginClick(); setMobileMenuOpen(false); }}
          >
            Login
          </a>
        )}
      </div>
      {showSignUpModal && (
        <SignUpModal 
          onClose={handleModalClose}
          onLoginClick={handleLoginFromModal}
          onLoginSuccess={onLoginSuccess}
        />
      )}
      {showLoginModal && (
        <LoginModal 
          onClose={handleModalClose}
          onSignUpClick={handleSignUpFromModal}
          onLoginSuccess={onLoginSuccess}
        />
      )}
    </>
  );
};

export default TopBar;
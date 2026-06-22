import React, { useState } from 'react';
import TopBar from './TopBar';
import { useAuth, API_BASE_URL } from './contexts/AuthContext';

// Stripe Price IDs - Replace these with your actual Stripe Price IDs
const PRICE_IDS = {
  pro: 'price_1TH0zDRM0rqezn1zJXDz5jQh',
  ultra: 'price_1TH0zsRM0rqezn1z2dhWgXH6'
};

const Pricing = ({ onViewDashboard, onBack }) => {
  const { isAuthenticated, user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handlePricingClick = () => {
    // Already on pricing page
    console.log('Already on pricing');
  };

  const handleSignUpClick = () => {
    console.log('Sign Up clicked');
  };

  const handleLoginClick = () => {
    console.log('Login clicked');
  };

  const handleSubscribe = async (planType) => {
    if (!isAuthenticated) {
      alert('Please login to subscribe');
      return;
    }
    
    // Check for JWT token before making the request
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first');
      window.location.href = '/login';
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const priceId = PRICE_IDS[planType];
      if (!priceId) {
        throw new Error(`No price ID configured for plan: ${planType}`);
      }
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId,
          userId: user?._id || user?.id || user?.email || '',
          userEmail: user?.email || ''
        })
      });
      
      // Handle 401 Unauthorized gracefully
      if (response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const data = await response.json();
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError(error.message || 'Failed to create checkout session');
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Unlimited static QR codes',
        'Unlimited possible scans',
        'Full freedom for QR color',
        'Logo and stickers customization',
        'Community support'
      ],
      color: '#00D9FF',
      popular: false
    },
    {
      name: 'Pro',
      price: '$15',
      period: 'per month',
      features: [
        'Everything in the free tier',
        'Unlimited dynamic & static QR codes',
        'Scan statistic (count and location)',
        'Cancel anytime',
        '7-days money back guaranteed'
      ],
      color: '#FF00FF',
      popular: true
    },
    {
      name: 'Ultra',
      price: '$150',
      period: 'per year',
      features: [
        'Everything in Pro tier',
        'Scan statistic (time and Device used)',
        'Priority support',
        'Advanced analytics dashboard',
        'API access'
      ],
      color: '#00FF00',
      popular: false
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
        onLoginSuccess={(userData) => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }}
      />

      <div style={{
        padding: '60px 20px 120px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
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
            Simple, Transparent Pricing
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            lineHeight: '1.1',
            margin: '0 0 18px 0',
            letterSpacing: '-1px',
          }}>
            <span style={{ color: '#FF00FF', textShadow: '0 0 24px rgba(255, 0, 255, 0.5)' }}>
              Choose Your Plan
            </span>
          </h1>

          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#a0a0a0',
            maxWidth: '700px',
            margin: '0 auto 40px',
          }}>
            Start for free, upgrade when you need more power. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '60px',
        }}>
          {pricingPlans.map((plan, index) => (
            <div key={index} style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: `2px solid ${plan.color}`,
              borderRadius: '24px',
              padding: '40px 30px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              ':hover': {
                transform: 'translateY(-10px)',
                boxShadow: `0 20px 40px rgba(${parseInt(plan.color.slice(1, 3), 16)}, ${parseInt(plan.color.slice(3, 5), 16)}, ${parseInt(plan.color.slice(5, 7), 16)}, 0.3)`,
              }
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: plan.color,
                  color: '#000',
                  padding: '6px 20px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  boxShadow: `0 4px 12px ${plan.color}80`,
                }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 0 10px 0',
                  color: plan.color,
                }}>
                  {plan.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '48px', fontWeight: '900', color: '#fff' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '16px', color: '#888' }}>
                    /{plan.period}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, marginBottom: '30px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '15px',
                      fontSize: '14px',
                      color: '#ccc',
                    }}>
                      <span style={{ color: plan.color, fontSize: '16px' }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => plan.name !== 'Free' && handleSubscribe(plan.name.toLowerCase())}
                disabled={loading && plan.name !== 'Free'}
                style={{
                  padding: '16px',
                  background: `linear-gradient(135deg, ${plan.color} 0%, ${plan.color}80 100%)`,
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000',
                  fontWeight: '700',
                  cursor: plan.name === 'Free' ? 'default' : 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  opacity: loading && plan.name !== 'Free' ? 0.7 : 1,
                  ':hover': plan.name === 'Free' ? {} : {
                    transform: 'scale(1.05)',
                    boxShadow: `0 10px 20px ${plan.color}80`,
                  }
                }}
              >
                {plan.name === 'Free' 
                  ? 'Get Started Free' 
                  : loading 
                    ? 'Processing...' 
                    : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(0, 217, 255, 0.2)',
          borderRadius: '20px',
          padding: '40px',
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '30px',
            color: '#00D9FF',
            textAlign: 'center',
          }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              {
                q: 'Can I switch plans anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
              },
              {
                q: 'Is there a free trial for paid plans?',
                a: 'Yes, all paid plans come with a 14-day free trial. No credit card required.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime. Your subscription will remain active until the end of the billing period.'
              }
            ].map((faq, idx) => (
              <div key={idx} style={{
                background: 'rgba(0, 217, 255, 0.05)',
                border: '1px solid rgba(0, 217, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 10px 0', color: '#fff' }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: '14px', color: '#a0a0a0', margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Back button */}
        {onBack && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
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
              ':hover': {
                background: 'rgba(0, 217, 255, 0.1)',
              }
            }}>
              ← Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
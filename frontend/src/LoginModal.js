import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_BASE_URL } from './contexts/AuthContext';

const LoginModal = ({ onClose, onSignUpClick, onLoginSuccess }) => {
  const { loginWithGoogle, loginWithGoogleCredential, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHoveringClose, setIsHoveringClose] = useState(false);
  const [isHoveringLogin, setIsHoveringLogin] = useState(false);
  const [isHoveringGoogle, setIsHoveringGoogle] = useState(false);
  const [isHoveringSignUpLink, setIsHoveringSignUpLink] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const googleButtonRef = useRef(null);


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success) {
        // Store user data (for persistence on page refresh)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Store JWT token if provided (used by Dashboard/TopBar for subscription checks)
        if (data.token) {
          localStorage.setItem('jwtToken', data.token);
          localStorage.setItem('token', data.token);  // Also save as 'token' for EditorPage compatibility
          console.log('✅ JWT token stored:', data.token.substring(0, 30) + '...');
        }

        
        // Dispatch a custom event that any component can listen to
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: data.user 
        }));
        
        // Close modal - stay on current page
        onClose();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load Google Identity Services and render the GIS button
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: '1091645843591-s9mqdm4gceuoqm024rv9o3e639c9araq.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 320
          }
        );
      }
    };

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    try {
      console.log('📱 Google credential response received');
      
      const result = await loginWithGoogleCredential(response.credential);
      
      if (result.success) {
        console.log('✅ Google login successful:', result.user.email);
        onClose();
      } else {
        console.error('❌ Google login failed:', result.error);
        setError('Google login failed: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      setError('An error occurred during Google login');
    }
  };

  const handleGoogleLogin = () => {
    console.log('Initiating Google OAuth login');
    // Use the auth context to handle Google OAuth
    loginWithGoogle();
    onClose();
  };

  return (

    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        position: 'relative',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button 
          onClick={onClose}
          onMouseEnter={() => setIsHoveringClose(true)}
          onMouseLeave={() => setIsHoveringClose(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: isHoveringClose ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '24px',
            cursor: 'pointer',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background 0.3s ease',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#fff',
            margin: '0 0 10px 0',
          }}>
            Welcome back
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#a0a0a0',
            margin: 0,
            lineHeight: '1.5',
          }}>
            Sign in to access your QR codes and dashboard
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#ff6b6b',
            fontSize: '14px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Email input */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            position: 'relative',
            marginBottom: '10px',
          }}>
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888',
              fontSize: '18px',
            }}>
              ✉️
            </div>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setIsFocusedEmail(true)}
              onBlur={() => setIsFocusedEmail(false)}
              placeholder="Enter your Email"
              style={{
                width: '100%',
                padding: '14px 14px 14px 50px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isFocusedEmail ? '#00D9FF' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Password input */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            position: 'relative',
            marginBottom: '10px',
          }}>
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888',
              fontSize: '18px',
            }}>
              🔒
            </div>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setIsFocusedPassword(true)}
              onBlur={() => setIsFocusedPassword(false)}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '14px 14px 14px 50px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isFocusedPassword ? '#00D9FF' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Login button */}
        <button 
          onClick={handleLoginSubmit}
          disabled={loading}
          onMouseEnter={() => setIsHoveringLogin(true)}
          onMouseLeave={() => setIsHoveringLogin(false)}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#000',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            marginBottom: '20px',
            opacity: loading ? 0.7 : 1,
            transform: isHoveringLogin && !loading ? 'translateY(-2px)' : 'translateY(0)',
            boxShadow: isHoveringLogin && !loading ? '0 10px 20px rgba(0, 217, 255, 0.3)' : 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Divider with "or" */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(255, 255, 255, 0.1)',
          }}></div>
          <div style={{
            padding: '0 15px',
            color: '#888',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            or
          </div>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(255, 255, 255, 0.1)',
          }}></div>
        </div>

        {/* Google Login button - rendered by Google Identity Services */}
        <div 
          ref={googleButtonRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '25px',
            minHeight: '48px',
          }}
        ></div>


        {/* Sign up link */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#a0a0a0',
        }}>
          Don't have an account?{' '}
          <a 
            onClick={onSignUpClick}
            onMouseEnter={() => setIsHoveringSignUpLink(true)}
            onMouseLeave={() => setIsHoveringSignUpLink(false)}
            style={{
              color: '#00D9FF',
              textDecoration: isHoveringSignUpLink ? 'underline' : 'none',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Sign up here
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

// For EdgeOne Pages deployment, use VITE_BACKEND_URL when available.
// Otherwise, fall back to same-origin in production and localhost backend in development.
const getBaseUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  if (process.env.NODE_ENV === 'production') {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }

  return 'http://localhost:3000';
};
export const API_BASE_URL = getBaseUrl();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      // First, check localStorage for saved user data (from signup/login)
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setLoading(false);
          return; // Don't override with backend check if we have saved data
        } catch (error) {
          console.error('Error parsing saved user:', error);
        }
      }
      
      // Then try session-based authentication
      await checkAuthStatus();
      
      // If session auth failed, try JWT token
      const token = localStorage.getItem('jwtToken');
      if (token && !user) {
        await getUserFromToken(token);
      }
    };
    
    checkAuth();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        credentials: 'include', // Important for cookies/sessions
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // If backend is not reachable, use demo mode
      if (error.message.includes('Failed to fetch')) {
        console.warn('Backend not reachable, running in demo mode');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    // Redirect to Google OAuth endpoint
    const currentUrl = window.location.href;
    window.location.href = `${API_BASE_URL}/auth/google?redirect=${encodeURIComponent(currentUrl)}`;
  };

  const logout = async () => {
    // Clear client-side storage
    localStorage.removeItem('user');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('token');
    
    // Redirect to home page
    window.location.href = '/';
  };

  const getCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data.user;
      } else if (response.status === 401) {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Get user info from JWT token
  const getUserFromToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data.user;
      } else {
        // If token is invalid, remove it
        localStorage.removeItem('jwtToken');
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Error getting user from token:', error);
      localStorage.removeItem('jwtToken');
      return null;
    }
  };

  // Demo mode functions (for when backend is not available)
  const demoLogin = () => {
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@example.com',
      displayName: 'Demo User',
      profilePicture: null,
      stats: {
        qrCodesCreated: 3,
        totalScans: 42,
        lastActive: new Date().toISOString()
      },
      preferences: {
        theme: 'dark',
        notifications: true
      },
      subscription: {
        plan: 'free',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        isActive: true
      },
      isDemo: true
    };
    setUser(demoUser);
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
  };

  const demoLogout = () => {
    setUser(null);
    localStorage.removeItem('demoUser');
    window.location.reload();
  };

  // Listen for the custom 'userLoggedIn' event (dispatched by SignUpModal)
  useEffect(() => {
    const handleUserLogin = (event) => {
      setUser(event.detail);
    };
    
    window.addEventListener('userLoggedIn', handleUserLogin);
    
    // Also check localStorage on initial load
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
    
    return () => window.removeEventListener('userLoggedIn', handleUserLogin);
  }, []);

  // Check for demo user in localStorage on mount
  useEffect(() => {
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser && !user) {
      try {
        setUser(JSON.parse(demoUser));
      } catch (error) {
        console.error('Error parsing demo user:', error);
      }
    }
  }, [user]);

  // Save user asset functions
  const saveSticker = async (stickerData, name, category) => {
    try {
      console.log('AuthContext: Saving sticker, isAuthenticated:', !!user);
      console.log('AuthContext: Sticker data length:', stickerData?.length || 0);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/assets/stickers`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          data: stickerData,
          name: name || 'Untitled Sticker',
          category: category || 'custom'
        })
      });

      console.log('AuthContext: Save sticker response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthContext: Failed to save sticker:', errorText);
        throw new Error(`Failed to save sticker: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('AuthContext: Sticker saved successfully:', result);
      return result;
    } catch (error) {
      console.error('AuthContext: Error saving sticker:', error);
      throw error;
    }
  };

  const saveLogo = async (logoData, name) => {
    try {
      console.log('AuthContext: Saving logo, isAuthenticated:', !!user);
      console.log('AuthContext: Logo data length:', logoData?.length || 0);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/assets/logos`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          data: logoData,
          name: name || 'Untitled Logo'
        })
      });

      console.log('AuthContext: Save logo response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthContext: Failed to save logo:', errorText);
        throw new Error(`Failed to save logo: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('AuthContext: Logo saved successfully:', result);
      return result;
    } catch (error) {
      console.error('AuthContext: Error saving logo:', error);
      throw error;
    }
  };

  const deleteSticker = async (stickerId) => {
    try {
      console.log('AuthContext: Deleting sticker, ID:', stickerId);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/assets/stickers/${stickerId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      console.log('AuthContext: Delete sticker response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthContext: Failed to delete sticker:', errorText);
        throw new Error(`Failed to delete sticker: ${response.status} ${response.statusText}`);
      }

      console.log('AuthContext: Sticker deleted successfully');
      return true;
    } catch (error) {
      console.error('AuthContext: Error deleting sticker:', error);
      throw error;
    }
  };

  const deleteLogo = async (logoId) => {
    try {
      console.log('AuthContext: Deleting logo, ID:', logoId);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/assets/logos/${logoId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      console.log('AuthContext: Delete logo response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthContext: Failed to delete logo:', errorText);
        throw new Error(`Failed to delete logo: ${response.status} ${response.statusText}`);
      }

      console.log('AuthContext: Logo deleted successfully');
      return true;
    } catch (error) {
      console.error('AuthContext: Error deleting logo:', error);
      throw error;
    }
  };

  const deleteQrCode = async (qrCodeId) => {
    try {
      console.log('AuthContext: Deleting QR code, ID:', qrCodeId);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/assets/qrcodes/${qrCodeId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      console.log('AuthContext: Delete QR code response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthContext: Failed to delete QR code:', errorText);
        throw new Error(`Failed to delete QR code: ${response.status} ${response.statusText}`);
      }

      console.log('AuthContext: QR code deleted successfully');
      return true;
    } catch (error) {
      console.error('AuthContext: Error deleting QR code:', error);
      throw error;
    }
  };

  const saveQrCode = async (qrData, imageData, name, qrCodeId = null, designCharacteristics = null) => {
    try {
      console.log('AuthContext: Saving QR code, isAuthenticated:', !!user);
      console.log('AuthContext: QR data:', qrData?.substring(0, 50) + '...');
      console.log('AuthContext: Image data length:', imageData?.length || 0);
      console.log('AuthContext: QR Code ID:', qrCodeId);
      console.log('AuthContext: Design characteristics:', designCharacteristics);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // ============================================================
      // STEP 1: Save to the standalone 'qrcodes' collection
      // This is what the EdgeOne function queries for /track/:id
      // ============================================================
      console.log('📡 STEP 1: Saving to standalone qrcodes collection...');
      const qrcodesResponse = await fetch(`${API_BASE_URL}/api/qrcodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: qrCodeId,
          data: qrData
        })
      });
      
      console.log('AuthContext: qrcodes collection response status:', qrcodesResponse.status, qrcodesResponse.statusText);
      
      if (qrcodesResponse.ok) {
        const qrcodesResult = await qrcodesResponse.json();
        console.log('✅ STEP 1 SUCCESS: QR code saved to qrcodes collection:', qrcodesResult);
      } else {
        const errorText = await qrcodesResponse.text();
        console.error('⚠️ STEP 1 WARNING: Failed to save to qrcodes collection:', errorText);
        // Continue anyway - this is not critical for the user-facing save
      }
      
      // ============================================================
      // STEP 2: Save to user's account (for Dashboard display)
      // This saves to user.qrCodes array with image data
      // ============================================================
      console.log('📡 STEP 2: Saving to user account (assets/qrcodes)...');
      const response = await fetch(`${API_BASE_URL}/api/assets/qrcodes`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          data: qrData,
          imageData,
          name: name || 'Untitled QR Code',
          qrCodeId: qrCodeId, // Send QR code ID to backend
          design: designCharacteristics // Send design characteristics to backend
        })
      });

      console.log('AuthContext: Save QR code response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ STEP 2 FAILED: Failed to save QR code to user account:', errorText);
        throw new Error(`Failed to save QR code: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ STEP 2 SUCCESS: QR code saved to user account:', result);
      
      // Also store design characteristics in localStorage for frontend retrieval
      if (designCharacteristics && result.qrCode && result.qrCode.id) {
        const qrCodeId = result.qrCode.id;
        const designStorageKey = `qr_design_${qrCodeId}`;
        localStorage.setItem(designStorageKey, JSON.stringify(designCharacteristics));
        console.log('AuthContext: Design characteristics stored in localStorage:', designStorageKey);
      }
      
      return result;
    } catch (error) {
      console.error('AuthContext: Error saving QR code:', error);
      throw error;
    }
  };

  const getUserAssets = async () => {
    try {
      console.log('AuthContext: Fetching user assets from', `${API_BASE_URL}/api/assets`);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('jwtToken');
      const headers = {};
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/assets`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      console.log('AuthContext: Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthContext: Failed to fetch user assets:', errorText);
        throw new Error(`Failed to fetch user assets: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AuthContext: Received assets data:', data);
      console.log('AuthContext: Stickers count:', data.stickers?.length || 0);
      console.log('AuthContext: Logos count:', data.logos?.length || 0);
      console.log('AuthContext: QR Codes count:', data.qrCodes?.length || 0);
      
      return data;
    } catch (error) {
      console.error('AuthContext: Error fetching user assets:', error);
      throw error;
    }
  };

  // Helper functions for subscription and trial checks
  const canCreateDynamicQrCodes = () => {
    if (!user) return false;
    
    // Demo users can always create dynamic QR codes (for testing)
    if (user.isDemo) return true;
    
    // Check if user has pro plan
    if (user.subscription?.plan === 'pro' || user.subscription?.plan === 'enterprise') {
      return true;
    }
    
    // Check if trial is still active
    if (user.subscription?.trialEndsAt) {
      const trialEndsAt = new Date(user.subscription.trialEndsAt);
      const now = new Date();
      return trialEndsAt > now;
    }
    
    return false;
  };

  const getTrialDaysLeft = () => {
    if (!user || !user.subscription?.trialEndsAt) return 0;
    
    const trialEndsAt = new Date(user.subscription.trialEndsAt);
    const now = new Date();
    const diffTime = trialEndsAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const isProUser = () => {
    if (!user) return false;
    return user.subscription?.plan === 'pro' || user.subscription?.plan === 'enterprise';
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isDemoUser: user?.isDemo || false,
    loginWithGoogle,
    logout: user?.isDemo ? demoLogout : logout,
    demoLogin,
    getCurrentUser,
    checkAuthStatus,
    setError,
    saveSticker,
    saveLogo,
    deleteSticker,
    deleteLogo,
    deleteQrCode,
    saveQrCode,
    getUserAssets,
    canCreateDynamicQrCodes,
    getTrialDaysLeft,
    isProUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
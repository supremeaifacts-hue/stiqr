import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from './contexts/AuthContext';
import TopBar from './TopBar';
import StatisticsModal from './StatisticsModal';

const Dashboard = ({ onCreate, onViewPricing, onBack, onEditQrCode }) => {
  const { user, isAuthenticated, logout, demoLogin, getUserAssets, saveSticker, saveLogo, deleteSticker, deleteLogo, deleteQrCode, saveQrCode, canCreateDynamicQrCodes, getTrialDaysLeft, isProUser } = useAuth();
  const [userAssets, setUserAssets] = useState({ stickers: [], logos: [], qrCodes: [] });
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedQrCodeForStats, setSelectedQrCodeForStats] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdownId]);
  
  // Fetch subscription status when component mounts or authentication changes
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (isAuthenticated && !user?.isDemo) {
        setLoadingSubscription(true);
        try {
          console.log('Dashboard: Fetching subscription status...');
          const token = localStorage.getItem('jwtToken');
          
          // ADDED LOG AS REQUESTED
          console.log('Calling /api/user/subscription');
          console.log('Token exists:', !!token);
          console.log('Token length:', token ? token.length : 0);
          
          const response = await fetch(`${API_BASE_URL}/api/user/subscription`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // ADDED LOG AS REQUESTED
            console.log('Response:', data);
            
            console.log('Dashboard: Subscription data received:', data);
            setSubscriptionData(data);
          } else {
            console.error('Dashboard: Failed to fetch subscription status:', response.status);
          }
        } catch (error) {
          console.error('Dashboard: Error fetching subscription status:', error);
        } finally {
          setLoadingSubscription(false);
        }
      } else {
        setSubscriptionData(null);
      }
    };
    
    fetchSubscriptionStatus();
  }, [isAuthenticated, user?.isDemo]);
  
  // Fetch user assets when component mounts or authentication changes
  useEffect(() => {
    const fetchAssets = async () => {
      console.log('Dashboard: fetchAssets called, isAuthenticated:', isAuthenticated);
      if (isAuthenticated) {
        setLoadingAssets(true);
        try {
          console.log('Dashboard: Calling getUserAssets()...');
          const assets = await getUserAssets();
          console.log('Dashboard: Received assets:', assets);
          console.log('Dashboard: Stickers count:', assets.stickers?.length || 0);
          console.log('Dashboard: Logos count:', assets.logos?.length || 0);
          console.log('Dashboard: QR Codes count:', assets.qrCodes?.length || 0);
          setUserAssets({
            stickers: assets?.stickers || [],
            logos: assets?.logos || [],
            qrCodes: assets?.qrCodes || []
          });
        } catch (error) {
          console.error('Dashboard: Failed to fetch user assets:', error);
          console.error('Dashboard: Error details:', error.message);
          // Use demo data for demo users
          if (user?.isDemo) {
            console.log('Dashboard: Using demo data for demo user');
            setUserAssets({
              stickers: [
                { id: '1', data: '✨', name: 'Sparkle', category: 'custom' },
                { id: '2', data: '⭐', name: 'Star', category: 'custom' },
                { id: '3', data: '🔥', name: 'Fire', category: 'custom' }
              ],
              logos: [
                { id: '1', data: '🏢', name: 'Company Logo' },
                { id: '2', data: '🌟', name: 'Brand Logo' }
              ],
              qrCodes: [
                { id: '1', data: 'https://example.com', imageData: 'data:image/png;base64,...', name: 'Example QR', scans: 5 },
                { id: '2', data: 'https://demo.com', imageData: 'data:image/png;base64,...', name: 'Demo QR', scans: 3 }
              ]
            });
          }
        } finally {
          setLoadingAssets(false);
        }
      } else {
        console.log('Dashboard: User not authenticated, clearing assets');
        setUserAssets({ stickers: [], logos: [], qrCodes: [] });
      }
    };
    
    fetchAssets();
  }, [isAuthenticated, getUserAssets, user?.isDemo]);

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
    // For demo purposes, use demo login if not authenticated
    if (!isAuthenticated) {
      demoLogin();
    }
  };

  const handleDashboardClick = () => {
    // Already on dashboard, do nothing or refresh
    console.log('Already on dashboard');
  };

  const handleStickerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/pjp', 'image/jfif', 'image/jpe', 'image/pijpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (.png, .jpeg, .jpg, .pjp, .jfif, .jpe, .pijpeg)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const stickerData = event.target.result;
      
      // Save sticker to backend if user is authenticated
      if (isAuthenticated) {
        try {
          await saveSticker(stickerData, file.name, 'custom');
          console.log('Sticker saved to user account');
          // Refresh assets
          const assets = await getUserAssets();
          setUserAssets(assets);
        } catch (error) {
          console.error('Failed to save sticker:', error);
          alert('Failed to save sticker. Please try again.');
        }
      } else {
        handleLoginClick();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/pjp', 'image/jfif', 'image/jpe', 'image/pijpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (.png, .jpeg, .jpg, .pjp, .jfif, .jpe, .pijpeg)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const logoData = event.target.result;
      
      // Save logo to backend if user is authenticated
      if (isAuthenticated) {
        try {
          await saveLogo(logoData, file.name);
          console.log('Logo saved to user account');
          // Refresh assets
          const assets = await getUserAssets();
          setUserAssets(assets);
        } catch (error) {
          console.error('Failed to save logo:', error);
          alert('Failed to save logo. Please try again.');
        }
      } else {
        handleLoginClick();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSticker = async (stickerId, stickerName) => {
    if (!confirm(`Are you sure you want to delete the sticker "${stickerName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteSticker(stickerId);
      console.log('Sticker deleted successfully');
      // Refresh assets
      const assets = await getUserAssets();
      setUserAssets(assets);
      alert('Sticker deleted successfully!');
    } catch (error) {
      console.error('Failed to delete sticker:', error);
      alert('Failed to delete sticker. Please try again.');
    }
  };

  const handleDeleteLogo = async (logoId, logoName) => {
    if (!confirm(`Are you sure you want to delete the logo "${logoName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteLogo(logoId);
      console.log('Logo deleted successfully');
      // Refresh assets
      const assets = await getUserAssets();
      setUserAssets(assets);
      alert('Logo deleted successfully!');
    } catch (error) {
      console.error('Failed to delete logo:', error);
      alert('Failed to delete logo. Please try again.');
    }
  };

  // Function to duplicate a QR code
  const handleDuplicateQrCode = async (qrCode) => {
    console.log('Duplicating QR code:', qrCode.name);
    
    if (!isAuthenticated) {
      alert('Please login to duplicate QR codes');
      return;
    }
    
    try {
      // Get design characteristics from localStorage
      let designCharacteristics = null;
      if (qrCode.id) {
        const designStorageKey = `qr_design_${qrCode.id}`;
        const storedDesign = localStorage.getItem(designStorageKey);
        if (storedDesign) {
          try {
            designCharacteristics = JSON.parse(storedDesign);
            console.log('Retrieved design characteristics for duplication:', designCharacteristics);
          } catch (error) {
            console.error('Error parsing design characteristics for duplication:', error);
          }
        }
      }
      
      // Save a new QR code with the same data and design characteristics
      const newName = `${qrCode.name} (Copy)`;
      const savedQrCode = await saveQrCode(
        qrCode.data,
        qrCode.imageData,
        newName,
        designCharacteristics
      );
      
      console.log('QR code duplicated successfully:', savedQrCode);
      alert(`QR code "${qrCode.name}" duplicated as "${newName}"!`);
      
      // Refresh assets to show the new QR code
      const assets = await getUserAssets();
      setUserAssets(assets);
      
    } catch (error) {
      console.error('Failed to duplicate QR code:', error);
      alert('Failed to duplicate QR code. Please try again.');
    }
  };

  // Function to delete a QR code
  const handleDeleteQrCode = async (qrCode) => {
    console.log('Deleting QR code:', qrCode.name);
    
    if (!isAuthenticated) {
      alert('Please login to delete QR codes');
      return;
    }
    
    // Ask for confirmation
    const confirmed = window.confirm(`Are you sure you want to delete "${qrCode.name}" permanently?\n\nThis action cannot be undone.`);
    
    if (!confirmed) {
      console.log('Delete cancelled by user');
      return;
    }
    
    try {
      // Note: This would require a backend API endpoint for deleting QR codes
      // For now, we'll simulate deletion by filtering it out from the local state
      // In a real implementation, you would call a delete API endpoint
      
      // Remove from localStorage if design characteristics exist
      if (qrCode.id) {
        const designStorageKey = `qr_design_${qrCode.id}`;
        localStorage.removeItem(designStorageKey);
        console.log('Removed design characteristics from localStorage:', designStorageKey);
      }
      
      // Call the backend API to delete the QR code permanently
      await deleteQrCode(qrCode.id);
      
      // Also remove from local state
      const updatedQrCodes = (userAssets?.qrCodes || []).filter(qr => qr.id !== qrCode.id);
      setUserAssets({
        ...userAssets,
        qrCodes: updatedQrCodes
      });
      
      console.log('QR code deleted successfully from database');
      alert(`QR code "${qrCode.name}" has been deleted permanently from the database.`);
      
    } catch (error) {
      console.error('Failed to delete QR code:', error);
      alert('Failed to delete QR code. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
    }}>
      <TopBar 
        onViewDashboard={handleDashboardClick}
        onViewPricing={handlePricingClick}
        onSignUp={handleSignUpClick}
        onLogin={handleLoginClick}
        onGoToLanding={onBack}
        onLoginSuccess={(userData) => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }}
      />
      
      <div style={{ flex: 1, padding: '40px 60px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', color: '#00D9FF' }}>
          Dashboard
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '40px' }}>
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid #00D9FF',
            borderRadius: '16px',
            padding: '30px',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔲</div>
            <div style={{ fontSize: '14px', color: '#888' }}>Total QR Codes</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>
              {isAuthenticated ? (userAssets?.qrCodes?.length || 0) : '0'}
            </div>
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid #FF00FF',
            borderRadius: '16px',
            padding: '30px',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>👁️</div>
            <div style={{ fontSize: '14px', color: '#888' }}>Total Scans</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>
              {isAuthenticated ? (userAssets?.qrCodes?.reduce((total, qr) => total + (qr.scans || 0), 0) || 0) : '0'}
            </div>
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid #888',
            borderRadius: '16px',
            padding: '30px',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📈</div>
            <div style={{ fontSize: '14px', color: '#888' }}>Avg. Scans</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>
              {isAuthenticated && (userAssets?.qrCodes?.length || 0) > 0 
                ? Math.round((userAssets?.qrCodes?.reduce((total, qr) => total + (qr.scans || 0), 0) || 0) / (userAssets?.qrCodes?.length || 1)) 
                : '0'}
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        {isAuthenticated && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '40px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '5px' }}>
                  Subscription Status
                </div>
                <div style={{ fontSize: '14px', color: '#a0a0a0' }}>
                  {loadingSubscription ? 'Loading...' : 
                   subscriptionData?.planType === 'free' ? 'Free Plan' : 
                   subscriptionData?.planType === 'pro' ? 'Pro Plan' : 
                   subscriptionData?.planType === 'ultra' ? 'Ultra Plan' : 'Free Plan'}
                </div>
              </div>
              <div>
                {loadingSubscription ? (
                  <div style={{ fontSize: '14px', color: '#aaa' }}>Loading...</div>
                ) : subscriptionData?.subscriptionStatus === 'active' && 
                   (subscriptionData?.planType === 'pro' || subscriptionData?.planType === 'ultra') ? (
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#00FF00', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    {subscriptionData?.planType === 'pro' ? '⭐ Pro Member' : '👑 Ultra Member'}
                  </div>
                ) : (
                  <button 
                    onClick={handlePricingClick}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #FF00FF 0%, #00D9FF 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#000',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>
            
            {!loadingSubscription && subscriptionData?.planType === 'free' && subscriptionData?.trialEndsAt && (
              <div style={{
                background: 'rgba(255, 0, 255, 0.1)',
                border: '1px solid rgba(255, 0, 255, 0.3)',
                borderRadius: '10px',
                padding: '15px',
                marginTop: '15px',
              }}>
                <div style={{ fontSize: '14px', color: '#FF00FF', fontWeight: '600', marginBottom: '5px' }}>
                  ⭐ Free Trial Active
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>
                  Your trial ends in {getTrialDaysLeft()} days. Upgrade to Pro to keep dynamic QR codes after trial.
                </div>
              </div>
            )}
            
            {!loadingSubscription && subscriptionData?.subscriptionStatus === 'active' && subscriptionData?.subscriptionEndDate && (
              <div style={{
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '10px',
                padding: '15px',
                marginTop: '15px',
              }}>
                <div style={{ fontSize: '14px', color: '#00D9FF', fontWeight: '600', marginBottom: '5px' }}>
                  📅 Subscription Expiry
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>
                  Your {subscriptionData?.planType} subscription {subscriptionData?.subscriptionStatus === 'active' ? 'renews' : 'expires'} on {new Date(subscriptionData.subscriptionEndDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        )}

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Your QR Codes</h2>
        {isAuthenticated ? (
          loadingAssets ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '80px 0',
              border: '2px dashed #444',
              borderRadius: '16px',
              color: '#555',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <div style={{ marginBottom: '30px' }}>Loading your QR codes...</div>
            </div>
          ) : (userAssets?.qrCodes?.length || 0) > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}>
              {userAssets.qrCodes.map((qrCode, index) => {
                // Check if this is a dynamic QR code and trial has expired
                const isDynamicQr = qrCode.data && qrCode.data.includes('/assets/qrcodes/') && qrCode.data.includes('/redirect');
                const trialExpired = isDynamicQr && !canCreateDynamicQrCodes();
                
                return (
                  <div
                    key={qrCode.id || index}
                    style={{
                      background: trialExpired ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
                      border: trialExpired ? '1px solid rgba(255, 0, 0, 0.5)' : '1px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {trialExpired && (
                      <>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(4px)',
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          padding: '20px',
                        }}>
                          <div style={{ fontSize: '24px', color: '#FF0000', marginBottom: '10px' }}>🔒</div>
                          <div style={{ fontSize: '12px', color: '#FF0000', fontWeight: '600', textAlign: 'center' }}>
                            Trial Expired
                          </div>
                          <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'center', marginTop: '5px' }}>
                            Upgrade to Pro to edit
                          </div>
                          <button 
                            onClick={handlePricingClick}
                            style={{
                              marginTop: '10px',
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #FF0000 0%, #FF00FF 100%)',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#fff',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '10px',
                              zIndex: 2,
                            }}
                          >
                            Upgrade Now
                          </button>
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: '#FF0000',
                          color: '#fff',
                          fontSize: '8px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          zIndex: 2,
                        }}>
                          LOCKED
                        </div>
                      </>
                    )}
                    
                    {/* 3-dots menu button */}
                    {!trialExpired && (
                      <div className="dropdown-container" style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        zIndex: 2,
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === qrCode.id ? null : qrCode.id);
                          }}
                          style={{
                            background: 'rgba(0, 0, 0, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            color: '#fff',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: 0,
                          }}
                        >
                          ⋮
                        </button>
                        
                        {openDropdownId === qrCode.id && (
                          <div className="dropdown-container" style={{
                            position: 'absolute',
                            top: '30px',
                            right: 0,
                            background: 'rgba(0, 0, 0, 0.9)',
                            border: '1px solid rgba(0, 217, 255, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 0',
                            minWidth: '160px',
                            zIndex: 100,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                          }}>
                            <button
                              onClick={() => {
                                console.log('Edit the QR code clicked for:', qrCode.name);
                                setOpenDropdownId(null);
                                // Call the onEditQrCode function to navigate to landing page with QR code data
                                if (onEditQrCode) {
                                  // Try to retrieve design characteristics from localStorage
                                  let designCharacteristics = null;
                                  if (qrCode.id) {
                                    const designStorageKey = `qr_design_${qrCode.id}`;
                                    const storedDesign = localStorage.getItem(designStorageKey);
                                    if (storedDesign) {
                                      try {
                                        designCharacteristics = JSON.parse(storedDesign);
                                        console.log('Retrieved design characteristics from localStorage:', designCharacteristics);
                                      } catch (error) {
                                        console.error('Error parsing design characteristics:', error);
                                      }
                                    }
                                  }
                                  
                                  // Create QR code object with design characteristics
                                  const qrCodeWithDesign = {
                                    ...qrCode,
                                    design: designCharacteristics
                                  };
                                  
                                  onEditQrCode(qrCodeWithDesign);
                                } else {
                                  // Fallback to alert if function not provided
                                  alert(`Redirecting to edit QR code: ${qrCode.name}\n\nIn a full implementation, this would open the landing page with all QR code options pre-filled for editing.`);
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span>✏️</span>
                              Edit the QR code
                            </button>
                            <button
                              onClick={() => {
                                console.log('Duplicate clicked for:', qrCode.name);
                                setOpenDropdownId(null);
                                handleDuplicateQrCode(qrCode);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span>📋</span>
                              Duplicate
                            </button>
                            <button
                              onClick={() => {
                                console.log('Statistics clicked for:', qrCode.name);
                                setOpenDropdownId(null);
                                setSelectedQrCodeForStats(qrCode);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#00D9FF',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span>📊</span>
                              Statistics
                            </button>
                            <div style={{
                              height: '1px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              margin: '4px 0',
                            }} />
                            <button
                              onClick={() => {
                                console.log('Delete clicked for:', qrCode.name);
                                setOpenDropdownId(null);
                                handleDeleteQrCode(qrCode);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 16px',
                                background: 'transparent',
                                border: 'none',
                                color: '#ff4444',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span>🗑️</span>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div style={{
                      width: '120px',
                      height: '120px',
                      background: '#fff',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: trialExpired ? 'blur(2px)' : 'none',
                      opacity: trialExpired ? 0.5 : 1,
                    }}>
                      {qrCode.imageData && qrCode.imageData.startsWith('data:') ? (
                        <img 
                          src={qrCode.imageData} 
                          alt={qrCode.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{ fontSize: '32px' }}>🔲</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center', filter: trialExpired ? 'blur(1px)' : 'none', opacity: trialExpired ? 0.7 : 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '5px' }}>
                        {qrCode.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '5px' }}>
                        {(qrCode.data || '').length > 30 ? (qrCode.data || '').substring(0, 30) + '...' : qrCode.data || ''}
                      </div>
                      <div style={{ fontSize: '10px', color: trialExpired ? '#FF0000' : '#00D9FF' }}>
                        Scans: {qrCode.scans || 0}
                      </div>
                      {isDynamicQr && !trialExpired && !isProUser() && (
                        <div style={{ fontSize: '9px', color: '#FF00FF', marginTop: '5px' }}>
                          ⭐ Trial: {getTrialDaysLeft()} days left
                        </div>
                      )}
                      {isDynamicQr && isProUser() && (
                        <div style={{ fontSize: '9px', color: '#00FF00', marginTop: '5px' }}>
                          ✅ Pro Plan
                        </div>
                      )}
                    </div>
                    
                    {/* Download button */}
                    <button
                      onClick={() => {
                        console.log('Download clicked for:', qrCode.name);
                        if (qrCode.imageData && qrCode.imageData.startsWith('data:')) {
                          const link = document.createElement('a');
                          link.href = qrCode.imageData;
                          link.download = `${qrCode.name || 'qr_code'}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } else {
                          alert('QR code image not available for download');
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#000',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '11px',
                        width: '100%',
                        marginTop: '5px',
                      }}
                    >
                      ⬇️ Download QR Code
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '80px 0',
              border: '2px dashed #444',
              borderRadius: '16px',
              color: '#555',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔲</div>
              <div style={{ marginBottom: '30px' }}>No QR codes yet. Create your first one!</div>
              <button onClick={onCreate} style={{
                padding: '12px 30px',
                background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                border: 'none',
                borderRadius: '20px',
                color: '#000',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 0 20px rgba(0,217,255,0.3),0 0 10px rgba(255,0,255,0.2)',
              }}>+ Create QR Code</button>
            </div>
          )
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '80px 0',
            border: '2px dashed #444',
            borderRadius: '16px',
            color: '#555',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔲</div>
            <div style={{ marginBottom: '30px' }}>Login to save and access your QR codes</div>
            <button onClick={handleLoginClick} style={{
              padding: '12px 30px',
              background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
              border: 'none',
              borderRadius: '20px',
              color: '#000',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 0 20px rgba(0,217,255,0.3),0 0 10px rgba(255,0,255,0.2)',
            }}>Login to Save QR Codes</button>
          </div>
        )}

        {/* My Stickers and Logos Section */}
        <div style={{ marginTop: '60px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#FF00FF' }}>
            My Stickers and Logos
          </h2>
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 0, 255, 0.3)',
            borderRadius: '16px',
            padding: '30px',
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                  Your Saved Assets
                </div>
                <div style={{ fontSize: '14px', color: '#a0a0a0' }}>
                  Store and manage your custom stickers and logos for quick access when creating QR codes.
                </div>
              </div>
            </div>

            {/* Sticker Gallery */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                  Stickers ({isAuthenticated ? (userAssets?.stickers?.length || 0) : '0'})
                </div>
                <div>
                  <input
                    type="file"
                    id="dashboard-sticker-upload"
                    accept=".png,.jpeg,.jpg,.pjp,.jfif,.jpe,.pijpeg"
                    onChange={handleStickerUpload}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="dashboard-sticker-upload"
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #FF00FF 0%, #00D9FF 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#000',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'inline-block',
                    }}
                  >
                    + Add a new Sticker
                  </label>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '15px' }}>
                {isAuthenticated ? (
                  loadingAssets ? (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#666',
                      fontSize: '14px',
                    }}>
                      Loading stickers...
                    </div>
                  ) : (userAssets?.stickers?.length || 0) > 0 ? (
                    (userAssets?.stickers || []).map((sticker, index) => (
                      <div
                        key={sticker.id || index}
                        style={{
                          width: '80px',
                          height: '80px',
                          background: index % 3 === 0 ? 'rgba(0, 217, 255, 0.1)' : 
                                     index % 3 === 1 ? 'rgba(255, 0, 255, 0.1)' : 'rgba(0, 255, 0, 0.1)',
                          border: index % 3 === 0 ? '2px dashed rgba(0, 217, 255, 0.3)' : 
                                  index % 3 === 1 ? '2px dashed rgba(255, 0, 255, 0.3)' : '2px dashed rgba(0, 255, 0, 0.3)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                        title={sticker.name}
                      >
                        {sticker.data.startsWith('data:') ? (
                          <img 
                            src={sticker.data} 
                            alt={sticker.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          sticker.data
                        )}
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSticker(sticker.id, sticker.name);
                          }}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(255, 0, 0, 0.8)',
                            border: 'none',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0',
                          }}
                          title={`Delete ${sticker.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#666',
                      fontSize: '14px',
                    }}>
                      No stickers saved yet. Upload stickers in the editor to see them here.
                    </div>
                  )
                ) : (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#666',
                    fontSize: '14px',
                  }}>
                    Login to save and access your stickers
                  </div>
                )}
              </div>
            </div>

            {/* Logo Gallery */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                  Logos ({isAuthenticated ? (userAssets?.logos?.length || 0) : '0'})
                </div>
                <div>
                  <input
                    type="file"
                    id="dashboard-logo-upload"
                    accept=".png,.jpeg,.jpg,.pjp,.jfif,.jpe,.pijpeg"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="dashboard-logo-upload"
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#000',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'inline-block',
                    }}
                  >
                    + Add a new Logo
                  </label>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '15px' }}>
                {isAuthenticated ? (
                  loadingAssets ? (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#666',
                      fontSize: '14px',
                    }}>
                      Loading logos...
                    </div>
                  ) : (userAssets?.logos?.length || 0) > 0 ? (
                    (userAssets?.logos || []).map((logo, index) => (
                      <div
                        key={logo.id || index}
                        style={{
                          width: '80px',
                          height: '80px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          color: '#fff',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                        title={logo.name}
                      >
                        {logo.data.startsWith('data:') ? (
                          <img 
                            src={logo.data} 
                            alt={logo.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          logo.data
                        )}
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLogo(logo.id, logo.name);
                          }}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(255, 0, 0, 0.8)',
                            border: 'none',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0',
                          }}
                          title={`Delete ${logo.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#666',
                      fontSize: '14px',
                    }}>
                      No logos saved yet. Upload logos in the editor to see them here.
                    </div>
                  )
                ) : (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#666',
                    fontSize: '14px',
                  }}>
                    Login to save and access your logos
                  </div>
                )}
              </div>
            </div>

            {/* Storage Info */}
            {isAuthenticated && (
              <div style={{
                marginTop: '25px',
                padding: '15px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#a0a0a0',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>Storage used: 5MB / 100MB</div>
                  <div style={{ width: '100px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '5%', height: '100%', background: 'linear-gradient(90deg, #00D9FF, #FF00FF)' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Modal */}
      {selectedQrCodeForStats && (
        <StatisticsModal
          qrCode={selectedQrCodeForStats}
          onClose={() => setSelectedQrCodeForStats(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;

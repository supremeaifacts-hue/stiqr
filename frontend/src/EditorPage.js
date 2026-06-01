import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import StickerPicker from './StickerPicker';
import { useAuth } from './contexts/AuthContext';
import whatsappLogo from './assets/logos/whatsapp.png';
import wechatLogo from './assets/logos/wechat.png';
import instagramLogo from './assets/logos/instagram.png';
import mailLogo from './assets/logos/mail.png';
import wifiLogo from './assets/logos/wifi.png';
import paypalLogo from './assets/logos/paypal.png';
import linkLogo from './assets/logos/link.png';
import tiktokLogo from './assets/logos/tiktok.png';
import bitcoinLogo from './assets/logos/bitcoin.png';

const EditorPage = ({ onBack, onGoToDashboard, onGoToProfile, embedded = false, qrCodeToEdit, onClearQrCodeToEdit }) => {
  const [selectedType, setSelectedType] = useState('url');
  const [qrData, setQrData] = useState('');
  const [qrMode, setQrMode] = useState('static');
  const [designTab, setDesignTab] = useState('frame');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('H');
  const [includeMargin, setIncludeMargin] = useState(true);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [qrSize, setQrSize] = useState(300);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [userLogos, setUserLogos] = useState([]);
  const [loadingLogos, setLoadingLogos] = useState(false);
  
  // Generate unique ID for QR codes (same algorithm as backend)
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // State for tracking URL
  const [qrCodeId, setQrCodeId] = useState(generateId());
  
  // Function to regenerate QR code ID (call this when creating new QR code)
  const regenerateQrCodeId = () => {
    const newId = generateId();
    setQrCodeId(newId);
    console.log('Regenerated QR code ID:', newId);
    return newId;
  };
  
  // Generate tracking URL
  // Accepts an optional id parameter. If not provided, uses the state qrCodeId.
  // IMPORTANT: Always pass the id explicitly when you've just generated a new one,
  // because React state updates are async and the state may still have the old value.
  const getTrackingUrl = (id) => {
    const effectiveId = id || qrCodeId;
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return `http://localhost:3000/track/${effectiveId}`;
    } else {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}/track/${effectiveId}`;
    }
  };
  
  // ============================================================
  // Use a ref to track the latest qrCodeId synchronously.
  // This avoids timing issues with async setState in effects.
  // ============================================================
  const qrCodeIdRef = useRef(qrCodeId);
  qrCodeIdRef.current = qrCodeId;
  
  // ============================================================
  // Regenerate QR code ID whenever the destination URL changes.
  // This ensures each new destination gets a fresh tracking ID,
  // keeping the preview, download, and database record in sync.
  // ============================================================
  useEffect(() => {
    if (qrData && qrData.trim().length > 0) {
      const newId = generateId();
      setQrCodeId(newId);
      qrCodeIdRef.current = newId; // Update ref synchronously
      console.log(`🆕 Generated new QR code ID for destination "${qrData.substring(0, 50)}": ${newId}`);
    }
  }, [qrData]);
  
  // Email-specific state
  const [emailData, setEmailData] = useState({
    email: '',
    subject: '',
    message: ''
  });
  
  // SMS/WhatsApp-specific state
  const [smsData, setSmsData] = useState({
    countryCode: '+1',
    phoneNumber: '',
    message: ''
  });
  
  // WiFi-specific state
  const [wifiData, setWifiData] = useState({
    ssid: '',
    encryption: 'WPA/WPA2',
    password: ''
  });
  
  // PDF file state
  const [pdfFile, setPdfFile] = useState(null);
  
  // Local subscription state - fetched directly from backend to ensure accuracy
  const [isPro, setIsPro] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [trialStartedAt, setTrialStartedAt] = useState(null);
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  
  const { isAuthenticated, saveLogo, saveQrCode, getUserAssets, canCreateDynamicQrCodes, getTrialDaysLeft, isProUser } = useAuth();
  
  // Fetch subscription status from backend on mount and when auth changes
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
      if (!token) {
        setIsPro(false);
        setSubscriptionPlan(null);
        setSubscriptionLoading(false);
        return;
      }
      
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/user/subscription`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const isActivePro = data.subscriptionStatus === 'active' && 
            (data.planType === 'pro' || data.planType === 'ultra' || data.planType === 'enterprise');
          
          setIsPro(isActivePro);
          setSubscriptionPlan(data.planType);
          
          // Store trial info from backend response
          if (data.trialStartedAt) {
            setTrialStartedAt(data.trialStartedAt);
          }
          if (data.trialEndsAt) {
            setTrialEndsAt(data.trialEndsAt);
          }
          
          // Also update the user object in localStorage so AuthContext functions work correctly
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              parsedUser.subscription = parsedUser.subscription || {};
              parsedUser.subscription.plan = data.planType || parsedUser.subscription.plan;
              parsedUser.subscription.isActive = data.subscriptionStatus === 'active';
              parsedUser.subscription.subscriptionStatus = data.subscriptionStatus;
              if (data.trialStartedAt) parsedUser.subscription.trialStartedAt = data.trialStartedAt;
              if (data.trialEndsAt) parsedUser.subscription.trialEndsAt = data.trialEndsAt;
              localStorage.setItem('user', JSON.stringify(parsedUser));
              console.log('✅ Updated user subscription in localStorage:', data.planType, data.subscriptionStatus);
            } catch (e) {
              console.error('Error updating user subscription in localStorage:', e);
            }
          }
        } else {
          console.warn('Failed to fetch subscription status, using cached data');
          // Fall back to AuthContext's isProUser
          setIsPro(isProUser());
          setSubscriptionPlan(null);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        // Fall back to AuthContext's isProUser
        setIsPro(isProUser());
        setSubscriptionPlan(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };
    
    fetchSubscriptionStatus();
  }, [isAuthenticated]);
  
  // Also re-fetch when isAuthenticated changes (user logs in/out)
  useEffect(() => {
    if (isAuthenticated) {
      setSubscriptionLoading(true);
      const fetchOnAuth = async () => {
        const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
        if (!token) return;
        
        try {
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          const response = await fetch(`${baseUrl}/api/user/subscription`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            const isActivePro = data.subscriptionStatus === 'active' && 
              (data.planType === 'pro' || data.planType === 'ultra' || data.planType === 'enterprise');
            setIsPro(isActivePro);
            setSubscriptionPlan(data.planType);
            
            // Update localStorage user object
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
              try {
                const parsedUser = JSON.parse(savedUser);
                parsedUser.subscription = parsedUser.subscription || {};
                parsedUser.subscription.plan = data.planType || parsedUser.subscription.plan;
                parsedUser.subscription.isActive = data.subscriptionStatus === 'active';
                parsedUser.subscription.subscriptionStatus = data.subscriptionStatus;
                localStorage.setItem('user', JSON.stringify(parsedUser));
              } catch (e) {}
            }
          }
        } catch (error) {
          console.error('Failed to re-fetch subscription:', error);
        } finally {
          setSubscriptionLoading(false);
        }
      };
      fetchOnAuth();
    } else {
      setIsPro(false);
      setSubscriptionPlan(null);
      setSubscriptionLoading(false);
    }
  }, [isAuthenticated]);
  
  // Helper to check if user can create dynamic QR codes (uses local state + AuthContext)
  const getCanCreateDynamic = () => {
    if (!isAuthenticated) return false;
    // Use local isPro state if available, otherwise fall back to AuthContext
    if (isPro) return true;
    return canCreateDynamicQrCodes();
  };
  
  // Helper to check if user is pro (uses local state + AuthContext)
  const getIsPro = () => {
    if (isPro) return true;
    return isProUser();
  };
  
  // Helper to get plan display name
  const getPlanDisplayName = () => {
    if (subscriptionPlan === 'pro') return 'Pro';
    if (subscriptionPlan === 'ultra') return 'Ultra';
    if (subscriptionPlan === 'enterprise') return 'Enterprise';
    return null;
  };

  // Helper to check if any QR content has been entered (for any type)
  const hasQrContent = () => {
    if (selectedType === 'url' || selectedType === 'text') {
      return qrData && qrData.trim().length > 0;
    } else if (selectedType === 'email') {
      return emailData.email && emailData.email.trim().length > 0;
    } else if (selectedType === 'sms' || selectedType === 'whatsapp') {
      return smsData.phoneNumber && smsData.phoneNumber.trim().length > 0;
    } else if (selectedType === 'wifi') {
      return wifiData.ssid && wifiData.ssid.trim().length > 0;
    } else if (selectedType === 'pdf') {
      return pdfFile !== null;
    } else {
      return qrData && qrData.trim().length > 0;
    }
  };

  // Helper to get the formatted QR content for any type
  const getQrContent = () => {
    if (selectedType === 'url' || selectedType === 'text') {
      return qrData || '';
    } else if (selectedType === 'email') {
      const subject = emailData.subject ? `?subject=${encodeURIComponent(emailData.subject)}` : '';
      const body = emailData.message ? `${subject ? '&' : '?'}body=${encodeURIComponent(emailData.message)}` : '';
      return `mailto:${emailData.email}${subject}${body}`;
    } else if (selectedType === 'sms') {
      const body = smsData.message ? `?body=${encodeURIComponent(smsData.message)}` : '';
      return `sms:${smsData.countryCode}${smsData.phoneNumber}${body}`;
    } else if (selectedType === 'whatsapp') {
      const text = smsData.message ? `?text=${encodeURIComponent(smsData.message)}` : '';
      return `https://wa.me/${smsData.countryCode.replace('+', '')}${smsData.phoneNumber}${text}`;
    } else if (selectedType === 'wifi') {
      return `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};;`;
    } else if (selectedType === 'pdf') {
      // If we have an uploaded PDF URL stored, use it; otherwise fall back to PDF:filename
      return pdfFile ? (pdfFile.uploadedUrl || `PDF:${pdfFile.name}`) : '';
    } else {
      return qrData || '';
    }
  };
  
  // Frame customization state
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [framePhrase, setFramePhrase] = useState('SCAN ME');
  const [frameFont, setFrameFont] = useState('Arial');
  const [frameColor, setFrameColor] = useState('#000000');
  
  const canvasRef = useRef(null);

  // Fetch user logos when component mounts or authentication changes
  useEffect(() => {
    const fetchUserLogos = async () => {
      if (isAuthenticated) {
        setLoadingLogos(true);
        try {
          const assets = await getUserAssets();
          setUserLogos(assets.logos || []);
        } catch (error) {
          console.error('Failed to fetch user logos:', error);
          setUserLogos([]);
        } finally {
          setLoadingLogos(false);
        }
      } else {
        setUserLogos([]);
      }
    };
    
    fetchUserLogos();
  }, [isAuthenticated, getUserAssets]);

  // Pre-fill form when qrCodeToEdit is provided
  useEffect(() => {
    if (qrCodeToEdit) {
      console.log('Pre-filling form with QR code data:', qrCodeToEdit);
      
      // Set QR code data
      if (qrCodeToEdit.data) {
        setQrData(qrCodeToEdit.data);
      }
      
      // Set QR code name as frame phrase if available
      if (qrCodeToEdit.name) {
        setFramePhrase(qrCodeToEdit.name);
      }
      
      // Try to get design characteristics from qrCodeToEdit.design first
      let designCharacteristics = qrCodeToEdit.design;
      
      // If not in qrCodeToEdit.design, try to get from localStorage as fallback
      if (!designCharacteristics && qrCodeToEdit.id) {
        const designStorageKey = `qr_design_${qrCodeToEdit.id}`;
        const storedDesign = localStorage.getItem(designStorageKey);
        if (storedDesign) {
          try {
            designCharacteristics = JSON.parse(storedDesign);
            console.log('Retrieved design characteristics from localStorage fallback:', designCharacteristics);
          } catch (error) {
            console.error('Error parsing design characteristics from localStorage:', error);
          }
        }
      }
      
      // Restore design characteristics if available
      if (designCharacteristics) {
        const design = designCharacteristics;
        
        // Restore QR color
        if (design.qrColor) {
          setQrColor(design.qrColor);
        }
        
        // Restore background color
        if (design.bgColor) {
          setBgColor(design.bgColor);
        }
        
        // Restore frame
        if (design.selectedFrame) {
          setSelectedFrame(design.selectedFrame);
        }
        
        // Restore frame color
        if (design.frameColor) {
          setFrameColor(design.frameColor);
        }
        
        // Restore frame font
        if (design.frameFont) {
          setFrameFont(design.frameFont);
        }
        
        // Restore sticker
        if (design.selectedSticker) {
          setSelectedSticker(design.selectedSticker);
        }
        
        // Restore logo
        if (design.selectedLogo) {
          setSelectedLogo(design.selectedLogo);
        }
        
        // Restore error correction level
        if (design.errorCorrectionLevel) {
          setErrorCorrectionLevel(design.errorCorrectionLevel);
        }
        
        // Restore QR mode
        if (design.qrMode) {
          setQrMode(design.qrMode);
        }
        
        // Restore selected type
        if (design.selectedType) {
          setSelectedType(design.selectedType);
        }
        
        // Restore include margin
        if (design.includeMargin !== undefined) {
          setIncludeMargin(design.includeMargin);
        }
        
        // Restore QR size
        if (design.qrSize) {
          setQrSize(design.qrSize);
        }
      }
      
      // Show a message to the user
      alert(`Editing QR code: ${qrCodeToEdit.name || 'Untitled QR Code'}\n\nAll design characteristics have been restored. Make your changes and click "Save to My QR codes" to update it.`);
      
      // Clear the qrCodeToEdit after using it
      if (onClearQrCodeToEdit) {
        // Clear after a short delay to ensure the form is pre-filled
        setTimeout(() => {
          onClearQrCodeToEdit();
        }, 100);
      }
    }
  }, [qrCodeToEdit, onClearQrCodeToEdit]);

  const qrTypes = [
    { id: 'url', label: 'Link' },
    { id: 'text', label: 'Text' },
    { id: 'email', label: 'E-mail' },
    { id: 'sms', label: 'SMS' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'wifi', label: 'WI‑FI' },
    { id: 'pdf', label: 'PDF' },
    { id: 'social', label: 'Social Media' },
    { id: 'event', label: 'Event' },
  ];

  useEffect(() => {
    const generateQRCode = async () => {
      // Only generate QR code if we have data to encode
      // For URL type, require at least some text
      // For other types, check their specific data
      let hasData = false;
      
      if (selectedType === 'url' || selectedType === 'text') {
        hasData = qrData && qrData.trim().length > 0;
      } else if (selectedType === 'email') {
        hasData = emailData.email && emailData.email.trim().length > 0;
      } else if (selectedType === 'sms' || selectedType === 'whatsapp') {
        hasData = smsData.phoneNumber && smsData.phoneNumber.trim().length > 0;
      } else if (selectedType === 'wifi') {
        hasData = wifiData.ssid && wifiData.ssid.trim().length > 0;
      } else if (selectedType === 'pdf') {
        hasData = pdfFile !== null;
      } else {
        hasData = qrData && qrData.trim().length > 0;
      }
      
      if (hasData && canvasRef.current) {
        // FIXED PREVIEW AREA: Always use 270x300px canvas for preview
        const canvasWidth = 270;
        const canvasHeight = 300;
        
        // Set canvas dimensions
        canvasRef.current.width = canvasWidth;
        canvasRef.current.height = canvasHeight;
        
        // Set CSS dimensions to match (important!)
        canvasRef.current.style.width = canvasWidth + 'px';
        canvasRef.current.style.height = canvasHeight + 'px';
        canvasRef.current.style.minWidth = canvasWidth + 'px';
        canvasRef.current.style.minHeight = canvasHeight + 'px';
        canvasRef.current.style.maxWidth = canvasWidth + 'px';
        canvasRef.current.style.maxHeight = canvasHeight + 'px';
        
        // Clear canvas
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw white background for QR code area
        // For Frame #2: draw at (20,10) with size 230x230px
        // For other frames: draw at (15,15) with size 240x240px
        let qrAreaSize, qrAreaX, qrAreaY;
        
        if (selectedFrame === 'frame2') {
          qrAreaSize = 230; // QR code will be 230x230px for Frame #2
          qrAreaX = 20; // Start at (20,10) for Frame #2
          qrAreaY = 10;
        } else {
          qrAreaSize = 240; // QR code will be 240x240px for other frames
          qrAreaX = 15; // Start at (15,15) for other frames
          qrAreaY = 15;
        }
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(qrAreaX, qrAreaY, qrAreaSize, qrAreaSize);
        
        // Generate QR code on a temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = qrAreaSize;
        tempCanvas.height = qrAreaSize;
        
        // ============================================================
        // Use the ref to get the LATEST qrCodeId synchronously.
        // This avoids timing issues with async setState in effects.
        // ============================================================
        const currentQrCodeId = qrCodeIdRef.current;
        
        await new Promise((resolve, reject) => {
          // ============================================================
          // PREVIEW: Use tracking URL for ALL types so the preview
          // matches exactly what will be downloaded and scanned.
          // This ensures the same ID is used everywhere.
          // ============================================================
          let qrContent;
          
          // For dynamic QR codes (or when user has entered data), use tracking URL
          // so the preview encodes the same tracking URL as the download.
          // The tracking URL will redirect to the actual destination.
          if (selectedType === 'url' || selectedType === 'text') {
            qrContent = getTrackingUrl(currentQrCodeId);
          } else if (selectedType === 'email') {
            // Format email as mailto: link
            const subject = emailData.subject ? `?subject=${encodeURIComponent(emailData.subject)}` : '';
            const body = emailData.message ? `${subject ? '&' : '?'}body=${encodeURIComponent(emailData.message)}` : '';
            qrContent = `mailto:${emailData.email}${subject}${body}`;
          } else if (selectedType === 'sms') {
            // Format SMS as sms: link
            const body = smsData.message ? `?body=${encodeURIComponent(smsData.message)}` : '';
            qrContent = `sms:${smsData.countryCode}${smsData.phoneNumber}${body}`;
          } else if (selectedType === 'whatsapp') {
            // Format WhatsApp as https://wa.me/ link
            const text = smsData.message ? `?text=${encodeURIComponent(smsData.message)}` : '';
            qrContent = `https://wa.me/${smsData.countryCode.replace('+', '')}${smsData.phoneNumber}${text}`;
          } else if (selectedType === 'wifi') {
            // Format WiFi credentials
            qrContent = `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};;`;
          } else if (selectedType === 'pdf') {
            // For PDF, we can't encode the file in QR code directly
            // Use a placeholder or the tracking URL
            qrContent = getTrackingUrl();
          } else {
            qrContent = qrData || getTrackingUrl();
          }
          
          QRCode.toCanvas(
            tempCanvas,
            qrContent,
            {
              width: qrAreaSize,
              margin: includeMargin ? 2 : 0,
              color: {
                dark: qrColor,
                light: bgColor,
              },
              errorCorrectionLevel: errorCorrectionLevel,
            },
            (error) => {
              if (error) {
                console.error('QR Code error:', error);
                reject(error);
              } else {
                resolve();
              }
            }
          );
        });
        
        // Now apply the selected frame (drawn BEFORE the QR code)
        if (selectedFrame !== 'none') {
          if (selectedFrame === 'frame1') {
            // Frame #1: Black rounded rectangle with "SCAN ME" label
            // Canvas is 270x300px
            // - Outer container: 270px wide, black, rounded corners (14px)
            // - QR code is already drawn at (15,15) with size 240x240px
            // - Label: "SCAN ME" white text below QR code (moved 5px lower)
            
            const outerWidth = 270;
            const outerHeight = 300;
            const borderRadius = 14;
            
            // Draw black rounded rectangle (outer container) - uses frameColor variable
            ctx.fillStyle = frameColor;
            ctx.beginPath();
            ctx.roundRect(0, 0, outerWidth, outerHeight, borderRadius);
            ctx.fill();
            
            // Draw frame phrase label - changed to 18px height and lowered by 20px total
            const labelY = 15 + 240 + 8 + 5 + 5 + 10; // qrAreaY + qrAreaSize + gap + 5px lower + 5px more + 10px more = 283px from top
            ctx.fillStyle = '#ffffff';
            ctx.font = `700 18px ${frameFont}, sans-serif`; // Changed from 11px to 18px
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.letterSpacing = '2px';
            
            // Draw uppercase text with letter spacing
            const labelText = framePhrase.toUpperCase(); // Use frame phrase, convert to uppercase
            const labelX = outerWidth / 2;
            
            // Manually draw text with letter spacing
            let currentX = labelX - (ctx.measureText(labelText).width / 2);
            for (let i = 0; i < labelText.length; i++) {
              ctx.fillText(labelText[i], currentX, labelY);
              currentX += ctx.measureText(labelText[i]).width + 2; // 2px letter spacing
            }
            
          } else if (selectedFrame === 'frame2') {
            // Frame #2: 10px thick frame from (10,0) to (250,240) - 240x240px
            // Inside area: 220x220px (240 - 10*2)
            // QR code area: from (20,10) to (240,230) - 220x220px
            // Rectangle on bottom: from (10,250) to (250,300) - 240x50px
            // Editable text inside rectangle using frame phrase, font, color
            
            const frameWidth = 10; // 10px thick frame
            const frameSize = 240; // 240x240px (250-10=240, 240-0=240)
            const frameX = 10; // Start from (10,0)
            const frameY = 0;
            
            // Draw 10px thick frame (240x240px) from (10,0) to (250,240) with rounded corners (6px radius - half of 12px)
            ctx.strokeStyle = frameColor; // Use frameColor variable
            ctx.lineWidth = frameWidth;
            ctx.beginPath();
            ctx.roundRect(frameX + frameWidth/2, frameY + frameWidth/2, frameSize, frameSize, 6);
            ctx.stroke();
            
            // Draw text rectangle: (10,260) to (260,300) - 250x40px with rounded corners (16px radius - double of 8px)
            const textRectX = 10;
            const textRectY = 260;
            const textRectWidth = 250; // 260-10=250
            const textRectHeight = 40; // 300-260=40
            
            // Draw rectangle background with rounded corners
            ctx.fillStyle = frameColor; // Use frameColor variable
            ctx.beginPath();
            ctx.roundRect(textRectX, textRectY, textRectWidth, textRectHeight, 16);
            ctx.fill();
            
            // Draw editable text inside rectangle
            ctx.fillStyle = '#ffffff'; // White text
            ctx.font = `700 18px ${frameFont}, sans-serif`; // Use frameFont variable
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const labelText = framePhrase.toUpperCase(); // Use frame phrase, convert to uppercase
            const labelX = textRectX + textRectWidth / 2;
            const labelY = textRectY + textRectHeight / 2;
            
            // Draw text with letter spacing
            ctx.letterSpacing = '2px';
            let currentX = labelX - (ctx.measureText(labelText).width / 2);
            for (let i = 0; i < labelText.length; i++) {
              ctx.fillText(labelText[i], currentX, labelY);
              currentX += ctx.measureText(labelText[i]).width + 2; // 2px letter spacing
            }
          }
        }
        
        // Draw the QR code from temporary canvas to main canvas
        // For Frame #2: draw at (20,10) with size 230x230px
        // For other frames: draw at (15,15) with size 240x240px
        if (selectedFrame === 'frame2') {
          // For Frame #2, draw at (20,10) with size 230x230px
          const qrX = 20;
          const qrY = 10;
          
          // Draw the QR code directly (no scaling needed since it's already 230x230)
          ctx.drawImage(tempCanvas, qrX, qrY);
        } else {
          // For other frames, draw at (15,15) with size 240x240px
          ctx.drawImage(tempCanvas, qrAreaX, qrAreaY);
        }
        
        // Apply sticker if selected
        if (selectedSticker) {
          const stickerSize = 48; // 20% of 240px QR area
          // Center the sticker perfectly in the QR code area
          const x = qrAreaX + (qrAreaSize - stickerSize) / 2;
          const y = qrAreaY + (qrAreaSize - stickerSize) / 2;
          const padding = 6;
          // White square perfectly centered (no offset)
          const whiteSquareX = x - padding;
          const whiteSquareY = y - padding;
          ctx.fillStyle = 'white';
          const radius = 8;
          ctx.beginPath();
          ctx.moveTo(whiteSquareX + radius, whiteSquareY);
          ctx.lineTo(whiteSquareX + stickerSize + padding * 2 - radius, whiteSquareY);
          ctx.quadraticCurveTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY, whiteSquareX + stickerSize + padding * 2, whiteSquareY + radius);
          ctx.lineTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY + stickerSize + padding * 2 - radius);
          ctx.quadraticCurveTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY + stickerSize + padding * 2, whiteSquareX + stickerSize + padding * 2 - radius, whiteSquareY + stickerSize + padding * 2);
          ctx.lineTo(whiteSquareX + radius, whiteSquareY + stickerSize + padding * 2);
          ctx.quadraticCurveTo(whiteSquareX, whiteSquareY + stickerSize + padding * 2, whiteSquareX, whiteSquareY + stickerSize + padding * 2 - radius);
          ctx.lineTo(whiteSquareX, whiteSquareY + radius);
          ctx.quadraticCurveTo(whiteSquareX, whiteSquareY, whiteSquareX + radius, whiteSquareY);
          ctx.closePath();
          ctx.fill();

          // Sticker perfectly centered (no offset)
          const stickerX = x;
          const stickerY = y;

          if (selectedSticker.startsWith('data:')) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, stickerX, stickerY, stickerSize, stickerSize);
            };
            img.src = selectedSticker;
          } else {
            ctx.font = `${stickerSize * 0.8}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000';
            ctx.fillText(selectedSticker, stickerX + stickerSize/2, stickerY + stickerSize/2);
          }
        }
        
        // Apply logo if selected
        if (selectedLogo) {
          const logoSize = 50;
          // Center the logo perfectly in the QR code area
          const x = qrAreaX + (qrAreaSize - logoSize) / 2;
          const y = qrAreaY + (qrAreaSize - logoSize) / 2;
          
          const img = new Image();
          img.onload = () => {
            // Draw white background for logo perfectly centered (no offset)
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.roundRect(x - 2, y - 2, logoSize + 4, logoSize + 4, 4);
            ctx.fill();
            
            // Draw the logo perfectly centered (no offset)
            ctx.drawImage(img, x, y, logoSize, logoSize);
          };
          img.src = selectedLogo;
        }
        
        // (Red dot removed - was used for alignment debugging)
      }
    };
    
    generateQRCode();
  }, [qrData, qrColor, bgColor, qrSize, errorCorrectionLevel, includeMargin, selectedSticker, selectedLogo, selectedFrame, framePhrase, frameFont, frameColor, selectedType, emailData, smsData, wifiData, pdfFile, qrCodeId]);
         

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (PNG, JPG, JPEG, or SVG)');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const logoData = event.target.result;
        setSelectedLogo(logoData);
        
        // Save logo to backend if user is authenticated
        if (isAuthenticated) {
          try {
            await saveLogo(logoData, file.name);
            console.log('Logo saved to user account');
          } catch (error) {
            console.error('Failed to save logo:', error);
            // Continue anyway - the logo will still be selected
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (canvasRef.current && hasQrContent()) {
      // ============================================================
      // Use the SAME ID that was generated when the component mounted
      // (or when the user last clicked "Save to My QR codes").
      // This ensures preview, download, and database all use the same ID.
      // ============================================================
      const effectiveQrCodeId = qrCodeId;
      
      // Get the formatted QR content for the current type
      const qrContentForDownload = getQrContent();
      
      // Send the data to your backend
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const token = localStorage.getItem('jwtToken');
        const qrcodesHeaders = {
          'Content-Type': 'application/json',
        };
        if (token) {
          qrcodesHeaders['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${baseUrl}/qrcodes`, {
          method: 'POST',
          headers: qrcodesHeaders,
          body: JSON.stringify({
            id: effectiveQrCodeId,
            data: qrContentForDownload,
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to save QR code to database');
        } else {
          console.log('QR code saved successfully');
        }
      } catch (error) {
        console.error('Error saving QR code:', error);
      }

      
      // Use tracking URL for QR code generation
      const trackingUrl = getTrackingUrl(effectiveQrCodeId);
      let savedQrCode = null;
      
      // Note: We'll save the QR code AFTER the final canvas is complete
      // (with tracking URL, frame, logo, and sticker all applied)
      // This ensures the dashboard preview matches the downloaded QR code

      
      // Generate QR code with tracking URL
      const canvas = document.createElement('canvas');
      
      // Use same dimensions as preview: 270x300px for Frame #1 and Frame #2, otherwise original dimensions
      if (selectedFrame === 'frame1' || selectedFrame === 'frame2') {
        canvas.width = 270;
        canvas.height = 300;
      } else {
        canvas.width = qrSize;
        canvas.height = qrSize * 2 + 250; // Original dimensions for other frames
      }
      
      // Generate QR code (skip for Frame #1 and Frame #2 - we'll draw them ourselves)
      if (selectedFrame !== 'frame1' && selectedFrame !== 'frame2') {
        await new Promise((resolve, reject) => {
          // ALL QR codes should use tracking URL for scan tracking
          const qrContent = trackingUrl;
          
          QRCode.toCanvas(
            canvas,
            qrContent,
            {
              width: qrSize - 60, // Account for white area padding
              margin: includeMargin ? 2 : 0,
              color: {
                dark: qrColor,
                light: bgColor,
              },
              errorCorrectionLevel: errorCorrectionLevel,
            },
            (error) => {
              if (error) {
                console.error('QR Code generation error:', error);
                reject(error);
              } else {
                resolve();
              }
            }
          );
        });
      }
      
      // Apply same customizations as preview
      const ctx = canvas.getContext('2d');
      
      // Apply frame effects
      if (selectedFrame !== 'none') {
        const frameConfigs = {
          'thick-under-text': { borderWidth: 6, borderRadius: 0, hasLabel: false, labelPosition: 'below', hasIcon: false },
          'thick-over-text': { borderWidth: 6, borderRadius: 0, hasLabel: false, labelPosition: 'over', hasIcon: false },
          'frame1': { borderWidth: 14, padding: 10, color: '#000000' },
          'frame2': { borderWidth: 1, padding: 29, color: '#000000' },
        };
        
        const config = frameConfigs[selectedFrame];
        if (config) {
          if (selectedFrame === 'thick-under-text') {
            const rectangleHeight = qrSize * 0.12;
            const rectanglePadding = qrSize * 0.05;
            const rectangleWidth = qrSize - (rectanglePadding * 2);
            const rectangleRadius = rectangleHeight / 2;
            const rectangleY = qrSize/2 - 25;
            const labelOffsetX = -10;
            
            // Draw rectangle background with rounded edges
            ctx.fillStyle = frameColor;
            ctx.beginPath();
            ctx.roundRect(rectanglePadding + labelOffsetX, rectangleY - rectangleHeight/2, rectangleWidth, rectangleHeight, rectangleRadius);
            ctx.fill();
            
            // Draw white border around rectangle
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(rectanglePadding + labelOffsetX, rectangleY - rectangleHeight/2, rectangleWidth, rectangleHeight, rectangleRadius);
            ctx.stroke();
            
            // Draw editable text inside rectangle
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${rectangleHeight * 0.4}px ${frameFont}`;
            
            const maxWidth = rectangleWidth * 0.9;
            let text = framePhrase;
            
            // Truncate text if too long
            const metrics = ctx.measureText(text);
            if (metrics.width > maxWidth) {
              while (text.length > 3 && ctx.measureText(text + '...').width > maxWidth) {
                text = text.slice(0, -1);
              }
              text = text + '...';
            }
            
            ctx.fillText(text, qrSize/2 + labelOffsetX, rectangleY);
          } else if (selectedFrame === 'frame1') {
            // For Frame #1: Black rounded rectangle with "SCAN ME" label
            // Canvas is 270x300px (same as preview)
            // - Outer container: 270px wide, uses frameColor, rounded corners (14px)
            // - QR code will be drawn at (15,15) with size 240x240px
            // - Label: uses framePhrase, frameFont, white text below QR code
            
            const outerWidth = 270;
            const outerHeight = 300;
            const borderRadius = 14;
            
            // Draw black rounded rectangle (outer container) - uses frameColor variable
            ctx.fillStyle = frameColor;
            ctx.beginPath();
            ctx.roundRect(0, 0, outerWidth, outerHeight, borderRadius);
            ctx.fill();
            
            // Draw frame phrase label - same as preview (283px from top)
            const labelY = 15 + 240 + 8 + 5 + 5 + 10; // qrAreaY + qrAreaSize + gap + 5px lower + 5px more + 10px more = 283px from top
            ctx.fillStyle = '#ffffff';
            ctx.font = `700 18px ${frameFont}, sans-serif`; // Use frameFont variable
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.letterSpacing = '2px';
            
            // Draw uppercase text with letter spacing
            const labelText = framePhrase.toUpperCase(); // Use frame phrase, convert to uppercase
            const labelX = outerWidth / 2;
            
            // Manually draw text with letter spacing
            let currentX = labelX - (ctx.measureText(labelText).width / 2);
            for (let i = 0; i < labelText.length; i++) {
              ctx.fillText(labelText[i], currentX, labelY);
              currentX += ctx.measureText(labelText[i]).width + 2; // 2px letter spacing
            }
            
            // For Frame #1, we skip the initial QR code generation, so no need to clear
            // The frame is already drawn, now we just need to draw the QR code
            
            // Now we need to redraw the QR code at (15,15) with size 240x240px
            // First, save the current canvas state
            ctx.save();
            
            // Clip to the area where QR code should be (15,15, 240x240)
            ctx.beginPath();
            ctx.rect(15, 15, 240, 240);
            ctx.clip();
            
            // Create a temporary canvas for the QR code
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 240;
            tempCanvas.height = 240;
            
            // Generate QR code on temporary canvas
            await new Promise((resolve, reject) => {
              // ALL QR codes should use tracking URL for scan tracking
              const qrContent = trackingUrl;
              
              QRCode.toCanvas(
                tempCanvas,
                qrContent,
                {
                  width: 240,
                  margin: includeMargin ? 2 : 0,
                  color: {
                    dark: qrColor,
                    light: bgColor,
                  },
                  errorCorrectionLevel: errorCorrectionLevel,
                },
                (error) => {
                  if (error) {
                    console.error('QR Code regeneration error:', error);
                    reject(error);
                  } else {
                    resolve();
                  }
                }
              );
            });
            
            // Draw the QR code from temporary canvas to main canvas at (15,15)
            ctx.drawImage(tempCanvas, 15, 15);
            
            // Restore canvas state
            ctx.restore();
          } else if (selectedFrame === 'frame2') {
            // For Frame #2: 10px thick frame from (10,0) to (250,240) - 240x240px
            // Inside area: 220x220px (240 - 10*2)
            // QR code area: from (20,10) to (240,230) - 220x220px
            // Rectangle on bottom: from (10,250) to (250,300) - 240x50px
            // Editable text inside rectangle using frame phrase, font, color
            
            const frameWidth = 10; // 10px thick frame
            const frameSize = 240; // 240x240px (250-10=240, 240-0=240)
            const frameX = 10; // Start from (10,0)
            const frameY = 0;
            
            // Draw 10px thick frame (240x240px) from (10,0) to (250,240) with rounded corners (6px radius - half of 12px)
            ctx.strokeStyle = frameColor; // Use frameColor variable
            ctx.lineWidth = frameWidth;
            ctx.beginPath();
            ctx.roundRect(frameX + frameWidth/2, frameY + frameWidth/2, frameSize, frameSize, 6);
            ctx.stroke();
            
            // Draw text rectangle: (10,260) to (260,300) - 250x40px with rounded corners (16px radius - double of 8px)
            const textRectX = 10;
            const textRectY = 260;
            const textRectWidth = 250; // 260-10=250
            const textRectHeight = 40; // 300-260=40
            
            // Draw rectangle background with rounded corners
            ctx.fillStyle = frameColor; // Use frameColor variable
            ctx.beginPath();
            ctx.roundRect(textRectX, textRectY, textRectWidth, textRectHeight, 16);
            ctx.fill();
            
            // Draw editable text inside rectangle
            ctx.fillStyle = '#ffffff'; // White text
            ctx.font = `700 18px ${frameFont}, sans-serif`; // Use frameFont variable
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const labelText = framePhrase.toUpperCase(); // Use frame phrase, convert to uppercase
            const labelX = textRectX + textRectWidth / 2;
            const labelY = textRectY + textRectHeight / 2;
            
            // Draw text with letter spacing
            ctx.letterSpacing = '2px';
            let currentX = labelX - (ctx.measureText(labelText).width / 2);
            for (let i = 0; i < labelText.length; i++) {
              ctx.fillText(labelText[i], currentX, labelY);
              currentX += ctx.measureText(labelText[i]).width + 2; // 2px letter spacing
            }
            
            // Clear the area where the QR code was originally drawn (with white padding)
            // For Frame #2, the QR code should be at (20,10) with size 230x230px
            // So we need to clear that area
            ctx.clearRect(20, 10, 230, 230);
            
            // Now we need to redraw the QR code at (20,10) with size 230x230px
            // First, save the current canvas state
            ctx.save();
            
            // Clip to the area where QR code should be (20,10, 230x230)
            ctx.beginPath();
            ctx.rect(20, 10, 230, 230);
            ctx.clip();
            
            // Create a temporary canvas for the QR code
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 230;
            tempCanvas.height = 230;
            
            // Generate QR code on temporary canvas
            await new Promise((resolve, reject) => {
              // ALL QR codes should use tracking URL for scan tracking
              const qrContent = trackingUrl;
              
              QRCode.toCanvas(
                tempCanvas,
                qrContent,
                {
                  width: 230,
                  margin: includeMargin ? 2 : 0,
                  color: {
                    dark: qrColor,
                    light: bgColor,
                  },
                  errorCorrectionLevel: errorCorrectionLevel,
                },
                (error) => {
                  if (error) {
                    console.error('QR Code regeneration error:', error);
                    reject(error);
                  } else {
                    resolve();
                  }
                }
              );
            });
            
            // Draw the QR code from temporary canvas to main canvas at (20,10)
            ctx.drawImage(tempCanvas, 20, 10);
            
            // Restore canvas state
            ctx.restore();
          }
        }
      }
      
                // Apply sticker if selected
                if (selectedSticker) {
                  const stickerSize = qrSize * 0.2;
                  // Calculate QR code area dimensions (same as how QR is drawn)
                  const qrAreaSize = qrSize - 60;
                  // Center sticker within the QR code area
                  const x = (qrAreaSize - stickerSize) / 2;
                  const y = (qrAreaSize - stickerSize) / 2;
                  const padding = 6;
                  // White square perfectly centered (no offset)
                  const whiteSquareX = x - padding;
                  const whiteSquareY = y - padding;
                  ctx.fillStyle = 'white';
                  const radius = 8;
                  ctx.beginPath();
                  ctx.moveTo(whiteSquareX + radius, whiteSquareY);
                  ctx.lineTo(whiteSquareX + stickerSize + padding * 2 - radius, whiteSquareY);
                  ctx.quadraticCurveTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY, whiteSquareX + stickerSize + padding * 2, whiteSquareY + radius);
                  ctx.lineTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY + stickerSize + padding * 2 - radius);
                  ctx.quadraticCurveTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY + stickerSize + padding * 2, whiteSquareX + stickerSize + padding * 2 - radius, whiteSquareY + stickerSize + padding * 2);
                  ctx.lineTo(whiteSquareX + radius, whiteSquareY + stickerSize + padding * 2);
                  ctx.quadraticCurveTo(whiteSquareX, whiteSquareY + stickerSize + padding * 2, whiteSquareX, whiteSquareY + stickerSize + padding * 2 - radius);
                  ctx.lineTo(whiteSquareX, whiteSquareY + radius);
                  ctx.quadraticCurveTo(whiteSquareX, whiteSquareY, whiteSquareX + radius, whiteSquareY);
                  ctx.closePath();
                  ctx.fill();

                  // Sticker perfectly centered (no offset)
                  const stickerX = x;
                  const stickerY = y;

        if (selectedSticker.startsWith('data:')) {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, stickerX, stickerY, stickerSize, stickerSize);
              resolve();
            };
            img.onerror = reject;
            img.src = selectedSticker;
          });
        } else {
          ctx.font = `${stickerSize * 0.8}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#000';
          ctx.fillText(selectedSticker, stickerX + stickerSize/2, stickerY + stickerSize/2);
        }
      }
      
      // Apply logo if selected
      if (selectedLogo) {
        const logoSize = 50;
        // Calculate QR code area dimensions (same as how QR is drawn)
        const qrAreaSize = qrSize - 60;
        // Center logo within the QR code area
        const x = (qrAreaSize - logoSize) / 2;
        const y = (qrAreaSize - logoSize) / 2;
        
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => {
            // Draw white background for logo perfectly centered (no offset)
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.roundRect(x - 2, y - 2, logoSize + 4, logoSize + 4, 4);
            ctx.fill();
            
            // Draw the logo perfectly centered (no offset)
            ctx.drawImage(img, x, y, logoSize, logoSize);
            resolve();
          };
          img.onerror = reject;
          img.src = selectedLogo;
        });
      }
      
      // Download the QR code
      const finalImageData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = finalImageData;
      link.download = `qrcode_${Date.now()}.png`;
      link.click();
      
      // ============================================================
      // Save the final QR code image to the user's dashboard
      // This uses the COMPLETED canvas with tracking URL, frame,
      // logo, and sticker all applied - matching exactly what was downloaded.
      // ============================================================
      if (isAuthenticated) {
        try {
          savedQrCode = await saveQrCode(
            getQrContent(),
            finalImageData,
            `QR Code ${new Date().toLocaleDateString()}`,
            effectiveQrCodeId
          );
          console.log('✅ QR code saved to dashboard with final rendered image:', savedQrCode);
        } catch (error) {
          console.error('Failed to save QR code to dashboard:', error);
        }
      }

    }
  };

  const editorContent = (
    <div style={{
      display: 'flex',
      flex: 1,
      flexDirection: 'row',
      gap: '30px',
      width: '100%',
    }}>
      {/* Left Sidebar */}
      <div style={{
        width: '528px',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '30px',
        borderRadius: '24px',
        border: '1px solid rgba(0, 217, 255, 0.1)',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 10px 0', color: '#00D9FF' }}>
          QR Editor
        </h1>

        {/* Step 1: Choose the Type */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(0,217,255,0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '30px',
        }}>
          <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#fff', fontWeight: '700', textAlign: 'left' }}>
            1. Choose the Type:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: '12px' }}>
            {qrTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                style={{
                  background: selectedType === type.id ? '#00D9FF' : 'transparent',
                  color: selectedType === type.id ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>
                  {type.id === 'url' && '🔗'}
                  {type.id === 'text' && '📝'}
                  {type.id === 'email' && '✉️'}
                  {type.id === 'sms' && '💬'}
                  {type.id === 'whatsapp' && '📱'}
                  {type.id === 'wifi' && '📶'}
                  {type.id === 'pdf' && '📄'}
                  {type.id === 'social' && '🔗'}
                  {type.id === 'event' && '📅'}
                </span>
                {type.label}
              </button>
            ))}
          </div>
        </div>


        <div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#fff', fontWeight: '700', marginBottom: '10px' }}>
              <span>🔗</span> 2. Complete the Content:
            </label>
              {selectedType === 'email' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData({...emailData, email: e.target.value})}
                    placeholder="Your Email Address"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    placeholder="Subject of Email"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                    placeholder="Message"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      minHeight: '100px',
                      resize: 'vertical',
                    }}
                  />
                </div>
              ) : selectedType === 'sms' || selectedType === 'whatsapp' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                      value={smsData.countryCode}
                      onChange={(e) => setSmsData({...smsData, countryCode: e.target.value})}
                      style={{
                        flex: '0 0 120px',
                        padding: '12px',
                        background: '#1a1a2e',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="+1" style={{ background: '#1a1a2e', color: '#fff' }}>🇺🇸 +1 (USA)</option>
                      <option value="+44" style={{ background: '#1a1a2e', color: '#fff' }}>🇬🇧 +44 (UK)</option>
                      <option value="+91" style={{ background: '#1a1a2e', color: '#fff' }}>🇮🇳 +91 (India)</option>
                      <option value="+86" style={{ background: '#1a1a2e', color: '#fff' }}>🇨🇳 +86 (China)</option>
                      <option value="+81" style={{ background: '#1a1a2e', color: '#fff' }}>🇯🇵 +81 (Japan)</option>
                      <option value="+49" style={{ background: '#1a1a2e', color: '#fff' }}>🇩🇪 +49 (Germany)</option>
                      <option value="+33" style={{ background: '#1a1a2e', color: '#fff' }}>🇫🇷 +33 (France)</option>
                      <option value="+61" style={{ background: '#1a1a2e', color: '#fff' }}>🇦🇺 +61 (Australia)</option>
                      <option value="+55" style={{ background: '#1a1a2e', color: '#fff' }}>🇧🇷 +55 (Brazil)</option>
                      <option value="+7" style={{ background: '#1a1a2e', color: '#fff' }}>🇷🇺 +7 (Russia)</option>
                    </select>
                    <input
                      type="tel"
                      value={smsData.phoneNumber}
                      onChange={(e) => setSmsData({...smsData, phoneNumber: e.target.value})}
                      placeholder="Phone Number"
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <textarea
                    value={smsData.message}
                    onChange={(e) => setSmsData({...smsData, message: e.target.value})}
                    placeholder="Message"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      minHeight: '100px',
                      resize: 'vertical',
                    }}
                  />
                </div>
              ) : selectedType === 'wifi' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    value={wifiData.ssid}
                    onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})}
                    placeholder="SSID (Network Name)"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <select
                    value={wifiData.encryption}
                    onChange={(e) => setWifiData({...wifiData, encryption: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#1a1a2e',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="WEP" style={{ background: '#1a1a2e', color: '#fff' }}>WEP</option>
                    <option value="WPA/WPA2" style={{ background: '#1a1a2e', color: '#fff' }}>WPA/WPA2</option>
                  </select>
                  <input
                    type="password"
                    value={wifiData.password}
                    onChange={(e) => setWifiData({...wifiData, password: e.target.value})}
                    placeholder="WI-FI Password"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ) : selectedType === 'pdf' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="file"
                    id="pdf-upload"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPdfFile(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="pdf-upload"
                    style={{
                      padding: '14px',
                      background: 'rgba(0, 217, 255, 0.1)',
                      border: '2px dashed rgba(0, 217, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#00D9FF',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      textAlign: 'center',
                      display: 'block',
                    }}
                  >
                    📁 Upload PDF File
                  </label>
                  {pdfFile && (
                    <div style={{
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#00D9FF',
                      textAlign: 'center',
                    }}>
                      Selected: {pdfFile.name}
                    </div>
                  )}
                </div>
              ) : selectedType === 'social' || selectedType === 'event' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    style={{
                      padding: '14px',
                      background: 'linear-gradient(135deg, #FF00FF 0%, #00D9FF 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#000',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Create Now
                  </button>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(0, 217, 255, 0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#00D9FF',
                    textAlign: 'center',
                  }}>
                    This feature will be implemented soon
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  placeholder={
                    selectedType === 'url' ? "Enter the URL" : 
                    selectedType === 'text' ? "Enter the message" : 
                    "Enter URL or data..."
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                Reliability & Complexity
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { label: 'LOW', value: 'L' },
                  { label: 'MEDIUM', value: 'M' },
                  { label: 'HIGH', value: 'Q' },
                  { label: 'HIGHEST', value: 'H' },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setErrorCorrectionLevel(level.value)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: errorCorrectionLevel === level.value ? '#00D9FF' : 'rgba(0, 217, 255, 0.1)',
                      color: errorCorrectionLevel === level.value ? '#000' : '#00D9FF',
                      border: `1px solid ${errorCorrectionLevel === level.value ? '#00D9FF' : 'rgba(0, 217, 255, 0.3)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '11px',
                    }}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 217, 255, 0.08)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '24px',
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: '700', textAlign: 'left' }}>
                3. Choose the Kind of QR Code:
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                <button
                  onClick={() => setQrMode('static')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: qrMode === 'static' ? '#00D9FF' : 'rgba(0, 217, 255, 0.2)',
                    color: qrMode === 'static' ? '#000' : '#00D9FF',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  Static QR
                </button>
                <button
                  onClick={() => {
                    setQrMode('dynamic');
                    if (!isAuthenticated) {
                      // Show login prompt or message
                      console.log('User needs to login for dynamic QR codes');
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: qrMode === 'dynamic' ? '#00D9FF' : 'rgba(0, 217, 255, 0.2)',
                    color: qrMode === 'dynamic' ? '#000' : '#00D9FF',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  Dynamic QR
                </button>
              </div>
              {qrMode === 'dynamic' && !isAuthenticated && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px',
                  background: 'rgba(255, 0, 255, 0.1)',
                  border: '1px solid rgba(255, 0, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#FF00FF',
                  textAlign: 'center',
                }}>
                  🔒 Login to create Dynamic QR codes for free for 7 days
                </div>
              )}
              {qrMode === 'dynamic' && isAuthenticated && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px',
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#00D9FF',
                  textAlign: 'center',
                }}>
                  {subscriptionLoading ? (
                    <span>⏳ Checking subscription status...</span>
                  ) : getIsPro() ? (
                    <span>🎉 With your "{getPlanDisplayName() || 'Pro'}" plan you can edit the QR code's metadata in your Dashboard page</span>
                  ) : getCanCreateDynamic() ? (
                    <span>⭐ Your free Pro trial started on {trialStartedAt ? new Date(trialStartedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'today'}, you can generate Dynamic QR codes during these first 7 days. {getTrialDaysLeft()} days left. <a href="/pricing" style={{color: '#FF00FF', textDecoration: 'underline'}}>Upgrade to Pro</a></span>
                  ) : (
                    <span>⛔ Trial expired. <a href="/pricing" style={{color: '#FF00FF', textDecoration: 'underline'}}>Subscribe to Pro plan</a></span>
                  )}
                </div>
              )}
            </div>

            <div style={{
              marginBottom: '30px',
              padding: '18px',
              background: 'rgba(0, 217, 255, 0.05)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
                <span>🎨</span> 4. Design Your QR Code:
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                {['frame', 'shape', 'logo'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDesignTab(tab)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '16px',
                      border: designTab === tab ? '2px solid #00D9FF' : '1px solid rgba(255, 255, 255, 0.25)',
                      background: designTab === tab ? 'rgba(0, 217, 255, 0.2)' : 'transparent',
                      color: designTab === tab ? '#00D9FF' : '#ccc',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {tab === 'frame' ? 'Frame' : tab === 'shape' ? 'Color' : 'Logo'}
                  </button>
                ))}
              </div>

              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.15)' }}>
                {designTab === 'frame' && (
                  <div>
                    <div style={{ marginBottom: '12px', fontSize: '12px', color: '#aaa', fontWeight: '600' }}>
                      Choose a frame style:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {[
                        { 
                          id: 'none', 
                          label: 'No Frame',
                          borderStyle: 'none', 
                          borderWidth: '0px', 
                          borderColor: 'transparent',
                          hasLabel: false,
                          labelPosition: 'none',
                          hasIcon: false
                        },
                        { 
                          id: 'frame1', 
                          label: 'Frame #1',
                          borderStyle: 'solid', 
                          borderWidth: '14px', 
                          borderColor: '#000000',
                          hasLabel: false,
                          labelPosition: 'none',
                          hasIcon: false,
                          padding: '10px'
                        },
                        { 
                          id: 'frame2', 
                          label: 'Frame #2',
                          borderStyle: 'solid', 
                          borderWidth: '1px', 
                          borderColor: '#000000',
                          hasLabel: false,
                          labelPosition: 'none',
                          hasIcon: false,
                          padding: '29px'
                        },
                      ].map((frame) => (
                        <div
                          key={frame.id}
                          onClick={() => setSelectedFrame(frame.id)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: selectedFrame === frame.id ? 'rgba(0, 217, 255, 0.15)' : 'rgba(0, 217, 255, 0.05)',
                            border: selectedFrame === frame.id ? '2px solid #00D9FF' : '2px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            padding: '10px',
                            height: '120px',
                          }}
                          onMouseEnter={(e) => {
                            if (selectedFrame !== frame.id) {
                              e.currentTarget.style.borderColor = '#00D9FF';
                              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedFrame !== frame.id) {
                              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.2)';
                              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)';
                            }
                          }}
                        >
                          {/* Mini QR Preview with frame style */}
                          <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#fff',
                            borderStyle: frame.borderStyle,
                            borderRadius: frame.isCircle ? '50%' : frame.borderRadius,
                            borderWidth: frame.borderWidth,
                            borderColor: frame.borderColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '6px',
                            boxSizing: 'border-box',
                            position: 'relative',
                            overflow: 'hidden',
                          }}>
                            {/* Mini QR code pattern */}
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                              <rect x="4" y="4" width="10" height="10" fill="#000"/>
                              <rect x="26" y="4" width="10" height="10" fill="#000"/>
                              <rect x="4" y="26" width="10" height="10" fill="#000"/>
                              <rect x="6" y="6" width="6" height="6" fill="#fff"/>
                              <rect x="28" y="6" width="6" height="6" fill="#fff"/>
                              <rect x="6" y="28" width="6" height="6" fill="#fff"/>
                              <rect x="16" y="4" width="3" height="3" fill="#000"/>
                              <rect x="20" y="4" width="3" height="3" fill="#000"/>
                              <rect x="16" y="8" width="3" height="3" fill="#000"/>
                              <rect x="18" y="16" width="5" height="5" fill="#000"/>
                              <rect x="16" y="20" width="3" height="3" fill="#000"/>
                              <rect x="22" y="18" width="3" height="3" fill="#000"/>
                              <rect x="26" y="18" width="3" height="3" fill="#000"/>
                              <rect x="30" y="22" width="3" height="3" fill="#000"/>
                              <rect x="18" y="26" width="3" height="3" fill="#000"/>
                              <rect x="22" y="28" width="3" height="3" fill="#000"/>
                              <rect x="26" y="26" width="5" height="5" fill="#000"/>
                              <rect x="30" y="30" width="3" height="3" fill="#000"/>
                            </svg>
                            
                            {/* Round label overlay for frames with labels */}
                            {frame.hasLabel && frame.labelPosition === 'over' && (
                              <div style={{
                                position: 'absolute',
                                top: '-30px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#00D9FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white',
                              }}>
                                {frame.hasIcon && (
                                  <span style={{ fontSize: '10px', color: 'white' }}>QR</span>
                                )}
                              </div>
                            )}
                            
                            {/* Round label underlay for frames with labels under */}
                            {frame.hasLabel && frame.labelPosition === 'under' && (
                              <div style={{
                                position: 'absolute',
                                bottom: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#FF00FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white',
                              }}>
                                {frame.hasIcon && (
                                  <span style={{ fontSize: '10px', color: 'white' }}>QR</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Text label below for circle frame */}
                          {frame.isCircle && (
                            <div style={{
                              marginTop: '4px',
                              padding: '2px 6px',
                              background: 'transparent',
                              borderRadius: '4px',
                              fontSize: '8px',
                              color: '#ccc',
                              textAlign: 'center',
                            }}>
                              Your Text
                            </div>
                          )}
                          
                          <span style={{ fontSize: '9px', color: '#ccc', fontWeight: '600', textAlign: 'center', marginTop: '4px' }}>{frame.label}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Frame customization controls */}
                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '600', marginBottom: '12px' }}>
                        Frame Customization:
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Frame phrase input */}
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: '#ccc', fontWeight: '600' }}>
                            Frame phrase:
                          </label>
                          <input
                            type="text"
                            value={framePhrase}
                            onChange={(e) => setFramePhrase(e.target.value)}
                            placeholder="Enter text for frame label..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: 'rgba(0, 217, 255, 0.05)',
                              border: '1px solid rgba(0, 217, 255, 0.2)',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '11px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        
                        {/* Phrase font selection */}
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: '#ccc', fontWeight: '600' }}>
                            Phrase font:
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {['Arial', 'Courier', 'Georgia'].map((font) => (
                              <button
                                key={font}
                                onClick={() => setFrameFont(font)}
                                style={{
                                  flex: 1,
                                  padding: '6px',
                                  background: frameFont === font ? '#00D9FF' : 'rgba(0, 217, 255, 0.1)',
                                  border: `1px solid ${frameFont === font ? '#00D9FF' : 'rgba(0, 217, 255, 0.3)'}`,
                                  borderRadius: '4px',
                                  color: frameFont === font ? '#000' : '#ccc',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                }}
                              >
                                {font}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Frame color selection */}
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: '#ccc', fontWeight: '600' }}>
                            Frame color:
                          </label>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {[
                              '#000000', '#FF00FF', '#00FF00', '#FFFF00', '#FF9900', '#FF0000', '#9900FF'
                            ].map((color) => (
                              <div
                                key={color}
                                onClick={() => setFrameColor(color)}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: color,
                                  border: frameColor === color ? '3px solid white' : '2px solid white',
                                  cursor: 'pointer',
                                  boxShadow: frameColor === color ? '0 0 8px rgba(0,0,0,0.5)' : '0 0 4px rgba(0,0,0,0.3)',
                                  transform: frameColor === color ? 'scale(1.1)' : 'scale(1)',
                                  transition: 'all 0.2s ease',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {designTab === 'shape' && (
                  <div>
                    <div style={{ marginBottom: '12px', fontSize: '12px', color: '#aaa', fontWeight: '600' }}>
                      Choose a color for your QR code:
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {[
                        { id: '#000000', label: 'Black', color: '#000000' },
                        { id: '#FF00FF', label: 'Magenta', color: '#FF00FF' },
                        { id: '#00FF00', label: 'Green', color: '#00FF00' },
                        { id: '#FFFF00', label: 'Yellow', color: '#FFFF00' },
                        { id: '#FF9900', label: 'Orange', color: '#FF9900' },
                        { id: '#FF0000', label: 'Red', color: '#FF0000' },
                        { id: '#9900FF', label: 'Purple', color: '#9900FF' },
                      ].map((colorOption) => (
                        <div
                          key={colorOption.id}
                          onClick={() => setQrColor(colorOption.id)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: qrColor === colorOption.id ? 'rgba(0, 217, 255, 0.15)' : 'rgba(0, 217, 255, 0.05)',
                            border: qrColor === colorOption.id ? '2px solid #00D9FF' : '2px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            padding: '10px',
                            width: '80px',
                            height: '80px',
                          }}
                          onMouseEnter={(e) => {
                            if (qrColor !== colorOption.id) {
                              e.currentTarget.style.borderColor = '#00D9FF';
                              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (qrColor !== colorOption.id) {
                              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.2)';
                              e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)';
                            }
                          }}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: colorOption.color,
                            borderRadius: '8px',
                            marginBottom: '6px',
                            boxSizing: 'border-box',
                            border: '2px solid white',
                            boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                          }}>
                          </div>
                          <span style={{ fontSize: '9px', color: '#ccc', fontWeight: '600', textAlign: 'center' }}>{colorOption.label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#aaa', fontWeight: '600', marginBottom: '8px' }}>
                        Selected Color: <span style={{ color: qrColor, fontWeight: '700' }}>{qrColor}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          background: qrColor,
                          borderRadius: '4px',
                          border: '2px solid white',
                        }}></div>
                        <div style={{ fontSize: '10px', color: '#ccc' }}>
                          This color will be applied to the QR code pattern (not the frame)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {designTab === 'logo' && (
                  <div>
                    <div style={{ marginBottom: '12px', fontSize: '12px', color: '#aaa', fontWeight: '600' }}>
                      Add a logo or image:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="file"
                        id="logo-upload"
                        accept=".png,.jpg,.jpeg,.svg"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="logo-upload"
                        style={{
                          padding: '12px',
                          background: 'rgba(0, 217, 255, 0.1)',
                          border: '2px dashed rgba(0, 217, 255, 0.3)',
                          borderRadius: '8px',
                          color: '#00D9FF',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          textAlign: 'center',
                          display: 'block',
                        }}
                      >
                        📁 Upload Logo
                      </label>
                      <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>
                        Recommended: PNG with transparent background
                      </div>

                      {/* Common Logos Banner */}
                      <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '600', marginBottom: '8px', marginTop: '8px' }}>
                        Or choose a common logo:
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        overflowX: 'auto',
                        paddingBottom: '8px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#00D9FF rgba(0, 217, 255, 0.1)',
                        WebkitOverflowScrolling: 'touch',
                      }}>
                        {[
                          { id: 'whatsapp', label: 'WhatsApp', src: whatsappLogo },
                          { id: 'wechat', label: 'WeChat', src: wechatLogo },
                          { id: 'instagram', label: 'Instagram', src: instagramLogo },
                          { id: 'mail', label: 'Mail', src: mailLogo },
                          { id: 'wifi', label: 'Wi-Fi', src: wifiLogo },
                          { id: 'paypal', label: 'PayPal', src: paypalLogo },
                          { id: 'link', label: 'Link', src: linkLogo },
                          { id: 'tiktok', label: 'TikTok', src: tiktokLogo },
                          { id: 'bitcoin', label: 'Bitcoin', src: bitcoinLogo },
                        ].map((logo) => (
                          <div
                            key={logo.id}
                            onClick={() => setSelectedLogo(logo.src)}
                            style={{
                              flex: '0 0 auto',
                              width: '72px',
                              height: '72px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              background: selectedLogo === logo.src ? 'rgba(0, 217, 255, 0.2)' : 'rgba(0, 217, 255, 0.05)',
                              border: selectedLogo === logo.src ? '2px solid #00D9FF' : '1px solid rgba(0, 217, 255, 0.2)',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              padding: '4px',
                            }}
                            title={logo.label}
                          >
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'transparent'
                            }}>
                              <img src={logo.src} alt={logo.label} style={{ width: '28px', height: '28px', display: 'block' }} />
                            </div>
                            <span style={{ fontSize: '9px', color: '#ccc', fontWeight: '600', textAlign: 'center', lineHeight: '1.1' }}>
                              {logo.label}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Selected Logo Display */}
                      {selectedLogo && (
                        <div style={{
                          marginTop: '15px',
                          padding: '15px',
                          background: 'rgba(0, 217, 255, 0.1)',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '10px',
                        }}>
                          <div style={{ fontSize: '12px', color: '#00D9FF', fontWeight: '600' }}>
                            Selected Logo
                          </div>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '2px solid #00D9FF',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}>
                            {selectedLogo.startsWith('data:') || selectedLogo.startsWith('http') || selectedLogo.startsWith('/logos/') || selectedLogo.startsWith('/assets/') ? (
                              <img 
                                src={selectedLogo} 
                                alt="Selected logo" 
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <div style={{ fontSize: '24px', color: '#fff' }}>{selectedLogo}</div>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedLogo(null)}
                            style={{
                              padding: '4px 12px',
                              background: 'rgba(255, 0, 0, 0.2)',
                              border: '1px solid rgba(255, 0, 0, 0.5)',
                              borderRadius: '4px',
                              color: '#ff6b6b',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>✕</span> Remove Logo
                          </button>
                        </div>
                      )}
                      
                      {/* Saved Logos Section */}
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(0, 217, 255, 0.2)' }}>
                        {isAuthenticated ? (
                          <div>
                            <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '600', marginBottom: '12px' }}>
                              Your Saved Logos ({userLogos.length})
                            </div>
                            {loadingLogos ? (
                              <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '11px' }}>
                                Loading your logos...
                              </div>
                            ) : userLogos.length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '10px' }}>
                                {userLogos.map((logo, index) => (
                                  <div
                                    key={logo.id || index}
                                    onClick={() => setSelectedLogo(logo.data)}
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      border: selectedLogo === logo.data ? '2px solid #00D9FF' : '1px solid rgba(255, 255, 255, 0.2)',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '20px',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      overflow: 'hidden',
                                      transition: 'all 0.2s ease',
                                    }}
                                    title={logo.name}
                                    onMouseEnter={(e) => {
                                      if (selectedLogo !== logo.data) {
                                        e.currentTarget.style.borderColor = '#00D9FF';
                                        e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (selectedLogo !== logo.data) {
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                      }
                                    }}
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
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '11px' }}>
                                No logos saved yet. Upload a logo to see it here.
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: '#00D9FF', fontWeight: '600', marginBottom: '8px' }}>
                              Login to use your saved logos
                            </div>
                            <div style={{ fontSize: '10px', color: '#888' }}>
                              Sign in to access and reuse your previously uploaded logos
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '15px' }}>
                <span>✨</span> Center Sticker
              </label>
              <button
                onClick={() => setShowStickerPicker(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #FF00FF 0%, #FF1493 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ✨ Add Sticker
              </button>
              {selectedSticker && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  background: 'rgba(0, 217, 255, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{ fontSize: '24px', textAlign: 'center' }}>
                    {selectedSticker.startsWith('data:') ? (
                      <img src={selectedSticker} alt="sticker" style={{ maxWidth: '60px', maxHeight: '60px' }} />
                    ) : (
                      selectedSticker
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedSticker(null)}
                    style={{
                      padding: '4px 12px',
                      background: 'rgba(255, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 0, 0, 0.5)',
                      borderRadius: '4px',
                      color: '#ff6b6b',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>✕</span> Remove Sticker
                  </button>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Right Preview */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '30px 40px',
        alignSelf: 'flex-start',
        height: 'fit-content',
      }}>
        <div style={{
          padding: '50px',
          background: '#ffffff',
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          marginBottom: '40px',
          overflow: 'visible',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <canvas ref={canvasRef} style={{ 
            border: '1px solid white', // Frame preview area
            width: selectedFrame === 'frame1' ? '270px' : 'auto',
            height: selectedFrame === 'frame1' ? '300px' : 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
          }} /> {/* Frame preview area */}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownload}
            style={{
              padding: '14px 40px',
              background: 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
              border: 'none',
              borderRadius: '20px',
              color: '#000',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 0 30px rgba(0, 217, 255, 0.5)',
            }}
          >
            Download QR Code
          </button>
          <button
            onClick={async () => {
              console.log('💾 Save to My QR codes button clicked');
              console.log('isAuthenticated:', isAuthenticated);
              console.log('qrData:', qrData?.substring(0, 100));
              console.log('qrCodeId:', qrCodeId);
              console.log('selectedFrame:', selectedFrame);
              console.log('framePhrase:', framePhrase);
              
              if (!isAuthenticated) {
                alert('Please login to save QR codes to your collection');
                return;
              }
              
              if (!hasQrContent()) {
                alert('Please create a QR code first');
                return;
              }
              
              try {
                // ============================================================
                // Generate a final rendered image with tracking URL, frame,
                // logo, and sticker - matching exactly what would be downloaded.
                // This ensures the dashboard preview matches the downloaded QR code.
                // ============================================================
                let imageData;
                
                // Generate a fresh canvas with the tracking URL and all design elements
                const finalCanvas = document.createElement('canvas');
                const trackingUrl = getTrackingUrl(qrCodeIdRef.current);
                
                // Use same dimensions as preview: 270x300px for Frame #1 and Frame #2, otherwise original dimensions
                if (selectedFrame === 'frame1' || selectedFrame === 'frame2') {
                  finalCanvas.width = 270;
                  finalCanvas.height = 300;
                } else {
                  finalCanvas.width = qrSize;
                  finalCanvas.height = qrSize * 2 + 250;
                }
                
                // Generate QR code with tracking URL (skip for Frame #1 and Frame #2)
                if (selectedFrame !== 'frame1' && selectedFrame !== 'frame2') {
                  await new Promise((resolve, reject) => {
                    QRCode.toCanvas(
                      finalCanvas,
                      trackingUrl,
                      {
                        width: qrSize - 60,
                        margin: includeMargin ? 2 : 0,
                        color: {
                          dark: qrColor,
                          light: bgColor,
                        },
                        errorCorrectionLevel: errorCorrectionLevel,
                      },
                      (error) => {
                        if (error) reject(error);
                        else resolve();
                      }
                    );
                  });
                }
                
                // Apply frame effects (same logic as handleDownload)
                const ctx = finalCanvas.getContext('2d');
                if (selectedFrame !== 'none') {
                  if (selectedFrame === 'frame1') {
                    const outerWidth = 270;
                    const outerHeight = 300;
                    const borderRadius = 14;
                    
                    ctx.fillStyle = frameColor;
                    ctx.beginPath();
                    ctx.roundRect(0, 0, outerWidth, outerHeight, borderRadius);
                    ctx.fill();
                    
                    const labelY = 15 + 240 + 8 + 5 + 5 + 10;
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `700 18px ${frameFont}, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'alphabetic';
                    
                    const labelText = framePhrase.toUpperCase();
                    const labelX = outerWidth / 2;
                    let currentX = labelX - (ctx.measureText(labelText).width / 2);
                    for (let i = 0; i < labelText.length; i++) {
                      ctx.fillText(labelText[i], currentX, labelY);
                      currentX += ctx.measureText(labelText[i]).width + 2;
                    }
                    
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(15, 15, 240, 240);
                    ctx.clip();
                    
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 240;
                    tempCanvas.height = 240;
                    
                    await new Promise((resolve, reject) => {
                      QRCode.toCanvas(
                        tempCanvas,
                        trackingUrl,
                        {
                          width: 240,
                          margin: includeMargin ? 2 : 0,
                          color: { dark: qrColor, light: bgColor },
                          errorCorrectionLevel: errorCorrectionLevel,
                        },
                        (error) => {
                          if (error) reject(error);
                          else resolve();
                        }
                      );
                    });
                    
                    ctx.drawImage(tempCanvas, 15, 15);
                    ctx.restore();
                  } else if (selectedFrame === 'frame2') {
                    const frameWidth = 10;
                    const frameSize = 240;
                    const frameX = 10;
                    const frameY = 0;
                    
                    ctx.strokeStyle = frameColor;
                    ctx.lineWidth = frameWidth;
                    ctx.beginPath();
                    ctx.roundRect(frameX + frameWidth/2, frameY + frameWidth/2, frameSize, frameSize, 6);
                    ctx.stroke();
                    
                    const textRectX = 10;
                    const textRectY = 260;
                    const textRectWidth = 250;
                    const textRectHeight = 40;
                    
                    ctx.fillStyle = frameColor;
                    ctx.beginPath();
                    ctx.roundRect(textRectX, textRectY, textRectWidth, textRectHeight, 16);
                    ctx.fill();
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `700 18px ${frameFont}, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    const labelText = framePhrase.toUpperCase();
                    const labelX = textRectX + textRectWidth / 2;
                    const labelY = textRectY + textRectHeight / 2;
                    
                    let currentX = labelX - (ctx.measureText(labelText).width / 2);
                    for (let i = 0; i < labelText.length; i++) {
                      ctx.fillText(labelText[i], currentX, labelY);
                      currentX += ctx.measureText(labelText[i]).width + 2;
                    }
                    
                    ctx.clearRect(20, 10, 230, 230);
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(20, 10, 230, 230);
                    ctx.clip();
                    
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 230;
                    tempCanvas.height = 230;
                    
                    await new Promise((resolve, reject) => {
                      QRCode.toCanvas(
                        tempCanvas,
                        trackingUrl,
                        {
                          width: 230,
                          margin: includeMargin ? 2 : 0,
                          color: { dark: qrColor, light: bgColor },
                          errorCorrectionLevel: errorCorrectionLevel,
                        },
                        (error) => {
                          if (error) reject(error);
                          else resolve();
                        }
                      );
                    });
                    
                    ctx.drawImage(tempCanvas, 20, 10);
                    ctx.restore();
                  }
                }
                
                // Apply sticker if selected
                if (selectedSticker) {
                  const stickerSize = qrSize * 0.2;
                  // Calculate QR code area dimensions (same as how QR is drawn)
                  const qrAreaSize = qrSize - 60;
                  // Center sticker within the QR code area
                  const x = (qrAreaSize - stickerSize) / 2;
                  const y = (qrAreaSize - stickerSize) / 2;
                  const padding = 6;
                  // White square perfectly centered (no offset)
                  const whiteSquareX = x - padding;
                  const whiteSquareY = y - padding;
                  ctx.fillStyle = 'white';
                  const radius = 8;
                  ctx.beginPath();
                  ctx.moveTo(whiteSquareX + radius, whiteSquareY);
                  ctx.lineTo(whiteSquareX + stickerSize + padding * 2 - radius, whiteSquareY);
                  ctx.quadraticCurveTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY, whiteSquareX + stickerSize + padding * 2, whiteSquareY + radius);
                  ctx.lineTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY + stickerSize + padding * 2 - radius);
                  ctx.quadraticCurveTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY + stickerSize + padding * 2, whiteSquareX + stickerSize + padding * 2 - radius, whiteSquareY + stickerSize + padding * 2);
                  ctx.lineTo(whiteSquareX + radius, whiteSquareY + stickerSize + padding * 2);
                  ctx.quadraticCurveTo(whiteSquareX, whiteSquareY + stickerSize + padding * 2, whiteSquareX, whiteSquareY + stickerSize + padding * 2 - radius);
                  ctx.lineTo(whiteSquareX, whiteSquareY + radius);
                  ctx.quadraticCurveTo(whiteSquareX, whiteSquareY, whiteSquareX + radius, whiteSquareY);
                  ctx.closePath();
                  ctx.fill();

                  // Sticker perfectly centered (no offset)
                  const stickerX = x;
                  const stickerY = y;
                  
                  if (selectedSticker.startsWith('data:')) {
                    const img = new Image();
                    await new Promise((resolve, reject) => {
                      img.onload = () => {
                        ctx.drawImage(img, stickerX, stickerY, stickerSize, stickerSize);
                        resolve();
                      };
                      img.onerror = reject;
                      img.src = selectedSticker;
                    });
                  } else {
                    ctx.font = `${stickerSize * 0.8}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#000';
                    ctx.fillText(selectedSticker, stickerX + stickerSize/2, stickerY + stickerSize/2);
                  }
                }
                
                // Apply logo if selected
                if (selectedLogo) {
                  const logoSize = 50;
                  // Calculate QR code area dimensions (same as how QR is drawn)
                  const qrAreaSize = qrSize - 60;
                  // Center logo within the QR code area
                  const x = (qrAreaSize - logoSize) / 2;
                  const y = (qrAreaSize - logoSize) / 2;
                  
                  const img = new Image();
                  await new Promise((resolve, reject) => {
                    img.onload = () => {
                      // Draw white background for logo perfectly centered (no offset)
                      ctx.fillStyle = 'white';
                      ctx.beginPath();
                      ctx.roundRect(x - 2, y - 2, logoSize + 4, logoSize + 4, 4);
                      ctx.fill();
                      // Draw the logo perfectly centered (no offset)
                      ctx.drawImage(img, x, y, logoSize, logoSize);
                      resolve();
                    };
                    img.onerror = reject;
                    img.src = selectedLogo;
                  });
                }
                
                // Capture the final rendered image
                imageData = finalCanvas.toDataURL('image/png');
                console.log('📸 Generated final rendered image with tracking URL, frame, sticker, and logo');

                
                // Create design characteristics object
                const designCharacteristics = {
                  qrColor,
                  bgColor,
                  selectedFrame,
                  frameColor,
                  frameFont,
                  framePhrase,
                  selectedSticker,
                  selectedLogo,
                  errorCorrectionLevel,
                  qrMode,
                  selectedType,
                  includeMargin,
                  qrSize
                };
                
                // Check if we're editing an existing QR code
                const isEditing = qrCodeToEdit && qrCodeToEdit.id;
                
                // ============================================================
                // Get base URL and auth token (needed for both PDF upload and STEP 1)
                // ============================================================
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                const token = localStorage.getItem('jwtToken');
                
                // ============================================================
                // PDF UPLOAD: If this is a PDF QR code, upload the file first
                // ============================================================
                if (selectedType === 'pdf' && pdfFile && !pdfFile.uploadedUrl) {
                  console.log('📄 Uploading PDF file:', pdfFile.name);
                  
                  // Read the PDF file as base64
                  const pdfReader = new FileReader();
                  const pdfBase64 = await new Promise((resolve, reject) => {
                    pdfReader.onload = () => resolve(pdfReader.result);
                    pdfReader.onerror = reject;
                    pdfReader.readAsDataURL(pdfFile);
                  });
                  
                  // Upload to backend
                  const uploadResponse = await fetch(`${baseUrl}/api/upload/pdf`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      fileData: pdfBase64,
                      fileName: pdfFile.name
                    })
                  });
                  
                  if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    console.log('✅ PDF uploaded successfully:', uploadResult.url);
                    
                    // Store the uploaded URL on the pdfFile object
                    setPdfFile(prev => {
                      const updated = prev;
                      updated.uploadedUrl = uploadResult.url;
                      return updated;
                    });
                    
                    // Also update the ref directly for immediate use
                    pdfFile.uploadedUrl = uploadResult.url;
                  } else {
                    const uploadError = await uploadResponse.text();
                    console.error('❌ PDF upload failed:', uploadError);
                    alert('Failed to upload PDF file. Please try again.');
                    return;
                  }
                }
                
                // ============================================================
                // STEP 1: Save to the standalone qrcodes collection
                // This is what the EdgeOne function queries for /track/:id
                // ============================================================
                // Get the formatted QR content for the current type
                const qrContent = getQrContent();
                console.log('📡 STEP 1: Saving to standalone qrcodes collection...');
                console.log('   POST /qrcodes');
                console.log('   Body:', JSON.stringify({ id: qrCodeId, data: qrContent }));
                const qrcodesHeaders = {
                  'Content-Type': 'application/json',
                };
                if (token) {
                  qrcodesHeaders['Authorization'] = `Bearer ${token}`;
                }
                const qrcodesResponse = await fetch(`${baseUrl}/qrcodes`, {
                  method: 'POST',
                  headers: qrcodesHeaders,
                  body: JSON.stringify({
                    id: qrCodeId,
                    data: qrContent
                  })
                });

                
                console.log('   Response status:', qrcodesResponse.status, qrcodesResponse.statusText);
                
                if (qrcodesResponse.ok) {
                  const qrcodesResult = await qrcodesResponse.json();
                  console.log('✅ STEP 1 SUCCESS: QR code saved to qrcodes collection:', qrcodesResult);
                } else {
                  const errorText = await qrcodesResponse.text();
                  console.error('⚠️ STEP 1 WARNING: Failed to save to qrcodes collection:', errorText);
                }
                
                // ============================================================
                // STEP 2: Save to user's account (for Dashboard display)
                // ============================================================
                console.log('📡 STEP 2: Saving to user account...');
                const savedQrCode = await saveQrCode(
                  qrContent, 
                  imageData, 
                  framePhrase || `QR Code ${new Date().toLocaleDateString()}`,
                  qrCodeId, // Pass the QR code ID generated by frontend
                  designCharacteristics,
                  selectedType // Pass the QR type (wifi, pdf, email, sms, whatsapp, url)
                );
                console.log('✅ STEP 2 SUCCESS: QR code saved to user account:', savedQrCode);
                
                if (isEditing) {
                  alert(`QR code "${framePhrase || 'Untitled QR Code'}" updated successfully!\n\nThe modified QR code has overwritten the old version in your Dashboard > My QR codes.`);
                } else {
                  alert('QR code saved to your collection! You can find it in Dashboard > My QR codes.');
                }
                
              } catch (error) {
                console.error('Failed to save QR code:', error);
                alert('Failed to save QR code. Please try again.');
              }
            }}
            style={{
              padding: '14px 40px',
              background: 'linear-gradient(135deg, #00FF00 0%, #00D9FF 100%)',
              border: 'none',
              borderRadius: '20px',
              color: '#000',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 0 30px rgba(0, 255, 0, 0.5)',
            }}
          >
            💾 Save to My QR codes
          </button>
        </div>
      </div>
    </div>
  );

  const stickerPicker = showStickerPicker ? (
    <StickerPicker
      onSelectSticker={(sticker) => setSelectedSticker(sticker)}
      onClose={() => setShowStickerPicker(false)}
    />
  ) : null;

  if (embedded) {
    return (
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '60px 20px',
        boxSizing: 'border-box',
      }}>
        <div style={{ width: '100%', maxWidth: '1200px' }}>
          {editorContent}
          {stickerPicker}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
    }}>
      {/* Top Navigation Bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(0, 217, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #00D9FF',
              borderRadius: '8px',
              color: '#00D9FF',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Homepage
          </button>
          <button
            onClick={onGoToDashboard}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #FF00FF',
              borderRadius: '8px',
              color: '#FF00FF',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Dashboard
          </button>
          <button
            onClick={onGoToProfile}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #888',
              borderRadius: '8px',
              color: '#888',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Profile
          </button>
        </div>
      </header>

      {editorContent}
      {stickerPicker}
    </div>
  );
};

export default EditorPage;
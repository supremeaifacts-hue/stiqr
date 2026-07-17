import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import StickerPicker from './StickerPicker';
import { useAuth } from './contexts/AuthContext';
import './EditorPage.css';
import whatsappLogo from './assets/logos/whatsapp.png';
import wechatLogo from './assets/logos/wechat.png';
import instagramLogo from './assets/logos/instagram.png';
import mailLogo from './assets/logos/mail.png';
import wifiLogo from './assets/logos/wifi.png';
import paypalLogo from './assets/logos/paypal.png';
import linkLogo from './assets/logos/link.png';
import tiktokLogo from './assets/logos/tiktok.png';
import bitcoinLogo from './assets/logos/bitcoin.png';
import facebookLogo from './assets/logos/facebook.png';
import xLogo from './assets/logos/x.png';
import youtubeLogo from './assets/logos/youtube.png';
import pinterestLogo from './assets/logos/pinterest.png';
import venmoLogo from './assets/logos/venmo.png';
import redditLogo from './assets/logos/reddit.png';
import githubLogo from './assets/logos/github.png';
import linkedinLogo from './assets/logos/linkedin.png';
import spotifyLogo from './assets/logos/spotify.png';
import messengerLogo from './assets/logos/messenger.png';
import telegramLogo from './assets/logos/telegram.png';

const commonLogos = [
  { id: 'whatsapp', label: 'WhatsApp', src: whatsappLogo },
  { id: 'wechat', label: 'WeChat', src: wechatLogo },
  { id: 'instagram', label: 'Instagram', src: instagramLogo },
  { id: 'facebook', label: 'Facebook', src: facebookLogo },
  { id: 'x', label: 'X', src: xLogo },
  { id: 'youtube', label: 'YouTube', src: youtubeLogo },
  { id: 'pinterest', label: 'Pinterest', src: pinterestLogo },
  { id: 'venmo', label: 'Venmo', src: venmoLogo },
  { id: 'reddit', label: 'Reddit', src: redditLogo },
  { id: 'github', label: 'GitHub', src: githubLogo },
  { id: 'linkedin', label: 'LinkedIn', src: linkedinLogo },
  { id: 'spotify', label: 'Spotify', src: spotifyLogo },
  { id: 'messenger', label: 'Messenger', src: messengerLogo },
  { id: 'mail', label: 'Mail', src: mailLogo },
  { id: 'wifi', label: 'Wi-Fi', src: wifiLogo },
  { id: 'paypal', label: 'PayPal', src: paypalLogo },
  { id: 'link', label: 'Link', src: linkLogo },
  { id: 'tiktok', label: 'TikTok', src: tiktokLogo },
  { id: 'bitcoin', label: 'Bitcoin', src: bitcoinLogo },
  { id: 'telegram', label: 'Telegram', src: telegramLogo },
];

const getLogoForHandle = (handle) => {
  if (!handle) return linkLogo;
  const normalized = handle.toLowerCase();
  const match = commonLogos.find(item => item.id === normalized || item.label.toLowerCase() === normalized);
  return match ? match.src : linkLogo;
};

const getSocialPageIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    return segments.length ? segments[segments.length - 1] : null;
  } catch {
    const marker = '/social/';
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return url.substring(index + marker.length).split(/[/?#]/)[0] || null;
  }
};

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
    }
    
    // Use VITE_BACKEND_URL if available (configured in EdgeOne Pages env vars)
    const backendUrl = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_BACKEND_URL;
    if (backendUrl) {
      return `${backendUrl}/track/${effectiveId}`;
    }
    
    // Fallback: use the current hostname (EdgeOne function will proxy to backend)
    const protocol = window.location.protocol;
    return `${protocol}//${hostname}/track/${effectiveId}`;
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
  
  // ============================================================
  // Scroll-following QR preview: smoothly move the QR preview
  // up and down within the column as the user scrolls.
  // Uses a containerRef and contentRef to keep the content clipped
  // inside the sticky `.editor-right` container. Disabled on mobile.
  // ============================================================
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    console.log('Scroll useEffect mounted');
    console.log('isMobile:', isMobile);

    if (isMobile) return; // no scroll-follow on small screens

    const handleScroll = () => {
      console.log('🔄 Scroll handler is running!');
      if (!containerRef.current || !contentRef.current) return;

      const container = containerRef.current;
      const content = contentRef.current;
      const rect = container.getBoundingClientRect();

      const containerHeight = container.offsetHeight;
      const contentHeight = content.scrollHeight;
      const maxTranslate = Math.max(0, containerHeight - contentHeight);

      const viewportHeight = window.innerHeight;
      const start = 0;
      const end = viewportHeight - containerHeight;
      const adjustedEnd = Math.max(end, 0);

      let progress = 0;
      if (adjustedEnd !== start) {
        progress = (rect.top - start) / (adjustedEnd - start);
        progress = Math.max(0, Math.min(1, progress));
      }

      console.log('scroll debug:', { top: rect.top, containerHeight, contentHeight, maxTranslate, viewportHeight, progress, adjustedEnd });

      const translateY = progress * maxTranslate;
      content.style.transform = `translateY(${translateY}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    console.log('Scroll listeners attached');
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isMobile]);
  
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
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Social Media QR Code state
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [socialPageColor, setSocialPageColor] = useState('#e5e9ec');
  const [socialHeadline, setSocialHeadline] = useState('Follow me on these Social Media');
  const [socialProfiles, setSocialProfiles] = useState([
    { id: 'fb', platform: 'Facebook', url: '', logo: facebookLogo, handle: 'facebook' },
    { id: 'ig', platform: 'Instagram', url: '', logo: instagramLogo, handle: 'instagram' },
    { id: 'x', platform: 'X', url: '', logo: xLogo, handle: 'x' },
    { id: 'tg', platform: 'Telegram', url: '', logo: telegramLogo, handle: 'telegram' }
  ]);
  // Use a ref to always have access to the latest socialProfiles (avoids stale closures)
  const socialProfilesRef = useRef(socialProfiles);
  useEffect(() => {
    socialProfilesRef.current = socialProfiles;
  }, [socialProfiles]);
  const [customColorInput, setCustomColorInput] = useState('#e5e9ec');
  const customColorInputRef = useRef(null);
  const [socialPageId, setSocialPageId] = useState(null);
  const [socialConfigSaved, setSocialConfigSaved] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);

  // Event QR Code state
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventPageColor, setEventPageColor] = useState('#e5e9ec');
  const [eventCustomColorInput, setEventCustomColorInput] = useState('#e5e9ec');
  const eventCustomColorInputRef = useRef(null);
  const [eventData, setEventData] = useState({
    title: 'Amelia & James',
    summary: 'Amelia and James are finally getting married',
    about: 'Come and join us in celebrating our wedding with our family and friends',
    image: null,
    imagePreview: null,
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: '',
    timeFrom: '15:00',
    timeTo: '23:00',
    services: {
      wifi: true,
      bathroom: true,
      handicapped: false,
      babies: false,
      dogs: false,
      parking: true,
      food: false,
    },
    street: "Villa D'Este, Via Regina 40",
    city: 'Cernobbio',
    state: 'Italy',
    zip: '',
    country: '',
    contactName: "Villa d'Este",
    contactPhone: '+39 031 3481',
    contactEmail: 'weddings@villadeste.com',
    contactWebsite: 'www.villadeste.com',
  });

  const [savingEvent, setSavingEvent] = useState(false);
  const [eventPageId, setEventPageId] = useState(null);
  const [eventConfigSaved, setEventConfigSaved] = useState(false);
  const eventImageInputRef = useRef(null);

  // Menu QR Code state
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuPageColor, setMenuPageColor] = useState('#e5e9ec');
  const [menuCustomColorInput, setMenuCustomColorInput] = useState('#e5e9ec');
  const menuCustomColorInputRef = useRef(null);
  const [menuData, setMenuData] = useState({
    title: 'Bistro Elegant',
    summary: 'Discover our delicious selection',
    about: '',
    image: null,
    imagePreview: null,
    pdfFile: null,
    pdfFileName: '',
    businessHours: {
      monday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
      tuesday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
      wednesday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
      thursday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
      friday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
      saturday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
      sunday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
    },
    services: {
      wifi: true,
      bathroom: true,
      handicapped: false,
      babies: false,
      dogs: false,
      parking: true,
      food: true,
    },
    street: '123 Gourmet Street',
    city: 'New York',
    state: '',
    zip: '45321',
    country: '',
    contactName: 'Bistro Elegant',
    contactPhone: '111-324 4567',
    contactEmail: 'bistro@elegant.com',
    contactWebsite: '',
  });

  const [savingMenu, setSavingMenu] = useState(false);
  const [menuPageId, setMenuPageId] = useState(null);
  const [menuConfigSaved, setMenuConfigSaved] = useState(false);
  const menuImageInputRef = useRef(null);
  const menuPdfInputRef = useRef(null);


  // Open social modal (separate handler for easier debugging)
  const openSocialModal = () => {
    console.log('Opening Social Media modal');
    setShowSocialModal(true);
  };

  // Open menu modal
  const openMenuModal = () => {
    console.log('Opening Menu modal');
    // Pre-load the restaurant image
    const img = new Image();
    img.onload = () => {
      setMenuData(prev => ({
        ...prev,
        imagePreview: '/assets/restaurant.png',
      }));
    };
    img.onerror = () => {
      console.log('Restaurant image not found, using default gradient');
    };
    img.src = '/assets/restaurant.png';
    setShowMenuModal(true);
  };

  // Get the menu landing page URL
  const getMenuLandingUrl = (pageId) => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return `http://localhost:3000/menu/${pageId}`;
    } else {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}/menu/${pageId}`;
    }
  };

  // Handle saving menu configuration
  const handleSaveMenuConfig = async () => {
    // Validate required fields
    if (!menuData.title.trim()) {
      alert('Please enter a menu title.');
      return;
    }

    setSavingMenu(true);

    try {
      const newMenuPageId = menuPageId || generateId();

      // Build the menu data payload
      const menuPayload = {
        id: newMenuPageId,
        title: menuData.title,
        summary: menuData.summary,
        about: menuData.about,
        image: menuData.imagePreview,
        pdfFile: menuData.pdfFile,
        pdfFileName: menuData.pdfFileName,
        businessHours: menuData.businessHours,
        services: menuData.services,
        address: {
          street: menuData.street,
          city: menuData.city,
          state: menuData.state,
          zip: menuData.zip,
          country: menuData.country,
        },
        contact: {
          name: menuData.contactName,
          phone: menuData.contactPhone,
          email: menuData.contactEmail,
          website: menuData.contactWebsite,
        },
        pageColor: menuPageColor,
      };

      // Save to backend
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🔍 Saving menu page:', JSON.stringify(menuPayload));

      const response = await fetch(`${baseUrl}/api/menu-pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(menuPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save menu page:', errorText);
        throw new Error('Failed to save menu configuration');
      }

      const result = await response.json();
      console.log('✅ Menu page saved:', result);

      // Store the menu page ID
      setMenuPageId(newMenuPageId);
      setMenuConfigSaved(true);

      // Generate the menu landing page URL and set it as the QR data
      const menuUrl = getMenuLandingUrl(newMenuPageId);
      setQrData(menuUrl);
      
      // Close the modal
      setShowMenuModal(false);

      // Show success message
      alert(`✅ Menu page created successfully!\n\nYour landing page URL: ${menuUrl}\n\nThe QR code will now encode this URL. You can customize the QR code design (frames, colors, logos) and then save it to your collection.`);

    } catch (error) {
      console.error('Error saving menu configuration:', error);
      alert('Failed to save menu configuration. Please try again.');
    } finally {
      setSavingMenu(false);
    }
  };

  // Open event modal
  const openEventModal = () => {
    console.log('Opening Event modal');
    // Pre-load the wedding image
    const img = new Image();
    img.onload = () => {
      setEventData(prev => ({
        ...prev,
        imagePreview: '/assets/wedding.png',
      }));
    };
    img.onerror = () => {
      console.log('Wedding image not found, using default gradient');
    };
    img.src = '/assets/wedding.png';
    setShowEventModal(true);
  };

  // Get the event landing page URL
  const getEventLandingUrl = (pageId) => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return `http://localhost:3000/event/${pageId}`;
    } else {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}/event/${pageId}`;
    }
  };

  // Handle saving event configuration
  const handleSaveEventConfig = async () => {
    // Validate required fields
    if (!eventData.title.trim()) {
      alert('Please enter an event title.');
      return;
    }

    setSavingEvent(true);

    try {
      const newEventPageId = eventPageId || generateId();

      // Build the event data payload
      const eventPayload = {
        id: newEventPageId,
        title: eventData.title,
        summary: eventData.summary,
        about: eventData.about,
        image: eventData.imagePreview,
        dateFrom: eventData.dateFrom,
        dateTo: eventData.dateTo,
        services: eventData.services,
        address: {
          street: eventData.street,
          city: eventData.city,
          state: eventData.state,
          zip: eventData.zip,
          country: eventData.country,
        },
        contact: {
          name: eventData.contactName,
          phone: eventData.contactPhone,
          email: eventData.contactEmail,
          website: eventData.contactWebsite,
        },
        pageColor: eventPageColor,
      };

      // Save to backend
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🔍 Saving event page:', JSON.stringify(eventPayload));

      const response = await fetch(`${baseUrl}/api/event-pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(eventPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save event page:', errorText);
        throw new Error('Failed to save event configuration');
      }

      const result = await response.json();
      console.log('✅ Event page saved:', result);

      // Store the event page ID
      setEventPageId(newEventPageId);
      setEventConfigSaved(true);

      // Generate the event landing page URL and set it as the QR data
      const eventUrl = getEventLandingUrl(newEventPageId);
      setQrData(eventUrl);
      
      // Close the modal
      setShowEventModal(false);

      // Show success message
      alert(`✅ Event page created successfully!\n\nYour landing page URL: ${eventUrl}\n\nThe QR code will now encode this URL. You can customize the QR code design (frames, colors, logos) and then save it to your collection.`);

    } catch (error) {
      console.error('Error saving event configuration:', error);
      alert('Failed to save event configuration. Please try again.');
    } finally {
      setSavingEvent(false);
    }
  };


  // Handle PDF file selection - upload immediately to MongoDB
  const handlePdfFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Store the file object immediately so the UI shows it
    setPdfFile(file);
    setIsUploadingPdf(true);
    setPdfUploaded(false);
    setUploadProgress(0);

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const token = localStorage.getItem('jwtToken');

      const formData = new FormData();
      formData.append('pdfFile', file);
      formData.append('qrCodeId', qrCodeId);

      setUploadProgress(50);

      const uploadResponse = await fetch(`${baseUrl}/api/upload/pdf`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text();
        console.error('❌ PDF upload failed:', uploadError);
        alert('Failed to upload PDF file. Please try again.');
        setIsUploadingPdf(false);
        setPdfFile(null);
        return;
      }

      const result = await uploadResponse.json();
      console.log('✅ PDF upload response:', result);

      // If we get a jobId, poll for completion
      if (result.jobId) {
        console.log('🔄 Polling PDF job:', result.jobId);
        
        // Poll for job completion
        let pollAttempts = 0;
        const maxPollAttempts = 30; // 30 seconds max
        const pollInterval = 1000; // 1 second
        
        const pollJob = async () => {
          while (pollAttempts < maxPollAttempts) {
            pollAttempts++;
            try {
              const jobResponse = await fetch(`${baseUrl}/api/pdf/job/${result.jobId}`);
              if (jobResponse.ok) {
                const jobData = await jobResponse.json();
                console.log(`📊 Job status (attempt ${pollAttempts}):`, jobData.status);
                
                if (jobData.status === 'completed') {
                  console.log('✅ PDF job completed:', jobData.fileUrl);
                  file.uploadedUrl = jobData.fileUrl;
                  setPdfFile(prev => {
                    const updated = { ...prev };
                    updated.uploadedUrl = jobData.fileUrl;
                    return updated;
                  });
                  setPdfUploaded(true);
                  setUploadProgress(100);
                  return;
                } else if (jobData.status === 'failed') {
                  console.error('❌ PDF job failed:', jobData.error);
                  alert('PDF processing failed: ' + (jobData.error || 'Unknown error'));
                  setPdfFile(null);
                  return;
                }
              }
            } catch (pollErr) {
              console.error('⚠️ Poll error:', pollErr);
            }
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollInterval));
          }
          // If we get here, polling timed out - fall back to direct response
          console.warn('⚠️ PDF job polling timed out, using direct response');
          if (result.fileUrl) {
            file.uploadedUrl = result.fileUrl;
            setPdfFile(prev => {
              const updated = { ...prev };
              updated.uploadedUrl = result.fileUrl;
              return updated;
            });
            setPdfUploaded(true);
            setUploadProgress(100);
          } else {
            alert('PDF upload timed out. Please try again.');
            setPdfFile(null);
          }
        };
        
        pollJob();
      } else {
        // Direct response (no jobId) - use fileUrl directly
        console.log('✅ PDF saved directly to MongoDB:', result.pdfId, result.fileUrl);
        file.uploadedUrl = result.fileUrl;
        setPdfFile(prev => {
          const updated = { ...prev };
          updated.uploadedUrl = result.fileUrl;
          return updated;
        });
        setPdfUploaded(true);
        setUploadProgress(100);
      }

    } catch (error) {
      console.error('PDF upload error:', error);
      alert('PDF upload failed. Please try again.');
      setPdfFile(null);
    } finally {
      setIsUploadingPdf(false);
    }
  };


  // Get the social landing page URL
  const getSocialLandingUrl = (pageId) => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return `http://localhost:3000/social/${pageId}`;
    } else {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}/social/${pageId}`;
    }
  };

  // Handle saving social media configuration
  const handleSaveSocialConfig = async () => {
    // Use the ref to get the latest socialProfiles (avoids stale closures)
    const currentProfiles = socialProfilesRef.current;
    
    // Validate that at least one profile has a URL
    const validProfiles = currentProfiles.filter(p => p.url && p.url.trim().length > 0);
    if (validProfiles.length === 0) {
      alert('Please add at least one social media profile with a URL.');
      return;
    }

    setSavingSocial(true);

    try {
      // Reuse an existing social page ID when editing an existing Social Media QR code
      const existingSocialPageId = socialPageId || getSocialPageIdFromUrl(qrData);
      const newSocialPageId = existingSocialPageId || generateId();
      
      // Platform color map (matches backend getPlatformColor)
      const platformColorMap = {
        'facebook': '#1877F2',
        'instagram': '#E4405F',
        'youtube': '#FF0000',
        'tiktok': '#000000',
        'x': '#000000',
        'twitter': '#1DA1F2',
        'linkedin': '#0077B5',
        'whatsapp': '#25D366',
        'telegram': '#26A5E4',
        'messenger': '#00B2FF',
        'snapchat': '#FFFC00',
        'pinterest': '#E60023',
        'reddit': '#FF4500',
        'github': '#333333',
        'spotify': '#1DB954',
        'venmo': '#008CFF',
        'wechat': '#07C160',
        'paypal': '#00457C',
        'bitcoin': '#F7931A',
        'link': '#00D9FF',
        'generic': '#555'
      };

      // Prepare buttons array for the backend with color, logo, and all metadata
      const buttons = validProfiles.map(p => {
        const handle = p.handle || p.platform.toLowerCase();
        // Normalize URL: ensure it has a protocol (add https:// if missing)
        let normalizedUrl = p.url.trim();
        if (normalizedUrl && !normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
          normalizedUrl = 'https://' + normalizedUrl;
        }
        return {
          platform: handle,
          url: normalizedUrl,
          label: p.platform,
          color: platformColorMap[handle] || '#555',
          logo: p.logo || null
        };
      });

      // DEBUG: Log what we're about to send
      console.log('🔍 DEBUG handleSaveSocialConfig:');
      console.log('   socialProfiles state:', JSON.stringify(socialProfiles));
      console.log('   validProfiles:', JSON.stringify(validProfiles));
      console.log('   buttons to send:', JSON.stringify(buttons));
      console.log('   socialHeadline:', socialHeadline);
      console.log('   socialPageColor:', socialPageColor);

      // Build design object from modal state
      const design = {
        backgroundColor: socialPageColor,
        buttonStyle: 'rounded',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      };

      // Save to backend
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const requestBody = JSON.stringify({
        id: newSocialPageId,
        buttons: buttons,
        title: socialHeadline || 'My Social Links',
        pageColor: socialPageColor,
        headline: socialHeadline,
        design: design
      });
      console.log('🔍 DEBUG request body:', requestBody);

      const response = await fetch(`${baseUrl}/api/social-pages`, {
        method: 'POST',
        headers,
        body: requestBody
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save social page:', errorText);
        throw new Error('Failed to save social media configuration');
      }

      const result = await response.json();
      console.log('✅ Social page saved:', result);

      // Store the social page ID
      setSocialPageId(newSocialPageId);
      setSocialConfigSaved(true);

      // Generate the social landing page URL and set it as the QR data
      const socialUrl = getSocialLandingUrl(newSocialPageId);
      setQrData(socialUrl);
      
      // Close the modal
      setShowSocialModal(false);

      // Show success message
      alert(`✅ Social Media page created successfully!\n\nYour landing page URL: ${socialUrl}\n\nThe QR code will now encode this URL. You can customize the QR code design (frames, colors, logos) and then save it to your collection.`);

    } catch (error) {
      console.error('Error saving social configuration:', error);
      alert('Failed to save social media configuration. Please try again.');
    } finally {
      setSavingSocial(false);
    }
  };
  
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

      const socialUrl = qrCodeToEdit.data || qrCodeToEdit.destination || '';
      if (socialUrl.includes('/social/')) {
        const pageId = getSocialPageIdFromUrl(socialUrl);
        if (pageId) {
          setSocialPageId(pageId);
          setSelectedType('social');

          const loadSocialPage = async () => {
            try {
              const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
              const response = await fetch(`${baseUrl}/api/social-pages/${pageId}`);
              if (!response.ok) {
                throw new Error(`Unable to load social page ${pageId}`);
              }
              const page = await response.json();
              setSocialPageColor(page.pageColor || '#e5e9ec');
              setSocialHeadline(page.headline || page.title || 'Follow me on these Social Media');
              setSocialConfigSaved(true);

              const matchedProfiles = socialProfilesRef.current.map(profile => {
                const buttonMatch = (page.buttons || []).find(btn => {
                  const handle = String(btn.platform || btn.label || '').toLowerCase();
                  return handle === profile.handle?.toLowerCase() || handle === profile.platform.toLowerCase();
                });
                return {
                  ...profile,
                  url: buttonMatch?.url || profile.url,
                };
              });

              const extraProfiles = (page.buttons || [])
                .filter(btn => !matchedProfiles.some(profile => profile.handle?.toLowerCase() === String(btn.platform || btn.label || '').toLowerCase()))
                .map(btn => {
                  const handle = String(btn.platform || btn.label || 'link').toLowerCase();
                  return {
                    id: handle,
                    platform: btn.label || btn.platform || 'Link',
                    logo: getLogoForHandle(handle),
                    handle,
                    url: btn.url || '',
                  };
                });

              setSocialProfiles([...matchedProfiles, ...extraProfiles]);

              if (qrCodeToEdit.openSocialModal) {
                setShowSocialModal(true);
              }
            } catch (error) {
              console.error('Failed to load social page config:', error);
            }
          };
          loadSocialPage();
        }
      }
      
      // Handle Event QR code editing
      const eventUrl = qrCodeToEdit.data || qrCodeToEdit.destination || '';
      if (eventUrl.includes('/event/')) {
        setSelectedType('event');
        // Extract event page ID from URL
        const eventPageIdMatch = eventUrl.match(/\/event\/([^\/?#]+)/);
        const eventPageId = eventPageIdMatch ? eventPageIdMatch[1] : null;
        if (eventPageId) {
          // Fetch the event page data from backend to restore image and all fields
          const loadEventPage = async () => {
            try {
              const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
              const response = await fetch(`${baseUrl}/api/event-pages/${eventPageId}`);
              if (response.ok) {
                const page = await response.json();
                setEventPageColor(page.pageColor || '#e5e9ec');
                setEventCustomColorInput(page.pageColor || '#e5e9ec');
                setEventData({
                  title: page.title || '',
                  summary: page.summary || '',
                  about: page.about || '',
                  image: page.image || null,
                  imagePreview: page.image || null,
                  dateFrom: page.dateFrom || new Date().toISOString().split('T')[0],
                  dateTo: page.dateTo || '',
                  timeFrom: page.timeFrom || '',
                  timeTo: page.timeTo || '',
                  services: page.services || {
                    wifi: false, bathroom: false, handicapped: false,
                    babies: false, dogs: false, parking: false, food: false
                  },
                  street: page.address?.street || '',
                  city: page.address?.city || '',
                  state: page.address?.state || '',
                  zip: page.address?.zip || '',
                  country: page.address?.country || '',
                  contactName: page.contact?.name || '',
                  contactPhone: page.contact?.phone || '',
                  contactEmail: page.contact?.email || '',
                  contactWebsite: page.contact?.website || '',
                });
                setEventPageId(eventPageId);
                setEventConfigSaved(true);
              }
            } catch (error) {
              console.error('Failed to load event page data:', error);
            }
          };
          loadEventPage();
        }
        if (qrCodeToEdit.openEventModal) {
          setShowEventModal(true);
        }
      }
      
      // Handle Menu QR code editing
      const menuUrl = qrCodeToEdit.data || qrCodeToEdit.destination || '';
      if (menuUrl.includes('/menu/')) {
        setSelectedType('menu');
        // Extract menu page ID from URL
        const menuPageIdMatch = menuUrl.match(/\/menu\/([^\/?#]+)/);
        const menuPageId = menuPageIdMatch ? menuPageIdMatch[1] : null;
        if (menuPageId) {
          // Fetch the menu page data from backend to restore image and all fields
          const loadMenuPage = async () => {
            try {
              const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
              const response = await fetch(`${baseUrl}/api/menu-pages/${menuPageId}`);
              if (response.ok) {
                const page = await response.json();
                setMenuPageColor(page.pageColor || '#e5e9ec');
                setMenuCustomColorInput(page.pageColor || '#e5e9ec');
                setMenuData({
                  title: page.title || '',
                  summary: page.summary || '',
                  about: page.about || '',
                  image: page.image || null,
                  imagePreview: page.image || null,
                  pdfFile: page.pdfFile || null,
                  pdfFileName: page.pdfFileName || '',
                  businessHours: page.businessHours || {
                    monday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
                    tuesday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
                    wednesday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
                    thursday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
                    friday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
                    saturday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
                    sunday: { morningOpen: '', morningClose: '', eveningOpen: '', eveningClose: '', closed: false },
                  },
                  services: page.services || {
                    wifi: false, bathroom: false, handicapped: false,
                    babies: false, dogs: false, parking: false, food: false
                  },
                  street: page.address?.street || '',
                  city: page.address?.city || '',
                  state: page.address?.state || '',
                  zip: page.address?.zip || '',
                  country: page.address?.country || '',
                  contactName: page.contact?.name || '',
                  contactPhone: page.contact?.phone || '',
                  contactEmail: page.contact?.email || '',
                  contactWebsite: page.contact?.website || '',
                });
                setMenuPageId(menuPageId);
                setMenuConfigSaved(true);
              }
            } catch (error) {
              console.error('Failed to load menu page data:', error);
            }
          };
          loadMenuPage();
        }
        if (qrCodeToEdit.openMenuModal) {
          setShowMenuModal(true);
        }
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
    { id: 'menu', label: 'Menu' },
  ];

  // Social Media platforms for "Add more links" feature
  const socialMediaPlatforms = [
    { id: 'facebook', name: 'Facebook', logo: facebookLogo, handle: 'facebook' },
    { id: 'instagram', name: 'Instagram', logo: instagramLogo, handle: 'instagram' },
    { id: 'x', name: 'X', logo: xLogo, handle: 'x' },
    { id: 'youtube', name: 'YouTube', logo: youtubeLogo, handle: 'youtube' },
    { id: 'pinterest', name: 'Pinterest', logo: pinterestLogo, handle: 'pinterest' },
    { id: 'tiktok', name: 'TikTok', logo: tiktokLogo, handle: 'tiktok' },
    { id: 'venmo', name: 'Venmo', logo: venmoLogo, handle: 'venmo' },
    { id: 'reddit', name: 'Reddit', logo: redditLogo, handle: 'reddit' },
    { id: 'telegram', name: 'Telegram', logo: telegramLogo, handle: 'telegram' },
    { id: 'github', name: 'GitHub', logo: githubLogo, handle: 'github' },
    { id: 'linkedin', name: 'LinkedIn', logo: linkedinLogo, handle: 'linkedin' },
    { id: 'spotify', name: 'Spotify', logo: spotifyLogo, handle: 'spotify' },
    { id: 'messenger', name: 'Messenger', logo: messengerLogo, handle: 'messenger' },
    { id: 'whatsapp', name: 'WhatsApp', logo: whatsappLogo, handle: 'whatsapp' },
    { id: 'wechat', name: 'WeChat', logo: wechatLogo, handle: 'wechat' },
    { id: 'generic', name: 'Generic Link', logo: linkLogo, handle: 'link' },
  ];

  // Helper function to handle social profile updates
  const updateSocialProfile = (id, field, value) => {
    setSocialProfiles(prev =>
      prev.map(profile =>
        profile.id === id ? { ...profile, [field]: value } : profile
      )
    );
  };

  // Helper function to add a new social profile
  const addSocialProfile = (platform) => {
    const newId = 'social_' + Date.now();
    setSocialProfiles(prev => [...prev, {
      id: newId,
      platform: platform.name,
      url: '',
      logo: platform.logo,
      handle: platform.handle
    }]);
    setShowPlatformPicker(false);
  };

  // Helper function to remove a social profile
  const removeSocialProfile = (id) => {
    setSocialProfiles(prev => prev.filter(profile => profile.id !== id));
  };

  // Helper function to move profile up
  const moveSocialProfileUp = (id) => {
    setSocialProfiles(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index > 0) {
        const newArray = [...prev];
        [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
        return newArray;
      }
      return prev;
    });
  };

  // Helper function to move profile down
  const moveSocialProfileDown = (id) => {
    setSocialProfiles(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index < prev.length - 1) {
        const newArray = [...prev];
        [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
        return newArray;
      }
      return prev;
    });
  };

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
                  // Calculate QR code area dimensions based on frame type
                  let qrAreaSize, qrAreaX, qrAreaY;
                  if (selectedFrame === 'frame1') {
                    qrAreaSize = 240;
                    qrAreaX = 15;
                    qrAreaY = 15;
                  } else if (selectedFrame === 'frame2') {
                    qrAreaSize = 230;
                    qrAreaX = 20;
                    qrAreaY = 10;
                  } else {
                    qrAreaSize = qrSize - 60;
                    qrAreaX = 0;
                    qrAreaY = 0;
                  }
                  // Center sticker within the QR code area
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
        // Calculate QR code area dimensions based on frame type
        let qrAreaSize, qrAreaX, qrAreaY;
        if (selectedFrame === 'frame1') {
          qrAreaSize = 240;
          qrAreaX = 15;
          qrAreaY = 15;
        } else if (selectedFrame === 'frame2') {
          qrAreaSize = 230;
          qrAreaX = 20;
          qrAreaY = 10;
        } else {
          qrAreaSize = qrSize - 60;
          qrAreaX = 0;
          qrAreaY = 0;
        }
        // Center logo within the QR code area
        const x = qrAreaX + (qrAreaSize - logoSize) / 2;
        const y = qrAreaY + (qrAreaSize - logoSize) / 2;
        
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
    <div className="editor-content">
      {/* Left Sidebar */}
      <div className="editor-left">
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
                  {type.id === 'menu' && '🍽️'}
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
                    onChange={handlePdfFileSelect}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="pdf-upload"
                    style={{
                      padding: '14px',
                      background: isUploadingPdf ? 'rgba(0, 217, 255, 0.05)' : 'rgba(0, 217, 255, 0.1)',
                      border: isUploadingPdf ? '2px dashed rgba(0, 217, 255, 0.15)' : '2px dashed rgba(0, 217, 255, 0.3)',
                      borderRadius: '8px',
                      color: isUploadingPdf ? '#666' : '#00D9FF',
                      cursor: isUploadingPdf ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      textAlign: 'center',
                      display: 'block',
                    }}
                  >
                    {isUploadingPdf ? '⏳ Uploading...' : '📁 Upload PDF File'}
                  </label>
                  
                  {/* Upload progress bar */}
                  {isUploadingPdf && (
                    <div style={{
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      borderRadius: '8px',
                    }}>
                      <div style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '600', marginBottom: '6px', textAlign: 'center' }}>
                        Uploading PDF... {uploadProgress}%
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(0, 217, 255, 0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${uploadProgress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #00D9FF, #FF00FF)',
                          borderRadius: '3px',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  )}
                  
                  {/* Upload success indicator */}
                  {!isUploadingPdf && pdfUploaded && pdfFile && (
                    <div style={{
                      padding: '10px',
                      background: 'rgba(0, 255, 100, 0.1)',
                      border: '1px solid rgba(0, 255, 100, 0.3)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#00ff64',
                      textAlign: 'center',
                      fontWeight: '600',
                    }}>
                      ✅ PDF uploaded: {pdfFile.name}
                    </div>
                  )}
                  
                  {/* Show selected file name when not yet uploaded */}
                  {!isUploadingPdf && !pdfUploaded && pdfFile && (
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
              ) : selectedType === 'social' || selectedType === 'event' || selectedType === 'menu' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={selectedType === 'social' ? openSocialModal : selectedType === 'event' ? openEventModal : openMenuModal}
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
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      paddingBottom: '8px',
                      scrollSnapType: 'x mandatory',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#00D9FF rgba(0, 217, 255, 0.1)',
                    }}
                      className="frame-styles-scroll"
                    >
                      <style>{`
                        .frame-styles-scroll::-webkit-scrollbar {
                          height: 4px;
                        }
                        .frame-styles-scroll::-webkit-scrollbar-track {
                          background: rgba(0, 217, 255, 0.1);
                          border-radius: 2px;
                        }
                        .frame-styles-scroll::-webkit-scrollbar-thumb {
                          background: #00D9FF;
                          border-radius: 2px;
                        }
                      `}</style>
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
                            flex: '0 0 auto',
                            width: '120px',
                            background: selectedFrame === frame.id ? 'rgba(0, 217, 255, 0.15)' : 'rgba(0, 217, 255, 0.05)',
                            border: selectedFrame === frame.id ? '2px solid #00D9FF' : '2px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            padding: '10px',
                            height: '120px',
                            scrollSnapAlign: 'start',
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
                        {commonLogos.map((logo) => (
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

      {/* NEW: QR Preview Column (this is the container) */}
      <div
        ref={containerRef}
        className="editor-right"
      >
        {/* QR Preview Box (moves up and down with scroll on desktop, fixed on mobile) */}
        <div
          ref={contentRef}
          className="qr-preview-scroll"
        >
          <div className="qr-preview-card">
            <canvas ref={canvasRef} className="qr-canvas" style={{ 
              width: selectedFrame === 'frame1' ? '270px' : 'auto',
              height: selectedFrame === 'frame1' ? '300px' : 'auto',
            }} />
          </div>

          <div className="editor-actions">
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
                  let imageData;
                  const finalCanvas = document.createElement('canvas');
                  const trackingUrl = getTrackingUrl(qrCodeIdRef.current);
                  
                  if (selectedFrame === 'frame1' || selectedFrame === 'frame2') {
                    finalCanvas.width = 270;
                    finalCanvas.height = 300;
                  } else {
                    finalCanvas.width = qrSize;
                    finalCanvas.height = qrSize * 2 + 250;
                  }
                  
                  if (selectedFrame !== 'frame1' && selectedFrame !== 'frame2') {
                    await new Promise((resolve, reject) => {
                      QRCode.toCanvas(
                        finalCanvas,
                        trackingUrl,
                        {
                          width: qrSize - 60,
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
                  }
                  
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
                        QRCode.toCanvas(tempCanvas, trackingUrl, { width: 240, margin: includeMargin ? 2 : 0, color: { dark: qrColor, light: bgColor }, errorCorrectionLevel: errorCorrectionLevel }, (error) => { if (error) reject(error); else resolve(); });
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
                        QRCode.toCanvas(tempCanvas, trackingUrl, { width: 230, margin: includeMargin ? 2 : 0, color: { dark: qrColor, light: bgColor }, errorCorrectionLevel: errorCorrectionLevel }, (error) => { if (error) reject(error); else resolve(); });
                      });
                      ctx.drawImage(tempCanvas, 20, 10);
                      ctx.restore();
                    }
                  }
                  
                  if (selectedSticker) {
                    const stickerSize = qrSize * 0.2;
                    let qrAreaSize, qrAreaX, qrAreaY;
                    if (selectedFrame === 'frame1') { qrAreaSize = 240; qrAreaX = 15; qrAreaY = 15; }
                    else if (selectedFrame === 'frame2') { qrAreaSize = 230; qrAreaX = 20; qrAreaY = 10; }
                    else { qrAreaSize = qrSize - 60; qrAreaX = 0; qrAreaY = 0; }
                    const x = qrAreaX + (qrAreaSize - stickerSize) / 2;
                    const y = qrAreaY + (qrAreaSize - stickerSize) / 2;
                    const padding = 6;
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
                    const stickerX = x;
                    const stickerY = y;
                    if (selectedSticker.startsWith('data:')) {
                      const img = new Image();
                      await new Promise((resolve, reject) => {
                        img.onload = () => { ctx.drawImage(img, stickerX, stickerY, stickerSize, stickerSize); resolve(); };
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
                  
                  if (selectedLogo) {
                    const logoSize = 50;
                    let qrAreaSize, qrAreaX, qrAreaY;
                    if (selectedFrame === 'frame1') { qrAreaSize = 240; qrAreaX = 15; qrAreaY = 15; }
                    else if (selectedFrame === 'frame2') { qrAreaSize = 230; qrAreaX = 20; qrAreaY = 10; }
                    else { qrAreaSize = qrSize - 60; qrAreaX = 0; qrAreaY = 0; }
                    const x = qrAreaX + (qrAreaSize - logoSize) / 2;
                    const y = qrAreaY + (qrAreaSize - logoSize) / 2;
                    const img = new Image();
                    await new Promise((resolve, reject) => {
                      img.onload = () => {
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.roundRect(x - 2, y - 2, logoSize + 4, logoSize + 4, 4);
                        ctx.fill();
                        ctx.drawImage(img, x, y, logoSize, logoSize);
                        resolve();
                      };
                      img.onerror = reject;
                      img.src = selectedLogo;
                    });
                  }
                  
                  imageData = finalCanvas.toDataURL('image/png');
                  console.log('📸 Generated final rendered image with tracking URL, frame, sticker, and logo');
                  
                  const designCharacteristics = {
                    qrColor, bgColor, selectedFrame, frameColor, frameFont, framePhrase,
                    selectedSticker, selectedLogo, errorCorrectionLevel, qrMode, selectedType, includeMargin, qrSize
                  };
                  
                  const isEditing = qrCodeToEdit && qrCodeToEdit.id;
                  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                  const token = localStorage.getItem('jwtToken');
                  
                  
                  const qrContent = getQrContent();
                  console.log('📡 STEP 1: Saving to standalone qrcodes collection...');
                  const qrcodesHeaders = { 'Content-Type': 'application/json' };
                  if (token) qrcodesHeaders['Authorization'] = `Bearer ${token}`;
                  const qrcodesResponse = await fetch(`${baseUrl}/qrcodes`, {
                    method: 'POST',
                    headers: qrcodesHeaders,
                    body: JSON.stringify({ id: qrCodeId, data: qrContent, type: selectedType })
                  });
                  if (qrcodesResponse.ok) {
                    const qrcodesResult = await qrcodesResponse.json();
                    console.log('✅ STEP 1 SUCCESS: QR code saved to qrcodes collection:', qrcodesResult);
                  } else {
                    const errorText = await qrcodesResponse.text();
                    console.error('⚠️ STEP 1 WARNING: Failed to save to qrcodes collection:', errorText);
                  }
                  
                  console.log('📡 STEP 2: Saving to user account...');
                  const savedQrCode = await saveQrCode(qrContent, imageData, framePhrase || `QR Code ${new Date().toLocaleDateString()}`, qrCodeId, designCharacteristics, selectedType);
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
                background: 'linear-gradient(135deg, #FF00FF 0%, #FF6600 100%)',
                border: 'none',
                borderRadius: '20px',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 0 30px rgba(255, 0, 255, 0.5)',
              }}
            >
              💾 Save to My QR codes
            </button>
          </div>
        </div>
        {/* Spacer to give the sticky preview room to scroll within the column */}
        <div style={{ height: '600px' }} />
      </div>
    </div>
  );

  const stickerPicker = showStickerPicker ? (
    <StickerPicker
      onSelectSticker={(sticker) => setSelectedSticker(sticker)}
      onClose={() => setShowStickerPicker(false)}
    />
  ) : null;

  const renderSocialModal = (() => {
    if (!showSocialModal) return null;
    return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)',
        }}>
          <div style={{
            position: 'relative',
            background: 'rgba(20, 20, 40, 0.95)',
            border: '2px solid rgba(0, 217, 255, 0.3)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '1100px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'block',
          }}>
            <div className="modal-layout">
              <div className="modal-editor">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#00D9FF', fontSize: '24px', fontWeight: '700' }}>
                  Social Media QR Code
                </h2>
                <button
                  onClick={() => setShowSocialModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ccc',
                    fontSize: '28px',
                    cursor: 'pointer',
                    padding: 0,
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>

              <div>
                <div>
                  <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#fff', fontWeight: '600' }}>
                    Page Color
                  </label>
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa' }}>Choose which color your page should have</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['#e5e9ec', '#edcbc0', '#fff5cd', '#8cd7ff', '#dad0f0', '#305971', '#25501a'].map((color) => (
                        <div
                          key={color}
                          onClick={() => {
                            setSocialPageColor(color);
                            setCustomColorInput(color);
                          }}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: color,
                            border: socialPageColor === color ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: socialPageColor === color ? '0 0 12px rgba(0,0,0,0.5)' : 'none',
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '12px', color: '#ccc', marginBottom: '6px', display: 'block' }}>Choose Custom Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={customColorInput}
                        onChange={(e) => {
                          setCustomColorInput(e.target.value);
                          if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                            setSocialPageColor(e.target.value);
                          }
                        }}
                        placeholder="#RRGGBB"
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(0, 217, 255, 0.05)',
                          border: '1px solid rgba(0, 217, 255, 0.2)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          flex: 1,
                        }}
                      />
                      <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                        <button
                          type="button"
                          onClick={() => customColorInputRef.current?.click()}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '8px',
                            background: customColorInput,
                            border: '2px solid rgba(0, 217, 255, 0.3)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        />
                        <input
                          ref={customColorInputRef}
                          type="color"
                          value={customColorInput}
                          onChange={(e) => {
                            setCustomColorInput(e.target.value);
                            setSocialPageColor(e.target.value);
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            border: 'none',
                            padding: 0,
                            margin: 0,
                            cursor: 'pointer',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#fff', fontWeight: '600' }}>
                    Headline
                  </label>
                  <input
                    type="text"
                    value={socialHeadline}
                    onChange={(e) => setSocialHeadline(e.target.value)}
                    placeholder="Enter headline"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      fontWeight: '600',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#fff', fontWeight: '600' }}>
                    Social Media Profiles
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                  {socialProfiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '12px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '8px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        {typeof profile.logo === 'string' ? (
                          <img src={profile.logo} alt={`${profile.platform} logo`} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '20px' }}>{profile.logo}</span>
                        )}
                        <span style={{ fontSize: '9px', color: '#aaa', textAlign: 'center', maxWidth: '60px', wordBreak: 'break-word' }}>
                          {profile.platform}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={profile.url}
                          onChange={(e) => updateSocialProfile(profile.id, 'url', e.target.value)}
                          placeholder="https://"
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(0, 217, 255, 0.05)',
                            border: '1px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button
                            onClick={() => moveSocialProfileUp(profile.id)}
                            disabled={index === 0}
                            style={{
                              minWidth: '62px',
                              padding: '6px 10px',
                              background: index === 0 ? 'rgba(0, 217, 255, 0.1)' : 'rgba(0, 217, 255, 0.2)',
                              border: '1px solid rgba(0, 217, 255, 0.3)',
                              borderRadius: '4px',
                              color: index === 0 ? '#666' : '#00D9FF',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '10px',
                              fontWeight: '600',
                            }}
                          >
                            Up
                          </button>
                          <button
                            onClick={() => moveSocialProfileDown(profile.id)}
                            disabled={index === socialProfiles.length - 1}
                            style={{
                              minWidth: '62px',
                              padding: '6px 10px',
                              background: index === socialProfiles.length - 1 ? 'rgba(0, 217, 255, 0.1)' : 'rgba(0, 217, 255, 0.2)',
                              border: '1px solid rgba(0, 217, 255, 0.3)',
                              borderRadius: '4px',
                              color: index === socialProfiles.length - 1 ? '#666' : '#00D9FF',
                              cursor: index === socialProfiles.length - 1 ? 'not-allowed' : 'pointer',
                              fontSize: '10px',
                              fontWeight: '600',
                            }}
                          >
                            Down
                          </button>
                          <button
                            onClick={() => removeSocialProfile(profile.id)}
                            style={{
                              minWidth: '62px',
                              padding: '6px 10px',
                              background: 'rgba(255, 0, 0, 0.2)',
                              border: '1px solid rgba(255, 0, 0, 0.3)',
                              borderRadius: '4px',
                              color: '#ff6b6b',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: '600',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline horizontally scrollable platform picker bar */}
                <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#aaa', fontWeight: '600', marginBottom: '8px' }}>
                    Add more links:
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#00D9FF rgba(0, 217, 255, 0.1)',
                    WebkitOverflowScrolling: 'touch',
                    maxWidth: '100%',
                  }}>
                    {socialMediaPlatforms.map((platform) => (
                      <div
                        key={platform.id}
                        onClick={() => addSocialProfile(platform)}
                        style={{
                          flex: '0 0 auto',
                          width: '64px',
                          height: '64px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px',
                          background: 'rgba(0, 217, 255, 0.1)',
                          border: '1px solid rgba(0, 217, 255, 0.3)',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          padding: '4px',
                        }}
                        title={platform.name}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)';
                          e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <img
                          src={platform.logo}
                          alt={platform.name}
                          style={{ width: '22px', height: '22px', display: 'block' }}
                        />
                        <span style={{ fontSize: '8px', color: '#00D9FF', fontWeight: '600', textAlign: 'center', lineHeight: '1.1' }}>
                          {platform.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            </div>
            <div className="modal-preview">
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '280px',
                height: '560px',
                background: 'radial-gradient(ellipse at top, #333, #000)',
                borderRadius: '40px',
                border: '12px solid #1a1a1a',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 0 5px rgba(255,255,255,0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '150px',
                  height: '25px',
                  background: '#000',
                  borderRadius: '0 0 20px 20px',
                  zIndex: 10,
                }}></div>

                <div style={{
                  flex: 1,
                  background: socialPageColor,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  gap: '15px',
                  marginTop: '5px',
                }}>
                  <h3 style={{
                    margin: 0,
                    color: '#000',
                    fontSize: '16px',
                    fontWeight: '700',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  }}>
                    {(socialHeadline.includes('Social Media') ? [socialHeadline.replace('Social Media', '').trim(), 'Social Media'] : [socialHeadline]).map((line, index) => (
                      <span key={index} style={{ display: 'block' }}>{line.trim()}</span>
                    ))}
                  </h3>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    width: '100%',
                  }}>
                    {socialProfiles.filter(p => p.url.trim().length > 0).slice(0, 4).map((profile) => (
                      <div
                        key={profile.id}
                        style={{
                          padding: '10px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                          {typeof profile.logo === 'string' ? (
                            <img src={profile.logo} alt={`${profile.platform} logo`} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: '16px' }}>{profile.logo}</span>
                          )}
                          <span style={{ fontSize: '11px', color: '#000', fontWeight: '600' }}>
                            {profile.platform}
                          </span>
                        </div>
                        <button style={{
                          padding: '4px 10px',
                          background: 'rgba(0, 0, 0, 0.2)',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#000',
                          fontSize: '10px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}>
                          Visit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Save Configuration Button */}
              <button
                onClick={handleSaveSocialConfig}
                disabled={savingSocial}
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  padding: '14px 20px',
                  background: savingSocial ? 'rgba(0, 217, 255, 0.3)' : 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: savingSocial ? '#888' : '#000',
                  fontWeight: '700',
                  cursor: savingSocial ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  boxShadow: savingSocial ? 'none' : '0 0 20px rgba(0, 217, 255, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                {savingSocial ? '⏳ Saving...' : '💾 Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  })();

  const renderEventModal = (() => {
    if (!showEventModal) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
      }}>
        <div style={{
          position: 'relative',
          background: 'rgba(20, 20, 40, 0.95)',
          border: '2px solid rgba(0, 217, 255, 0.3)',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '1100px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'block',
        }}>
          <div className="modal-layout">
            <div className="modal-editor">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#00D9FF', fontSize: '24px', fontWeight: '700' }}>
                Event QR Code
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ccc',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: 0,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            <div>
              {/* Page Color */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#fff', fontWeight: '600' }}>
                  Page Color
                </label>
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa' }}>Choose which color your page should have</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['#e5e9ec', '#edcbc0', '#fff5cd', '#8cd7ff', '#dad0f0', '#305971', '#25501a'].map((color) => (
                      <div
                        key={color}
                        onClick={() => {
                          setEventPageColor(color);
                          setEventCustomColorInput(color);
                        }}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: color,
                          border: eventPageColor === color ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: eventPageColor === color ? '0 0 12px rgba(0,0,0,0.5)' : 'none',
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#ccc', marginBottom: '6px', display: 'block' }}>Choose Custom Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={eventCustomColorInput}
                      onChange={(e) => {
                        setEventCustomColorInput(e.target.value);
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          setEventPageColor(e.target.value);
                        }
                      }}
                      placeholder="#RRGGBB"
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        flex: 1,
                      }}
                    />
                    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                      <button
                        type="button"
                        onClick={() => eventCustomColorInputRef.current?.click()}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '8px',
                          background: eventCustomColorInput,
                          border: '2px solid rgba(0, 217, 255, 0.3)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                      <input
                        ref={eventCustomColorInputRef}
                        type="color"
                        value={eventCustomColorInput}
                        onChange={(e) => {
                          setEventCustomColorInput(e.target.value);
                          setEventPageColor(e.target.value);
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Section */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#00D9FF', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid rgba(0, 217, 255, 0.2)', paddingBottom: '8px' }}>
                  Event
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Event Image
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        ref={eventImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setEventData(prev => ({
                                ...prev,
                                image: file,
                                imagePreview: ev.target.result,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={() => eventImageInputRef.current?.click()}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(0, 217, 255, 0.2)',
                          border: '1px solid rgba(0, 217, 255, 0.3)',
                          borderRadius: '6px',
                          color: '#00D9FF',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        📁 Browse
                      </button>
                      {eventData.imagePreview && (
                        <button
                          onClick={() => setEventData(prev => ({...prev, image: null, imagePreview: null}))}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 0, 0, 0.3)',
                            borderRadius: '6px',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          🗑 Delete
                        </button>
                      )}
                    </div>
                    {eventData.imagePreview && (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={eventData.imagePreview} alt="Event preview" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '6px' }} />
                        <span style={{ fontSize: '11px', color: '#aaa' }}>Image uploaded</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={eventData.title}
                      onChange={(e) => setEventData({...eventData, title: e.target.value})}
                      placeholder="Enter event title"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: '700',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Summary
                    </label>
                    <textarea
                      value={eventData.summary}
                      onChange={(e) => setEventData({...eventData, summary: e.target.value})}
                      placeholder="Brief summary of the event"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        minHeight: '60px',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      About
                    </label>
                    <textarea
                      value={eventData.about}
                      onChange={(e) => setEventData({...eventData, about: e.target.value})}
                      placeholder="Tell more about the event"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        minHeight: '80px',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              </div>


              {/* Details Section */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#00D9FF', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid rgba(0, 217, 255, 0.2)', paddingBottom: '8px' }}>
                  Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Date of the event
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: '#888' }}>From</label>
                        <input
                          type="date"
                          value={eventData.dateFrom}
                          onChange={(e) => setEventData({...eventData, dateFrom: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(0, 217, 255, 0.05)',
                            border: '1px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                            colorScheme: 'dark',
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: '#888' }}>To</label>
                        <input
                          type="date"
                          value={eventData.dateTo}
                          onChange={(e) => setEventData({...eventData, dateTo: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(0, 217, 255, 0.05)',
                            border: '1px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                            colorScheme: 'dark',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Time (24h format)
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: '#888' }}>From</label>
                        <input
                          type="time"
                          value={eventData.timeFrom}
                          onChange={(e) => setEventData({...eventData, timeFrom: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(0, 217, 255, 0.05)',
                            border: '1px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                            colorScheme: 'dark',
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: '#888' }}>To</label>
                        <input
                          type="time"
                          value={eventData.timeTo}
                          onChange={(e) => setEventData({...eventData, timeTo: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(0, 217, 255, 0.05)',
                            border: '1px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                            colorScheme: 'dark',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Choose the services available at the event
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {[
                        { key: 'wifi', label: 'Wi-Fi', emoji: '📶' },
                        { key: 'bathroom', label: 'Bathroom', emoji: '🚻' },
                        { key: 'handicapped', label: 'Handicapped Facilities', emoji: '♿' },
                        { key: 'babies', label: 'Babies Allowed', emoji: '👶' },
                        { key: 'dogs', label: 'Dogs Allowed', emoji: '🐕' },
                        { key: 'parking', label: 'Parking', emoji: '🅿️' },
                        { key: 'food', label: 'Food', emoji: '🍽️' },
                      ].map((service) => (
                        <label
                          key={service.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            background: eventData.services[service.key] ? 'rgba(0, 217, 255, 0.15)' : 'rgba(0, 217, 255, 0.05)',
                            border: eventData.services[service.key] ? '1px solid rgba(0, 217, 255, 0.5)' : '1px solid rgba(0, 217, 255, 0.15)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: eventData.services[service.key] ? '#00D9FF' : '#ccc',
                            fontWeight: eventData.services[service.key] ? '600' : '400',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={eventData.services[service.key]}
                            onChange={(e) => setEventData({
                              ...eventData,
                              services: {...eventData.services, [service.key]: e.target.checked}
                            })}
                            style={{ accentColor: '#00D9FF' }}
                          />
                          <span>{service.emoji}</span>
                          <span>{service.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#00D9FF', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid rgba(0, 217, 255, 0.2)', paddingBottom: '8px' }}>
                  Address
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={eventData.street}
                    onChange={(e) => setEventData({...eventData, street: e.target.value})}
                    placeholder="Street address"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <input
                      type="text"
                      value={eventData.city}
                      onChange={(e) => setEventData({...eventData, city: e.target.value})}
                      placeholder="City"
                      style={{
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        width: '100%',
                      }}
                    />
                    <input
                      type="text"
                      value={eventData.state}
                      onChange={(e) => setEventData({...eventData, state: e.target.value})}
                      placeholder="State"
                      style={{
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        width: '100%',
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <input
                      type="text"
                      value={eventData.zip}
                      onChange={(e) => setEventData({...eventData, zip: e.target.value})}
                      placeholder="ZIP"
                      style={{
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        width: '100%',
                      }}
                    />
                    <input
                      type="text"
                      value={eventData.country}
                      onChange={(e) => setEventData({...eventData, country: e.target.value})}
                      placeholder="Country"
                      style={{
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        width: '100%',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contacts Section */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#00D9FF', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid rgba(0, 217, 255, 0.2)', paddingBottom: '8px' }}>
                  Contacts
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={eventData.contactName}
                    onChange={(e) => setEventData({...eventData, contactName: e.target.value})}
                    placeholder="Name"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="tel"
                    value={eventData.contactPhone}
                    onChange={(e) => setEventData({...eventData, contactPhone: e.target.value})}
                    placeholder="Phone"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="email"
                    value={eventData.contactEmail}
                    onChange={(e) => setEventData({...eventData, contactEmail: e.target.value})}
                    placeholder="Email"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="url"
                    value={eventData.contactWebsite}
                    onChange={(e) => setEventData({...eventData, contactWebsite: e.target.value})}
                    placeholder="Website"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            </div>
            <div className="modal-preview">
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '320px',
                height: '600px',
                background: '#f7f9fb',
                borderRadius: '40px',
                border: '12px solid #1a1a1a',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 0 5px rgba(255,255,255,0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: '"Nunito", "Segoe UI", sans-serif',
              }}>
                {/* Notch */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '150px',
                  height: '25px',
                  background: '#000',
                  borderRadius: '0 0 20px 20px',
                  zIndex: 10,
                }}></div>

                {/* Scrollable Content */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  background: eventPageColor || '#f7f9fb',
                }}>
                  {/* Hero Section - Image with Title overlay */}
                  <div style={{
                    position: 'relative',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {eventData.imagePreview ? (
                      <>
                        <img src={eventData.imagePreview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(30,48,79,0.3), rgba(30,48,79,0.1))' }}></div>
                      </>
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1E304F, #2a4a7a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '40px', opacity: 0.3 }}>🎉</span>
                      </div>
                    )}
                    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', padding: '0 16px' }}>
                      <div style={{
                        display: 'inline-block',
                        background: 'rgba(0, 0, 0, 0.45)',
                        backdropFilter: 'blur(4px)',
                        padding: '8px 20px',
                        borderRadius: '10px',
                      }}>
                        <div style={{ fontSize: '20px', fontWeight: '600', fontFamily: '"Cormorant SC", Georgia, serif', lineHeight: '1.2', letterSpacing: '0.02em' }}>
                          {eventData.title || 'Event Title'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 1: Event Title + Summary */}
                  <div style={{ padding: '16px 16px 8px' }}>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.35)',
                      borderRadius: '10px',
                      padding: '20px',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: '600', fontFamily: '"Cormorant SC", Georgia, serif', color: '#10264a', marginBottom: '8px', letterSpacing: '0.02em' }}>
                        {eventData.title || 'Event Title'}
                      </div>
                      {eventData.summary && (
                        <div style={{ fontSize: '16px', fontFamily: '"Nunito", "Segoe UI", sans-serif', color: '#283a50', lineHeight: '1.6' }}>
                          {eventData.summary}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: About */}
                  {eventData.about && (
                    <div style={{ padding: '8px 16px' }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.35)',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        <div style={{ fontSize: '15px', fontWeight: '600', fontFamily: '"Cormorant SC", Georgia, serif', color: '#10264a', marginBottom: '8px', letterSpacing: '0.02em' }}>
                          About
                        </div>
                        <div style={{ fontSize: '16px', fontFamily: '"Nunito", "Segoe UI", sans-serif', color: '#283a50', lineHeight: '1.6' }}>
                          {eventData.about}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 3: Date + Time + Services */}
                  {(eventData.dateFrom || eventData.dateTo || eventData.timeFrom || eventData.timeTo || Object.values(eventData.services).some(v => v)) && (
                    <div style={{ padding: '8px 16px' }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.35)',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        {(eventData.dateFrom || eventData.dateTo) && (
                          <div style={{ marginBottom: (eventData.timeFrom || eventData.timeTo || Object.values(eventData.services).some(v => v)) ? '16px' : '0' }}>
                            <div style={{ fontSize: '15px', fontWeight: '600', fontFamily: '"Cormorant SC", Georgia, serif', color: '#10264a', marginBottom: '8px', letterSpacing: '0.02em' }}>
                              Date
                            </div>
                            <div style={{ fontSize: '16px', fontFamily: '"Nunito", "Segoe UI", sans-serif', color: '#283a50' }}>
                              {eventData.dateFrom ? new Date(eventData.dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                              {eventData.dateFrom && eventData.dateTo ? ' - ' : ''}
                              {eventData.dateTo ? new Date(eventData.dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                            </div>
                          </div>
                        )}

                        {(eventData.timeFrom || eventData.timeTo) && (
                          <div style={{ marginBottom: Object.values(eventData.services).some(v => v) ? '16px' : '0' }}>
                            <div style={{ fontSize: '15px', fontWeight: '600', fontFamily: '"Cormorant SC", Georgia, serif', color: '#10264a', marginBottom: '8px', letterSpacing: '0.02em' }}>
                              Time
                            </div>
                            <div style={{ fontSize: '16px', fontFamily: '"Nunito", "Segoe UI", sans-serif', color: '#283a50' }}>
                              {eventData.timeFrom || ''}{eventData.timeFrom && eventData.timeTo ? ' - ' : ''}{eventData.timeTo || ''}
                            </div>
                          </div>
                        )}

                        {Object.values(eventData.services).some(v => v) && (
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '600', fontFamily: '"Cormorant SC", Georgia, serif', color: '#10264a', marginBottom: '8px', textAlign: 'center', letterSpacing: '0.02em' }}>
                              Services
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                              {eventData.services.wifi && <span title="Wi-Fi" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>📶</span>}
                              {eventData.services.bathroom && <span title="Bathroom" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>🚻</span>}
                              {eventData.services.handicapped && <span title="Handicapped Facilities" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>♿</span>}
                              {eventData.services.babies && <span title="Babies Allowed" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>👶</span>}
                              {eventData.services.dogs && <span title="Dogs Allowed" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>🐕</span>}
                              {eventData.services.parking && <span title="Parking" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>🅿️</span>}
                              {eventData.services.food && <span title="Food" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>🍽️</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card 4: Address */}
                  {(eventData.street || eventData.city || eventData.state || eventData.zip || eventData.country) && (
                    <div style={{ padding: '8px 16px' }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.35)',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        <div style={{ fontSize: '15px', fontWeight: '600', fontFamily: '"Cormorant SC", Georgia, serif', color: '#10264a', marginBottom: '8px', letterSpacing: '0.02em' }}>
                          Address
                        </div>
                        <div style={{ fontSize: '16px', fontFamily: '"Nunito", "Segoe UI", sans-serif', color: '#283a50', lineHeight: '1.5' }}>
                          {[eventData.street, eventData.city, eventData.state, eventData.zip, eventData.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 5: Contacts */}
                  {(eventData.contactName || eventData.contactPhone || eventData.contactEmail || eventData.contactWebsite) && (
                    <div style={{ padding: '8px 16px' }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.35)',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        <div style={{ fontSize: '15px', fontWeight: '600', fontFamily: '"Cormorant SC", Georgia, serif', color: '#10264a', marginBottom: '12px', letterSpacing: '0.02em' }}>
                          Contacts
                        </div>
                        {eventData.contactName && (
                          <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: '"Cormorant SC", Georgia, serif', color: '#10264a', marginBottom: '8px' }}>
                            {eventData.contactName}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {eventData.contactPhone && (
                            <div style={{ fontSize: '16px', fontFamily: '"Nunito", "Segoe UI", sans-serif', color: '#283a50' }}>
                              📞 {eventData.contactPhone}
                            </div>
                          )}
                          {eventData.contactEmail && (
                            <div style={{ fontSize: '16px', fontFamily: '"Nunito", "Segoe UI", sans-serif', color: '#283a50' }}>
                              ✉️ {eventData.contactEmail}
                            </div>
                          )}
                          {eventData.contactWebsite && (
                            <div style={{ fontSize: '16px', fontFamily: '"Nunito", "Segoe UI", sans-serif', color: '#283a50' }}>
                              🌐 {eventData.contactWebsite}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', fontFamily: '"Cormorant SC", Georgia, serif', color: '#191c1e', marginBottom: '4px', letterSpacing: '0.02em' }}>
                      {eventData.title || 'Event'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6e7a74' }}>
                      Powered by Stiqr.top
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Save Configuration Button */}
              <button
                onClick={handleSaveEventConfig}
                disabled={savingEvent}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '14px 20px',
                  background: savingEvent ? 'rgba(0, 217, 255, 0.3)' : 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: savingEvent ? '#888' : '#000',
                  fontWeight: '700',
                  cursor: savingEvent ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  boxShadow: savingEvent ? 'none' : '0 0 20px rgba(0, 217, 255, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                {savingEvent ? '⏳ Saving...' : '💾 Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  })();

  const renderMenuModal = (() => {
    if (!showMenuModal) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
      }}>
        <div style={{
          position: 'relative',
          background: 'rgba(20, 20, 40, 0.95)',
          border: '2px solid rgba(0, 217, 255, 0.3)',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '1100px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'block',
        }}>
          <div className="modal-layout">
            <div className="modal-editor">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#00D9FF', fontSize: '24px', fontWeight: '700' }}>
                Menu QR Code
              </h2>
              <button
                onClick={() => setShowMenuModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ccc',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: 0,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            <div>
              {/* Page Color */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#fff', fontWeight: '600' }}>
                  Page Color
                </label>
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa' }}>Choose which color your page should have</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['#e5e9ec', '#edcbc0', '#fff5cd', '#8cd7ff', '#dad0f0', '#305971', '#25501a'].map((color) => (
                      <div
                        key={color}
                        onClick={() => {
                          setMenuPageColor(color);
                          setMenuCustomColorInput(color);
                        }}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: color,
                          border: menuPageColor === color ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: menuPageColor === color ? '0 0 12px rgba(0,0,0,0.5)' : 'none',
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#ccc', marginBottom: '6px', display: 'block' }}>Choose Custom Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={menuCustomColorInput}
                      onChange={(e) => {
                        setMenuCustomColorInput(e.target.value);
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          setMenuPageColor(e.target.value);
                        }
                      }}
                      placeholder="#RRGGBB"
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        flex: 1,
                      }}
                    />
                    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                      <button
                        type="button"
                        onClick={() => menuCustomColorInputRef.current?.click()}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '8px',
                          background: menuCustomColorInput,
                          border: '2px solid rgba(0, 217, 255, 0.3)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                      <input
                        ref={menuCustomColorInputRef}
                        type="color"
                        value={menuCustomColorInput}
                        onChange={(e) => {
                          setMenuCustomColorInput(e.target.value);
                          setMenuPageColor(e.target.value);
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Section */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#00D9FF', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid rgba(0, 217, 255, 0.2)', paddingBottom: '8px' }}>
                  Menu
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Restaurant Image
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        ref={menuImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setMenuData(prev => ({
                                ...prev,
                                image: file,
                                imagePreview: ev.target.result,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={() => menuImageInputRef.current?.click()}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(0, 217, 255, 0.2)',
                          border: '1px solid rgba(0, 217, 255, 0.3)',
                          borderRadius: '6px',
                          color: '#00D9FF',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        📁 Browse
                      </button>
                      {menuData.imagePreview && (
                        <button
                          onClick={() => setMenuData(prev => ({...prev, image: null, imagePreview: null}))}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 0, 0, 0.3)',
                            borderRadius: '6px',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          🗑 Delete
                        </button>
                      )}
                    </div>
                    {menuData.imagePreview && (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={menuData.imagePreview} alt="Restaurant preview" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '6px' }} />
                        <span style={{ fontSize: '11px', color: '#aaa' }}>Image uploaded</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Menu Title
                    </label>
                    <input
                      type="text"
                      value={menuData.title}
                      onChange={(e) => setMenuData({...menuData, title: e.target.value})}
                      placeholder="Enter menu title"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: '700',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Summary
                    </label>
                    <textarea
                      value={menuData.summary}
                      onChange={(e) => setMenuData({...menuData, summary: e.target.value})}
                      placeholder="Brief summary of the menu"
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        minHeight: '60px',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Menu PDF File
                    </label>
                    <input
                      ref={menuPdfInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setMenuData(prev => ({
                              ...prev,
                              pdfFile: ev.target.result,
                              pdfFileName: file.name,
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <button
                      onClick={() => menuPdfInputRef.current?.click()}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: 'rgba(0, 217, 255, 0.1)',
                        border: '2px dashed rgba(0, 217, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#00D9FF',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'center',
                        display: 'block',
                      }}
                    >
                      📁 Upload PDF File
                    </button>
                    {menuData.pdfFileName && (
                      <div style={{
                        marginTop: '8px',
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>📄</span>
                          <span style={{ fontSize: '12px', color: '#00D9FF', fontWeight: '600' }}>{menuData.pdfFileName}</span>
                        </div>
                        <button
                          onClick={() => setMenuData(prev => ({...prev, pdfFile: null, pdfFileName: ''}))}
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(255, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 0, 0, 0.3)',
                            borderRadius: '4px',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: '600',
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#00D9FF', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid rgba(0, 217, 255, 0.2)', paddingBottom: '8px' }}>
                  Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Business Days Section */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Business Hours
                    </label>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '6px 8px', textAlign: 'left', color: '#aaa', fontWeight: '600', borderBottom: '1px solid rgba(0,217,255,0.2)', fontSize: '10px' }}>Day</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa', fontWeight: '600', borderBottom: '1px solid rgba(0,217,255,0.2)', fontSize: '10px' }} colSpan="2">Morning</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa', fontWeight: '600', borderBottom: '1px solid rgba(0,217,255,0.2)', fontSize: '10px' }} colSpan="2">Evening</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa', fontWeight: '600', borderBottom: '1px solid rgba(0,217,255,0.2)', fontSize: '10px' }}>Closed</th>
                          </tr>
                          <tr>
                            <th style={{ padding: '2px 8px' }}></th>
                            <th style={{ padding: '2px 8px', textAlign: 'center', color: '#888', fontWeight: '400', fontSize: '9px', borderBottom: '1px solid rgba(0,217,255,0.1)' }}>Open</th>
                            <th style={{ padding: '2px 8px', textAlign: 'center', color: '#888', fontWeight: '400', fontSize: '9px', borderBottom: '1px solid rgba(0,217,255,0.1)' }}>Close</th>
                            <th style={{ padding: '2px 8px', textAlign: 'center', color: '#888', fontWeight: '400', fontSize: '9px', borderBottom: '1px solid rgba(0,217,255,0.1)' }}>Open</th>
                            <th style={{ padding: '2px 8px', textAlign: 'center', color: '#888', fontWeight: '400', fontSize: '9px', borderBottom: '1px solid rgba(0,217,255,0.1)' }}>Close</th>
                            <th style={{ padding: '2px 8px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'monday', label: 'Monday' },
                            { key: 'tuesday', label: 'Tuesday' },
                            { key: 'wednesday', label: 'Wednesday' },
                            { key: 'thursday', label: 'Thursday' },
                            { key: 'friday', label: 'Friday' },
                            { key: 'saturday', label: 'Saturday' },
                            { key: 'sunday', label: 'Sunday' },
                          ].map((day) => {
                            const hours = menuData.businessHours[day.key];
                            const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
                            const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
                            const renderTimeSelect = (field, value) => {
                              const hour = value ? value.split(':')[0] : '';
                              const minute = value ? value.split(':')[1] : '';
                              return (
                                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                  <select
                                    value={hour}
                                    onChange={(e) => {
                                      const newHour = e.target.value;
                                      const newValue = newHour && minute ? `${newHour}:${minute}` : newHour || '';
                                      setMenuData({
                                        ...menuData,
                                        businessHours: {
                                          ...menuData.businessHours,
                                          [day.key]: { ...hours, [field]: newValue }
                                        }
                                      });
                                    }}
                                    style={{
                                      flex: 1,
                                      padding: '4px 2px',
                                      background: 'rgba(0, 217, 255, 0.05)',
                                      border: '1px solid rgba(0, 217, 255, 0.15)',
                                      borderRadius: '4px',
                                      color: '#fff',
                                      fontSize: '10px',
                                      boxSizing: 'border-box',
                                      colorScheme: 'dark',
                                      cursor: 'pointer',
                                      minWidth: '0',
                                    }}
                                  >
                                    <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>--</option>
                                    {hourOptions.map(h => (
                                      <option key={h} value={h} style={{ background: '#1a1a2e', color: '#fff' }}>{h}</option>
                                    ))}
                                  </select>
                                  {hour && hour !== 'Closed' && (
                                    <select
                                      value={minute}
                                      onChange={(e) => {
                                        const newMinute = e.target.value;
                                        const newValue = hour && newMinute ? `${hour}:${newMinute}` : '';
                                        setMenuData({
                                          ...menuData,
                                          businessHours: {
                                            ...menuData.businessHours,
                                            [day.key]: { ...hours, [field]: newValue }
                                          }
                                        });
                                      }}
                                      style={{
                                        flex: 1,
                                        padding: '4px 2px',
                                        background: 'rgba(0, 217, 255, 0.05)',
                                        border: '1px solid rgba(0, 217, 255, 0.15)',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '10px',
                                        boxSizing: 'border-box',
                                        colorScheme: 'dark',
                                        cursor: 'pointer',
                                        minWidth: '0',
                                      }}
                                    >
                                      <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>--</option>
                                      {minuteOptions.map(m => (
                                        <option key={m} value={m} style={{ background: '#1a1a2e', color: '#fff' }}>{m}</option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              );
                            };
                            return (
                              <tr key={day.key}>
                                <td style={{ padding: '4px 8px', color: '#fff', fontWeight: '600', borderBottom: '1px solid rgba(0,217,255,0.08)', whiteSpace: 'nowrap' }}>{day.label}</td>
                                <td style={{ padding: '4px 4px', borderBottom: '1px solid rgba(0,217,255,0.08)' }}>
                                  {renderTimeSelect('morningOpen', hours.morningOpen)}
                                </td>
                                <td style={{ padding: '4px 4px', borderBottom: '1px solid rgba(0,217,255,0.08)' }}>
                                  {renderTimeSelect('morningClose', hours.morningClose)}
                                </td>
                                <td style={{ padding: '4px 4px', borderBottom: '1px solid rgba(0,217,255,0.08)' }}>
                                  {renderTimeSelect('eveningOpen', hours.eveningOpen)}
                                </td>
                                <td style={{ padding: '4px 4px', borderBottom: '1px solid rgba(0,217,255,0.08)' }}>
                                  {renderTimeSelect('eveningClose', hours.eveningClose)}
                                </td>
                                <td style={{ padding: '4px 4px', borderBottom: '1px solid rgba(0,217,255,0.08)', textAlign: 'center' }}>
                                  <button
                                    onClick={() => {
                                      setMenuData({
                                        ...menuData,
                                        businessHours: {
                                          ...menuData.businessHours,
                                          [day.key]: { ...hours, closed: !hours.closed }
                                        }
                                      });
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      background: hours.closed ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 217, 255, 0.1)',
                                      border: hours.closed ? '1px solid rgba(255, 0, 0, 0.5)' : '1px solid rgba(0, 217, 255, 0.2)',
                                      borderRadius: '4px',
                                      color: hours.closed ? '#ff6b6b' : '#888',
                                      cursor: 'pointer',
                                      fontSize: '9px',
                                      fontWeight: '600',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {hours.closed ? '✓ Closed' : 'Closed'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#ccc', fontWeight: '600' }}>
                      Choose the services available at the restaurant
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {[
                        { key: 'wifi', label: 'Wi-Fi', emoji: '📶' },
                        { key: 'bathroom', label: 'Bathroom', emoji: '🚻' },
                        { key: 'handicapped', label: 'Handicapped Facilities', emoji: '♿' },
                        { key: 'babies', label: 'Babies Allowed', emoji: '👶' },
                        { key: 'dogs', label: 'Dogs Allowed', emoji: '🐕' },
                        { key: 'parking', label: 'Parking', emoji: '🅿️' },
                        { key: 'food', label: 'Food', emoji: '🍽️' },
                      ].map((service) => (
                        <label
                          key={service.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            background: menuData.services[service.key] ? 'rgba(0, 217, 255, 0.15)' : 'rgba(0, 217, 255, 0.05)',
                            border: menuData.services[service.key] ? '1px solid rgba(0, 217, 255, 0.5)' : '1px solid rgba(0, 217, 255, 0.15)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: menuData.services[service.key] ? '#00D9FF' : '#ccc',
                            fontWeight: menuData.services[service.key] ? '600' : '400',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={menuData.services[service.key]}
                            onChange={(e) => setMenuData({
                              ...menuData,
                              services: {...menuData.services, [service.key]: e.target.checked}
                            })}
                            style={{ accentColor: '#00D9FF' }}
                          />
                          <span>{service.emoji}</span>
                          <span>{service.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#00D9FF', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid rgba(0, 217, 255, 0.2)', paddingBottom: '8px' }}>
                  Address
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={menuData.street}
                    onChange={(e) => setMenuData({...menuData, street: e.target.value})}
                    placeholder="Street address"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <input
                      type="text"
                      value={menuData.city}
                      onChange={(e) => setMenuData({...menuData, city: e.target.value})}
                      placeholder="City"
                      style={{
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        width: '100%',
                      }}
                    />
                    <input
                      type="text"
                      value={menuData.state}
                      onChange={(e) => setMenuData({...menuData, state: e.target.value})}
                      placeholder="State"
                      style={{
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        width: '100%',
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <input
                      type="text"
                      value={menuData.zip}
                      onChange={(e) => setMenuData({...menuData, zip: e.target.value})}
                      placeholder="ZIP"
                      style={{
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        width: '100%',
                      }}
                    />
                    <input
                      type="text"
                      value={menuData.country}
                      onChange={(e) => setMenuData({...menuData, country: e.target.value})}
                      placeholder="Country"
                      style={{
                        padding: '10px',
                        background: 'rgba(0, 217, 255, 0.05)',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        width: '100%',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contacts Section */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#00D9FF', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid rgba(0, 217, 255, 0.2)', paddingBottom: '8px' }}>
                  Contacts
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={menuData.contactName}
                    onChange={(e) => setMenuData({...menuData, contactName: e.target.value})}
                    placeholder="Name"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="tel"
                    value={menuData.contactPhone}
                    onChange={(e) => setMenuData({...menuData, contactPhone: e.target.value})}
                    placeholder="Phone"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="email"
                    value={menuData.contactEmail}
                    onChange={(e) => setMenuData({...menuData, contactEmail: e.target.value})}
                    placeholder="Email"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="url"
                    value={menuData.contactWebsite}
                    onChange={(e) => setMenuData({...menuData, contactWebsite: e.target.value})}
                    placeholder="Website"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            </div>
            <div className="modal-preview">
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '320px',
                height: '600px',
                background: '#f7f9fb',
                borderRadius: '40px',
                border: '12px solid #1a1a1a',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 0 5px rgba(255,255,255,0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: '"Nunito Sans", "Inter", sans-serif',
              }}>
                {/* Notch */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '150px',
                  height: '25px',
                  background: '#000',
                  borderRadius: '0 0 20px 20px',
                  zIndex: 10,
                }}></div>

                {/* Scrollable Content */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  background: menuPageColor || '#f7f9fb',
                }}>
                  {/* Hero Section - Image with Title overlay */}
                  <div style={{
                    position: 'relative',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {menuData.imagePreview ? (
                      <>
                        <img src={menuData.imagePreview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(30,48,79,0.3), rgba(30,48,79,0.1))' }}></div>
                      </>
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1E304F, #2a4a7a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '40px', opacity: 0.3 }}>🍽️</span>
                      </div>
                    )}
                    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', padding: '0 16px' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', fontFamily: '"Hanken Grotesk", sans-serif', lineHeight: '1.2', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                        {menuData.title || 'Menu Title'}
                      </div>
                    </div>
                  </div>

                  {/* Card 1: Menu Title + Summary */}
                  <div style={{ padding: '16px 16px 8px' }}>
                    <div style={{
                      background: '#fff',
                      borderRadius: '10px',
                      padding: '20px',
                      border: '1px solid #e0e3e5',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: '"Hanken Grotesk", sans-serif', color: '#1E304F', marginBottom: '8px' }}>
                        {menuData.title || 'Menu Title'}
                      </div>
                      {menuData.summary && (
                        <div style={{ fontSize: '13px', color: '#3e4944', lineHeight: '1.5' }}>
                          {menuData.summary}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Menu PDF */}
                  {menuData.pdfFileName && (
                    <div style={{ padding: '8px 16px' }}>
                      <div style={{
                        background: '#fff',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid #e0e3e5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: '"Hanken Grotesk", sans-serif', color: '#1E304F', marginBottom: '12px' }}>
                          Menu PDF
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <span style={{ fontSize: '32px' }}>📄</span>
                          <div style={{ fontSize: '12px', color: '#3e4944', fontWeight: '600' }}>
                            {menuData.pdfFileName}
                          </div>
                          <div style={{
                            padding: '8px 20px',
                            background: '#1E304F',
                            borderRadius: '20px',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}>
                            View Menu PDF
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 3: Business Hours - only show if at least one day has hours or is marked closed */}
                  {Object.values(menuData.businessHours).some(h => h.closed || (h.morningOpen && h.morningClose) || (h.eveningOpen && h.eveningClose)) && (
                    <div style={{ padding: '8px 16px' }}>
                      <div style={{
                        background: '#fff',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid #e0e3e5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: '"Hanken Grotesk", sans-serif', color: '#1E304F', marginBottom: '12px', textAlign: 'center' }}>
                          Business Hours
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {[
                            { key: 'monday', label: 'Mon' },
                            { key: 'tuesday', label: 'Tue' },
                            { key: 'wednesday', label: 'Wed' },
                            { key: 'thursday', label: 'Thu' },
                            { key: 'friday', label: 'Fri' },
                            { key: 'saturday', label: 'Sat' },
                            { key: 'sunday', label: 'Sun' },
                          ].map((day) => {
                            const h = menuData.businessHours[day.key];
                            const hasMorning = h.morningOpen && h.morningClose;
                            const hasEvening = h.eveningOpen && h.eveningClose;
                            return (
                              <div key={day.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', padding: '2px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                <span style={{ fontWeight: '700', color: '#1E304F', minWidth: '32px' }}>{day.label}</span>
                                <span style={{ color: h.closed ? '#e74c3c' : '#3e4944' }}>
                                  {h.closed ? 'Closed' : (
                                    <>
                                      {hasMorning ? `${h.morningOpen} - ${h.morningClose}` : ''}
                                      {hasMorning && hasEvening ? '  |  ' : ''}
                                      {hasEvening ? `${h.eveningOpen} - ${h.eveningClose}` : ''}
                                    </>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 4: Services */}
                  {Object.values(menuData.services).some(v => v) && (
                    <div style={{ padding: '8px 16px' }}>
                      <div style={{
                        background: '#fff',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid #e0e3e5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: '"Hanken Grotesk", sans-serif', color: '#1E304F', marginBottom: '8px', textAlign: 'center' }}>
                          Services
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {menuData.services.wifi && <span title="Wi-Fi" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>📶</span>}
                          {menuData.services.bathroom && <span title="Bathroom" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>🚻</span>}
                          {menuData.services.handicapped && <span title="Handicapped Facilities" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>♿</span>}
                          {menuData.services.babies && <span title="Babies Allowed" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>👶</span>}
                          {menuData.services.dogs && <span title="Dogs Allowed" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>🐕</span>}
                          {menuData.services.parking && <span title="Parking" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>🅿️</span>}
                          {menuData.services.food && <span title="Food" style={{ fontSize: '20px', filter: 'grayscale(100%)' }}>🍽️</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 4: Address */}
                  {(menuData.street || menuData.city || menuData.state || menuData.zip || menuData.country) && (
                    <div style={{ padding: '8px 16px' }}>
                      <div style={{
                        background: '#fff',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid #e0e3e5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: '"Hanken Grotesk", sans-serif', color: '#1E304F', marginBottom: '8px' }}>
                          Address
                        </div>
                        <div style={{ fontSize: '12px', color: '#3e4944', lineHeight: '1.5' }}>
                          {[menuData.street, menuData.city, menuData.state, menuData.zip, menuData.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 5: Contacts */}
                  {(menuData.contactName || menuData.contactPhone || menuData.contactEmail || menuData.contactWebsite) && (
                    <div style={{ padding: '8px 16px' }}>
                      <div style={{
                        background: '#fff',
                        borderRadius: '10px',
                        padding: '20px',
                        border: '1px solid #e0e3e5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: '"Hanken Grotesk", sans-serif', color: '#1E304F', marginBottom: '12px' }}>
                          Contacts
                        </div>
                        {menuData.contactName && (
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#191c1e', marginBottom: '8px' }}>
                            {menuData.contactName}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {menuData.contactPhone && (
                            <div style={{ fontSize: '12px', color: '#3e4944' }}>
                              📞 {menuData.contactPhone}
                            </div>
                          )}
                          {menuData.contactEmail && (
                            <div style={{ fontSize: '12px', color: '#3e4944' }}>
                              ✉️ {menuData.contactEmail}
                            </div>
                          )}
                          {menuData.contactWebsite && (
                            <div style={{ fontSize: '12px', color: '#3e4944' }}>
                              🌐 {menuData.contactWebsite}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', fontFamily: '"Hanken Grotesk", sans-serif', color: '#191c1e', marginBottom: '4px' }}>
                      {menuData.title || 'Menu'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6e7a74' }}>
                      Powered by Stiqr.top
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Save Configuration Button */}
              <button
                onClick={handleSaveMenuConfig}
                disabled={savingMenu}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '14px 20px',
                  background: savingMenu ? 'rgba(0, 217, 255, 0.3)' : 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: savingMenu ? '#888' : '#000',
                  fontWeight: '700',
                  cursor: savingMenu ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  boxShadow: savingMenu ? 'none' : '0 0 20px rgba(0, 217, 255, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                {savingMenu ? '⏳ Saving...' : '💾 Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  })();


  return (
    <div className="editor-page-wrapper">
      {!embedded && (
        <header className="editor-header">
          <div className="editor-header-buttons">
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
      )}

      {editorContent}
      {stickerPicker}
      {renderSocialModal}
      {renderEventModal}
      {renderMenuModal}
    </div>
  );
};

export default EditorPage;


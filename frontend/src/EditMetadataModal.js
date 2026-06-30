import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './contexts/AuthContext';

// Helper to detect QR type from destination data
const detectQrType = (data) => {
  if (!data) return 'url';
  if (data.startsWith('mailto:')) return 'email';
  if (data.startsWith('sms:')) return 'sms';
  if (data.startsWith('https://wa.me/')) return 'whatsapp';
  if (data.startsWith('WIFI:S:')) return 'wifi';
  if (data.startsWith('PDF:')) return 'pdf';
  if (data.includes('/social/')) return 'social';
  if (data.includes('/event/')) return 'event';
  if (data.includes('/menu/')) return 'menu';
  // Check if it's a PDF URL (uploaded PDF via /api/pdf/ endpoint)
  if (data.includes('/api/pdf/')) return 'pdf';
  // Check if it's a PDF URL (uploaded PDF)
  if (data.includes('/uploads/') && data.toLowerCase().endsWith('.pdf')) return 'pdf';
  return 'url';
};

// Helper to parse destination data back into individual fields
const parseDestinationData = (data) => {
  if (!data) return { type: 'url', fields: { destination: '' } };

  if (data.startsWith('mailto:')) {
    // mailto:email?subject=...&body=...
    const mailtoMatch = data.match(/^mailto:([^?]+)/);
    const email = mailtoMatch ? decodeURIComponent(mailtoMatch[1]) : '';
    const subjectMatch = data.match(/[?&]subject=([^&]*)/);
    const subject = subjectMatch ? decodeURIComponent(subjectMatch[1]) : '';
    const bodyMatch = data.match(/[?&]body=([^&]*)/);
    const message = bodyMatch ? decodeURIComponent(bodyMatch[1]) : '';
    return { type: 'email', fields: { email, subject, message } };
  }

  if (data.startsWith('sms:')) {
    // sms:+1number?body=...
    const smsMatch = data.match(/^sms:(\+?\d+)/);
    const phoneNumber = smsMatch ? smsMatch[1] : '';
    let countryCode = '+1';
    let number = phoneNumber;
    if (phoneNumber.startsWith('+')) {
      const ccMatch = phoneNumber.match(/^(\+\d{1,3})/);
      if (ccMatch) {
        countryCode = ccMatch[1];
        number = phoneNumber.substring(ccMatch[1].length);
      }
    }
    const bodyMatch = data.match(/[?&]body=([^&]*)/);
    const message = bodyMatch ? decodeURIComponent(bodyMatch[1]) : '';
    return { type: 'sms', fields: { countryCode, phoneNumber: number, message } };
  }

  if (data.startsWith('https://wa.me/')) {
    // https://wa.me/1number?text=...
    const waMatch = data.match(/^https:\/\/wa\.me\/(\d+)/);
    const fullNumber = waMatch ? waMatch[1] : '';
    let countryCode = '+1';
    let number = fullNumber;
    if (fullNumber.length > 0) {
      const ccMatch = fullNumber.match(/^(\d{1,3})/);
      if (ccMatch) {
        countryCode = '+' + ccMatch[1];
        number = fullNumber.substring(ccMatch[1].length);
      }
    }
    const textMatch = data.match(/[?&]text=([^&]*)/);
    const message = textMatch ? decodeURIComponent(textMatch[1]) : '';
    return { type: 'whatsapp', fields: { countryCode, phoneNumber: number, message } };
  }

  if (data.startsWith('WIFI:S:')) {
    // WIFI:S:ssid;T:encryption;P:password;;
    const ssidMatch = data.match(/WIFI:S:([^;]*)/);
    const ssid = ssidMatch ? decodeURIComponent(ssidMatch[1]) : '';
    const encMatch = data.match(/;T:([^;]*)/);
    const encryption = encMatch ? encMatch[1] : 'WPA/WPA2';
    const passMatch = data.match(/;P:([^;]*)/);
    const password = passMatch ? decodeURIComponent(passMatch[1]) : '';
    return { type: 'wifi', fields: { ssid, encryption, password } };
  }

  if (data.startsWith('PDF:')) {
    const pdfName = data.substring(4);
    return { type: 'pdf', fields: { pdfName } };
  }

  // Check if it's a PDF URL (uploaded PDF via /api/pdf/ endpoint)
  if (data.includes('/api/pdf/')) {
    // Extract the MongoDB ID from the URL
    const urlParts = data.split('/');
    const pdfId = urlParts[urlParts.length - 1] || '';
    return { type: 'pdf', fields: { pdfName: `PDF (${pdfId.substring(0, 8)}...)` } };
  }

  // Check if it's a PDF URL (uploaded PDF)
  if (data.includes('/uploads/') && data.toLowerCase().endsWith('.pdf')) {
    // Extract filename from URL
    const urlParts = data.split('/');
    const pdfName = urlParts[urlParts.length - 1] || 'PDF file';
    return { type: 'pdf', fields: { pdfName } };
  }

  const type = detectQrType(data);
  if (type === 'social') {
    return { type: 'social', fields: { destination: data } };
  }
  if (type === 'event') {
    return { type: 'event', fields: { destination: data } };
  }
  if (type === 'menu') {
    return { type: 'menu', fields: { destination: data } };
  }

  return { type: 'url', fields: { destination: data } };
};

// Helper to format fields back into destination string
const formatDestinationData = (type, fields) => {
  switch (type) {
    case 'email': {
      const subject = fields.subject ? `?subject=${encodeURIComponent(fields.subject)}` : '';
      const body = fields.message ? `${subject ? '&' : '?'}body=${encodeURIComponent(fields.message)}` : '';
      return `mailto:${fields.email}${subject}${body}`;
    }
    case 'sms': {
      const body = fields.message ? `?body=${encodeURIComponent(fields.message)}` : '';
      return `sms:${fields.countryCode}${fields.phoneNumber}${body}`;
    }
    case 'whatsapp': {
      const text = fields.message ? `?text=${encodeURIComponent(fields.message)}` : '';
      return `https://wa.me/${fields.countryCode.replace('+', '')}${fields.phoneNumber}${text}`;
    }
    case 'wifi': {
      return `WIFI:S:${fields.ssid};T:${fields.encryption};P:${fields.password};;`;
    }
    case 'pdf':
      return `PDF:${fields.pdfName}`;
    default:
      return fields.destination || '';
  }
};

const EditMetadataModal = ({ qrCode, onClose, onSave, onOpenSocialEditor, onOpenEventEditor, onOpenMenuEditor }) => {
  const [destination, setDestination] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [qrType, setQrType] = useState('url');
  const [emailFields, setEmailFields] = useState({ email: '', subject: '', message: '' });
  const [smsFields, setSmsFields] = useState({ countryCode: '+1', phoneNumber: '', message: '' });
  const [wifiFields, setWifiFields] = useState({ ssid: '', encryption: 'WPA/WPA2', password: '' });
  const [pdfName, setPdfName] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    if (qrCode) {
      const rawData = qrCode.destination || qrCode.data || '';
      setDestination(rawData);
      setName(qrCode.name || '');
      setCategory(qrCode.category || '');
      setTags(Array.isArray(qrCode.tags) ? qrCode.tags.join(', ') : (qrCode.tags || ''));
      setNotes(qrCode.notes || '');

      const parsed = parseDestinationData(rawData);
      setQrType(parsed.type);

      switch (parsed.type) {
        case 'email':
          setEmailFields(parsed.fields);
          break;
        case 'sms':
        case 'whatsapp':
          setSmsFields(parsed.fields);
          break;
        case 'wifi':
          setWifiFields(parsed.fields);
          break;
        case 'pdf':
          setPdfName(parsed.fields.pdfName || '');
          break;
        default:
          break;
      }
    }
  }, [qrCode]);

  const handleSave = async () => {
    let finalDestination;
    if (qrType === 'url') {
      finalDestination = destination.trim();
    } else if (qrType === 'pdf' && pdfFile) {
      // Upload the new PDF file first
      setUploadingPdf(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('jwtToken');
        
        // Read the PDF file as base64
        const pdfReader = new FileReader();
        const pdfBase64 = await new Promise((resolve, reject) => {
          pdfReader.onload = () => resolve(pdfReader.result);
          pdfReader.onerror = reject;
          pdfReader.readAsDataURL(pdfFile);
        });
        
        // Upload to backend
        const uploadResponse = await fetch(`${API_BASE_URL}/api/upload/pdf`, {
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
          finalDestination = uploadResult.url;
        } else {
          const uploadError = await uploadResponse.text();
          console.error('❌ PDF upload failed:', uploadError);
          setError('Failed to upload PDF file. Please try again.');
          setUploadingPdf(false);
          setSaving(false);
          return;
        }
      } catch (uploadErr) {
        console.error('❌ PDF upload error:', uploadErr);
        setError('Failed to upload PDF file. Please try again.');
        setUploadingPdf(false);
        setSaving(false);
        return;
      }
      
      setUploadingPdf(false);
    } else {
      finalDestination = formatDestinationData(qrType, {
        ...emailFields,
        ...smsFields,
        ...wifiFields,
        pdfName,
      });
    }

    if (!finalDestination.trim()) {
      setError('Destination is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('jwtToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/qrcodes/${qrCode.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          destination: finalDestination,
          name: name.trim() || qrCode.name,
          category: category.trim(),
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          notes: notes.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update QR code');
      }

      const result = await response.json();
      console.log('✅ QR code metadata updated:', result);
      setSuccess(true);

      if (onSave) {
        onSave({
          ...qrCode,
          destination: finalDestination,
          name: name.trim() || qrCode.name,
          category: category.trim(),
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          notes: notes.trim(),
        });
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('❌ Failed to update QR code metadata:', err);
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getQrTypeLabel = () => {
    const labels = {
      url: 'URL',
      email: 'E-mail',
      sms: 'SMS',
      whatsapp: 'WhatsApp',
      wifi: 'Wi-Fi',
      pdf: 'PDF',
      social: 'Social Media',
      event: 'Event',
      menu: 'Menu',
    };
    return labels[qrType] || 'URL';
  };

  const renderTypeSpecificFields = () => {
    switch (qrType) {
      case 'email':
        return (
          <>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>
                Email Address <span style={{ color: '#FF00FF' }}>*</span>
              </label>
              <input
                type="email"
                value={emailFields.email}
                onChange={(e) => setEmailFields({...emailFields, email: e.target.value})}
                placeholder="email@example.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: emailFields.email.trim() ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                onBlur={(e) => e.target.style.borderColor = emailFields.email.trim() ? 'rgba(0, 217, 255, 0.3)' : 'rgba(255, 0, 0, 0.3)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>
                Subject <span style={{ color: '#888' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={emailFields.subject}
                onChange={(e) => setEmailFields({...emailFields, subject: e.target.value})}
                placeholder="Subject of Email"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>
                Message <span style={{ color: '#888' }}>(optional)</span>
              </label>
              <textarea
                value={emailFields.message}
                onChange={(e) => setEmailFields({...emailFields, message: e.target.value})}
                placeholder="Email body text"
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </>
        );

      case 'sms':
      case 'whatsapp':
        return (
          <>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>
                Phone Number <span style={{ color: '#FF00FF' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={smsFields.countryCode}
                  onChange={(e) => setSmsFields({...smsFields, countryCode: e.target.value})}
                  style={{
                    flex: '0 0 120px',
                    padding: '10px 14px',
                    background: '#1a1a2e',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
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
                  value={smsFields.phoneNumber}
                  onChange={(e) => setSmsFields({...smsFields, phoneNumber: e.target.value})}
                  placeholder="Phone Number"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: smsFields.phoneNumber.trim() ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                  onBlur={(e) => e.target.style.borderColor = smsFields.phoneNumber.trim() ? 'rgba(0, 217, 255, 0.3)' : 'rgba(255, 0, 0, 0.3)'}
                />
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>
                Message <span style={{ color: '#888' }}>(optional)</span>
              </label>
              <textarea
                value={smsFields.message}
                onChange={(e) => setSmsFields({...smsFields, message: e.target.value})}
                placeholder="Message"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </>
        );

      case 'wifi':
        return (
          <>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>
                SSID (Network Name) <span style={{ color: '#FF00FF' }}>*</span>
              </label>
              <input
                type="text"
                value={wifiFields.ssid}
                onChange={(e) => setWifiFields({...wifiFields, ssid: e.target.value})}
                placeholder="Network Name"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: wifiFields.ssid.trim() ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                onBlur={(e) => e.target.style.borderColor = wifiFields.ssid.trim() ? 'rgba(0, 217, 255, 0.3)' : 'rgba(255, 0, 0, 0.3)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>
                Encryption
              </label>
              <select
                value={wifiFields.encryption}
                onChange={(e) => setWifiFields({...wifiFields, encryption: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#1a1a2e',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="WEP" style={{ background: '#1a1a2e', color: '#fff' }}>WEP</option>
                <option value="WPA/WPA2" style={{ background: '#1a1a2e', color: '#fff' }}>WPA/WPA2</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>
                Password <span style={{ color: '#888' }}>(optional)</span>
              </label>
              <input
                type="password"
                value={wifiFields.password}
                onChange={(e) => setWifiFields({...wifiFields, password: e.target.value})}
                placeholder="Wi-Fi Password"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </>
        );

      case 'pdf':
        return (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px', fontWeight: '600' }}>
              PDF File
            </label>
            <div style={{
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              borderRadius: '8px',
              color: '#00D9FF',
              fontSize: '13px',
              marginBottom: '10px',
            }}>
              📄 {pdfFile ? pdfFile.name : (pdfName || 'No PDF selected')}
            </div>
            <input
              type="file"
              id="pdf-upload-metadata"
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
              htmlFor="pdf-upload-metadata"
              style={{
                display: 'block',
                padding: '12px 14px',
                background: 'rgba(0, 217, 255, 0.1)',
                border: '2px dashed rgba(0, 217, 255, 0.3)',
                borderRadius: '8px',
                color: '#00D9FF',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#00D9FF'}
              onMouseLeave={(e) => e.target.style.borderColor = 'rgba(0, 217, 255, 0.3)'}
            >
              📁 Upload New PDF
            </label>
            {pdfFile && (
              <div style={{ fontSize: '11px', color: '#6bff6b', marginTop: '6px' }}>
                ✅ New PDF selected: {pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
            <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
              Upload a new PDF to update the destination for this dynamic QR code.
            </div>
          </div>
        );

      case 'social':
        return (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#aaa',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              Destination URL <span style={{ color: '#FF00FF' }}>*</span>
            </label>
            <input
              type="url"
              value={destination}
              readOnly
              placeholder="https://example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#bbb',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                cursor: 'not-allowed',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onOpenSocialEditor) {
                    onOpenSocialEditor(qrCode);
                  }
                  onClose();
                }}
                style={{
                  width: 'fit-content',
                  padding: '10px 16px',
                  background: '#00D9FF',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontWeight: '700',
                  cursor: onOpenSocialEditor ? 'pointer' : 'not-allowed',
                }}
              >
                🎛️ Open Social Media Page Editor
              </button>
              <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
                The Social Media landing page is managed separately. Open the page editor to update the saved styles, headline, and links.
              </div>
            </div>
          </div>
        );

      case 'event':
        return (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#aaa',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              Destination URL <span style={{ color: '#FF00FF' }}>*</span>
            </label>
            <input
              type="url"
              value={destination}
              readOnly
              placeholder="https://example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#bbb',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                cursor: 'not-allowed',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onOpenEventEditor) {
                    onOpenEventEditor(qrCode);
                  }
                  onClose();
                }}
                style={{
                  width: 'fit-content',
                  padding: '10px 16px',
                  background: '#00D9FF',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontWeight: '700',
                  cursor: onOpenEventEditor ? 'pointer' : 'not-allowed',
                }}
              >
                🎛️ Open Event Page Editor
              </button>
              <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
                The Event landing page is managed separately. Open the page editor to update the saved event details, date, address, and contacts.
              </div>
            </div>
          </div>
        );

      case 'menu':
        return (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#aaa',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              Destination URL <span style={{ color: '#FF00FF' }}>*</span>
            </label>
            <input
              type="url"
              value={destination}
              readOnly
              placeholder="https://example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#bbb',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                cursor: 'not-allowed',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onOpenMenuEditor) {
                    onOpenMenuEditor(qrCode);
                  }
                  onClose();
                }}
                style={{
                  width: 'fit-content',
                  padding: '10px 16px',
                  background: '#00D9FF',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontWeight: '700',
                  cursor: onOpenMenuEditor ? 'pointer' : 'not-allowed',
                }}
              >
                🎛️ Open Menu Page Editor
              </button>
              <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
                The Menu landing page is managed separately. Open the page editor to update the saved menu details, restaurant image, and items.
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#aaa',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              Destination URL <span style={{ color: '#FF00FF' }}>*</span>
            </label>
            <input
              type="url"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="https://example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: destination.trim() ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
              onBlur={(e) => e.target.style.borderColor = destination.trim() ? 'rgba(0, 217, 255, 0.3)' : 'rgba(255, 0, 0, 0.3)'}
            />
          </div>
        );
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    }}>
      <div style={{
        background: '#1a1a2e',
        border: '1px solid rgba(0, 217, 255, 0.3)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '650px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 0 40px rgba(0, 217, 255, 0.1), 0 0 20px rgba(255, 0, 255, 0.05)',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          ×
        </button>

        <div style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#00D9FF',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span>✏️</span>
          Edit Metadata (for Dynamic QR codes)
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 217, 255, 0.1))',
          border: '1px solid rgba(255, 0, 255, 0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>⚡</span>
          <div>
            <div style={{ fontSize: '13px', color: '#FF00FF', fontWeight: '600', marginBottom: '4px' }}>
              Dynamic QR Code Mode
            </div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', lineHeight: '1.5' }}>
              Appearance is locked. Only the destination and metadata can be changed. The QR code image will remain identical.
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>QR Code ID</div>
            <div style={{ fontSize: '12px', color: '#00D9FF', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {qrCode.id || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>Creation Date</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>
              {formatDate(qrCode.createdAt)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>Total Scan Count</div>
            <div style={{ fontSize: '12px', color: '#FF00FF', fontWeight: '600' }}>
              {qrCode.scans || 0} scans
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>Last Scan Date</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>
              {qrCode.lastScanDate ? formatDate(qrCode.lastScanDate) : 'N/A'}
            </div>
          </div>
        </div>

        <div style={{
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '12px', color: '#888' }}>QR Type:</span>
          <span style={{
            padding: '3px 10px',
            background: 'rgba(0, 217, 255, 0.15)',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#00D9FF',
            fontWeight: '600',
          }}>
            {getQrTypeLabel()}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
        }}>
          {renderTypeSpecificFields()}

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#aaa',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              QR Code Name <span style={{ color: '#888' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Campaign Name"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#aaa',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              Category/Folder <span style={{ color: '#888' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Marketing, Events, etc."
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#aaa',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              Tags <span style={{ color: '#888' }}>(comma separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#aaa',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              Notes <span style={{ color: '#888' }}>(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this QR code..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#00D9FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: '15px',
            padding: '10px 14px',
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '8px',
            color: '#ff6b6b',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>❌</span>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            marginTop: '15px',
            padding: '10px 14px',
            background: 'rgba(0, 255, 0, 0.1)',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            borderRadius: '8px',
            color: '#6bff6b',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>✅</span>
            QR code metadata updated successfully!
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#aaa',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: saving ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!saving) e.target.style.borderColor = '#fff';
            }}
            onMouseLeave={(e) => {
              if (!saving) e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 24px',
              background: saving ? 'rgba(0, 217, 255, 0.5)' : 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
              border: 'none',
              borderRadius: '8px',
              color: saving ? '#888' : '#000',
              fontSize: '14px',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMetadataModal;

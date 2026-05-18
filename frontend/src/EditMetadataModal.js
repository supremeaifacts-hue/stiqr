import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './contexts/AuthContext';

const EditMetadataModal = ({ qrCode, onClose, onSave }) => {
  const [destination, setDestination] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill form with existing QR code data
  useEffect(() => {
    if (qrCode) {
      setDestination(qrCode.destination || qrCode.data || '');
      setName(qrCode.name || '');
      setCategory(qrCode.category || '');
      setTags(Array.isArray(qrCode.tags) ? qrCode.tags.join(', ') : (qrCode.tags || ''));
      setNotes(qrCode.notes || '');
    }
  }, [qrCode]);

  const handleSave = async () => {
    if (!destination.trim()) {
      setError('Destination URL is required');
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
          destination: destination.trim(),
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

      // Call onSave callback to refresh dashboard
      if (onSave) {
        onSave({
          ...qrCode,
          destination: destination.trim(),
          name: name.trim() || qrCode.name,
          category: category.trim(),
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          notes: notes.trim(),
        });
      }

      // Close modal after short delay
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

  // Format creation date
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
        {/* Close button */}
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

        {/* Header */}
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

        {/* Warning Banner */}
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
              Appearance is locked. Only the destination URL and metadata can be changed. The QR code image will remain identical.
            </div>
          </div>
        </div>

        {/* Read-only Info */}
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

        {/* Form Fields */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
        }}>
          {/* Destination URL (full width) */}
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

          {/* QR Code Name */}
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

          {/* Category/Folder */}
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

          {/* Tags */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: '#aaa',
              marginBottom: '6px',
              fontWeight: '600',
            }}>
              Tags <span style={{ color: '#888' }}>(optional, comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="summer, sale, campaign"
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

          {/* Notes */}
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
              placeholder="Internal notes about this QR code..."
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
            color: '#ff4444',
            fontSize: '13px',
          }}>
            ❌ {error}
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
            color: '#00FF00',
            fontSize: '13px',
          }}>
            ✅ Metadata updated successfully! Closing...
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
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
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = '#fff'; e.target.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.target.style.color = '#aaa'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !destination.trim()}
            style={{
              padding: '10px 24px',
              background: saving ? 'linear-gradient(135deg, #666 0%, #888 100%)' : 'linear-gradient(135deg, #00D9FF 0%, #FF00FF 100%)',
              border: 'none',
              borderRadius: '8px',
              color: saving ? '#aaa' : '#000',
              fontSize: '14px',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: (!destination.trim() || saving) ? 0.6 : 1,
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

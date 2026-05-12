import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

const StatisticsModal = ({ qrCode, onClose }) => {
  const { isAuthenticated } = useAuth();

  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [step, setStep] = useState('day'); // 'day', 'week', 'month'
  
  // Real scan data from API
  const [allScanData, setAllScanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const qrCodeInfo = useMemo(() => ({
    id: qrCode?.id || 'demo-id',
    name: qrCode?.name || 'QR Code',
    createdAt: qrCode?.createdAt || new Date().toISOString(),
    scans: qrCode?.scans || 0,
  }), [qrCode]);

  // Fetch real scan data from the API
  useEffect(() => {
    const fetchScanData = async () => {
      if (!qrCodeInfo.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/analytics/${qrCodeInfo.id}`);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the API response into the format expected by the UI
        const scans = (data.scans || []).map((scan, index) => ({
          id: index + 1,
          timestamp: scan.timestamp || scan.processedAt || new Date().toISOString(),
          city: scan.city || 'Unknown',
          country: scan.country || 'Unknown',
          countryCode: scan.countryCode || '',
          os: scan.os || 'Unknown',
          deviceType: scan.deviceType || 'unknown',
          browser: scan.browser || 'Unknown',
        }));
        
        // Sort by timestamp descending
        scans.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setAllScanData(scans);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError(err.message);
        setAllScanData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScanData();
  }, [qrCodeInfo.id]);

  // Compute time since creation
  const timeSinceCreation = useMemo(() => {
    const created = new Date(qrCodeInfo.createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffWeeks > 0) {
      const remainingDays = diffDays % 7;
      return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''}${remainingDays > 0 ? `, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : ''}`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else {
      return `${diffSecs} second${diffSecs !== 1 ? 's' : ''}`;
    }
  }, [qrCodeInfo]);

  // Filter scan data by date range
  const filteredScanData = useMemo(() => {
    let filtered = [...allScanData];
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(s => new Date(s.timestamp) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => new Date(s.timestamp) <= toDate);
    }
    
    return filtered;
  }, [allScanData, dateFrom, dateTo]);

  // Total scans (filtered)
  const totalScans = filteredScanData.length;

  // Group scans by time step for the bar chart
  const scansOverTime = useMemo(() => {
    const groups = {};
    
    filteredScanData.forEach(scan => {
      const date = new Date(scan.timestamp);
      let key;
      
      if (step === 'day') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (step === 'week') {
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);
        key = `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else { // month
        key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      groups[key] = (groups[key] || 0) + 1;
    });
    
    // Sort by date
    const sorted = Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateA - dateB;
    });
    
    return sorted;
  }, [filteredScanData, step]);

  // Scans by OS
  const scansByOS = useMemo(() => {
    const osMap = {};
    filteredScanData.forEach(scan => {
      const os = scan.os || 'Unknown';
      osMap[os] = (osMap[os] || 0) + 1;
    });
    
    return Object.entries(osMap)
      .sort((a, b) => b[1] - a[1]);
  }, [filteredScanData]);

  // Scans by country
  const scansByCountry = useMemo(() => {
    const countryMap = {};
    filteredScanData.forEach(scan => {
      const country = scan.country || 'Unknown';
      countryMap[country] = (countryMap[country] || 0) + 1;
    });
    
    return Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1]);
  }, [filteredScanData]);

  // Scans by city
  const scansByCity = useMemo(() => {
    const cityMap = {};
    filteredScanData.forEach(scan => {
      const city = scan.city || 'Unknown';
      cityMap[city] = (cityMap[city] || 0) + 1;
    });
    
    return Object.entries(cityMap)
      .sort((a, b) => b[1] - a[1]);
  }, [filteredScanData]);

  // Max count for bar chart scaling
  const maxTimeCount = Math.max(...scansOverTime.map(([, c]) => c), 1);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
        border: '1px solid rgba(0, 217, 255, 0.3)',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '95vh',
        overflowY: 'auto',
        color: '#fff',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#00D9FF', margin: 0 }}>
            📊 Statistics for "{qrCode?.name || 'QR Code'}"
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            ×
          </button>
        </div>

        {/* TOP ROW: Total Scans (left) + Created Date & Active Time (right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '25px',
        }}>
          {/* Total Scans */}
          <div style={{
            background: 'rgba(0, 217, 255, 0.1)',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px', fontWeight: '600' }}>TOTAL SCANS</div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: '#00D9FF', lineHeight: '1' }}>
              {totalScans}
            </div>
          </div>

          {/* Created Date & Active Time */}
          <div style={{
            background: 'rgba(255, 0, 255, 0.1)',
            border: '1px solid rgba(255, 0, 255, 0.3)',
            borderRadius: '12px',
            padding: '25px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px', fontWeight: '600' }}>CREATED & ACTIVE TIME</div>
            <div style={{ fontSize: '16px', color: '#fff', marginBottom: '5px' }}>
              📅 {qrCodeInfo?.createdAt ? new Date(qrCodeInfo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </div>
            <div style={{ fontSize: '14px', color: '#FF00FF', fontWeight: '600' }}>
              Active for: {timeSinceCreation}
            </div>
          </div>
        </div>

        {/* FILTERS: Calendar Range + Step Selection */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          alignItems: 'center',
          marginBottom: '25px',
          padding: '15px 20px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#00D9FF' }}>📅 Filters:</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: '#aaa' }}>From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                padding: '6px 10px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: '#aaa' }}>To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                padding: '6px 10px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: '#aaa' }}>Group by:</label>
            <select
              value={step}
              onChange={(e) => setStep(e.target.value)}
              style={{
                padding: '6px 10px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>

        {/* MIDDLE ROW: Scans Over Time (left) + Scans by OS (right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '25px',
        }}>
          {/* Scans Over Time - Bar Chart */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#00D9FF' }}>
              📈 Scans Over Time
            </h3>
            {scansOverTime.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666', fontSize: '14px' }}>
                No scan data available for the selected period
              </div>
            ) : (
              <div style={{
                width: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '6px',
                  height: '200px',
                  padding: '0 5px 25px 5px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  width: `${Math.max(scansOverTime.length * 52, 100)}px`,
                }}>
                  {scansOverTime.map(([label, count], index) => {
                    const height = (count / maxTimeCount) * 170;
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '46px',
                        flexShrink: 0,
                      }}>
                        <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>{count}</div>
                        <div
                          style={{
                            width: '28px',
                            height: `${Math.max(height, 4)}px`,
                            background: 'linear-gradient(to top, #00D9FF, #FF00FF)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease',
                            cursor: 'pointer',
                          }}
                          title={`${label}: ${count} scans`}
                        ></div>
                        <div style={{
                          fontSize: '9px',
                          color: '#888',
                          marginTop: '5px',
                          whiteSpace: 'nowrap',
                          transform: 'rotate(-45deg)',
                          transformOrigin: 'left top',
                          position: 'relative',
                          top: '5px',
                        }}>
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Scans by OS - Horizontal Bar Chart */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#FF00FF' }}>
              💻 Scans by Operating System
            </h3>
            {scansByOS.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666', fontSize: '14px' }}>
                No scan data available
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scansByOS.map(([os, count], index) => {
                  const percentage = totalScans > 0 ? ((count / totalScans) * 100).toFixed(1) : 0;
                  const barWidth = totalScans > 0 ? (count / totalScans) * 100 : 0;
                  
                  // OS icons
                  let icon = '🖥️';
                  const osLower = os.toLowerCase();
                  if (osLower.includes('ios') || osLower.includes('iphone')) icon = '🍎';
                  else if (osLower.includes('android')) icon = '🤖';
                  else if (osLower.includes('windows')) icon = '🪟';
                  else if (osLower.includes('mac') || osLower.includes('os x')) icon = '💻';
                  else if (osLower.includes('linux')) icon = '🐧';
                  else if (osLower.includes('chrome')) icon = '🌐';
                  
                  return (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                        <span>
                          {icon} {os}
                        </span>
                        <span style={{ color: '#00D9FF', fontWeight: '600' }}>
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div style={{
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          background: index % 2 === 0 
                            ? 'linear-gradient(90deg, #FF00FF, #00D9FF)' 
                            : 'linear-gradient(90deg, #00D9FF, #FF00FF)',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease',
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: Top Countries (left) + Top Cities (right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '25px',
        }}>
          {/* Top Countries Table */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#00FF00' }}>
              🌍 Scans by Top Countries
            </h3>
            {scansByCountry.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666', fontSize: '14px' }}>
                No location data available
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', color: '#aaa', fontWeight: '600' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', color: '#aaa', fontWeight: '600' }}>Country</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', color: '#aaa', fontWeight: '600' }}>Scans</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', color: '#aaa', fontWeight: '600' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scansByCountry.map(([country, count], index) => {
                      const percentage = totalScans > 0 ? ((count / totalScans) * 100).toFixed(1) : 0;
                      return (
                        <tr key={country} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '8px 10px', fontSize: '12px', color: '#00D9FF', fontWeight: '700' }}>{index + 1}</td>
                          <td style={{ padding: '8px 10px', fontSize: '12px' }}>{country}</td>
                          <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>{count}</td>
                          <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', color: '#00D9FF' }}>{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Cities Table */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#FFFF00' }}>
              🏙️ Scans by Top Cities
            </h3>
            {scansByCity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666', fontSize: '14px' }}>
                No location data available
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', color: '#aaa', fontWeight: '600' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', color: '#aaa', fontWeight: '600' }}>City</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', color: '#aaa', fontWeight: '600' }}>Scans</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '11px', color: '#aaa', fontWeight: '600' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scansByCity.map(([city, count], index) => {
                      const percentage = totalScans > 0 ? ((count / totalScans) * 100).toFixed(1) : 0;
                      return (
                        <tr key={city} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '8px 10px', fontSize: '12px', color: '#FF00FF', fontWeight: '700' }}>{index + 1}</td>
                          <td style={{ padding: '8px 10px', fontSize: '12px' }}>{city}</td>
                          <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>{count}</td>
                          <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', color: '#FF00FF' }}>{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;

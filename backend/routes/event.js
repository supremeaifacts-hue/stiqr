const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Serve event landing page HTML
router.get('/event/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let eventPage = null;
    
    try {
      const db = mongoose.connection.db;
      if (db) {
        const collection = db.collection('event_pages');
        eventPage = await collection.findOne({ id });
      }
    } catch (dbError) {
      console.error('MongoDB error fetching event page:', dbError);
    }
    
    if (!eventPage) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Event Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #0a0a0a; color: #fff; }
          .container { text-align: center; padding: 40px; }
          h1 { color: #FF00FF; }
          p { color: #a0a0a0; }
        </style>
        </head>
        <body>
          <div class="container">
            <h1>Event Not Found</h1>
            <p>The event you're looking for doesn't exist or has been removed.</p>
          </div>
        </body>
        </html>
      `);
    }

    const { title, summary, about, image, dateFrom, dateTo, timeFrom, timeTo, services, address, contact, pageColor } = eventPage;
    
    // Format dates
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch { return dateStr; }
    };
    
    const dateFromFormatted = formatDate(dateFrom);
    const dateToFormatted = formatDate(dateTo);
    
    // Build address string
    const addressParts = [];
    if (address?.street) addressParts.push(address.street);
    if (address?.city) addressParts.push(address.city);
    if (address?.state) addressParts.push(address.state);
    if (address?.zip) addressParts.push(address.zip);
    if (address?.country) addressParts.push(address.country);
    const addressStr = addressParts.join(', ');
    
    // Build services HTML
    const serviceEmojis = {
      wifi: '📶', bathroom: '🚻', handicapped: '♿', babies: '👶',
      dogs: '🐕', parking: '🅿️', food: '🍽️'
    };
    const serviceLabels = {
      wifi: 'Wi-Fi', bathroom: 'Bathroom', handicapped: 'Handicapped Facilities',
      babies: 'Babies Allowed', dogs: 'Dogs Allowed', parking: 'Parking', food: 'Food'
    };
    
    let servicesHtml = '';
    if (services) {
      const activeServices = Object.entries(serviceEmojis)
        .filter(([key]) => services[key])
        .map(([key, emoji]) => `<span title="${serviceLabels[key]}" class="service-icon">${emoji}</span>`);
      if (activeServices.length > 0) {
        servicesHtml = `<div class="services-row">${activeServices.join('')}</div>`;
      }
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${title ? title + ' - Event' : 'Event'}</title>
        <meta name="description" content="${summary || 'Event page'}">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Cormorant+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          :root {
            --bg-color: ${pageColor || '#f7f9fb'};
            --text-primary: #191c1e;
            --text-secondary: #3e4944;
            --text-muted: #6e7a74;
            --card-bg: rgba(255, 255, 255, 0.35);
            --border-color: rgba(0, 0, 0, 0.08);
            --accent: #4DB695;
            --surface-low: rgba(255, 255, 255, 0.2);
          }
          
          body {
            font-family: 'Cormorant Garamond', Georgia, serif;
            background: var(--bg-color);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            font-size: 17px;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Cormorant SC', Georgia, serif;
            font-weight: 600;
          }
          
          /* ===== Hero Section ===== */
          .hero {
            position: relative;
            height: 280px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          
          .hero-image {
            position: absolute;
            inset: 0;
            z-index: 0;
          }
          
          .hero-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(30, 48, 79, 0.3), rgba(30, 48, 79, 0.1));
            z-index: 1;
          }
          
          .hero-content {
            position: relative;
            z-index: 2;
            text-align: center;
            color: #fff;
            padding: 0 20px;
          }
          
          .hero-title-wrapper {
            display: inline-block;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(4px);
            padding: 12px 28px;
            border-radius: 12px;
          }
          
          .hero-title {
            font-family: 'Cormorant SC', Georgia, serif;
            font-size: clamp(28px, 6vw, 42px);
            font-weight: 600;
            line-height: 1.2;
            letter-spacing: 0.02em;
            text-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          
          /* ===== Main Content ===== */
          .main-content {
            max-width: 640px;
            margin: 0 auto;
            padding: 0 16px;
            text-align: center;
          }
          
          /* ===== Cards ===== */
          .card {
            background: var(--card-bg);
            border-radius: 10px;
            padding: 20px;
            border: 1px solid var(--border-color);
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
          }
          
          .card:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            cursor: pointer;
          }
          
          .card-title {
            font-family: 'Cormorant SC', Georgia, serif;
            font-size: 15px;
            font-weight: 600;
            color: #1E304F;
            margin-bottom: 8px;
            letter-spacing: 0.02em;
          }
          
          .card-text {
            font-size: 16px;
            color: var(--text-secondary);
            line-height: 1.6;
          }
          
          .section-gap {
            padding: 8px 0;
          }
          
          .services-row {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 8px;
            justify-content: center;
          }
          
          .service-icon {
            font-size: 20px;
            filter: grayscale(100%);
          }
          
          /* ===== Footer ===== */
          .footer {
            padding: 24px 16px;
            text-align: center;
          }
          
          .footer .brand {
            font-family: 'Cormorant SC', Georgia, serif;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
          }
          
          .footer p {
            font-size: 10px;
            color: var(--text-muted);
          }
          
          /* ===== Responsive ===== */
          @media (min-width: 768px) {
            .hero {
              height: 350px;
            }
            
            .main-content {
              padding: 0 24px;
            }
          }
        </style>
      </head>
      <body>
        <main>
          <!-- Hero Section - Image with Title overlay -->
          <section class="hero">
            <div class="hero-image">
              ${image ? `<img src="${image}" alt="${title || 'Event'}">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg, #1E304F, #2a4a7a);display:flex;align-items:center;justify-content:center;"><span style="font-size:60px;opacity:0.3;">🎉</span></div>`}
              <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
              <div class="hero-title-wrapper">
                <h1 class="hero-title">${title || 'Event'}</h1>
              </div>
            </div>
          </section>
          
          <div class="main-content">
            <!-- Card 1: Event Title + Summary -->
            <div class="section-gap" style="padding-top:16px;">
              <div class="card">
                <div style="font-size:20px;font-weight:600;font-family:'Cormorant SC',Georgia,serif;color:#1E304F;margin-bottom:8px;letter-spacing:0.02em;">
                  ${title || 'Event Title'}
                </div>
                ${summary ? `<div style="font-size:16px;color:var(--text-secondary);line-height:1.6;">${summary}</div>` : ''}
              </div>
            </div>
            
            <!-- Card 2: About -->
            ${about ? `
              <div class="section-gap">
                <div class="card">
                  <div class="card-title">About</div>
                  <div class="card-text">${about}</div>
                </div>
              </div>
            ` : ''}
            
            <!-- Card 3: Date + Time + Services -->
            ${(dateFrom || dateTo || timeFrom || timeTo || servicesHtml) ? `
              <div class="section-gap">
                <div class="card">
                  ${(dateFrom || dateTo) ? `
                    <div class="card-title">Date</div>
                    <div class="card-text" style="${(timeFrom || timeTo || servicesHtml) ? 'margin-bottom:16px;' : ''}">
                      ${dateFromFormatted}${dateFrom && dateTo ? ' - ' : ''}${dateToFormatted}
                    </div>
                  ` : ''}
                  
                  ${(timeFrom || timeTo) ? `
                    <div class="card-title">Time</div>
                    <div class="card-text" style="${servicesHtml ? 'margin-bottom:16px;' : ''}">
                      ${timeFrom || ''}${timeFrom && timeTo ? ' - ' : ''}${timeTo || ''}
                    </div>
                  ` : ''}
                  
                  ${servicesHtml ? `
                    <div class="card-title">Services</div>
                    ${servicesHtml}
                  ` : ''}
                </div>
              </div>
            ` : ''}
            
            <!-- Card 4: Address -->
            ${addressStr ? `
              <div class="section-gap">
                <div class="card">
                  <div class="card-title">Address</div>
                  <div class="card-text">${addressStr}</div>
                </div>
              </div>
            ` : ''}
            
            <!-- Card 5: Contacts -->
            ${(contact?.name || contact?.phone || contact?.email || contact?.website) ? `
              <div class="section-gap">
                <div class="card">
                  <div class="card-title">Contacts</div>
                  ${contact?.name ? `<div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">${contact.name}</div>` : ''}
                  <div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
                    ${contact?.phone ? `<div style="font-size:12px;color:var(--text-secondary);">📞 ${contact.phone}</div>` : ''}
                    ${contact?.email ? `<div style="font-size:12px;color:var(--text-secondary);">✉️ ${contact.email}</div>` : ''}
                    ${contact?.website ? `<div style="font-size:12px;color:var(--text-secondary);">🌐 ${contact.website}</div>` : ''}
                  </div>
                </div>
              </div>
            ` : ''}
            
            <!-- Footer -->
            <footer class="footer">
              <div class="brand">${title || 'Event'}</div>
              <p>Powered by Stiqr.top</p>
            </footer>
          </div>
        </main>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving event page:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;

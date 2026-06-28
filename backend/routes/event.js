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

    const { title, summary, about, image, dateFrom, dateTo, services, address, contact, pageColor } = eventPage;
    
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

    // Determine background color class
    const bgClass = pageColor && pageColor !== '#e5e9ec' ? '' : 'bg-default';

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
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700;800&family=Nunito+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          :root {
            --bg-color: ${pageColor || '#f7f9fb'};
            --text-primary: #191c1e;
            --text-secondary: #3e4944;
            --text-muted: #6e7a74;
            --card-bg: #ffffff;
            --border-color: #bdc9c2;
            --accent: #4DB695;
            --accent-light: rgba(77, 182, 149, 0.1);
            --surface-low: #f2f4f6;
          }
          
          body {
            font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-color);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Hanken Grotesk', sans-serif;
          }
          
          /* ===== Hero Section ===== */
          .hero {
            position: relative;
            height: 400px;
            min-height: 400px;
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
          
          .hero-title {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: clamp(36px, 8vw, 56px);
            font-weight: 700;
            line-height: 1.1;
            letter-spacing: -0.02em;
            margin-bottom: 16px;
            text-shadow: 0 2px 20px rgba(0,0,0,0.3);
          }
          
          .hero-summary {
            font-size: 16px;
            color: rgba(255,255,255,0.85);
            max-width: 500px;
            margin: 0 auto;
            line-height: 1.6;
          }
          
          .hero-scroll {
            position: absolute;
            bottom: 48px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2;
            animation: bounce 2s infinite;
            color: #fff;
            font-size: 28px;
            opacity: 0.7;
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
            40% { transform: translateX(-50%) translateY(-10px); }
            60% { transform: translateX(-50%) translateY(-5px); }
          }
          
          /* ===== Navigation ===== */
          .nav-bar {
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 50;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-color);
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          .nav-inner {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 32px;
            max-width: 1280px;
            margin: 0 auto;
            padding: 16px 24px;
          }
          
          .nav-link {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
            text-decoration: none;
            padding-bottom: 4px;
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
          }
          
          .nav-link:hover,
          .nav-link.active {
            color: var(--accent);
            border-bottom-color: var(--accent);
          }
          
          /* ===== Main Content ===== */
          .main-content {
            padding-top: 0;
          }
          
          .section {
            padding: 80px 20px;
          }
          
          .section-alt {
            background: var(--surface-low);
          }
          
          .container {
            max-width: 1280px;
            margin: 0 auto;
          }
          
          .container-narrow {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
          }
          
          /* ===== Event Details Card ===== */
          .details-card {
            background: var(--card-bg);
            padding: 48px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            max-width: 600px;
            margin: 0 auto;
          }
          
          .details-card h3 {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 600;
            color: #1E304F;
            margin-bottom: 24px;
          }
          
          .detail-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          
          .detail-row .icon {
            font-size: 24px;
            color: var(--accent);
          }
          
          .detail-row .label {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
          }
          
          .detail-row .value {
            font-size: 14px;
            color: var(--text-secondary);
            margin-left: 36px;
          }
          
          .services-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 8px;
          }
          
          .service-icon {
            font-size: 24px;
            filter: grayscale(100%);
          }
          
          .divider {
            height: 1px;
            background: var(--border-color);
            margin: 24px 0;
          }
          
          /* ===== About Section ===== */
          .about-text {
            font-size: 16px;
            line-height: 1.8;
            color: var(--text-secondary);
            max-width: 700px;
            margin: 0 auto;
            text-align: center;
          }
          
          /* ===== Location Section ===== */
          .location-wrapper {
            display: flex;
            flex-direction: column;
            gap: 48px;
          }
          
          .location-info {
            max-width: 500px;
          }
          
          .location-label {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--accent);
            margin-bottom: 16px;
            display: block;
          }
          
          .location-title {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 32px;
            font-weight: 600;
            color: #1E304F;
            margin-bottom: 32px;
          }
          
          .location-cards {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .info-card {
            display: flex;
            gap: 16px;
            padding: 24px;
            background: #fff;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            transition: border-color 0.2s ease;
          }
          
          .info-card:hover {
            border-color: var(--accent);
          }
          
          .info-card .icon {
            font-size: 24px;
            color: var(--accent);
            flex-shrink: 0;
          }
          
          .info-card h4 {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 4px;
            color: var(--text-primary);
          }
          
          .info-card p {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
          }
          
          .info-card a {
            color: var(--accent);
            text-decoration: none;
            font-weight: 500;
          }
          
          .info-card a:hover {
            text-decoration: underline;
          }
          
          .contact-details {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .contact-details .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: var(--text-secondary);
          }
          
          .contact-details .contact-item .icon {
            font-size: 18px;
          }
          
          /* ===== Footer ===== */
          .footer {
            background: var(--surface-low);
            border-top: 1px solid var(--border-color);
            padding: 48px 24px;
            text-align: center;
          }
          
          .footer p {
            font-size: 13px;
            color: var(--text-muted);
          }
          
          .footer .brand {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-primary);
            margin-bottom: 8px;
          }
          
          /* ===== Responsive ===== */
          @media (min-width: 768px) {
            .location-wrapper {
              flex-direction: row;
            }
            
            .section {
              padding: 128px 64px;
            }
            
            .hero {
              height: 500px;
              min-height: 500px;
            }
          }
        </style>
      </head>
      <body>
        <!-- Navigation Bar -->
        <nav class="nav-bar" id="navbar">
          <div class="nav-inner">
            <a class="nav-link active" href="#event-details">Event Details</a>
            ${about ? '<a class="nav-link" href="#about">About</a>' : ''}
            ${addressStr ? '<a class="nav-link" href="#location">Location</a>' : ''}
            ${(contact?.name || contact?.phone || contact?.email || contact?.website) ? '<a class="nav-link" href="#contact">Contact</a>' : ''}
          </div>
        </nav>
        
        <main class="main-content">
          <!-- Hero Section -->
          <section class="hero">
            <div class="hero-image">
              ${image ? `<img src="${image}" alt="${title || 'Event'}">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg, #1E304F, #2a4a7a);display:flex;align-items:center;justify-content:center;"><span style="font-size:80px;opacity:0.3;">🎉</span></div>`}
              <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
              <h1 class="hero-title">${title || 'Event'}</h1>
              ${summary ? `<p class="hero-summary">${summary}</p>` : ''}
            </div>
            <div class="hero-scroll">↓</div>
          </section>
          
          <!-- Event Details Section -->
          <section class="section" id="event-details">
            <div class="container-narrow">
              <div class="details-card">
                <h3>Event Details</h3>
                
                ${(dateFrom || dateTo) ? `
                  <div class="detail-row">
                    <span class="icon">📅</span>
                    <span class="label">Date</span>
                  </div>
                  <div class="value">
                    ${dateFromFormatted}${dateFrom && dateTo ? ' - ' : ''}${dateToFormatted}
                  </div>
                ` : ''}
                
                ${servicesHtml ? `
                  <div class="divider"></div>
                  <h3 style="font-size:18px;margin-bottom:16px;">Event Services</h3>
                  ${servicesHtml}
                ` : ''}
              </div>
            </div>
          </section>
          
          <!-- About Section -->
          ${about ? `
            <section class="section section-alt" id="about">
              <div class="container-narrow">
                <span class="location-label" style="text-align:center;">About</span>
                <h2 class="location-title" style="text-align:center;font-size:28px;">About This Event</h2>
                <p class="about-text">${about}</p>
              </div>
            </section>
          ` : ''}
          
          <!-- Location Section -->
          ${addressStr ? `
            <section class="section" id="location">
              <div class="container">
                <div class="location-wrapper">
                  <div class="location-info">
                    <span class="location-label">Destination</span>
                    <h2 class="location-title">${address?.city || address?.country || 'Event Location'}</h2>
                    <div class="location-cards">
                      <div class="info-card">
                        <span class="icon">📍</span>
                        <div>
                          <h4>Event Address</h4>
                          <p>${addressStr}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style="flex:1;min-height:300px;background:var(--surface-low);border-radius:12px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-color);">
                    <div style="text-align:center;padding:40px;">
                      <span style="font-size:48px;display:block;margin-bottom:16px;">🗺️</span>
                      <p style="font-size:14px;color:var(--text-muted);">${addressStr}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ` : ''}
          
          <!-- Contact Section -->
          ${(contact?.name || contact?.phone || contact?.email || contact?.website) ? `
            <section class="section section-alt" id="contact">
              <div class="container-narrow">
                <span class="location-label" style="text-align:center;">Contact</span>
                <h2 class="location-title" style="text-align:center;font-size:28px;">Get In Touch</h2>
                <div class="details-card" style="text-align:left;">
                  ${contact?.name ? `<div class="detail-row"><span class="icon">👤</span><span class="label">${contact.name}</span></div>` : ''}
                  <div class="contact-details" style="margin-top:16px;">
                    ${contact?.phone ? `
                      <div class="contact-item">
                        <span class="icon">📞</span>
                        <a href="tel:${contact.phone}">${contact.phone}</a>
                      </div>
                    ` : ''}
                    ${contact?.email ? `
                      <div class="contact-item">
                        <span class="icon">✉️</span>
                        <a href="mailto:${contact.email}">${contact.email}</a>
                      </div>
                    ` : ''}
                    ${contact?.website ? `
                      <div class="contact-item">
                        <span class="icon">🌐</span>
                        <a href="${contact.website}" target="_blank" rel="noopener noreferrer">${contact.website}</a>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </section>
          ` : ''}
        </main>
        
        <!-- Footer -->
        <footer class="footer">
          <p class="brand">${title || 'Event'}</p>
          <p>Powered by Stiqr.top</p>
        </footer>
        
        <script>
          // Smooth scroll for nav links
          document.querySelectorAll('.nav-link').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            });
          });
          
          // Intersection Observer for active nav highlighting
          const sections = document.querySelectorAll('section[id]');
          const navLinks = document.querySelectorAll('.nav-link');
          
          if (sections.length > 0 && navLinks.length > 0) {
            window.addEventListener('scroll', () => {
              let current = '';
              sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= (sectionTop - 200)) {
                  current = section.getAttribute('id');
                }
              });
              
              navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                  link.classList.add('active');
                }
              });
            });
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving event page:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;

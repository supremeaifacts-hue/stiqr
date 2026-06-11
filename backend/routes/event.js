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
        .map(([key, emoji]) => `<span title="${serviceLabels[key]}" style="font-size:24px;filter:grayscale(100%)">${emoji}</span>`);
      if (activeServices.length > 0) {
        servicesHtml = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${activeServices.join('')}</div>`;
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
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: ${pageColor || '#e5e9ec'};
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .container {
            max-width: 500px;
            width: 100%;
            padding: 40px 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .event-image {
            width: 100%;
            max-height: 200px;
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.05);
          }
          .event-image img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            max-height: 200px;
          }
          .event-title {
            font-size: 24px;
            font-weight: 700;
            color: #000;
            text-align: center;
            line-height: 1.2;
          }
          .event-summary {
            font-size: 14px;
            color: #333;
            text-align: center;
            line-height: 1.4;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #000;
            margin-top: 8px;
          }
          .section-divider {
            height: 1px;
            background: rgba(0,0,0,0.1);
            margin: 4px 0;
          }
          .about-text {
            font-size: 13px;
            color: #333;
            line-height: 1.5;
          }
          .date-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #000;
            font-weight: 600;
          }
          .address-row {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 13px;
            color: #000;
          }
          .contact-item {
            font-size: 13px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .contact-name {
            font-size: 13px;
            color: #000;
            font-weight: 600;
          }
          .emoji-icon {
            filter: grayscale(100%);
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${image ? `<div class="event-image"><img src="${image}" alt="${title || 'Event'}"></div>` : ''}
          
          ${title ? `<h1 class="event-title">${title}</h1>` : ''}
          
          ${summary ? `<p class="event-summary">${summary}</p>` : ''}
          
          ${about ? `
            <div class="section-title">About</div>
            <div class="section-divider"></div>
            <p class="about-text">${about}</p>
          ` : ''}
          
          ${(dateFrom || dateTo) ? `
            <div class="section-title">Details</div>
            <div class="section-divider"></div>
            <div class="date-row">
              <span class="emoji-icon">📅</span>
              <span>${dateFromFormatted}${dateFrom && dateTo ? ' - ' : ''}${dateToFormatted}</span>
            </div>
            ${servicesHtml}
          ` : ''}
          
          ${addressStr ? `
            <div class="section-title">Address</div>
            <div class="section-divider"></div>
            <div class="address-row">
              <span class="emoji-icon">📍</span>
              <span>${addressStr}</span>
            </div>
          ` : ''}
          
          ${(contact?.name || contact?.phone || contact?.email || contact?.website) ? `
            <div class="section-title">Contacts</div>
            <div class="section-divider"></div>
            ${contact?.name ? `<div class="contact-name">${contact.name}</div>` : ''}
            ${contact?.phone ? `<div class="contact-item"><span class="emoji-icon">📞</span> ${contact.phone}</div>` : ''}
            ${contact?.email ? `<div class="contact-item"><span class="emoji-icon">✉️</span> ${contact.email}</div>` : ''}
            ${contact?.website ? `<div class="contact-item"><span class="emoji-icon">🌐</span> ${contact.website}</div>` : ''}
          ` : ''}
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving event page:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;

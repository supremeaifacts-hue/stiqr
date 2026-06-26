import React, { useState } from 'react';
import './Contact.css';
import TopBar from './TopBar';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('Sending your message...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('✅ Message sent successfully! We\'ll get back to you soon.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setStatus(`❌ ${data.error || 'Failed to send message. Please try again.'}`);
      }
    } catch (error) {
      setStatus('❌ Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
    }}>
      <TopBar
        onViewDashboard={() => window.location.href = '/dashboard'}
        onViewPricing={() => window.location.href = '/pricing'}
        onGoToLanding={() => window.location.href = '/'}
      />
      <main className="contact-page">
        <section className="contact-hero">
          <div className="contact-hero-inner">
            <p className="contact-hero-badge">Contact form</p>
          </div>
        </section>

      <div className="contact-content">
        <div className="contact-card">
          <div className="contact-card-header">
            <h1>Contact Us</h1>
            <p>Fill out the form below and we’ll route your message straight to support.</p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              <span>Name *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John"
                required
              />
            </label>

            <label>
              <span>Email *</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </label>

            <label>
              <span>Subject *</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="I need information about..."
                required
              />
            </label>

            <label>
              <span>How can we help you? *</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi StiQR, I would like to..."
                rows="6"
                required
              />
            </label>

            <button className="contact-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            {status && <p className="contact-status">{status}</p>}
          </form>
        </div>

        <aside className="contact-support-panel">
          <div className="contact-support-box">
            <div className="support-icon">✉️</div>
            <h2>Email us</h2>
            <p>Email us for general queries, including marketing and partnership opportunities.</p>
            <a className="support-email" href="mailto:support@stiqr.top">support@stiqr.top</a>
          </div>
        </aside>
      </div>
      </main>
    </div>
  );
};

export default Contact;

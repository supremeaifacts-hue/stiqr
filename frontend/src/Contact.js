import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const mailSubject = subject || 'Contact from StiQR';
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailtoLink = `mailto:support@stiqr.top?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;

    setStatus('Opening your email app...');
    window.location.href = mailtoLink;
  };

  return (
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

            <button className="contact-submit" type="submit">Send Message</button>
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
  );
};

export default Contact;

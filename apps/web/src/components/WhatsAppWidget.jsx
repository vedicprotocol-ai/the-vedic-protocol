import React, { useState } from 'react';

const PHONE = '447760538040';
const DEFAULT_MESSAGE = 'Hello! I have a question about The Vedic Protocol.';

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const text = message.trim() || DEFAULT_MESSAGE;
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setMessage('');
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="whatsapp-widget" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
      {/* Chat box */}
      {open && (
        <div style={{
          width: '300px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          fontFamily: 'sans-serif',
          background: '#fff',
        }}>
          {/* Header */}
          <div style={{
            background: '#25D366',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: '#128C7E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <WhatsAppIcon size={22} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>The Vedic Protocol</div>
              <div style={{ color: '#d9fdd3', fontSize: '12px' }}>Typically replies instantly</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '20px', lineHeight: 1, padding: '2px 4px' }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div style={{ background: '#e5ddd5', padding: '16px' }}>
            <div style={{
              background: '#fff',
              borderRadius: '10px 10px 10px 0',
              padding: '10px 12px',
              fontSize: '14px',
              color: '#333',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              maxWidth: '85%',
              lineHeight: 1.5,
            }}>
              👋 Hi there! How can we help you today?
            </div>
          </div>

          {/* Input */}
          <div style={{
            background: '#f0f0f0',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              style={{
                flex: 1,
                border: 'none',
                borderRadius: '20px',
                padding: '8px 14px',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'sans-serif',
                lineHeight: 1.4,
                background: '#fff',
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: '#25D366',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Send message"
            >
              <SendIcon size={18} color="#fff" />
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#25D366',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37,211,102,0.5)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon size={32} color="#fff" />
      </button>
    </div>
  );
}

function WhatsAppIcon({ size = 24, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function SendIcon({ size = 18, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
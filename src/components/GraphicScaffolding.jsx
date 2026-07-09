import React from 'react';

const GraphicScaffolding = ({ text }) => {
  const t = text || '';
  if (t.includes('油皮') || t.includes('油酥') || t.includes('層次') || t.includes('綠豆椪')) {
    return (
      <svg viewBox="0 0 100 60" width="100" height="60" style={{ marginBottom: '0.75rem' }}>
        <ellipse cx="50" cy="15" rx="45" ry="12" fill="none" stroke="var(--accent-gold)" strokeWidth="3" />
        <ellipse cx="50" cy="30" rx="45" ry="12" fill="none" stroke="var(--accent-gold)" strokeWidth="3" opacity="0.6" />
        <ellipse cx="50" cy="45" rx="45" ry="12" fill="none" stroke="var(--accent-gold)" strokeWidth="3" opacity="0.3" />
      </svg>
    );
  }
  if (t.includes('肚臍餅') || t.includes('烤箱')) {
    return (
      <svg viewBox="0 0 100 70" width="100" height="70" style={{ marginBottom: '0.75rem' }}>
        <rect x="10" y="10" width="80" height="55" rx="5" fill="none" stroke="var(--accent-gold)" strokeWidth="3" />
        <line x1="10" y1="28" x2="90" y2="28" stroke="var(--accent-gold)" strokeWidth="3" />
        <circle cx="50" cy="47" r="14" fill="rgba(212,175,55,0.15)" stroke="var(--accent-gold)" strokeWidth="2" />
        <circle cx="50" cy="47" r="5" fill="var(--accent-gold)" />
      </svg>
    );
  }
  return null;
};

export default GraphicScaffolding;

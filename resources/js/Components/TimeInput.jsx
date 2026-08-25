import React from 'react';

export default function TimeInput({ value, onChange, id, hasError }) {
  const [h, m] = (value || '09:00').split(':');
  const hours = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  const baseStyle = {
    flex: 1, padding: '9px 8px',
    background: 'var(--sp-inputBg)',
    border: '1px solid var(--sp-inputBorder)',
    borderRadius: '8px',
    fontSize: 'var(--sp-text-base)', color: 'var(--sp-text)',
    outline: 'none', cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif",
    appearance: 'none', WebkitAppearance: 'none',
  };
  const errStyle = hasError ? { borderColor: 'var(--sp-errorBorder)', background: 'var(--sp-errorBg)' } : {};
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%' }} id={id}>
      <select value={h} onChange={e => onChange(e.target.value + ':' + m)} style={{...baseStyle, ...errStyle}}>
        {hours.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span style={{ fontWeight: 700, color: 'var(--sp-textMuted)' }}>:</span>
      <select value={m} onChange={e => onChange(h + ':' + e.target.value)} style={{...baseStyle, ...errStyle}}>
        {minutes.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  );
}

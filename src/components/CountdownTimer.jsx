import React, { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    // 考試時間：115年9月5日 (週六) 16:30
    const targetDate = new Date('2026-09-05T16:30:00+08:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setIsOver(true);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        mins: minutes.toString().padStart(2, '0'),
        secs: seconds.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const boxStyle = {
    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '20px',
    margin: '20px auto',
    maxWidth: '600px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    position: 'relative',
    overflow: 'hidden'
  };

  const titleStyle = { fontSize: '1.1rem', color: '#38bdf8', fontWeight: 800, marginBottom: '8px', letterSpacing: '1px' };
  const subtitleStyle = { fontSize: '0.85rem', color: '#94a3b8', marginBottom: '15px' };
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' };
  const itemStyle = { background: 'rgba(0,0,0,0.3)', padding: '10px 5px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' };
  const numStyle = { fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', fontFamily: 'monospace', lineHeight: 1, marginBottom: '4px', textShadow: '0 0 10px rgba(255,255,255,0.3)' };
  const labelStyle = { fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' };
  const footerStyle = { fontSize: '0.95rem', color: '#fbbf24', fontWeight: 700, background: 'rgba(251,191,36,0.1)', padding: '8px', borderRadius: '8px' };

  return (
    <div style={boxStyle} className="fade-in">
      <div style={titleStyle}>⚠️ 115暑修 期末考 倒數計時 ⚠️</div>
      <div style={subtitleStyle}>考試時間：115年9月5日 (週六) 16:30</div>
      <div style={gridStyle}>
        <div style={itemStyle}><div style={numStyle}>{timeLeft.days}</div><div style={labelStyle}>Days</div></div>
        <div style={itemStyle}><div style={numStyle}>{timeLeft.hours}</div><div style={labelStyle}>Hours</div></div>
        <div style={itemStyle}><div style={numStyle}>{timeLeft.mins}</div><div style={labelStyle}>Mins</div></div>
        <div style={itemStyle}><div style={numStyle}>{timeLeft.secs}</div><div style={labelStyle}>Secs</div></div>
      </div>
      <div style={footerStyle}><span>💪</span> 期末考特訓團隊 祝福大家高分 All Pass！堅持到底！</div>
    </div>
  );
};

export default CountdownTimer;

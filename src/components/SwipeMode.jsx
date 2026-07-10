import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Zap, AlertTriangle, BookOpen, ChevronRight, Trophy } from 'lucide-react';
import GraphicScaffolding from './GraphicScaffolding';
import HighlightText from './HighlightText';
import { pastryKeywords } from '../data/keywords';
import questionsData from '../data/questions.json';
import { getPastryImage } from '../utils/imageMapper';

const SPRINT_SIZE = 10; // Cards per sprint

let sharedAudioCtx = null;
const getAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
  if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
  return sharedAudioCtx;
};

const playCorrectSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const playNote = (freq, startTime, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(startTime); osc.stop(startTime + duration);
  };
  const now = ctx.currentTime;
  playNote(523.25, now, 0.2);
  playNote(659.25, now + 0.1, 0.2);
  playNote(783.99, now + 0.2, 0.4);
  playNote(1046.50, now + 0.3, 0.6);
};

const playWrongSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const playBuzz = (freq, startTime, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.linearRampToValueAtTime(freq - 20, startTime + duration);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(startTime); osc.stop(startTime + duration);
  };
  const now = ctx.currentTime;
  playBuzz(150, now, 0.3);
  playBuzz(100, now + 0.2, 0.4);
};

const spawnConfetti = (count = 40) => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  Object.assign(canvas.style, { position: 'fixed', top: '0', left: '0', pointerEvents: 'none', zIndex: '9999' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const colors = ['#d4af37', '#f1c40f', '#e67e22', '#f39c12', '#ffffff'];
  const particles = Array.from({ length: count }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.4,
    vx: (Math.random() - 0.5) * 25,
    vy: (Math.random() - 0.5) * 25 - 12,
    size: Math.random() * 9 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1,
  }));
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.6; p.life -= 0.018;
      if (p.life > 0) {
        alive = true;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    if (alive) requestAnimationFrame(animate);
    else document.body.removeChild(canvas);
  };
  animate();
};

const SwipeMode = () => {
  const [allQs, setAllQs] = useState([]);
  const [boxes, setBoxes] = useState({});
  const [sprint, setSprint] = useState([]); // current 10-card sprint
  const [sprintIdx, setSprintIdx] = useState(0); // index within sprint
  const [sprintResults, setSprintResults] = useState([]); // {q, knew: bool}
  const [phase, setPhase] = useState('card'); // 'card' | 'sprint_done'
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [flyOut, setFlyOut] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [seenIds, setSeenIds] = useState(new Set());
  const [wrongFlash, setWrongFlash] = useState(null); // {answer, explanation} shown after wrong swipe
  const [unlockToast, setUnlockToast] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('全部');

  // Categories extraction
  const CATEGORIES = ['全部', '節日習俗', '製作工法', '食材知識', '歷史典故由來'];
  const CAT_EMOJI = { '全部': '🌟', '節日習俗': '🎊', '製作工法': '🛠️', '食材知識': '🍜', '歷史典故由來': '🏛️', '其他知識': '📚' };

  useEffect(() => {
    let savedBoxes = {};
    let savedSeenIds = new Set();
    try {
      const s = localStorage.getItem('pastry_leitner_boxes'); if (s) savedBoxes = JSON.parse(s);
      const seen = localStorage.getItem('pastry_seen_ids'); if (seen) savedSeenIds = new Set(JSON.parse(seen));
    } catch (e) {}
    const count = parseInt(sessionStorage.getItem('pastry_today_count') || '0');
    setTodayCount(count);
    setSeenIds(savedSeenIds);

    const combined = [
      ...questionsData.true_false.map(q => ({ ...q, type: 'tf' })),
      ...questionsData.multiple_choice.map(q => ({ ...q, type: 'mc' })),
    ];
    
    // Apply category filter
    const filtered = selectedCategory === '全部' 
      ? combined 
      : combined.filter(q => q.category === selectedCategory);

    let updatedBoxes = { ...savedBoxes };
    filtered.forEach(q => { if (updatedBoxes[q.id] === undefined) updatedBoxes[q.id] = 1; });
    setAllQs(filtered);
    setBoxes(updatedBoxes);
    buildSprint(filtered, updatedBoxes, savedSeenIds);
  }, [selectedCategory]);

  const saveBoxes = (newBoxes) => {
    setBoxes(newBoxes);
    localStorage.setItem('pastry_leitner_boxes', JSON.stringify(newBoxes));
  };

  const buildSprint = (qs, currentBoxes, currentSeenIds = seenIds) => {
    // Three pools: NEW (never seen), BOX1 (review), BOX2+ (consolidate)
    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

    const newPool    = shuffle(qs.filter(q => !currentSeenIds.has(q.id)));
    const box1Pool   = shuffle(qs.filter(q => currentSeenIds.has(q.id) && (currentBoxes[q.id] || 1) === 1));
    const box2Pool   = shuffle(qs.filter(q => currentSeenIds.has(q.id) && (currentBoxes[q.id] || 1) >= 2));

    // Guarantee: 4 new + 4 box1 + 2 box2+
    // Fallback gracefully if pool is smaller
    const pick = (pool, n) => pool.slice(0, n);

    let sprintCards = [];
    sprintCards.push(...pick(newPool, 4));
    sprintCards.push(...pick(box1Pool, 4));
    sprintCards.push(...pick(box2Pool, 2));

    // If we didn't get 10, top up from whatever is available
    if (sprintCards.length < SPRINT_SIZE) {
      const usedIds = new Set(sprintCards.map(q => q.id));
      const extras = shuffle(qs.filter(q => !usedIds.has(q.id)));
      sprintCards.push(...extras.slice(0, SPRINT_SIZE - sprintCards.length));
    }
    // Final shuffle to mix types
    sprintCards = shuffle(sprintCards).slice(0, SPRINT_SIZE);

    setSprint(sprintCards);
    setSprintIdx(0);
    setSprintResults([]);
    setPhase('card');
    setCurrentX(0);
    setFlyOut('');
    setShowAnswer(false);
  };

  const currentCard = sprint[sprintIdx];

  const handleSwipe = (direction) => {
    if (!currentCard) return;
    const knew = direction === 'right';
    const newBoxes = { ...boxes };
    const box = newBoxes[currentCard.id] || 1;

    if (knew) {
      newBoxes[currentCard.id] = Math.min(5, box + 1);
      playCorrectSound();
      if ('vibrate' in navigator) navigator.vibrate([15, 30, 15]);
      if (newBoxes[currentCard.id] >= 3) spawnConfetti(20);
    } else {
      newBoxes[currentCard.id] = 1;
      playWrongSound();
      if ('vibrate' in navigator) navigator.vibrate(80);
      // Flash correct answer for 1.5s after wrong swipe
      const answerText = currentCard.type === 'tf'
        ? (currentCard.answer ? 'O（正確）' : 'X（錯誤）')
        : currentCard.options?.[currentCard.answer] || '';
      setWrongFlash({ 
        answer: answerText, 
        explanation: currentCard.explanation || '',
        mnemonic: currentCard.mnemonic || '',
        keyword: currentCard.target_keyword || null
      });
      setTimeout(() => setWrongFlash(null), 2500); // 延長到 2.5 秒讓學生有時間看口訣
    }
    saveBoxes(newBoxes);

    const newResults = [...sprintResults, { q: currentCard, knew }];
    setSprintResults(newResults);

    // Mark this card as seen (coverage tracking)
    const newSeenIds = new Set(seenIds);
    newSeenIds.add(currentCard.id);
    setSeenIds(newSeenIds);
    localStorage.setItem('pastry_seen_ids', JSON.stringify([...newSeenIds]));

    // Update today count
    const newCount = todayCount + 1;
    setTodayCount(newCount);
    sessionStorage.setItem('pastry_today_count', String(newCount));

    setTimeout(() => {
      setFlyOut('');
      setCurrentX(0);
      setShowAnswer(false);
      const nextIdx = sprintIdx + 1;
      if (nextIdx >= SPRINT_SIZE || nextIdx >= sprint.length) {
        if (!knew || newResults.filter(r => r.knew).length === SPRINT_SIZE) spawnConfetti(60);
        setPhase('sprint_done');
      } else {
        setSprintIdx(nextIdx);
      }
    }, 280);
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (phase !== 'card' || !currentCard) return;
      if (e.key === 'ArrowRight') { setFlyOut('right'); handleSwipe('right'); }
      else if (e.key === 'ArrowLeft') { setFlyOut('left'); handleSwipe('left'); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setShowAnswer(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, currentCard, sprintIdx, boxes, sprintResults, todayCount]);

  // Touch/Mouse drag
  const touchState = useRef({ startX: 0, startY: 0, isScrolling: false });

  const onTouchStart = (e) => { 
    setIsDragging(true); 
    setStartX(e.touches[0].clientX); 
    touchState.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, isScrolling: false };
  };
  const onTouchMove = (e) => { 
    if (!isDragging) return; 
    const dx = e.touches[0].clientX - touchState.current.startX;
    const dy = e.touches[0].clientY - touchState.current.startY;
    if (!touchState.current.isScrolling) {
      if (Math.abs(dy) > Math.abs(dx) + 5) {
        touchState.current.isScrolling = true;
      }
    }
    if (touchState.current.isScrolling) return;
    setCurrentX(dx); 
  };
  const onTouchEnd = () => {
    setIsDragging(false);
    if (touchState.current.isScrolling) return;
    if (currentX > 80) { setFlyOut('right'); handleSwipe('right'); }
    else if (currentX < -80) { setFlyOut('left'); handleSwipe('left'); }
    else setCurrentX(0);
  };
  const onMouseDown = (e) => { setIsDragging(true); setStartX(e.clientX); };
  const onMouseMove = (e) => { if (!isDragging) return; setCurrentX(e.clientX - startX); };
  const onMouseUp = () => {
    setIsDragging(false);
    if (currentX > 80) { setFlyOut('right'); handleSwipe('right'); }
    else if (currentX < -80) { setFlyOut('left'); handleSwipe('left'); }
    else setCurrentX(0);
  };

  const box1Count = Object.values(boxes).filter(b => b === 1).length;
  const progress = sprint.length > 0 ? sprintIdx / SPRINT_SIZE : 0;
  const sprintCorrect = sprintResults.filter(r => r.knew).length;
  const hardCards = sprintResults.filter(r => !r.knew).map(r => r.q);

  // Weakness by category
  const weaknessByCategory = {};
  hardCards.forEach(q => {
    const cat = q.category || '其他知識';
    weaknessByCategory[cat] = (weaknessByCategory[cat] || 0) + 1;
  });
  const topWeakness = Object.entries(weaknessByCategory).sort((a,b) => b[1]-a[1])[0];

  // --- SPRINT DONE SCREEN ---
  if (phase === 'sprint_done') {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
        <Trophy size={56} color="var(--accent-gold)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem', fontSize: '1.8rem' }}>衝刺完成！</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>
          ⚡ 今日累積：<strong style={{ color: 'var(--accent-gold)' }}>{todayCount} 題</strong>
        </p>

        {/* Score ring */}
        <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '1.5rem' }}>
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none"
              stroke={sprintCorrect >= SPRINT_SIZE * 0.8 ? 'var(--accent-green)' : sprintCorrect >= SPRINT_SIZE * 0.5 ? 'var(--accent-gold)' : 'var(--accent-red)'}
              strokeWidth="10"
              strokeDasharray={`${(sprintCorrect / SPRINT_SIZE) * 327} 327`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)' }}>{sprintCorrect}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ {SPRINT_SIZE}</span>
          </div>
        </div>

        {/* Weakness Analysis */}
        {hardCards.length > 0 && (
          <div style={{ width: '100%', maxWidth: '480px', marginBottom: '1.5rem', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '14px', padding: '1.2rem' }}>
            <h3 style={{ color: 'var(--accent-red)', marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} /> 分析完成！你的弱點集中在……
            </h3>
            {/* Category bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
              {Object.entries(weaknessByCategory).sort((a,b)=>b[1]-a[1]).map(([cat, count]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '0.85rem' }}>
                    <span>{CAT_EMOJI[cat]||'📌'} {cat}</span>
                    <span style={{ color: 'var(--accent-red)', fontWeight: '700' }}>{count} 題錯</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px' }}>
                    <div style={{ height: '100%', borderRadius: '4px', background: 'var(--accent-red)', width: `${(count/hardCards.length)*100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Personalized CTA */}
            {topWeakness && (
              <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '0.9rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
                <strong style={{ color: 'var(--accent-gold)' }}>🎯 AI 建議：</strong>
                {topWeakness[0] === '節日習俗' && '你對「節日習俗」類題目尚需加強。這類題常出現節日名稱與對應糕餅，建議到「防呆寶典」過濾節日類陷阱題！'}
                {topWeakness[0] === '製作工法' && '你對「製作工法」尚有混淆。記住：工法題常考「步驟順序」與「操作目的」，多看幾遍就能大幅提升！'}
                {topWeakness[0] === '食材知識' && '你對「食材知識」還很模糊。建議專攻「食材類」陷阱題，到防呆寶典中找到對應題目反覆練習！'}
                {topWeakness[0] === '百年老店歷史' && '你對「店鋪歷史」類題目較弱。這類題只需記住「人名」與「特色產品」，再刷一次就能大幅提升！'}
                {(topWeakness[0] === '其他知識' || !['節日習俗','製作工法','食材知識','百年老店歷史'].includes(topWeakness[0])) && '這些題目還需加強！建議再刷一次，加深印象。'}
              </div>
            )}
          </div>
        )}

        {/* Wrong cards quick review */}
        {hardCards.length > 0 && (
          <div style={{ width: '100%', maxWidth: '480px', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.8rem', fontSize: '0.9rem' }}>本輪答錯（必考重點）</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {hardCards.map((q, i) => (
                <div key={i} style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: '10px', padding: '1rem' }}>
                  {q.needs_review && (
                    <div style={{ background: 'rgba(230,180,0,0.15)', border: '1px solid rgba(230,180,0,0.4)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', color: '#f0c040', marginBottom: '0.5rem' }}>
                      ⚠️ 此題疑似有 OCR 掃描誤差，可能題意不明穌
                    </div>
                  )}
                  <p style={{ fontSize: '0.88rem', fontWeight: '600', marginBottom: '0.4rem', lineHeight: '1.5' }}>{q.question}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginBottom: '0.3rem' }}>
                    ✅ 正確答案：{q.type === 'tf' ? (q.answer ? 'O (正確)' : 'X (錯誤)') : q.options?.[q.answer]}
                  </p>
                  {q.explanation && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.4rem' }}>
                      {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '480px' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => buildSprint(allQs, boxes)}>
            <Zap size={20} /> 再來一輪（10 題）
          </button>
          <button className="btn-secondary" style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => {
              const r = {}; allQs.forEach(q => r[q.id] = 1); saveBoxes(r);
              const empty = new Set(); setSeenIds(empty);
              localStorage.removeItem('pastry_seen_ids');
              buildSprint(allQs, r, empty);
            }}>
            <RefreshCw size={18} /> 重置記憶箱，從頭開始
          </button>
        </div>
      </div>
    );
  }

  // --- CARD SCREEN ---
  return (
    <div className="page-container swipe-mode-container" style={{ overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.2rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
          <h1 style={{ color: 'var(--accent-gold)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <Zap size={22} /> 極限滑動刷題
          </h1>
          <span style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid var(--accent-gold)', borderRadius: '20px', padding: '2px 12px', fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700' }}>
            ⚡ {todayCount} 題
          </span>
        </div>
        
        {/* Category Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: '460px', margin: '0 auto 0.5rem auto' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                color: selectedCategory === cat ? '#000' : 'var(--text-secondary)',
                border: `1px solid ${selectedCategory === cat ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '16px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: selectedCategory === cat ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {CAT_EMOJI[cat]} {cat}
            </button>
          ))}
        </div>
        <div className="desktop-hint" style={{ display: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          ⌨️ <strong>← / →</strong> 方向鍵判定・<strong>Space</strong> 看答案
        </div>
      </div>

      {/* Sprint Progress Bar */}
      <div style={{ maxWidth: '460px', margin: '0 auto', width: '100%', marginBottom: '1rem', flexShrink: 0 }}>
        {/* Coverage bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>題庫涵蓋率</span>
          <span style={{ fontSize: '0.75rem', color: seenIds.size >= allQs.length ? 'var(--accent-green)' : 'var(--accent-gold)', fontWeight: '700' }}>
            {seenIds.size} / {allQs.length} 題
            {seenIds.size >= allQs.length && ' ✅全學過了！'}
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', height: '5px', overflow: 'hidden', marginBottom: '10px' }}>
          <div style={{ height: '100%', borderRadius: '6px', background: seenIds.size >= allQs.length ? 'var(--accent-green)' : 'linear-gradient(90deg, #27ae60, #2ecc71)', width: `${allQs.length > 0 ? (seenIds.size / allQs.length) * 100 : 0}%`, transition: 'width 0.5s ease' }} />
        </div>
        {/* Sprint progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>本輪進度</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700' }}>{sprintIdx} / {SPRINT_SIZE}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '8px', background: 'linear-gradient(90deg, var(--accent-gold), #f1c40f)', width: `${progress * 100}%`, transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-green)' }}>✓ {sprintResults.filter(r => r.knew).length} 會了</span>
          <span style={{ color: 'var(--accent-red)' }}>✗ {sprintResults.filter(r => !r.knew).length} 不會</span>
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', maxWidth: '460px', margin: '0 auto', width: '100%', position: 'relative' }}>
        {currentCard ? (
          <div
            className={`swipe-card ${flyOut ? 'fly-' + flyOut : ''}`}
            style={{
              transform: `translate3d(${currentX}px, 0, 0) rotate(${currentX * 0.04}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
              width: '100%',
              minHeight: '320px',
              maxHeight: 'calc(100dvh - 240px)',
              background: `linear-gradient(to bottom, rgba(18,18,18,0.4) 0%, rgba(18,18,18,0.85) 100%), url(${currentCard && getPastryImage(currentCard.question + (currentCard.explanation || '')) ? getPastryImage(currentCard.question + (currentCard.explanation || '')) : './images/default.png'}) center/cover no-repeat`,
              border: '1px solid var(--glass-border)',
              borderRadius: '18px',
              padding: '1.5rem',
              boxShadow: 'var(--glass-shadow)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              userSelect: 'none',
              touchAction: 'pan-y',
              overflowY: 'auto',
              willChange: 'transform',
            }}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          >

            {/* Category badge */}
            {currentCard.category && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '2px 10px', fontSize: '0.72rem', color: 'var(--accent-gold)', marginBottom: '0.75rem', alignSelf: 'flex-start' }}>
                {CAT_EMOJI[currentCard.category] || '📌'} {currentCard.category}
              </div>
            )}
            <GraphicScaffolding text={currentCard.question} />
            <p style={{ fontSize: '1.25rem', lineHeight: 1.6, fontWeight: '600', marginBottom: '1rem', flex: 1, zIndex: 1 }}>
              <HighlightText text={currentCard.question} keywords={pastryKeywords} />
            </p>

            {!showAnswer ? (
              <div style={{ marginTop: 'auto' }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '0.9rem', justifyContent: 'center', marginBottom: '1rem' }}
                  onClick={(e) => { e.stopPropagation(); setShowAnswer(true); }}>
                  <BookOpen size={16} style={{ marginRight: '6px' }} /> 看答案
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent-red)' }}>← 不會</span>
                  <span style={{ color: 'var(--accent-green)' }}>會了 →</span>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '10px', padding: '1rem', marginTop: 'auto' }}>
                <p style={{ color: 'var(--accent-gold)', fontWeight: '700', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
                  ✅ 答案：{currentCard.type === 'tf' ? (currentCard.answer ? 'O (正確)' : 'X (錯誤)') : currentCard.options[currentCard.answer]}
                </p>
                {currentCard.mnemonic && (
                  <div style={{ background: 'rgba(212,175,55,0.15)', borderLeft: '3px solid var(--accent-gold)', padding: '0.6rem', margin: '0.6rem 0', borderRadius: '0 4px 4px 0' }}>
                    <p style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.95rem' }}>{currentCard.mnemonic}</p>
                  </div>
                )}
                {currentCard.explanation && <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{currentCard.explanation}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem', fontWeight: '700' }}>
                  <span style={{ color: 'var(--accent-red)' }}>← 還不熟</span>
                  <span style={{ color: 'var(--accent-green)' }}>記住了 →</span>
                </div>
              </div>
            )}

            {/* Swipe overlays */}
            <div style={{ position: 'absolute', top: '12%', right: '8%', padding: '6px 14px', border: '3px solid var(--accent-green)', color: 'var(--accent-green)', borderRadius: '8px', fontWeight: '900', fontSize: '1.4rem', transform: 'rotate(12deg)', opacity: currentX > 40 ? Math.min(currentX / 80, 1) : 0, pointerEvents: 'none' }}>會</div>
            <div style={{ position: 'absolute', top: '12%', left: '8%', padding: '6px 14px', border: '3px solid var(--accent-red)', color: 'var(--accent-red)', borderRadius: '8px', fontWeight: '900', fontSize: '1.4rem', transform: 'rotate(-12deg)', opacity: currentX < -40 ? Math.min(Math.abs(currentX) / 80, 1) : 0, pointerEvents: 'none' }}>不會</div>
          </div>
        ) : (
          <div style={{ color: 'var(--accent-gold)', textAlign: 'center', paddingTop: '4rem' }}>
            <RefreshCw size={40} style={{ marginBottom: '1rem' }} />
            <p>準備卡片中...</p>
          </div>
        )}
      </div>

      {/* Wrong Answer Flash Overlay — shown for 1.8s after swiping left */}
      {wrongFlash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          background: 'rgba(180, 30, 30, 0.92)',
          backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '2rem',
          animation: 'fadeInOut 2.5s ease forwards',
          pointerEvents: 'none',
        }}>
          {wrongFlash.keyword && (
            <div className="crit-blast" style={{ position: 'absolute', top: '15%', color: 'var(--accent-gold)', fontSize: '4.5rem', fontWeight: '900', zIndex: 9991 }}>
              {wrongFlash.keyword}
            </div>
          )}
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>正確答案是</div>
          <div style={{ color: '#f1c40f', fontSize: '1.6rem', fontWeight: '900', textAlign: 'center', marginBottom: '1rem', lineHeight: 1.4 }}>
            {wrongFlash.answer}
          </div>
          {wrongFlash.mnemonic ? (
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid var(--accent-gold)', maxWidth: '320px' }}>
              <div style={{ color: 'var(--accent-gold)', fontSize: '0.95rem', fontWeight: '700', textAlign: 'center', lineHeight: 1.5 }}>
                {wrongFlash.mnemonic}
              </div>
            </div>
          ) : wrongFlash.explanation && (
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', textAlign: 'center', maxWidth: '320px', lineHeight: 1.6 }}>
              {wrongFlash.explanation.slice(0, 60)}{wrongFlash.explanation.length > 60 ? '…' : ''}
            </div>
          )}
        </div>
      )}
      {/* Zeigarnik Bottom Drawer */}
      <div
        style={{
          position: 'fixed', left: 0, bottom: 0, width: '100%', height: '60vh',
          background: 'rgba(18,18,18,0.97)', backdropFilter: 'blur(20px)',
          borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
          borderTop: '1px solid var(--accent-red)',
          transform: drawerOpen ? 'translateY(0)' : 'translateY(calc(100% - 48px))',
          transition: 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
          zIndex: 998, display: 'flex', flexDirection: 'column',
        }}
      >
        <div onClick={() => setDrawerOpen(!drawerOpen)} style={{ height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', gap: '8px', color: box1Count === 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '700', fontSize: '0.9rem', position: 'relative' }}>
          <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.25)', borderRadius: '2px', position: 'absolute', top: '8px' }} />
          <AlertTriangle size={16} />
          {box1Count === 0 ? '🎉 恭喜！「還不熟」題庫已全部清空！' : `還有 ${box1Count} 題在「還不熟」題庫（${Math.round(box1Count / (allQs.length || 1) * 100)}% 陷阱未破）`}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem 1.5rem' }}>
          {box1Count === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '2rem', color: 'var(--accent-green)' }}>
              <Zap size={40} style={{ marginBottom: '1rem' }} />
              <h3>全部記住了！</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>可以去「模擬考場」做最終測試了！</p>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>「還不熟」題目（會被優先抽出）：</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {allQs.filter(q => boxes[q.id] === 1).slice(0, 12).map((q, i) => (
                  <div key={i} style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <strong>{q.question}</strong>
                  </div>
                ))}
                {box1Count > 12 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>...以及另外 {box1Count - 12} 題</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Unlock Toast overlay */}
      {unlockToast && (
        <div className="unlock-toast">
          <span>🎉 解鎖圖鑑：</span>
          <span style={{ color: '#fff' }}>{unlockToast}</span>
        </div>
      )}
    </div>
  );
};

export default SwipeMode;

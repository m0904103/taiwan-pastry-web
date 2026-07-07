import React, { useState } from 'react';
import { Book, Image as ImageIcon } from 'lucide-react';

const glossaryData = [
  {
    category: '🏮 神明祭祀',
    items: [
      { name: '平安龜', desc: '以鳳片粉或花生糖製成，通常用於「乞龜與還龜」還願，祈求平安。' },
      { name: '繼光餅', desc: '中間有洞可串起，源自明朝戚繼光軍糧，帶有「白芝麻」，口感鹹香。' },
      { name: '艾草粿', desc: '祭祀祖先、清明掃墓時常見的糕點。' },
      { name: '中元祭品', desc: '中元節普渡常出現「芋粿巧、辟桃、摩訶」。' }
    ]
  },
  {
    category: '👶 生命禮俗',
    items: [
      { name: '收涎餅', desc: '嬰兒滿「四個月」時掛在脖子上，用來收口水。' },
      { name: '彌月糕餅', desc: '嬰兒滿月時贈送親友，常送「紅龜粿」代表長壽。' },
      { name: '歸寧米糕', desc: '結婚後由「女方」準備帶回男方家，祝福兩人如膠似漆。' },
      { name: '四色糖', desc: '訂婚（文定）時女方準備，象徵甜甜蜜蜜。' }
    ]
  },
  {
    category: '🍡 地方特色與老店',
    items: [
      { name: '肚臍餅', desc: '客家特產，中間凹陷像肚臍，是用「烤箱」烤出來的。' },
      { name: '牛汶水', desc: '客家麻糬甜湯，用「水煮」而成，像牛泡在水裡避暑。' },
      { name: '冰沙餅 (平西餅)', desc: '白豆沙經過「水飛」沉澱，口感細緻冰涼，是用烤的。' },
      { name: '茯苓糕', desc: '相傳慈禧太后愛吃，能治胸悶，也是大稻埕的名產。' },
      { name: '李亭香', desc: '大稻埕百年老店，招牌是「平安龜」與各式傳統糕餅。' },
      { name: '十字軒', desc: '大稻埕老店，專門製作文定、收涎等禮俗所需的漢餅。' },
      { name: '太陽餅', desc: '發源於「台中」，傳統內餡為麥芽糖。' }
    ]
  }
];

const GlossaryMode = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="header-with-search" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Book size={28} /> 30秒糕餅速查圖鑑
        </h1>
        <p className="subtitle" style={{ marginTop: '0.5rem', opacity: 0.8 }}>
          刷題前先花30秒看過，幫大腦建立記憶抽屜！
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {glossaryData.map((cat, idx) => (
          <button
            key={idx}
            className={`btn-secondary ${activeTab === idx ? 'active' : ''}`}
            style={{
              padding: '0.6rem 1.2rem',
              background: activeTab === idx ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
              color: activeTab === idx ? '#000' : 'var(--text-primary)',
              border: activeTab === idx ? 'none' : '1px solid rgba(255,255,255,0.1)',
              fontWeight: activeTab === idx ? 'bold' : 'normal'
            }}
            onClick={() => setActiveTab(idx)}
          >
            {cat.category}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
        {glossaryData[activeTab].items.map((item, idx) => {
          return (
            <div key={idx} style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--accent-gold)',
              borderRadius: '12px',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'transform 0.2s',
              cursor: 'default',
              opacity: 1,
              filter: 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '1.1rem', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '0.5rem' }}>
                <ImageIcon size={18} /> 
                {item.name}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ color: 'var(--accent-green)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          大腦已經建立好基模了嗎？
        </p>
        <a href="#/swipe" className="btn-primary" style={{ display: 'inline-flex', padding: '0.8rem 2rem', textDecoration: 'none' }}>
          前往極限滑動刷題 ⚡
        </a>
      </div>
    </div>
  );
};

export default GlossaryMode;

import React, { useState } from 'react';
import { Book, Image as ImageIcon } from 'lucide-react';

const glossaryData = [
  {
    category: '🏮 神明祭祀',
    items: [
      { name: '平安龜（鳳片龜）', desc: '以「鳳片粉」製成龜形，用於「乞龜與還龜」還願，祈求平安。李亭香百年老店的招牌。' },
      { name: '繼光餅', desc: '源自明朝戚繼光將軍的行軍乾糧，中間有洞，表面沾「白芝麻」，口感鹹香耐放。' },
      { name: '艾草粿', desc: '用於「中元節、清明祭祖」。外皮含艾草粉（皮的材料），呈現綠色。' },
      { name: '芋粿巧', desc: '中元節普渡桌上的常見糕點之一，以芋頭製成。' },
      { name: '紅龜粿', desc: '紅色外皮（可用「紅麴」代替紅色素）、龜形，是生命禮俗常見的祭品，象徵長壽。' },
    ]
  },
  {
    category: '👶 生命禮俗',
    items: [
      { name: '湯餅之喜', desc: '新生兒誕生，宴請親友分贈吉祥大餅，稱為「湯餅之喜」。' },
      { name: '收涎餅', desc: '嬰兒滿「四個月」時舉行，將小餅掛於嬰兒脖子上，祈求平安長大。注意：不是滿月！' },
      { name: '米香餅（喜餅）', desc: '台語「吃米香，嫁好尪」，有婚姻幸福的吉祥意。相傳喜餅由「諸葛孔明」所發明。' },
      { name: '芝麻喜餅', desc: '結婚時的大型喜餅，包餡前須將餡料「冷藏凝固」以方便包餡（不是防爆餡、不是保鮮）。' },
      { name: '歸寧米糕', desc: '結婚後由「女方」準備帶回男方家。材料含「桂圓（龍眼乾）」，祝福感情如膠似漆。' },
      { name: '綠豆椪', desc: '台式月餅代表，外皮雪白膨起。傳統內餡：「綠豆沙＋肉燥」。製法：「小包酥」。豐原雪花齋的招牌。' },
    ]
  },
  {
    category: '🎑 節日應景',
    items: [
      { name: '甜年糕', desc: '過年必備。相傳「伍子胥」憂國憂民而發明。主粉料：「糯米粉」。筷子插入無米漿即熟。' },
      { name: '發糕', desc: '年節必吃，諧音「發財高升」。加「泡打粉」才能發。判斷熟透：筷子插入無米漿。' },
      { name: '九層粄（重陽糕）', desc: '重陽節應時糕點，黑白相間來自「黑糖」，以「蒸」熟成，重陽節會在糕上插小旗子象徵步步高升。' },
      { name: '綠豆糕', desc: '⚠️陷阱題！「端午節」應時是「綠豆糕」，不是綠豆椪！傳說具有驅瘟解毒功能。' },
      { name: '牛舌餅', desc: '形狀像牛舌，相傳為「荷蘭人」所留下，又稱「番王餅」。軟式內餡含「麥芽糖」。' },
      { name: '客家糍粑', desc: '客家人發明，口感黏Q。做好吃不完以「冷凍」保存，食用時自然解凍即可（不是冷藏）。' },
    ]
  },
  {
    category: '🍡 地方特色老店',
    items: [
      { name: '太陽餅', desc: '台中著名特產。餡料製作時須加「熟麵粉」幫助凝結成糰（不是為了增加酥脆）。' },
      { name: '方塊酥', desc: '由「黨長發」先生發明，口感酥脆方正。採「大包酥」手法製作。' },
      { name: '奶油酥餅', desc: '大甲名產，由「陳基振」先生改良發明。水油皮用「奶油」。烘烤前在餅上「戳兩個小洞」防爆餡。' },
      { name: '芋頭酥', desc: '大甲「芋頭產量過剩」而誕生的名產。採「大包酥」手法製作餅皮。' },
      { name: '黑糖糕', desc: '澎湖名產，改良自日治時期「琉球人」的琉球糕，由「陳克昌」所創。粉料：「樹薯粉＋低筋麵粉」，以「蒸」熟成。' },
      { name: '花蓮薯', desc: '花蓮著名伴手禮，日據時期的產物。正確口感應是「蓬鬆」（不是Q彈！）。' },
      { name: '肚臍餅', desc: '客家特產，中間凹陷像肚臍。內餡：「地瓜＋綠豆沙」。熟成方式：「烤箱」（不是蒸！）。' },
      { name: '茯苓糕', desc: '相傳「慈禧太后」愛吃（不是武則天！），能治胸悶。以「蒸」製成，口感鬆軟。' },
      { name: '冰沙餅（平西餅）', desc: '白豆沙經「水飛」工法過濾雜質。餅皮採「小包酥」。以「烤」熟成（不是蒸）。' },
      { name: '鳳梨酥', desc: '由「台中師傅顏瓶」改良自鳳梨大餅而來。餅皮用「奶油」。餡不夠酸加「檸檬汁」；熬煮時加「玉米粉」幫助凝結。' },
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

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PenTool, CheckSquare, Coffee } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero">
        <div className="hero-content">
          <h1>台灣傳統糕餅文化與創新</h1>
          <p className="subtitle">傳承百年手藝，品味文化底蘊</p>
          <div className="hero-decoration">
            <Coffee size={48} className="icon-gold" />
          </div>
        </div>
      </header>

      

      <section className="features-grid">
        <Link to="/quiz" className="feature-card">
          <div className="icon-wrapper">
            <CheckSquare size={32} />
          </div>
          <h2>模擬測驗</h2>
          <p>是非題與選擇題互動測驗，幫助您快速檢驗學習成果與盲點。</p>
        </Link>

        <Link to="/cheatsheet" className="feature-card">
          <div className="icon-wrapper">
            <CheckSquare size={32} />
          </div>
          <h2>開卷防呆寶典</h2>
          <p>獨家神級寶典，將歷屆考題轉化為白話情境對照表，考試翻書零壓力。</p>
        </Link>

        <Link to="/glossary" className="feature-card" style={{ borderTop: '3px solid var(--accent-green)' }}>
          <div className="icon-wrapper">
            <BookOpen size={32} color="var(--accent-green)" />
          </div>
          <h2>30秒糕餅速查圖鑑</h2>
          <p>刷題前先花 30 秒看過三大分類圖鑑，幫大腦建立記憶抽屜，不再死記硬背。</p>
        </Link>

        <Link to="/essay" className="feature-card">
          <div className="icon-wrapper">
            <PenTool size={32} />
          </div>
          <h2>問答題起手式</h2>
          <p>掌握問答題高分關鍵，提供完整答題模板與實作心得範例。</p>
        </Link>
      </section>

      <footer className="footer">
        <p>國立空中大學 115學年度暑學期 • 通識博雅教育中心</p>
      </footer>
    </div>
  );
};

export default Home;

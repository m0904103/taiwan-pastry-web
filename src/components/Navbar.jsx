import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar ${isHome ? 'navbar-transparent' : 'navbar-solid'}`}>
      <div className="nav-brand">
        <Link to="/">糕餅文化學堂</Link>
      </div>
      <div className="nav-links">
        <Link to="/swipe" className={location.pathname === '/swipe' ? 'active' : ''} style={{color: 'var(--accent-gold)'}}>極限滑動刷題</Link>
        <Link to="/glossary" className={location.pathname === '/glossary' ? 'active' : ''} style={{color: 'var(--accent-green)'}}>糕餅圖鑑</Link>
        <Link to="/quiz" className={location.pathname === '/quiz' ? 'active' : ''}>模擬考場</Link>
        <Link to="/cheatsheet" className={location.pathname === '/cheatsheet' ? 'active' : ''}>防呆寶典</Link>
        <Link to="/essay" className={location.pathname === '/essay' ? 'active' : ''}>申論起手式</Link>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import QuizMode from './components/QuizMode';
import CheatSheetMode from './components/CheatSheetMode';
import EssayMode from './components/EssayMode';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<QuizMode />} />
            <Route path="/cheatsheet" element={<CheatSheetMode />} />
            <Route path="/essay" element={<EssayMode />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

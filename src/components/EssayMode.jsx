import React, { useState, useRef, useEffect } from 'react';
import { Lightbulb, Edit3, CheckCircle2 } from 'lucide-react';
import questionsData from '../data/questions.json';
import './EssayMode.css'; // We'll need some CSS

const ClozeReveal = ({ answer }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (isRevealed) {
    return <span className="cloze-correct">{answer}</span>;
  }

  return (
    <span className="cloze-wrapper">
      <button 
        className="cloze-button" 
        onClick={() => setIsRevealed(true)}
        title="在心裡默唸答案後點擊翻牌"
      >
        點擊看解答
      </button>
    </span>
  );
};

const ClozeParagraph = ({ text }) => {
  const parts = [];
  const regex = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'cloze', answer: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return (
    <div className="cloze-text">
      {parts.map((p, i) => {
        if (p.type === 'text') {
          return (
            <span key={i}>
              {p.content.split('\n').map((line, j, arr) => (
                <React.Fragment key={j}>
                  {line}
                  {j < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </span>
          );
        }
        return (
          <ClozeReveal 
            key={i} 
            answer={p.answer} 
          />
        );
      })}
    </div>
  );
};

const PracticeArea = () => {
  const [essayText, setEssayText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="textarea-wrapper">
      <div 
        className={`experience-prompt ${isFocused ? 'focused' : ''}`}
        aria-hidden="true"
      >
        <span className="prompt-indicator"></span>
        💡 試著寫下「你上次吃」或「阿嬤買給你的」故事吧！
      </div>

      <textarea
        className="essay-textarea"
        placeholder="開始撰寫你的糕餅記憶..."
        value={essayText}
        onChange={(e) => setEssayText(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="申論題作答區塊"
      />
    </div>
  );
};

const EssayMode = () => {
  const essays = questionsData.essays;
  const [mode, setMode] = useState('cloze'); // 'cloze' or 'read'

  return (
    <div className="page-container">
      <div className="header-with-icon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>問答題起手式與防禦陣型</h1>
          <p className="subtitle">克漏字提取練習，破除流暢度錯覺，考場絕不腦袋空白！</p>
        </div>
        <div>
          <button 
            className={`btn-secondary ${mode === 'cloze' ? 'active' : ''}`} 
            onClick={() => setMode('cloze')}
            style={{ marginRight: '10px' }}
          >
            <Edit3 size={18} /> 填空練習
          </button>
          <button 
            className={`btn-secondary ${mode === 'read' ? 'active' : ''}`} 
            onClick={() => setMode('read')}
          >
            <CheckCircle2 size={18} /> 完整閱讀
          </button>
        </div>
      </div>

      <div className="essay-container">
        {essays.map((essay, idx) => (
          <div key={essay.id} className="essay-card">
            <div className="essay-question">
              <span className="q-number">Q{idx + 1}.</span>
              <h3>{essay.question}</h3>
            </div>
            
            <div className="essay-tips">
              <strong>💡 答題重點提示 (防禦陣型)：</strong>
              <p>{essay.tips}</p>
            </div>

            <div className="essay-answer">
              <div className="answer-header">
                <strong>▶ 起手式與範例解答：</strong>
              </div>
              <div className="answer-content">
                {mode === 'read' ? (
                  essay.example_answer.split('\n').map((line, i) => (
                    <p key={i}>{line.replace(/\{([^}]+)\}/g, '$1')}</p>
                  ))
                ) : (
                  <ClozeParagraph text={essay.example_answer} />
                )}
              </div>
            </div>

            {/* 自我練習區塊 */}
            <div className="essay-practice-section" style={{ marginTop: '2rem', borderTop: '1px dashed #e0e0e0', paddingTop: '1rem' }}>
              <div className="answer-header" style={{ color: '#795548' }}>
                <strong>✍️ 換你試試看 (防呆草稿區)：</strong>
              </div>
              <PracticeArea />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EssayMode;

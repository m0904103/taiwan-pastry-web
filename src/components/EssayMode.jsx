import React from 'react';
import questionsData from '../data/questions.json';

const EssayMode = () => {
  const essays = questionsData.essays;

  return (
    <div className="page-container">
      <div className="header-with-icon">
        <h1>問答題起手式與防禦陣型</h1>
        <p className="subtitle">讓老師覺得您很有邏輯，輕鬆拿滿基本分</p>
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
                {essay.example_answer.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EssayMode;

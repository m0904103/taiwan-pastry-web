import React, { useState } from 'react';
import questionsData from '../data/questions.json';
import { Search } from 'lucide-react';

const CheatSheetMode = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyTraps, setShowOnlyTraps] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const categories = ['全部', '節日習俗', '製作工法', '食材知識', '百年老店歷史', '其他知識'];

  // Combine TF and MC for the cheat sheet
  const allQuestions = [
    ...questionsData.true_false.map(q => ({
      ...q,
      type: '是非題',
      formattedAnswer: q.answer ? 'O' : 'X',
      trap: !q.answer ? '注意陷阱敘述' : ''
    })),
    ...questionsData.multiple_choice.map(q => ({
      ...q,
      type: '選擇題',
      formattedAnswer: q.options[q.answer]
    }))
  ];

  const filteredQuestions = allQuestions.filter(q => {
    if (showOnlyTraps && !q.trap) return false;
    if (selectedCategory !== '全部' && q.category !== selectedCategory) {
      if (selectedCategory === '其他知識' && !['節日習俗', '製作工法', '食材知識', '百年老店歷史'].includes(q.category)) {
        // pass
      } else {
        return false;
      }
    }
    
    return q.question.includes(searchTerm) || 
           q.explanation.includes(searchTerm) ||
           (q.formattedAnswer && q.formattedAnswer.toString().includes(searchTerm));
  });

  return (
    <div className="page-container">
      <div className="header-with-search">
        <div>
          <h1>開卷防呆寶典</h1>
          <p className="subtitle">考場實戰秒殺寶典，白話情境對照表</p>
        </div>
        <div className="cheatsheet-controls" style={{display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap'}}>
          <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--accent-red)'}}>
            <input 
              type="checkbox" 
              checked={showOnlyTraps}
              onChange={(e) => setShowOnlyTraps(e.target.checked)}
            />
            <strong>只看陷阱題</strong>
          </label>
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="搜尋關鍵字 (例：肚臍餅...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn-secondary ${selectedCategory === cat ? 'active' : ''}`}
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.9rem',
              background: selectedCategory === cat ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
              color: selectedCategory === cat ? '#000' : 'var(--text-primary)',
              border: selectedCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="cheatsheet-table-container">
        <table className="cheatsheet-table">
          <thead>
            <tr>
              <th width="10%">題型</th>
              <th width="40%">考卷上的完整題目敘述</th>
              <th width="20%">正確答案</th>
              <th width="30%">課本正確觀念 (詳解)</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(q => (
                <tr key={q.id}>
                  <td>
                    <span className={`tag ${q.type === '是非題' ? 'tag-tf' : 'tag-mc'}`}>
                      {q.type}
                    </span>
                  </td>
                  <td className="q-text">
                    {q.trap && <span className="trap-warning">[⚠陷阱敘述] </span>}
                    {q.question}
                  </td>
                  <td className="q-answer"><strong>{q.formattedAnswer}</strong></td>
                  <td className="q-explanation">{q.explanation}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4">找不到符合的考題</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheatSheetMode;

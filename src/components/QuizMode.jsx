import React, { useState, useEffect } from 'react';
import questionsData from '../data/questions.json';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Clock } from 'lucide-react';
import HighlightedText from './HighlightedText';

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
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };
  
  const now = ctx.currentTime;
  playNote(523.25, now, 0.2);       // C5
  playNote(659.25, now + 0.1, 0.2); // E5
  playNote(783.99, now + 0.2, 0.4); // G5
  playNote(1046.50, now + 0.3, 0.6); // C6
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
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };
  
  const now = ctx.currentTime;
  playBuzz(150, now, 0.3);
  playBuzz(100, now + 0.2, 0.4);
};

const QuizMode = () => {
  const [quizType, setQuizType] = useState('mixed');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]); // Track wrong answers

  useEffect(() => {
    startQuiz(quizType);
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [quizType]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !isFinished) {
      const id = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      setTimerInterval(id);
      return () => clearTimeout(id);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true); // Time's up
    }
  }, [timeLeft, isFinished]);

  const fisherYatesShuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = (type) => {
    let qList = [];
    if (type === 'tf' || type === 'mixed') {
      qList = [...qList, ...questionsData.true_false.map(q => ({...q, type: 'tf'}))];
    }
    if (type === 'mc' || type === 'mixed') {
      qList = [...qList, ...questionsData.multiple_choice.map(q => ({
        ...q, 
        type: 'mc',
        shuffledOptions: fisherYatesShuffle(q.options.map((opt, idx) => ({
          text: opt,
          originalIndex: idx,
          isCorrect: idx === q.answer
        })))
      }))];
    }
    if (type === 'mock') {
      const tfList = questionsData.true_false
        .map(q => ({...q, type: 'tf'}))
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
      const mcList = questionsData.multiple_choice
        .map(q => ({
          ...q, 
          type: 'mc',
          shuffledOptions: fisherYatesShuffle(q.options.map((opt, idx) => ({
            text: opt,
            originalIndex: idx,
            isCorrect: idx === q.answer
          })))
        }))
        .sort(() => Math.random() - 0.5)
        .slice(0, 15);
      qList = [...tfList, ...mcList].sort(() => Math.random() - 0.5);
      setTimeLeft(50 * 60);
    } else if (type === 'mistakes') {
      try {
        const boxes = JSON.parse(localStorage.getItem('pastry_leitner_boxes') || '{}');
        qList = qList.filter(q => boxes[q.id] === 1);
      } catch(e) {}
      qList = qList.sort(() => Math.random() - 0.5);
      setTimeLeft(null);
      if (qList.length === 0) {
        alert("恭喜！目前沒有錯題紀錄。為您自動切換至綜合測驗！");
        setQuizType('mixed');
        return; // handle next render
      }
    } else {
      qList = qList.sort(() => Math.random() - 0.5);
      setTimeLeft(null);
    }
    setQuestions(qList);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);
    setWrongAnswers([]);
  };

  const handleAnswer = (answer) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
    setShowExplanation(true);
    const q = questions[currentIndex];
    
    let isCorrect = false;
    if (q.type === 'tf') {
      isCorrect = answer === q.answer;
    } else {
      isCorrect = answer.isCorrect;
    }

    if (isCorrect) {
      setScore(score + 1);
      playCorrectSound();
      
      // Update Leitner box to 2 (correct) if in mistakes mode, or just don't touch it.
      // But actually it's better to always mark as correct (move up a box)
      try {
        let boxes = JSON.parse(localStorage.getItem('pastry_leitner_boxes') || '{}');
        if (boxes[q.id] === 1) {
           boxes[q.id] = 2; // Move out of box 1
           localStorage.setItem('pastry_leitner_boxes', JSON.stringify(boxes));
        }
      } catch(e) {}

    } else {
      playWrongSound();
      setWrongAnswers(prev => [...prev, { q, userAnswer: answer }]);

      // Save to wrong answers (Box 1)
      try {
        let boxes = JSON.parse(localStorage.getItem('pastry_leitner_boxes') || '{}');
        boxes[q.id] = 1;
        localStorage.setItem('pastry_leitner_boxes', JSON.stringify(boxes));
      } catch(e) {}
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0) return <div>Loading...</div>;

  const currentQ = questions[currentIndex];

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container">
      <div className="quiz-header">
        <h1>{quizType === 'mock' ? '期末考模擬考場' : quizType === 'mistakes' ? '📝 考前錯題本專攻' : '模擬測驗'}</h1>
        <div className="quiz-controls">
          <select value={quizType} onChange={(e) => setQuizType(e.target.value)} className="select-input">
            <option value="mixed">綜合測驗 (是非+選擇)</option>
            <option value="tf">是非題特訓</option>
            <option value="mc">選擇題特訓</option>
            <option value="mock">🔥 滿分模擬考 (25題/50分)</option>
            <option value="mistakes">📝 考前錯題本專攻</option>
          </select>
          <button className="btn-secondary" onClick={() => startQuiz(quizType)}>
            <RotateCcw size={18} /> 重新開始
          </button>
        </div>
      </div>

      {!isFinished ? (
        <div className="quiz-card">
          <div className="quiz-progress">
            <span>第 {currentIndex + 1} 題 / 共 {questions.length} 題</span>
            {timeLeft !== null && (
              <span className={`timer ${timeLeft < 300 ? 'timer-warning' : ''}`}>
                <Clock size={18} style={{marginRight: '5px', verticalAlign: 'middle'}}/>
                {formatTime(timeLeft)}
              </span>
            )}
            <span>目前得分：{score}</span>
          </div>
          
          <div className="question-text">
            <span className="question-type">
              [{currentQ.type === 'tf' ? '是非題' : '選擇題'}]
            </span>
            <HighlightedText text={currentQ.question} />
          </div>

          <div className="options-container">
            {currentQ.type === 'tf' ? (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <button
                  className={`option-btn tf-btn ${selectedAnswer === true ? (currentQ.answer === true ? 'correct' : 'wrong') : ''} ${showExplanation && currentQ.answer === true ? 'correct-reveal' : ''}`}
                  onClick={() => handleAnswer(true)}
                  disabled={showExplanation}
                  style={{ flex: 1, fontSize: '1.3rem', fontWeight: '900', padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                >
                  <span style={{ fontSize: '2rem' }}>✅</span>
                  O（正確）
                </button>
                <button
                  className={`option-btn tf-btn ${selectedAnswer === false ? (currentQ.answer === false ? 'correct' : 'wrong') : ''} ${showExplanation && currentQ.answer === false ? 'correct-reveal' : ''}`}
                  onClick={() => handleAnswer(false)}
                  disabled={showExplanation}
                  style={{ flex: 1, fontSize: '1.3rem', fontWeight: '900', padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                >
                  <span style={{ fontSize: '2rem' }}>❌</span>
                  X（錯誤）
                </button>
              </div>
            ) : (
              currentQ.shuffledOptions.map((opt, idx) => (
                <button 
                  key={idx}
                  className={`option-btn 
                    ${selectedAnswer?.originalIndex === opt.originalIndex ? (opt.isCorrect ? 'correct' : 'wrong') : ''} 
                    ${showExplanation && opt.isCorrect ? 'correct-reveal' : ''}`}
                  onClick={() => handleAnswer(opt)}
                  disabled={showExplanation}
                >
                  {opt.text}
                </button>
              ))
            )}
          </div>

          {showExplanation && (
            <div className={`explanation-box ${(currentQ.type === 'tf' ? selectedAnswer === currentQ.answer : selectedAnswer?.isCorrect) ? 'success' : 'error'}`}>
              <div className="explanation-header">
                {(currentQ.type === 'tf' ? selectedAnswer === currentQ.answer : selectedAnswer?.isCorrect) ? (
                  <><CheckCircle2 className="icon-success" /> 答對了！</>
                ) : (
                  <><XCircle className="icon-error" /> 答錯了！</>
                )}
              </div>
              <p><strong>詳解：</strong>{currentQ.explanation}</p>
              {currentQ.mnemonic && (
                <div style={{ background: 'rgba(212,175,55,0.15)', borderLeft: '3px solid var(--accent-gold)', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '0 4px 4px 0' }}>
                  <p style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.85rem' }}>{currentQ.mnemonic}</p>
                </div>
              )}
              <button className="btn-primary next-btn" onClick={nextQuestion} style={{ marginTop: '1rem' }}>
                {currentIndex < questions.length - 1 ? '下一題' : '查看成績'} <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="quiz-result-card">
          <h2>測驗結束 {timeLeft === 0 && '(時間到)'}</h2>
          <div className="score-display">
            <span className="score-number">{score}</span> / {questions.length}
          </div>
          <div style={{fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '1rem'}}>
            得分率: {Math.round((score / questions.length) * 100)}%
          </div>
          <p className="score-message">
            {score / questions.length >= 0.8 ? '太棒了！您已具備期末考滿分的實力！' : '再接再厲！請多利用防呆寶典複習！'}
          </p>
          <button className="btn-primary" style={{ marginBottom: '2rem' }} onClick={() => startQuiz(quizType)}>再測一次</button>

          {/* Wrong Answer Review Section */}
          {wrongAnswers.length > 0 && (
            <div style={{ width: '100%', textAlign: 'left' }}>
              <h3 style={{ color: 'var(--accent-red)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                ❌ 答錯的題目（{wrongAnswers.length} 題）— 必考重點！
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {wrongAnswers.map((item, i) => (
                  <div key={i} style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '12px', padding: '1rem' }}>
                    <p style={{ fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.5' }}>{item.q.question}</p>
                    <p style={{ color: 'var(--accent-red)', fontSize: '0.9rem' }}>
                      你的答案：{item.q.type === 'tf' ? (item.userAnswer ? 'O' : 'X') : item.userAnswer.text}
                    </p>
                    <p style={{ color: 'var(--accent-green)', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                      正確答案：{item.q.type === 'tf' ? (item.q.answer ? 'O (正確)' : 'X (錯誤)') : item.q.shuffledOptions.find(o => o.isCorrect).text}
                    </p>
                    {item.q.mnemonic && (
                      <div style={{ background: 'rgba(212,175,55,0.15)', borderLeft: '3px solid var(--accent-gold)', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '0 4px 4px 0' }}>
                        <p style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.85rem' }}>{item.q.mnemonic}</p>
                      </div>
                    )}
                    {item.q.explanation && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', lineHeight: '1.5' }}>
                        {item.q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {wrongAnswers.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--accent-green)', padding: '1rem' }}>
              🎉 全對！期末考滿分沒問題！
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizMode;

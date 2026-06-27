import React, { useState, useEffect } from 'react';
import questionsData from '../data/questions.json';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

const QuizMode = () => {
  const [quizType, setQuizType] = useState('mixed'); // 'mixed', 'tf', 'mc'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    startQuiz(quizType);
  }, [quizType]);

  const startQuiz = (type) => {
    let qList = [];
    if (type === 'tf' || type === 'mixed') {
      qList = [...qList, ...questionsData.true_false.map(q => ({...q, type: 'tf'}))];
    }
    if (type === 'mc' || type === 'mixed') {
      qList = [...qList, ...questionsData.multiple_choice.map(q => ({...q, type: 'mc'}))];
    }
    // Shuffle
    qList = qList.sort(() => Math.random() - 0.5);
    setQuestions(qList);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);
  };

  const handleAnswer = (answer) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (answer === questions[currentIndex].answer) {
      setScore(score + 1);
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

  return (
    <div className="page-container">
      <div className="quiz-header">
        <h1>模擬測驗</h1>
        <div className="quiz-controls">
          <select value={quizType} onChange={(e) => setQuizType(e.target.value)} className="select-input">
            <option value="mixed">綜合測驗 (是非+選擇)</option>
            <option value="tf">是非題特訓</option>
            <option value="mc">選擇題特訓</option>
          </select>
          <button className="btn-secondary" onClick={() => startQuiz(quizType)}>
            <RotateCcw size={18} /> 重新開始
          </button>
        </div>
      </div>

      {!isFinished ? (
        <div className="quiz-card">
          <div className="quiz-progress">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          
          <h2 className="question-text">
            <span className="question-type">{currentQ.type === 'tf' ? '[是非題]' : '[選擇題]'}</span>
            {currentQ.question}
          </h2>

          <div className="options-container">
            {currentQ.type === 'tf' ? (
              <>
                <button 
                  className={`option-btn ${selectedAnswer === true ? (currentQ.answer === true ? 'correct' : 'wrong') : ''} ${showExplanation && currentQ.answer === true ? 'correct-reveal' : ''}`}
                  onClick={() => handleAnswer(true)}
                  disabled={showExplanation}
                >
                  O (正確)
                </button>
                <button 
                  className={`option-btn ${selectedAnswer === false ? (currentQ.answer === false ? 'correct' : 'wrong') : ''} ${showExplanation && currentQ.answer === false ? 'correct-reveal' : ''}`}
                  onClick={() => handleAnswer(false)}
                  disabled={showExplanation}
                >
                  X (錯誤)
                </button>
              </>
            ) : (
              currentQ.options.map((opt, idx) => (
                <button 
                  key={idx}
                  className={`option-btn 
                    ${selectedAnswer === idx ? (currentQ.answer === idx ? 'correct' : 'wrong') : ''} 
                    ${showExplanation && currentQ.answer === idx ? 'correct-reveal' : ''}`}
                  onClick={() => handleAnswer(idx)}
                  disabled={showExplanation}
                >
                  {opt}
                </button>
              ))
            )}
          </div>

          {showExplanation && (
            <div className={`explanation-box ${selectedAnswer === currentQ.answer ? 'success' : 'error'}`}>
              <div className="explanation-header">
                {selectedAnswer === currentQ.answer ? (
                  <><CheckCircle2 className="icon-success" /> 答對了！</>
                ) : (
                  <><XCircle className="icon-error" /> 答錯了！</>
                )}
              </div>
              <p><strong>詳解：</strong>{currentQ.explanation}</p>
              <button className="btn-primary next-btn" onClick={nextQuestion}>
                {currentIndex < questions.length - 1 ? '下一題' : '查看成績'} <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="quiz-result-card">
          <h2>測驗結束</h2>
          <div className="score-display">
            <span className="score-number">{score}</span> / {questions.length}
          </div>
          <p className="score-message">
            {score / questions.length >= 0.8 ? '太棒了！您對傳統糕餅有很深的了解！' : '再接再厲！多複習寶典就能拿高分！'}
          </p>
          <button className="btn-primary" onClick={() => startQuiz(quizType)}>再測一次</button>
        </div>
      )}
    </div>
  );
};

export default QuizMode;

import React from 'react';

const HighlightedText = ({ text }) => {
  if (!text) return null;

  const ingredients = ['綠豆沙', '麵粉', '熟麵粉', '糯米粉', '鳳片粉', '米漿', '蛋黃', '芒果', '豬肉', '蘿蔔絲', '麥芽糖', '豆沙', '冬瓜', '蒜苗', '青蔥', '李仔鹹'];
  const cooking = ['蒸', '烤', '水煮', '煮', '油炸', '炸', '烹調', '熟成'];
  const history = ['伍子胥', '日據', '黨長發', '明鄭', '琉球', '陳基振', '沈正國', '相傳', '發明', '傳統'];

  // Create a regex to match any of the keywords
  const allKeywords = [...ingredients, ...cooking, ...history];
  if (allKeywords.length === 0) return <>{text}</>;

  // Sort by length descending to match longer keywords first (e.g. 熟麵粉 before 麵粉)
  allKeywords.sort((a, b) => b.length - a.length);
  
  const regex = new RegExp(`(${allKeywords.join('|')})`, 'g');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (ingredients.includes(part)) {
          return <span key={i} className="highlight-ingredient">{part}</span>;
        } else if (cooking.includes(part)) {
          return <span key={i} className="highlight-cooking">{part}</span>;
        } else if (history.includes(part)) {
          return <span key={i} className="highlight-history">{part}</span>;
        } else {
          return <span key={i}>{part}</span>;
        }
      })}
    </>
  );
};

export default HighlightedText;

export const getPastryImage = (text) => {
  if (!text) return null;
  const t = text.toLowerCase();
  
  // Specific Pastries
  if (t.includes('綠豆椪') || t.includes('平西餅')) return './images/mung_bean.png';
  if (t.includes('蛋黃酥')) return './images/yolk.png';
  if (t.includes('芋頭酥')) return './images/taro.png';
  if (t.includes('芋粿巧')) return './images/taro_kueh.png';
  if (t.includes('太陽餅') || t.includes('老婆餅')) return './images/sun.png';
  if (t.includes('紅龜粿') || t.includes('乞龜') || t.includes('還龜') || t.includes('壽桃') || t.includes('麵龜')) return './images/red_turtle.png';
  if (t.includes('甜年糕') || t.includes('發糕') || t.includes('年糕')) return './images/nian_gao.png';

  // Themes / Categories (Fallback for broader concepts)
  if (t.includes('彌月') || t.includes('滿月') || t.includes('紅蛋') || t.includes('油飯')) return './images/theme_baby.png';
  if (t.includes('婚嫁') || t.includes('訂婚') || t.includes('文定') || t.includes('喜餅') || t.includes('大餅') || t.includes('盒仔餅')) return './images/theme_wedding.png';
  if (t.includes('歷史') || t.includes('傳說') || t.includes('老店') || t.includes('起源') || t.includes('發明')) return './images/theme_history.png';
  if (t.includes('製作') || t.includes('烤') || t.includes('蒸') || t.includes('麵糰') || t.includes('包酥') || t.includes('麵粉') || t.includes('豬油')) return './images/theme_baking.png';

  return null;
};

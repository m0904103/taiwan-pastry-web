export const getPastryImage = (text) => {
  if (!text) return null;
  const t = text.toLowerCase();
  
  if (t.includes('綠豆椪') || t.includes('平西餅')) return '/images/mung_bean.png';
  if (t.includes('蛋黃酥')) return '/images/yolk.png';
  if (t.includes('芋頭酥') || t.includes('芋粿巧')) return '/images/taro.png';
  if (t.includes('太陽餅') || t.includes('老婆餅')) return '/images/sun.png';
  if (t.includes('紅龜粿') || t.includes('乞龜') || t.includes('還龜') || t.includes('壽桃') || t.includes('麵龜')) return '/images/red_turtle.png';
  if (t.includes('甜年糕') || t.includes('發糕')) return '/images/nian_gao.png';

  return null;
};

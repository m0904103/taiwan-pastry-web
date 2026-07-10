export const getPastryImage = (text) => {
  if (!text) return null;
  const t = text.toLowerCase();
  
  // New Specific Pastries
  if (t.includes('牛舌餅')) return './images/ox_tongue.png';
  if (t.includes('肚臍餅')) return './images/belly_button.png';
  if (t.includes('鳳梨酥')) return './images/pineapple_cake.png';
  if (t.includes('茯苓糕') || t.includes('綠豆糕') || t.includes('糕仔') || t.includes('狀元糕') || t.includes('雙糕潤')) return './images/steamed_cake.png';
  if (t.includes('牛汶水')) return './images/hakka_mochi.png';
  if (t.includes('米香') || t.includes('麻荖') || t.includes('花生粩')) return './images/rice_crispies.png';
  if (t.includes('鳳片')) return './images/feng_pian.png';

  // Original Specific Pastries
  if (t.includes('綠豆椪') || t.includes('平西餅')) return './images/mung_bean.png';
  if (t.includes('蛋黃酥')) return './images/yolk.png';
  if (t.includes('芋頭酥')) return './images/taro.png';
  if (t.includes('芋粿巧')) return './images/taro_kueh.png';
  if (t.includes('太陽餅') || t.includes('老婆餅')) return './images/sun.png';
  if (t.includes('紅龜粿') || t.includes('乞龜') || t.includes('還龜') || t.includes('壽桃') || t.includes('麵龜') || t.includes('建醮') || t.includes('祭祀')) return './images/red_turtle.png';
  if (t.includes('甜年糕') || t.includes('發糕') || t.includes('年糕')) return './images/nian_gao.png';

  // Themes / Categories (Expanded Fallbacks)
  if (t.includes('彌月') || t.includes('滿月') || t.includes('紅蛋') || t.includes('油飯') || t.includes('收涎') || t.includes('四月日')) return './images/theme_baby.png';
  if (t.includes('婚嫁') || t.includes('訂婚') || t.includes('文定') || t.includes('喜餅') || t.includes('大餅') || t.includes('盒仔餅')) return './images/theme_wedding.png';
  if (t.includes('歷史') || t.includes('傳說') || t.includes('老店') || t.includes('起源') || t.includes('發明') || t.includes('伍子胥') || t.includes('黨長發') || t.includes('陳基振') || t.includes('明鄭') || t.includes('沈正國')) return './images/theme_history.png';
  if (t.includes('製作') || t.includes('烤') || t.includes('蒸') || t.includes('煮') || t.includes('炸') || t.includes('麵糰') || t.includes('包酥') || t.includes('麵粉') || t.includes('豬油') || t.includes('酥皮') || t.includes('油皮') || t.includes('水仙粉') || t.includes('發麵') || t.includes('熟成')) return './images/theme_baking.png';

  return null;
};

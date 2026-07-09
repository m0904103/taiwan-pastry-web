import json
import re

# ─── 1. 分類規則 ─────────────────────────────────────────────────────────────
CATEGORY_RULES = {
    "節日習俗": [
        "中元節", "清明節", "端午節", "中秋節", "重陽", "元宵", "冬至", "春節", "農曆",
        "拜拜", "祭拜", "祭祀", "神明", "廟", "乞龜", "還龜", "迎城隍", "鑽燈腳",
        "龍鳳喜餅", "收涎", "彌月", "婚禮", "歸寧", "文定", "嫁妝", "紅包",
        "拜天公", "滿月", "百日", "節慶", "節日", "習俗", "禮俗", "傳統民間"
    ],
    "製作工法": [
        "油皮", "油酥", "水油皮", "開酥", "桿摺", "包酥", "擀", "摺",
        "蒸", "烤", "烤箱", "炸", "煮", "熬煮", "冷藏", "冷凍", "保鮮膜",
        "塗佈", "噴水", "戳洞", "爆餡", "回軟", "靜置", "沉澱", "水飛",
        "粉料", "糯米粉", "高筋", "低筋", "玉米粉", "製作", "製成", "步驟",
        "判斷", "蒸熟", "烤熟", "成型", "包餡", "餡料", "皮", "製法", "方式"
    ],
    "食材知識": [
        "芝麻", "花生", "蛋液", "蛋白", "玉米粉", "艾草", "黑糖", "二砂糖",
        "糯米粉", "在來米", "米漿", "綠豆", "紅豆", "豆沙", "花豆", "肉燥",
        "蒜苗", "青蔥", "胡椒", "鳳梨", "芒果", "芭樂", "毛豆", "李仔鹹",
        "梅子", "蜜餞", "木瓜", "芋頭", "沙拉油", "豬油", "奶油",
        "材料", "內餡", "食材", "成分", "配方", "粉料", "添加"
    ],
    "百年老店歷史": [
        "李亭香", "十字軒", "犁記", "舊振南", "台中太陽堂", "大甲",
        "大稻埕", "澎湖", "繼光餅", "戚繼光", "明朝", "日治", "琉球",
        "起源", "典故", "歷史", "研發", "由來", "創立", "傳說", "紀載",
        "平安龜", "鳳片龜", "茯苓糕", "慈禧", "武則天"
    ]
}

# ─── 2. OCR 雜訊偵測規則 ─────────────────────────────────────────────────────
def detect_ocr_issues(text):
    issues = []
    
    # 規則1: 字數過長 (超過120字)
    if len(text) > 120:
        issues.append(f"字數過長({len(text)}字)")
    
    # 規則2: 夾帶下一題的答案與題號  e.g. "(O)18."
    if re.search(r'[\(\（][OXox╳○][\)\）]\s*\d+[\.、]', text):
        issues.append("混入下一題答案標記")
    
    # 規則3: 文字中段出現括號答案標記
    matches = list(re.finditer(r'[\(\（][OXox╳○][\)\）]', text))
    for m in matches:
        start, end = m.span()
        if 5 < start < len(text) - 5:
            issues.append(f"文中夾帶答案標記'{m.group()}'")
    
    # 規則4: 包含 .詳答：或 .詳情 後面接了大段文字（表示解析混入題目）
    if re.search(r'詳答[：:]|詳情請參閱課程影片', text):
        issues.append("解析混入題目文字")
    
    # 規則5: 出現 \u0001 或控制字元 (PDF轉換殘留)
    if re.search(r'[\x00-\x08\x0b-\x1f\x7f]', text):
        issues.append("含PDF控制字元殘留")

    return issues

# ─── 3. 分類函數 ──────────────────────────────────────────────────────────────
def categorize(text):
    scores = {cat: 0 for cat in CATEGORY_RULES}
    for cat, keywords in CATEGORY_RULES.items():
        for kw in keywords:
            if kw in text:
                scores[cat] += 1
    
    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return "其他知識"
    return best

# ─── 4. 主程式 ───────────────────────────────────────────────────────────────
INPUT_PATH  = r"C:\Users\manpo\OneDrive\桌面\taiwan-pastry-web\src\data\questions.json"
OUTPUT_PATH = r"C:\Users\manpo\OneDrive\桌面\taiwan-pastry-web\src\data\questions.json"
REVIEW_PATH = r"C:\Users\manpo\OneDrive\桌面\taiwan-pastry-web\src\data\review_needed.json"

with open(INPUT_PATH, "r", encoding="utf-8-sig") as f:
    data = json.load(f)

review_list = []
total = 0
tagged = {"true_false": [], "multiple_choice": []}

for qtype in ["true_false", "multiple_choice"]:
    for q in data.get(qtype, []):
        total += 1
        text = q.get("question", "") + " " + q.get("explanation", "")
        
        # OCR 偵測
        issues = detect_ocr_issues(q.get("question", ""))
        if issues:
            q["needs_review"] = True
            q["review_reasons"] = issues
            review_list.append({"id": q["id"], "question": q["question"][:80]+"...", "issues": issues})
        else:
            q["needs_review"] = False
        
        # 打分類標籤
        q["category"] = categorize(text)
        
        tagged[qtype].append(q)

data["true_false"] = tagged["true_false"]
data["multiple_choice"] = tagged["multiple_choice"]

# 寫回主題庫
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 寫出待審核清單
with open(REVIEW_PATH, "w", encoding="utf-8") as f:
    json.dump(review_list, f, ensure_ascii=False, indent=2)

# ─── 5. 統計報告 ─────────────────────────────────────────────────────────────
categories = {}
ocr_count  = 0
for qtype in ["true_false", "multiple_choice"]:
    for q in data[qtype]:
        cat = q.get("category", "其他")
        categories[cat] = categories.get(cat, 0) + 1
        if q.get("needs_review"):
            ocr_count += 1

print(f"\n[OK] Done! Total {total} questions")
print(f"[WARN] OCR issues: {ocr_count} questions (see review_needed.json)")
print(f"\n[STATS] Category breakdown:")
for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
    print(f"   {cat}: {count}")

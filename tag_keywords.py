import json
import re

with open('src/data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

ingredients = ['綠豆沙', '麵粉', '熟麵粉', '糯米粉', '鳳片粉', '米漿', '蛋黃', '芒果', '豬肉', '蘿蔔絲', '麥芽糖', '豆沙', '冬瓜', '蒜苗', '青蔥', '李仔鹹']
cooking = ['蒸', '烤', '水煮', '煮', '油炸', '炸']
history = ['伍子胥', '日據', '黨長發', '明鄭', '琉球', '陳基振', '沈正國']

for key in ['true_false', 'multiple_choice']:
    for q in questions[key]:
        text = q['question'] + " " + q.get('explanation', '') + " " + str(q.get('answer', ''))
        target = None
        
        # Check history first
        for h in history:
            if h in text:
                target = h
                break
                
        # Then cooking
        if not target:
            for c in cooking:
                if c in text and ('方式' in text or '熟成' in text or '烹調' in text):
                    target = c
                    break
                    
        # Then ingredients
        if not target:
            for i in ingredients:
                if i in text:
                    target = i
                    break
        
        # Fallback to category
        if not target:
            if '神明' in q['category']: target = '祭祀'
            elif '生命' in q['category']: target = '習俗'
            else: target = '傳統'
            
        q['target_keyword'] = target

with open('src/data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Questions updated with target_keyword.")

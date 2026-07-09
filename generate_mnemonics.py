import json
import re

def generate_mnemonic(question_text, answer_text, category):
    text = question_text + " " + str(answer_text)
    
    # 特殊歷史與老店
    if "繼光餅" in text:
        return "戚繼光發明的鹹軍糧，記得配「白芝麻」最對味！"
    if "茯苓糕" in text:
        return "相傳慈禧太后愛吃，可以治胸悶，也是大稻埕的名產！"
    if "平安龜" in text or "李亭香" in text:
        return "百年老店李亭香招牌：平安龜 = 花生糕 + 黑芝麻餡，拜拜保平安！"
    if "十字軒" in text:
        return "大稻埕十字軒專賣傳統漢餅，文定、收涎、拜拜都要找它！"
    if "黑糖糕" in text or "澎湖" in text:
        return "黑糖糕是日治時期琉球人傳入澎湖的，不是台灣本土發明喔！"
    if "太陽餅" in text:
        return "台中太陽堂是太陽餅的發源地，內餡是麥芽糖！"
        
    # 節日與習俗
    if "收涎" in text:
        return "收涎 = 滿「四個月」！不是滿月喔！"
    if "歸寧" in text or "米糕" in text:
        return "歸寧米糕是「女方」準備帶回男方家的，祝福感情如膠似漆！"
    if "重陽" in text or "登高" in text:
        return "重陽節登高吃糕，上面要插小旗子代表「步步高升」！"
    if "端午" in text:
        return "端午節吃綠豆糕驅瘟解毒，不是綠豆椪！"
    if "中元節" in text:
        return "中元節必拜：芋粿巧、辟桃、摩訶！"
    if "艾草粿" in text or "祭拜祖先" in text:
        return "艾草粿是祭拜祖先用的，不是結婚用的！"
        
    # 特殊外觀與名稱
    if "肚臍餅" in text:
        return "中間凹陷像肚臍，用烤箱烤熟的客家特產！"
    if "冰沙餅" in text or "平西餅" in text:
        return "冰沙餅 = 經過「水飛」沉澱，口感綿密冰涼，是用烤的不是蒸的！"
    if "牛汶水" in text:
        return "客家牛汶水像牛泡在水裡，是用「煮」的，不是炸的！"
    if "九層板" in text:
        return "九層板的深色是「黑糖」，不是巧克力！"
    if "芋蔥粿" in text:
        return "判斷有沒有熟：用手摸表面「不黏手」就熟了！"
    if "李鹹糕仔" in text:
        return "李鹹 = 李仔鹹 (蜜餞)，不是木瓜乾！"
    if "芭樂冰皮" in text:
        return "用的是芭樂「果肉渣」，不是嫩葉！"
    if "紅龍蛋" in text:
        return "紅龍蛋的蛋黃是用「芒果」做的！"
        
    # 工法與材料
    if "甜年糕" in text:
        return "甜年糕是用「糯米粉」，不是高筋麵粉！"
    if "油酥皮" in text or "開酥" in text:
        return "順序：水油皮包油酥 -> 開酥桿摺 -> 包餡！"
    if "大包酥" in text or "保鮮膜" in text:
        return "桿摺完一定要用「保鮮膜」包起來，防止風乾！"
    if "胡椒餅" in text:
        return "胡椒餅內餡包的是「青蔥」，不是蒜苗！"
    if "綠豆椪" in text:
        return "傳統綠豆椪內餡是綠豆沙 + 「肉燥」！"
    if "芝麻喜餅" in text or "冷藏" in text:
        return "餡料拿去冷藏是為了「方便包餡」，不是防爆餡！"
    if "鳳梨膏" in text or "凝結" in text:
        return "熬鳳梨膏加的是「玉米粉」幫助凝結，不是蛋白！"
    if "奶油酥餅" in text or "爆餡" in text:
        return "防止爆餡要在餅皮「戳小洞」，不是噴水！"
    if "伍仁月餅" in text or "回軟" in text:
        return "烤完要靜置兩三天「回軟」才會好吃！"
    if "糍粑" in text or "解凍" in text:
        return "糍粑可以冷凍保存，吃的時候「自然解凍」即可！"
        
    # 通用分類兜底
    if category == "節日習俗":
        return "💡 節日題常考：什麼節日對應什麼糕餅！"
    elif category == "製作工法":
        return "💡 工法題常考：步驟順序與目的（例如防風乾、防爆餡）！"
    elif category == "食材知識":
        return "💡 食材題常考：用的是什麼粉（糯米粉還是麵粉）或什麼內餡！"
    elif category == "百年老店歷史":
        return "💡 歷史題常考：這家店的招牌商品或發明人是誰！"
        
    return "💡 記住：理解這題的錯誤選項為何錯，下次就不會被騙！"

INPUT_PATH  = r"C:\Users\manpo\OneDrive\桌面\taiwan-pastry-web\src\data\questions.json"
OUTPUT_PATH = r"C:\Users\manpo\OneDrive\桌面\taiwan-pastry-web\src\data\questions.json"

with open(INPUT_PATH, "r", encoding="utf-8-sig") as f:
    data = json.load(f)

for qtype in ["true_false", "multiple_choice"]:
    for q in data.get(qtype, []):
        cat = q.get("category", "")
        # Get correct answer text
        ans_text = ""
        if qtype == "true_false":
            ans_text = "O" if q["answer"] else "X"
        else:
            ans_text = q["options"][q["answer"]] if "options" in q else ""
            
        mn = generate_mnemonic(q.get("question", ""), ans_text, cat)
        q["mnemonic"] = mn

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ 所有題目已成功加上 mnemonic (記憶口訣)！")

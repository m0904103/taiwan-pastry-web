# -*- coding: utf-8 -*-
import os, sys, json, re, PyPDF2
sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r'C:\Users\manpo\OneDrive\桌面\台灣傳統糕餅文化與創新(考古題)'
all_text = ""
for file in os.listdir(pdf_dir):
    if file.endswith('.pdf') and '111' not in file: # skip 111 essay exam for automated parsing
        try:
            reader = PyPDF2.PdfReader(os.path.join(pdf_dir, file))
            for page in reader.pages:
                all_text += page.extract_text() + '\n'
        except Exception as e:
            print(f"Error reading {file}: {e}")

# Save raw text for debugging
with open('raw_text.txt', 'w', encoding='utf-8') as f:
    f.write(all_text)

# Clean up newlines that break sentences but aren't end of questions
# Actually, let's just parse the regex
pattern = re.compile(r'\(([OXox1-4])\)\s*\d+\.\s*(.*?)(?=\n\s*詳答：|\n詳答：)\n\s*詳答：\s*(.*?)(?=\n\([OXox1-4]\)\s*\d+\.|\Z)', re.DOTALL)

tf_qs = []
mc_qs = []

for m in pattern.finditer(all_text):
    ans_raw, question, explanation = m.groups()
    question = question.strip().replace('\n', '')
    explanation = explanation.strip().replace('\n', '')
    
    if ans_raw.upper() in ['O', 'X']:
        ans = True if ans_raw.upper() == 'O' else False
        tf_qs.append({
            "id": f"tf-{len(tf_qs)+1}",
            "question": question,
            "answer": ans,
            "explanation": explanation
        })
    else:
        opt_matches = re.findall(r'①(.*?)(?:②|$)(.*?)(?:③|$)(.*?)(?:④|$)(.*?)$', question)
        opts = []
        q_text = question
        if opt_matches:
            q_text = question.split('①')[0].strip()
            opts = [x.strip().strip('。') for x in opt_matches[0] if x]
        else:
            # Maybe it didn't use ①, check if it uses space or is just missing
            opts = ["選項A", "選項B", "選項C", "選項D"]
            
        try:
            ans_idx = int(ans_raw) - 1
        except:
            ans_idx = 0
            
        mc_qs.append({
            "id": f"mc-{len(mc_qs)+1}",
            "question": q_text,
            "options": opts,
            "answer": ans_idx,
            "explanation": explanation
        })

print(f"Extracted {len(tf_qs)} T/F and {len(mc_qs)} MCQs")

with open('extracted.json', 'w', encoding='utf-8') as f:
    json.dump({"true_false": tf_qs, "multiple_choice": mc_qs}, f, ensure_ascii=False, indent=2)

#!/usr/bin/env python3
"""向三个 locale 文件追加 liurenZizhan 命名空间、seo/share 键。
文本级插入，不重排已有内容：diff 纯新增。"""
import json
import sys

FILES = {
    'zh-CN': 'i18n/locales/zh-CN.json',
    'zh-TW': 'i18n/locales/zh-TW.json',
    'en': 'i18n/locales/en.json',
}

NS = {
    'zh-CN': {
        "title": "六壬字占",
        "subtitle": "写下一个字，以字画起小六壬课，掐指断你所问之事。",
        "toolDesc": "写一个字，以康熙笔画代月起宫，配农历日与时辰三数落宫，小六壬掐指速断吉凶。",
        "toolCta": "写个字掐一掐",
        "form": {
            "char": "所测之字",
            "charPlaceholder": "写一个汉字（单字）",
            "question": "所问之事（可选）",
            "questionPlaceholder": "例如：这笔生意能谈成吗？",
            "time": "起课时刻",
            "timeHint": "以起心动念、提笔问事的真实时刻起课",
            "submitBtn": "起课断事"
        },
        "error": {
            "invalidChar": "请写一个汉字（单字）"
        },
        "knowledgeCard1Title": "字画代月",
        "knowledgeCard1Desc": "以康熙笔画数从大安起数定首宫，再配农历日、时辰顺数六宫，三数落定课传。",
        "knowledgeCard2Title": "六宫速断",
        "knowledgeCard2Desc": "大安、留连、速喜、赤口、小吉、空亡，最终落宫定吉凶，口诀一掐一个准。",
        "scanning": "正在掐指起课……",
        "scanningSub": "字画起宫，三数落定",
        "resultTitle": "字占断语",
        "interpreting": "起课推演中……",
        "reinterpret": "重新推演",
        "backToCezi": "返回测字问事",
        "noQuestion": "未明言所问（按整体运势断）",
        "poster": {
            "kicker": "小 六 壬 · 以 字 起 课",
            "title": "六壬字占",
            "serial": "掐指六宫 · 字画代月",
            "overviewPending": "课传推演中，字的兆头即将见分晓……",
            "questionFlag": "问",
            "charMeta": "康熙 {strokes} 画 · 代月起宫",
            "panFlag": "起课",
            "charFlag": "字画",
            "dayFlag": "日宫",
            "hourFlag": "时宫",
            "panLine": "农历 {lunar} · {hour}时",
            "relLabel": "课传",
            "fieldPending": "推算中……",
            "verdictFlag": "断语",
            "verdictPending": "断语推敲中……",
            "noteLabel": "提点",
            "notePending": "字已落宫，静心思量，答案自来。",
            "signWho": "六壬字占",
            "seal": "六壬\n字占",
            "qrHint": "扫码测字"
        }
    },
    'zh-TW': {
        "title": "六壬字占",
        "subtitle": "寫下一個字，以字畫起小六壬課，掐指斷你所問之事。",
        "toolDesc": "寫一個字，以康熙筆畫代月起宮，配農曆日與時辰三數落宮，小六壬掐指速斷吉凶。",
        "toolCta": "寫個字掐一掐",
        "form": {
            "char": "所測之字",
            "charPlaceholder": "寫一個漢字（單字）",
            "question": "所問之事（可選）",
            "questionPlaceholder": "例如：這筆生意能談成嗎？",
            "time": "起課時刻",
            "timeHint": "以起心動念、提筆問事的真實時刻起課",
            "submitBtn": "起課斷事"
        },
        "error": {
            "invalidChar": "請寫一個漢字（單字）"
        },
        "knowledgeCard1Title": "字畫代月",
        "knowledgeCard1Desc": "以康熙筆畫數從大安起數定首宮，再配農曆日、時辰順數六宮，三數落定課傳。",
        "knowledgeCard2Title": "六宮速斷",
        "knowledgeCard2Desc": "大安、留連、速喜、赤口、小吉、空亡，最終落宮定吉凶，口訣一掐一個準。",
        "scanning": "正在掐指起課……",
        "scanningSub": "字畫起宮，三數落定",
        "resultTitle": "字占斷語",
        "interpreting": "起課推演中……",
        "reinterpret": "重新推演",
        "backToCezi": "返回測字問事",
        "noQuestion": "未明言所問（按整體運勢斷）",
        "poster": {
            "kicker": "小 六 壬 · 以 字 起 課",
            "title": "六壬字占",
            "serial": "掐指六宮 · 字畫代月",
            "overviewPending": "課傳推演中，字的兆頭即將見分曉……",
            "questionFlag": "問",
            "charMeta": "康熙 {strokes} 畫 · 代月起宮",
            "panFlag": "起課",
            "charFlag": "字畫",
            "dayFlag": "日宮",
            "hourFlag": "時宮",
            "panLine": "農曆 {lunar} · {hour}時",
            "relLabel": "課傳",
            "fieldPending": "推算中……",
            "verdictFlag": "斷語",
            "verdictPending": "斷語推敲中……",
            "noteLabel": "提點",
            "notePending": "字已落宮，靜心思量，答案自來。",
            "signWho": "六壬字占",
            "seal": "六壬\n字占",
            "qrHint": "掃碼測字"
        }
    },
    'en': {
        "title": "Liuren Character Divination",
        "subtitle": "Write one character; its strokes cast a Xiao Liuren lesson to answer your question.",
        "toolDesc": "Write a character. Its Kangxi stroke count starts the count, then the lunar day and hour walk the six palaces for a quick Xiao Liuren verdict.",
        "toolCta": "Try a character",
        "form": {
            "char": "Character",
            "charPlaceholder": "One Chinese character",
            "question": "Your question (optional)",
            "questionPlaceholder": "e.g. Will this deal work out?",
            "time": "Casting time",
            "timeHint": "Use the real moment the question came to mind",
            "submitBtn": "Cast & Read"
        },
        "error": {
            "invalidChar": "Please enter one Chinese character"
        },
        "knowledgeCard1Title": "Strokes Lead the Count",
        "knowledgeCard1Desc": "The Kangxi stroke count opens from Da'an, then lunar day and hour walk the six palaces — three counts settle the lesson.",
        "knowledgeCard2Title": "Six-Palace Verdict",
        "knowledgeCard2Desc": "Da'an, Liulian, Suxi, Chikou, Xiaoji, Kongwang — the final palace calls the outcome by the classic rhymes.",
        "scanning": "Casting the lesson…",
        "scanningSub": "Strokes open, three counts settle",
        "resultTitle": "Divination Verdict",
        "interpreting": "Reading the lesson…",
        "reinterpret": "Read again",
        "backToCezi": "Back to Character Divination",
        "noQuestion": "No question stated (read as general fortune)",
        "poster": {
            "kicker": "XIAO LIUREN · CHARACTER CAST",
            "title": "六壬字占",
            "serial": "SIX PALACES · STROKES LEAD",
            "overviewPending": "Reading the lesson, the sign is about to show…",
            "questionFlag": "Q",
            "charMeta": "Kangxi {strokes} strokes · opens the count",
            "panFlag": "Cast",
            "charFlag": "字",
            "dayFlag": "日",
            "hourFlag": "時",
            "panLine": "Lunar {lunar} · {hour} hour",
            "relLabel": "Flow",
            "fieldPending": "Reading…",
            "verdictFlag": "斷語",
            "verdictPending": "The verdict is being weighed…",
            "noteLabel": "Tip",
            "notePending": "The character has landed; sit with it, the answer will come.",
            "signWho": "Liuren Zizhan",
            "seal": "六壬\n字占",
            "qrHint": "Scan to cast"
        }
    },
}

SEO = {
    'zh-CN': {
        "liurenZizhanTitle": "六壬字占 - 写字起课掐指断事",
        "liurenZizhanDesc": "写一个汉字，以康熙笔画代月起宫，配农历日与时辰三数落宫，小六壬掐指速断所问之事，字占海报一图看清课传与断语。",
        "liurenZizhanKeywords": "六壬字占,小六壬测字,测字,掐指一算,字画起课,大安,速喜,测字问事"
    },
    'zh-TW': {
        "liurenZizhanTitle": "六壬字占 - 寫字起課掐指斷事",
        "liurenZizhanDesc": "寫一個漢字，以康熙筆畫代月起宮，配農曆日與時辰三數落宮，小六壬掐指速斷所問之事，字占海報一圖看清課傳與斷語。",
        "liurenZizhanKeywords": "六壬字占,小六壬測字,測字,掐指一算,字畫起課,大安,速喜,測字問事"
    },
    'en': {
        "liurenZizhanTitle": "Liuren Character Divination - Cast a Lesson from One Character",
        "liurenZizhanDesc": "Write one Chinese character. Its Kangxi strokes open the count, lunar day and hour walk the six palaces, and Xiao Liuren gives a quick verdict on your question.",
        "liurenZizhanKeywords": "liuren zizhan,xiao liuren,character divination,chinese cezi,six palaces"
    },
}

SHARE = {
    'zh-CN': {
        "hookLiurenZizhan": "我用六壬字占测了个字：{summary}",
        "hookLiurenZizhanDefault": "写个字就能起课断事，六壬字占帮你掐一掐"
    },
    'zh-TW': {
        "hookLiurenZizhan": "我用六壬字占測了個字：{summary}",
        "hookLiurenZizhanDefault": "寫個字就能起課斷事，六壬字占幫你掐一掐"
    },
    'en': {
        "hookLiurenZizhan": "I cast a Liuren lesson on one character: {summary}",
        "hookLiurenZizhanDefault": "One character, one lesson — try Liuren character divination"
    },
}


def ns_block(locale: str) -> str:
    body = json.dumps(NS[locale], ensure_ascii=False, indent=2)
    indented = '\n'.join('  ' + line for line in body.split('\n'))
    return '  "liurenZizhan": ' + indented.lstrip() + ',\n'


def kv_lines(d: dict, indent: str) -> str:
    items = list(d.items())
    out = []
    for i, (k, v) in enumerate(items):
        comma = ',' if i < len(items) - 1 else ''
        out.append(f'{indent}{json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False)}{comma}\n')
    return ''.join(out)


def flatten_keys(d, prefix=''):
    keys = []
    for k, v in d.items():
        keys.append(prefix + k)
        if isinstance(v, dict):
            keys.extend(flatten_keys(v, prefix + k + '.'))
    return keys


new_keysets = {}
for locale, path in FILES.items():
    with open(path) as f:
        original = f.read()
    before_keys = set(flatten_keys(json.loads(original)))

    lines = original.split('\n')

    # 1. 顶层命名空间：插在 "liurenSeeking" 之前
    ns_idx = [i for i, l in enumerate(lines) if l.startswith('  "liurenSeeking": {')]
    assert len(ns_idx) == 1, f'{locale}: liurenSeeking anchor x{len(ns_idx)}'
    # 命名空间块作为顶层兄弟：结尾带逗号（后面还有 liurenSeeking）
    block = ns_block(locale)
    lines.insert(ns_idx[0], block.rstrip('\n'))

    # 2. seo：插在 qimenZizhanKeywords 行之后
    seo_idx = [i for i, l in enumerate(lines) if '"qimenZizhanKeywords":' in l]
    assert len(seo_idx) == 1, f'{locale}: seo anchor x{len(seo_idx)}'
    seo_text = kv_lines(SEO[locale], '    ').rstrip('\n')
    # 新块最后一行需要逗号（后面还有原有键）
    lines.insert(seo_idx[0] + 1, seo_text + ',')

    # 3. share：插在 hookTaiyiDefault 行之后
    share_idx = [i for i, l in enumerate(lines) if '"hookTaiyiDefault":' in l]
    assert len(share_idx) == 1, f'{locale}: share anchor x{len(share_idx)}'
    share_text = kv_lines(SHARE[locale], '    ').rstrip('\n')
    lines.insert(share_idx[0] + 1, share_text + ',')

    result = '\n'.join(lines)
    after = json.loads(result)  # 语法校验
    after_keys = set(flatten_keys(after))
    lost = before_keys - after_keys
    assert not lost, f'{locale}: lost {lost}'
    gained = after_keys - before_keys
    new_keysets[locale] = gained

    with open(path, 'w') as f:
        f.write(result)
    print(f'{locale}: +{len(gained)} keys')

base = new_keysets['zh-CN']
for locale, ks in new_keysets.items():
    assert ks == base, f'{locale}: 新键集合不一致 {base ^ ks}'
print('三语新增键集合一致 ✓')

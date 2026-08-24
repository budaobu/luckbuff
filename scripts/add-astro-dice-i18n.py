#!/usr/bin/env python3
"""为占星骰子工具追加 astroDice namespace 与 seo.astroDice* 键。

纯文本插入，不重排已有内容：
- 顶层 astroDice 插在 "astrology" 块之后
- seo.astroDice* 插在 "astrologyOgDesc" 行之后（该行是 seo 最后一个键，需要补一个逗号）
"""
import json
import sys
from collections import OrderedDict

NS = {
    'zh-CN': {
        'title': '占星骰子',
        'subtitle': '行星·星座·宫位三骰同掷，掷出你当下的宇宙暗号',
        'disclaimer': '仅供文化娱乐参考。骰子不会替你做决定，它只是帮你把心里那杆秤擦亮一点。',
        'intro': '心里默念一件关切的事，或干脆什么都不想，点击摇骰——行星说「什么」，星座说「怎样」，宫位说「在哪里」。',
        'rollBtn': '掷出骰子',
        'rolling': '骰子落定中…',
        'reroll': '再掷一次',
        'backToAstrology': '返回占星专题',
        'calcFail': '骰子卡住了，再掷一次试试',
        'aiUnavailable': 'AI 解读暂时不可用，先看看骰面本身的信息',
        'knowledgeTitle': '三分钟看懂占星骰子',
        'knowledge1Title': '行星 · 什么',
        'knowledge1Desc': '行星代表正在行动的那股能量：是意志、情绪，还是沟通与欲望。',
        'knowledge2Title': '星座 · 怎样',
        'knowledge2Desc': '星座决定能量的表达风格：是横冲直撞，还是细水长流。',
        'knowledge3Title': '宫位 · 在哪里',
        'knowledge3Desc': '宫位指出这出戏上演的生活舞台：事业、感情、金钱或内心。',
        'element': {
            'fire': '火象能量',
            'earth': '土象能量',
            'air': '风象能量',
            'water': '水象能量',
        },
        'luckyColor': {
            'fire': '绯红',
            'earth': '姜黄',
            'air': '月白',
            'water': '黛蓝',
        },
        'luckyDirection': {
            'fire': '南',
            'earth': '西南',
            'air': '西',
            'water': '北',
        },
        'poster': {
            'brand': '占星骰子',
            'kicker': '占星骰子',
            'dimPlanet': '行星',
            'dimSign': '星座',
            'dimHouse': '宫位',
            'dignityNeutral': '庙旺平和',
            'dignityTag': '{planet}{type}',
            'dignity': {
                'domicile': '入庙',
                'exaltation': '擢升',
                'detriment': '失势',
                'fall': '落陷',
            },
            'scoreLabel': '契合指数',
            'grade': {
                'daji': '大吉',
                'ji': '吉',
                'ping': '平',
                'xiong': '凶',
            },
            'gradeOverview': {
                'daji': '三骰同气连枝，能量通透，顺着这股劲儿走就是。',
                'ji': '组合颇为顺手，小处留意，大方向没问题。',
                'ping': '不好不坏的平稳局，答案在你心里，骰子只是陪你确认。',
                'xiong': '能量略有滞涩，别硬顶，换个姿势再来。',
            },
            'dimFallback': {
                'planet': '这股能量在提醒你：先看清自己在用什么发力。',
                'sign': '表达方式，决定事情的温度与速度。',
                'house': '生活领域框定了这出戏的舞台。',
            },
            'kaiyunLabel': '开运',
            'kaiyunFallback': '宜近{color}色之物，行事朝{direction}方更顺。',
            'seal': '星骰',
            'footerNote': '占星骰子 · 仅供文化娱乐参考',
            'qrHint': '扫码再掷',
        },
    },
    'zh-TW': {
        'title': '占星骰子',
        'subtitle': '行星·星座·宮位三骰同擲，擲出你當下的宇宙暗號',
        'disclaimer': '僅供文化娛樂參考。骰子不會替你做決定，它只是幫你把心裡那桿秤擦亮一點。',
        'intro': '心裡默念一件關切的事，或乾脆什麼都不想，點擊搖骰——行星說「什麼」，星座說「怎樣」，宮位說「在哪裡」。',
        'rollBtn': '擲出骰子',
        'rolling': '骰子落定中…',
        'reroll': '再擲一次',
        'backToAstrology': '返回占星專題',
        'calcFail': '骰子卡住了，再擲一次試試',
        'aiUnavailable': 'AI 解讀暫時不可用，先看看骰面本身的資訊',
        'knowledgeTitle': '三分鐘看懂占星骰子',
        'knowledge1Title': '行星 · 什麼',
        'knowledge1Desc': '行星代表正在行動的那股能量：是意志、情緒，還是溝通與欲望。',
        'knowledge2Title': '星座 · 怎樣',
        'knowledge2Desc': '星座決定能量的表達風格：是橫衝直撞，還是細水長流。',
        'knowledge3Title': '宮位 · 在哪裡',
        'knowledge3Desc': '宮位指出這齣戲上演的生活舞台：事業、感情、金錢或內心。',
        'element': {
            'fire': '火象能量',
            'earth': '土象能量',
            'air': '風象能量',
            'water': '水象能量',
        },
        'luckyColor': {
            'fire': '緋紅',
            'earth': '薑黃',
            'air': '月白',
            'water': '黛藍',
        },
        'luckyDirection': {
            'fire': '南',
            'earth': '西南',
            'air': '西',
            'water': '北',
        },
        'poster': {
            'brand': '占星骰子',
            'kicker': '占星骰子',
            'dimPlanet': '行星',
            'dimSign': '星座',
            'dimHouse': '宮位',
            'dignityNeutral': '廟旺平和',
            'dignityTag': '{planet}{type}',
            'dignity': {
                'domicile': '入廟',
                'exaltation': '擢升',
                'detriment': '失勢',
                'fall': '落陷',
            },
            'scoreLabel': '契合指數',
            'grade': {
                'daji': '大吉',
                'ji': '吉',
                'ping': '平',
                'xiong': '凶',
            },
            'gradeOverview': {
                'daji': '三骰同氣連枝，能量通透，順著這股勁兒走就是。',
                'ji': '組合頗為順手，小處留意，大方向沒問題。',
                'ping': '不好不壞的平穩局，答案在你心裡，骰子只是陪你確認。',
                'xiong': '能量略有滯澀，別硬頂，換個姿勢再來。',
            },
            'dimFallback': {
                'planet': '這股能量在提醒你：先看清自己在用什麼發力。',
                'sign': '表達方式，決定事情的溫度與速度。',
                'house': '生活領域框定了這齣戲的舞台。',
            },
            'kaiyunLabel': '開運',
            'kaiyunFallback': '宜近{color}色之物，行事朝{direction}方更順。',
            'seal': '星骰',
            'footerNote': '占星骰子 · 僅供文化娛樂參考',
            'qrHint': '掃碼再擲',
        },
    },
    'en': {
        'title': 'Astrology Dice',
        'subtitle': 'Planet, sign and house — three dice, one cosmic signal for right now',
        'disclaimer': 'For cultural entertainment only. The dice never decide for you — they just polish the scale you already carry inside.',
        'intro': 'Hold a question in mind, or hold nothing at all, then roll — the planet says WHAT, the sign says HOW, the house says WHERE.',
        'rollBtn': 'Roll the Dice',
        'rolling': 'Dice settling…',
        'reroll': 'Roll Again',
        'backToAstrology': 'Back to Astrology',
        'calcFail': 'The dice got stuck — try rolling again',
        'aiUnavailable': 'AI reading is unavailable for now — the dice faces still speak for themselves',
        'knowledgeTitle': 'Astrology dice in three minutes',
        'knowledge1Title': 'Planet · What',
        'knowledge1Desc': 'The planet is the energy in motion: will, emotion, communication or desire.',
        'knowledge2Title': 'Sign · How',
        'knowledge2Desc': 'The sign styles that energy: headlong charge or slow drip.',
        'knowledge3Title': 'House · Where',
        'knowledge3Desc': 'The house names the stage: career, love, money or the inner life.',
        'element': {
            'fire': 'Fire energy',
            'earth': 'Earth energy',
            'air': 'Air energy',
            'water': 'Water energy',
        },
        'luckyColor': {
            'fire': 'crimson',
            'earth': 'ginger yellow',
            'air': 'moon white',
            'water': 'deep blue',
        },
        'luckyDirection': {
            'fire': 'south',
            'earth': 'southwest',
            'air': 'west',
            'water': 'north',
        },
        'poster': {
            'brand': 'Astro Dice',
            'kicker': 'ASTRO DICE',
            'dimPlanet': 'Planet',
            'dimSign': 'Sign',
            'dimHouse': 'House',
            'dignityNeutral': 'Neutral dignity',
            'dignityTag': '{planet} {type}',
            'dignity': {
                'domicile': 'in domicile',
                'exaltation': 'exalted',
                'detriment': 'in detriment',
                'fall': 'in fall',
            },
            'scoreLabel': 'Resonance',
            'grade': {
                'daji': 'Great',
                'ji': 'Good',
                'ping': 'Even',
                'xiong': 'Rough',
            },
            'gradeOverview': {
                'daji': 'Three dice, one clear current — ride it while it flows.',
                'ji': 'A handy combination; mind the details and the trend is yours.',
                'ping': 'An even draw. The answer is already in you; the dice just confirm it.',
                'xiong': 'Slightly stuck energy. Don’t push head-on — change the angle and roll on.',
            },
            'dimFallback': {
                'planet': 'This energy asks: notice what you are actually pushing with.',
                'sign': 'Style sets the temperature and speed of the matter.',
                'house': 'The life area frames the stage this play is on.',
            },
            'kaiyunLabel': 'Boost',
            'kaiyunFallback': 'Keep {color} close; head {direction} for smoother moves.',
            'seal': 'DICE',
            'footerNote': 'Astro Dice · For cultural entertainment only',
            'qrHint': 'Scan to roll',
        },
    },
}

SEO = {
    'zh-CN': {
        'astroDiceTitle': '占星骰子在线摇_行星星座宫位三骰占卜',
        'astroDiceDesc': '在线占星骰子：行星、星座、宫位三颗骰子同掷，结合庙旺落陷与宫位强度打分，AI 生成压缩解读并输出专属海报，仅供文化娱乐参考。',
        'astroDiceKeywords': '占星骰子,在线摇骰,行星骰子,星座骰子,宫位骰子,占星占卜',
        'astroDiceOgTitle': '占星骰子 · 掷出你当下的宇宙暗号',
        'astroDiceOgDesc': '行星说什么，星座说怎样，宫位说在哪里——三骰一掷，海报一张。',
    },
    'zh-TW': {
        'astroDiceTitle': '占星骰子線上擲_行星星座宮位三骰占卜',
        'astroDiceDesc': '線上占星骰子：行星、星座、宮位三顆骰子同擲，結合廟旺落陷與宮位強度打分，AI 生成壓縮解讀並輸出專屬海報，僅供文化娛樂參考。',
        'astroDiceKeywords': '占星骰子,線上擲骰,行星骰子,星座骰子,宮位骰子,占星占卜',
        'astroDiceOgTitle': '占星骰子 · 擲出你當下的宇宙暗號',
        'astroDiceOgDesc': '行星說什麼，星座說怎樣，宮位說在哪裡——三骰一擲，海報一張。',
    },
    'en': {
        'astroDiceTitle': 'Astrology Dice Online_Planet Sign House Three-Dice Reading',
        'astroDiceDesc': 'Roll three astrology dice online — planet, sign and house — scored by dignity and house strength, with an AI reading compressed into a shareable poster. For cultural entertainment only.',
        'astroDiceKeywords': 'astrology dice,online dice roll,planet dice,zodiac sign dice,house dice,astrology reading',
        'astroDiceOgTitle': 'Astrology Dice · A cosmic signal for right now',
        'astroDiceOgDesc': 'Planet says what, sign says how, house says where — three dice, one poster.',
    },
}




def insert_after_block(text: str, marker: str, payload: str) -> str:
    start = text.index(marker)
    depth = 0
    j = text.index('{', start)
    while True:
        c = text[j]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                break
        j += 1
    assert text[j + 1] == ',', f'expected comma after block: {text[j:j+3]!r}'
    # 插在原逗号之后："},\n  "astroDice": {...},\n  "next": ..."
    return text[:j + 2] + '\n' + payload + ',' + text[j + 2:]


for loc in ['zh-CN', 'zh-TW', 'en']:
    path = f'i18n/locales/{loc}.json'
    text = open(path, encoding='utf-8').read()

    if '"astroDice"' in text:
        sys.exit(f'{loc}: astroDice already exists')

    # 1. 顶层 astroDice namespace
    ns_json = json.dumps(NS[loc], ensure_ascii=False, indent=2)
    ns_block = '  "astroDice": ' + ns_json.replace('\n', '\n  ')
    text = insert_after_block(text, '  "astrology": {', ns_block)

    # 2. seo.astroDice*（astrologyOgDesc 是 seo 尾键，给它补逗号再追加）
    seo_marker = '"astrologyOgDesc": '
    k = text.index(seo_marker)
    line_end = text.index('\n', k)
    assert text[line_end - 1] != ',', f'{loc}: expected last key without comma'
    seo_lines = ',\n'.join(
        f'    "{key}": {json.dumps(val, ensure_ascii=False)}'
        for key, val in SEO[loc].items()
    )
    text = text[:line_end] + ',\n' + seo_lines + text[line_end:]

    json.loads(text, object_pairs_hook=OrderedDict)
    open(path, 'w', encoding='utf-8').write(text)
    print(f'{loc}: OK')

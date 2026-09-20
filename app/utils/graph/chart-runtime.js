// Local interactive runtime for the saved graph definitions.
export function mountGraph(initialChart, options = {}) {
  const renderIndex = options.renderIndex === true
  var s = [ "乾", "兑", "离", "震", "巽", "坎", "艮", "坤" ], o = {
      "乾": {
        symbol: "☰",
        image: "天",
        element: "金",
        nature: "健",
        lines: [ 1, 1, 1 ]
      },
      "兑": {
        symbol: "☱",
        image: "泽",
        element: "金",
        nature: "悦",
        lines: [ 1, 1, 0 ]
      },
      "离": {
        symbol: "☲",
        image: "火",
        element: "火",
        nature: "丽",
        lines: [ 1, 0, 1 ]
      },
      "震": {
        symbol: "☳",
        image: "雷",
        element: "木",
        nature: "动",
        lines: [ 1, 0, 0 ]
      },
      "巽": {
        symbol: "☴",
        image: "风",
        element: "木",
        nature: "入",
        lines: [ 0, 1, 1 ]
      },
      "坎": {
        symbol: "☵",
        image: "水",
        element: "水",
        nature: "陷",
        lines: [ 0, 1, 0 ]
      },
      "艮": {
        symbol: "☶",
        image: "山",
        element: "土",
        nature: "止",
        lines: [ 0, 0, 1 ]
      },
      "坤": {
        symbol: "☷",
        image: "地",
        element: "土",
        nature: "顺",
        lines: [ 0, 0, 0 ]
      }
    }, l = [ [ 1, "乾", "乾", "乾", "健行不息" ], [ 2, "坤", "坤", "坤", "厚德承载" ], [ 3, "屯", "坎", "震", "初生多难" ], [ 4, "蒙", "艮", "坎", "启蒙求正" ], [ 5, "需", "坎", "乾", "守正待时" ], [ 6, "讼", "乾", "坎", "慎争止讼" ], [ 7, "师", "坤", "坎", "统众以正" ], [ 8, "比", "坎", "坤", "亲比相辅" ], [ 9, "小畜", "巽", "乾", "小有蓄止" ], [ 10, "履", "乾", "兑", "谨慎践履" ], [ 11, "泰", "坤", "乾", "天地交泰" ], [ 12, "否", "乾", "坤", "天地不交" ], [ 13, "同人", "乾", "离", "和同于人" ], [ 14, "大有", "离", "乾", "丰有守正" ], [ 15, "谦", "坤", "艮", "谦退受益" ], [ 16, "豫", "震", "坤", "和乐预备" ], [ 17, "随", "兑", "震", "随时而动" ], [ 18, "蛊", "艮", "巽", "整治积弊" ], [ 19, "临", "坤", "兑", "临近督导" ], [ 20, "观", "巽", "坤", "观照示范" ], [ 21, "噬嗑", "离", "震", "决断阻隔" ], [ 22, "贲", "艮", "离", "文饰有度" ], [ 23, "剥", "艮", "坤", "剥落守静" ], [ 24, "复", "坤", "震", "返本复初" ], [ 25, "无妄", "乾", "震", "守正不妄" ], [ 26, "大畜", "艮", "乾", "大有蓄积" ], [ 27, "颐", "艮", "震", "养正慎言" ], [ 28, "大过", "兑", "巽", "非常担当" ], [ 29, "坎", "坎", "坎", "习险守信" ], [ 30, "离", "离", "离", "附丽明察" ], [ 31, "咸", "兑", "艮", "相感相应" ], [ 32, "恒", "震", "巽", "持久有常" ], [ 33, "遁", "乾", "艮", "退避守正" ], [ 34, "大壮", "震", "乾", "壮盛守礼" ], [ 35, "晋", "离", "坤", "明出地上" ], [ 36, "明夷", "坤", "离", "晦明守内" ], [ 37, "家人", "巽", "离", "齐家有序" ], [ 38, "睽", "离", "兑", "异中求同" ], [ 39, "蹇", "坎", "艮", "艰阻反身" ], [ 40, "解", "震", "坎", "舒解缓难" ], [ 41, "损", "艮", "兑", "减损修己" ], [ 42, "益", "巽", "震", "增益迁善" ], [ 43, "夬", "兑", "乾", "果决去患" ], [ 44, "姤", "乾", "巽", "相遇知防" ], [ 45, "萃", "兑", "坤", "聚合守正" ], [ 46, "升", "坤", "巽", "积小上升" ], [ 47, "困", "兑", "坎", "困顿守志" ], [ 48, "井", "坎", "巽", "养人之源" ], [ 49, "革", "兑", "离", "顺时变革" ], [ 50, "鼎", "离", "巽", "鼎新养贤" ], [ 51, "震", "震", "震", "戒惧行动" ], [ 52, "艮", "艮", "艮", "知止安静" ], [ 53, "渐", "巽", "艮", "循序渐进" ], [ 54, "归妹", "震", "兑", "婚嫁有序" ], [ 55, "丰", "震", "离", "丰盛持中" ], [ 56, "旅", "离", "艮", "羁旅守正" ], [ 57, "巽", "巽", "巽", "申命入顺" ], [ 58, "兑", "兑", "兑", "和悦相通" ], [ 59, "涣", "巽", "坎", "离散疏通" ], [ 60, "节", "坎", "兑", "节制有度" ], [ 61, "中孚", "巽", "兑", "诚信感通" ], [ 62, "小过", "震", "艮", "小事可过" ], [ 63, "既济", "坎", "离", "事成防变" ], [ 64, "未济", "离", "坎", "未成待续" ] ].map(e => {
      let [t, n, a, i, r] = e;
      return {
        number: t,
        name: n,
        upper: a,
        lower: i,
        meaning: r
      };
    });
    function c(e) {
      return String.fromCodePoint(19904 + e - 1);
    }
  var e, t, n = "http://www.w3.org/2000/svg";
          document.documentElement.classList.add("gxz-app-ready");
          var a = new IntersectionObserver(function(e) {
            e.forEach(function(e) {
              e.isIntersecting && (e.target.classList.add("in"), a.unobserve(e.target));
            });
          }, {
            threshold: .1
          });
          document.querySelectorAll(".reveal").forEach(function(e) {
            a.observe(e);
          });
          var i = [ {
            id: "basic_wangshuai",
            cat: "基础知识",
            badge: "旺衰",
            title: "五行旺相休囚死",
            desc: "切换月令季节，查看五行从旺到死的气势阶梯与生克来源。",
            thumb: '<svg viewBox="0 0 110 90" width="100"><circle cx="55" cy="45" r="34" fill="none" stroke="var(--hairline)" stroke-width="1"/><text x="55" y="18" text-anchor="middle" fill="var(--wood)" font-size="12" font-family="serif" font-weight="700">旺</text><text x="83" y="39" text-anchor="middle" fill="var(--fire)" font-size="12" font-family="serif" font-weight="700">相</text><text x="72" y="72" text-anchor="middle" fill="var(--earth)" font-size="12" font-family="serif" font-weight="700">休</text><text x="38" y="72" text-anchor="middle" fill="var(--metal)" font-size="12" font-family="serif" font-weight="700">囚</text><text x="27" y="39" text-anchor="middle" fill="var(--water)" font-size="12" font-family="serif" font-weight="700">死</text><circle cx="55" cy="45" r="12" fill="var(--cinnabar-soft)" stroke="var(--cinnabar)" stroke-width="1"/><text x="55" y="49" text-anchor="middle" fill="var(--cinnabar)" font-size="10" font-family="serif">令</text></svg>',
            fullDesc: "旺相休囚死是判断五行气势的基础。得月令者为旺，得旺者所生为相，生旺者为休，克旺者为囚，被旺者所克为死。它不是单独断吉凶，而是先确定季节背景下五行有没有得时。",
            quote: "口诀：春木旺火相水休金囚土死；夏火旺土相木休水囚金死；秋金旺水相土休火囚木死；冬水旺木相金休土囚火死；四季土旺金相火休木囚水死。"
          }, {
            id: "basic_tiangan_he",
            cat: "基础知识",
            badge: "天干",
            title: "天干五合",
            desc: "切换五组合化，查看两干牵合、合化五行、成化条件与象意。",
            thumb: '<svg viewBox="0 0 120 90" width="108"><line x1="26" y1="24" x2="94" y2="24" stroke="var(--gold)" stroke-width="1.4"/><line x1="26" y1="45" x2="94" y2="45" stroke="var(--cinnabar)" stroke-width="1.4"/><line x1="26" y1="66" x2="94" y2="66" stroke="var(--water)" stroke-width="1.4"/><text x="18" y="28" fill="var(--ink-2)" font-size="12" font-family="serif">甲</text><text x="98" y="28" fill="var(--ink-2)" font-size="12" font-family="serif">己</text><text x="18" y="49" fill="var(--ink-2)" font-size="12" font-family="serif">乙</text><text x="98" y="49" fill="var(--ink-2)" font-size="12" font-family="serif">庚</text><text x="18" y="70" fill="var(--ink-2)" font-size="12" font-family="serif">丙</text><text x="98" y="70" fill="var(--ink-2)" font-size="12" font-family="serif">辛</text><circle cx="60" cy="24" r="10" fill="var(--earth)"/><circle cx="60" cy="45" r="10" fill="var(--metal)"/><circle cx="60" cy="66" r="10" fill="var(--water)"/></svg>',
            fullDesc: "天干五合指甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火。相合先看两干之间是否有牵引、羁绊与合作，再看月令、通根、透出、周围干支助力，判断只是有合象，还是进一步成化。",
            quote: "提示：合不等于必化。实盘中要先分清「有合象」与「合而化气」。"
          }, {
            id: "basic_dizhi_relations",
            cat: "基础知识",
            badge: "地支",
            title: "地支刑冲合害破",
            desc: "切换关系类型，观察十二地支之间的合、冲、刑、害、破。",
            thumb: '<svg viewBox="0 0 100 100" width="94"><circle cx="50" cy="50" r="38" fill="none" stroke="var(--hairline)" stroke-width="1"/><line x1="50" y1="12" x2="50" y2="88" stroke="var(--cinnabar)" stroke-width="1.2"/><line x1="12" y1="50" x2="88" y2="50" stroke="var(--gold)" stroke-width="1.2"/><line x1="24" y1="24" x2="76" y2="76" stroke="var(--water)" stroke-width="1.2" stroke-dasharray="4 4"/><text x="50" y="10" text-anchor="middle" fill="var(--ink-2)" font-size="9" font-family="serif">子</text><text x="91" y="54" text-anchor="middle" fill="var(--ink-2)" font-size="9" font-family="serif">卯</text><text x="50" y="96" text-anchor="middle" fill="var(--ink-2)" font-size="9" font-family="serif">午</text><text x="9" y="54" text-anchor="middle" fill="var(--ink-2)" font-size="9" font-family="serif">酉</text></svg>',
            fullDesc: "地支关系是四柱、六爻、择日、奇门神煞推导的基础。六合偏向牵合与成事，六冲偏向动荡与分离，三刑偏向失衡与纠缠，六害偏向暗损，六破偏向破散。具体吉凶仍需结合旺衰、用忌、宫位和所问事项。",
            quote: "使用顺序建议：先定旺衰，再看合冲刑害破，最后回到用神与事项。"
          }, {
            id: "basic_canggan",
            cat: "基础知识",
            badge: "藏干",
            title: "地支藏干速览",
            desc: "点击任意地支，查看本气、中气、余气与五行来源。",
            thumb: '<svg viewBox="0 0 120 86" width="108"><rect x="8" y="10" width="104" height="66" rx="10" fill="var(--card)" stroke="var(--hairline)" stroke-width="1"/><text x="20" y="30" fill="var(--water)" font-size="12" font-family="serif" font-weight="700">子</text><text x="42" y="30" fill="var(--earth)" font-size="12" font-family="serif" font-weight="700">丑</text><text x="64" y="30" fill="var(--wood)" font-size="12" font-family="serif" font-weight="700">寅</text><text x="86" y="30" fill="var(--wood)" font-size="12" font-family="serif" font-weight="700">卯</text><text x="20" y="56" fill="var(--earth)" font-size="12" font-family="serif" font-weight="700">辰</text><text x="42" y="56" fill="var(--fire)" font-size="12" font-family="serif" font-weight="700">巳</text><text x="64" y="56" fill="var(--fire)" font-size="12" font-family="serif" font-weight="700">午</text><text x="86" y="56" fill="var(--earth)" font-size="12" font-family="serif" font-weight="700">未</text></svg>',
            fullDesc: "地支不是单一五行，而是把天干之气藏在地支之中。本气最重，中气次之，余气再次。八字取格局、定十神根气、看通根透干，都离不开地支藏干。",
            quote: "例：寅藏甲丙戊，以甲为本气，丙为中气，戊为余气。"
          }, {
            id: "basic_changsheng",
            cat: "基础知识",
            badge: "气机",
            title: "十二长生轮",
            desc: "选择日干，查看十二长生落在哪些地支与气机阶段。",
            thumb: '<svg viewBox="0 0 100 100" width="94"><circle cx="50" cy="50" r="38" fill="none" stroke="var(--hairline)" stroke-width="1"/><circle cx="50" cy="14" r="8" fill="var(--wood)"/><circle cx="83" cy="31" r="8" fill="var(--fire)"/><circle cx="83" cy="69" r="8" fill="var(--earth)"/><circle cx="50" cy="86" r="8" fill="var(--metal)"/><circle cx="17" cy="69" r="8" fill="var(--water)"/><circle cx="17" cy="31" r="8" fill="var(--ink-3)"/><text x="50" y="53" text-anchor="middle" fill="var(--cinnabar)" font-size="13" font-family="serif" font-weight="700">生旺墓绝</text></svg>',
            fullDesc: "十二长生把一个天干的气机分成十二个阶段：长生、沐浴、冠带、临官、帝旺、衰、病、死、墓、绝、胎、养。它不是简单吉凶表，而是看气从出生、成长、极盛、衰退到重新孕育的循环。",
            quote: "阳干顺行，阴干逆行。丙戊同宫，丁己同宫，是常用十二长生表的基础规则。"
          }, {
            id: "basic_jiazi",
            cat: "基础知识",
            badge: "六十",
            title: "六十甲子与旬空",
            desc: "点击任意甲子，查看序位、所属旬与旬空地支。",
            thumb: '<svg viewBox="0 0 120 86" width="108"><rect x="8" y="10" width="104" height="66" rx="10" fill="var(--card)" stroke="var(--hairline)" stroke-width="1"/><text x="20" y="30" fill="var(--cinnabar)" font-size="10" font-family="serif">甲子</text><text x="50" y="30" fill="var(--ink-2)" font-size="10" font-family="serif">乙丑</text><text x="82" y="30" fill="var(--ink-2)" font-size="10" font-family="serif">丙寅</text><text x="20" y="56" fill="var(--ink-2)" font-size="10" font-family="serif">丁卯</text><text x="50" y="56" fill="var(--gold)" font-size="10" font-family="serif">戊辰</text><text x="82" y="56" fill="var(--ink-2)" font-size="10" font-family="serif">己巳</text></svg>',
            fullDesc: "六十甲子由十天干与十二地支顺次相配而成，用来纪年、月、日、时。每十组为一旬，因十干配十二支而有两个地支不入本旬，称为旬空。旬空在六爻、奇门、神煞和择日中都会反复使用。",
            quote: "六旬空亡：甲子旬空戌亥，甲戌旬空申酉，甲申旬空午未，甲午旬空辰巳，甲辰旬空寅卯，甲寅旬空子丑。"
          }, {
            id: "basic_shishen",
            cat: "基础知识",
            badge: "十神",
            title: "十神关系入门",
            desc: "选择日主天干，查看比劫、食伤、财官印对应到哪些天干。",
            thumb: '<svg viewBox="0 0 110 90" width="100"><circle cx="55" cy="45" r="14" fill="var(--cinnabar)" opacity=".9"/><text x="55" y="49" text-anchor="middle" fill="#fff8f0" font-size="10" font-family="serif">日主</text><text x="55" y="16" text-anchor="middle" fill="var(--wood)" font-size="10" font-family="serif">印</text><text x="88" y="36" text-anchor="middle" fill="var(--fire)" font-size="10" font-family="serif">比劫</text><text x="76" y="75" text-anchor="middle" fill="var(--earth)" font-size="10" font-family="serif">食伤</text><text x="34" y="75" text-anchor="middle" fill="var(--gold)" font-size="10" font-family="serif">财</text><text x="22" y="36" text-anchor="middle" fill="var(--water)" font-size="10" font-family="serif">官杀</text></svg>',
            fullDesc: "十神是以日主为中心建立的关系语言：同我为比劫，我生为食伤，我克为财，克我为官杀，生我为印。再按阴阳同异分成比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印。",
            quote: "十神不是单独断吉凶的标签，而是描述人与事、资源与压力、表达与收获之间的关系。"
          }, {
            id: "yinyang_taiji",
            cat: "阴阳五行",
            badge: "太极图",
            title: "太极图的哲学含义",
            desc: "用缓慢旋转、鱼眼呼吸与光晕明灭，观察阴阳互根、消长与转化。",
            thumb: '<svg viewBox="0 0 100 100" width="90"><circle cx="50" cy="50" r="44" fill="none" stroke="var(--hairline)" stroke-width="1"/><path d="M50 6 A44 44 0 0 1 50 94 A22 22 0 0 1 50 50 A22 22 0 0 0 50 6 Z" fill="var(--ink)"/><path d="M50 6 A44 44 0 0 0 50 94 A22 22 0 0 0 50 50 A22 22 0 0 1 50 6 Z" fill="var(--paper-2)"/><circle cx="50" cy="28" r="8" fill="var(--paper-2)"/><circle cx="50" cy="72" r="8" fill="var(--ink)"/><circle cx="50" cy="28" r="3" fill="var(--ink)"/><circle cx="50" cy="72" r="3" fill="var(--paper-2)"/></svg>',
            fullDesc: "太极图象征宇宙本体：未分时为太极，既分则为阴阳。图中的动效保持克制：整体缓旋表示气机流行，鱼眼呼吸表示阴中有阳、阳中有阴，外层光晕明灭表示此消彼长。",
            quote: "太极者，无极而生，阴阳之母也，动之则分，静之则合。——周敦颐《太极图说》"
          }, {
            id: "yinyang_four",
            cat: "阴阳五行",
            badge: "四大规律",
            title: "阴阳四大规律",
            desc: "点击四个规律，查看具体含义、自然现象与术数应用举例。",
            thumb: '<svg viewBox="0 0 100 100" width="90"><rect x="6" y="6" width="40" height="40" rx="8" fill="var(--cinnabar-soft)" stroke="var(--cinnabar)" stroke-width="1"/><text x="26" y="22" text-anchor="middle" fill="var(--cinnabar)" font-size="7.5" font-family="serif">对立</text><text x="26" y="33" text-anchor="middle" fill="var(--cinnabar)" font-size="7.5" font-family="serif">制约</text><rect x="54" y="6" width="40" height="40" rx="8" fill="var(--gold-soft)" stroke="var(--gold)" stroke-width="1"/><text x="74" y="22" text-anchor="middle" fill="var(--gold)" font-size="7.5" font-family="serif">互根</text><text x="74" y="33" text-anchor="middle" fill="var(--gold)" font-size="7.5" font-family="serif">互用</text><rect x="6" y="54" width="40" height="40" rx="8" fill="rgba(74,124,89,.1)" stroke="var(--wood)" stroke-width="1"/><text x="26" y="70" text-anchor="middle" fill="var(--wood)" font-size="7.5" font-family="serif">消长</text><text x="26" y="81" text-anchor="middle" fill="var(--wood)" font-size="7.5" font-family="serif">平衡</text><rect x="54" y="54" width="40" height="40" rx="8" fill="rgba(47,72,88,.1)" stroke="var(--water)" stroke-width="1"/><text x="74" y="70" text-anchor="middle" fill="var(--water)" font-size="7.5" font-family="serif">相互</text><text x="74" y="81" text-anchor="middle" fill="var(--water)" font-size="7.5" font-family="serif">转化</text></svg>',
            fullDesc: "阴阳四大规律是阴阳学说的核心：对立制约（阴阳相互对立，相互制约）、互根互用（阴阳相互依存，互为根本）、消长平衡（阴阳在运动中保持动态平衡）、相互转化（阴阳在一定条件下可以互相转化）。四者共同构成了中国传统哲学对宇宙运动规律的基本认识框架。",
            quote: "阴阳者，天地之道也，万物之纲纪，变化之父母，生杀之本始。——《黄帝内经·素问》"
          }, {
            id: "yinyang_symbol",
            cat: "阴阳五行",
            badge: "符号表达",
            title: "阴阳的符号表达",
            desc: "点击各符号系统，查看阴阳在爻、数、色、卦中的不同表达方式。",
            thumb: '<svg viewBox="0 0 100 80" width="90"><rect x="10" y="12" width="35" height="8" rx="2" fill="var(--ink)" opacity=".8"/><rect x="10" y="28" width="14" height="8" rx="2" fill="var(--ink)" opacity=".8"/><rect x="31" y="28" width="14" height="8" rx="2" fill="var(--ink)" opacity=".8"/><text x="55" y="22" fill="var(--cinnabar)" font-size="16" font-family="serif" font-weight="700">一</text><text x="70" y="22" fill="var(--ink-3)" font-size="16" font-family="serif">- -</text><text x="55" y="45" fill="var(--ink-2)" font-size="11" font-family="serif">奇 偶</text><circle cx="20" cy="60" r="10" fill="var(--ink)" opacity=".85"/><circle cx="50" cy="60" r="10" fill="var(--paper-2)" stroke="var(--hairline)" stroke-width="1"/><text x="20" y="64" text-anchor="middle" fill="var(--paper-2)" font-size="10" font-family="serif">阳</text><text x="50" y="64" text-anchor="middle" fill="var(--ink)" font-size="10" font-family="serif">阴</text></svg>',
            fullDesc: "阴阳通过多种符号体系表达：爻（— 为阳爻，- - 为阴爻）、数（奇数为阳，偶数为阴）、色（黑为阴，白为阳）、方位（天为阳，地为阴；南为阳，北为阴）、时间（昼为阳，夜为阴）。在天干中，甲丙戊庚壬为阳，乙丁己辛癸为阴；在地支中，子寅辰午申戌为阳，丑卯巳未酉亥为阴。",
            quote: "一阴一阳之谓道，继之者善也，成之者性也。——《易经·系辞上》"
          }, {
            id: "yinyang_ganzhi",
            cat: "阴阳五行",
            badge: "干支分布",
            title: "阴阳在天干地支中的分布",
            desc: "点击任意天干或地支，查看其阴阳属性、五行归属与象意。",
            thumb: '<svg viewBox="0 0 110 80" width="100"><rect x="4" y="6" width="102" height="26" rx="6" fill="var(--card)" stroke="var(--hairline)" stroke-width=".8"/><text x="10" y="22" fill="var(--cinnabar)" font-size="9" font-family="serif">甲</text><text x="21" y="22" fill="var(--ink-3)" font-size="9" font-family="serif">乙</text><text x="32" y="22" fill="var(--cinnabar)" font-size="9" font-family="serif">丙</text><text x="43" y="22" fill="var(--ink-3)" font-size="9" font-family="serif">丁</text><text x="54" y="22" fill="var(--cinnabar)" font-size="9" font-family="serif">戊</text><text x="65" y="22" fill="var(--ink-3)" font-size="9" font-family="serif">己</text><text x="76" y="22" fill="var(--cinnabar)" font-size="9" font-family="serif">庚</text><text x="87" y="22" fill="var(--ink-3)" font-size="9" font-family="serif">辛</text><text x="98" y="22" fill="var(--cinnabar)" font-size="9" font-family="serif">壬</text><rect x="4" y="48" width="102" height="26" rx="6" fill="var(--card)" stroke="var(--hairline)" stroke-width=".8"/><text x="10" y="64" fill="var(--cinnabar)" font-size="9" font-family="serif">子</text><text x="19" y="64" fill="var(--ink-3)" font-size="9" font-family="serif">丑</text><text x="28" y="64" fill="var(--cinnabar)" font-size="9" font-family="serif">寅</text><text x="37" y="64" fill="var(--ink-3)" font-size="9" font-family="serif">卯</text><text x="46" y="64" fill="var(--cinnabar)" font-size="9" font-family="serif">辰</text><text x="55" y="64" fill="var(--ink-3)" font-size="9" font-family="serif">巳</text><text x="64" y="64" fill="var(--cinnabar)" font-size="9" font-family="serif">午</text><text x="73" y="64" fill="var(--ink-3)" font-size="9" font-family="serif">未</text><text x="82" y="64" fill="var(--cinnabar)" font-size="9" font-family="serif">申</text><text x="91" y="64" fill="var(--ink-3)" font-size="9" font-family="serif">酉</text><text x="100" y="64" fill="var(--cinnabar)" font-size="9" font-family="serif">戌</text></svg>',
            fullDesc: "天干十个：甲（阳木）、乙（阴木）、丙（阳火）、丁（阴火）、戊（阳土）、己（阴土）、庚（阳金）、辛（阴金）、壬（阳水）、癸（阴水）。地支十二个：子（阳水）、丑（阴土）、寅（阳木）、卯（阴木）、辰（阳土）、巳（阴火）、午（阳火）、未（阴土）、申（阳金）、酉（阴金）、戌（阳土）、亥（阴水）。奇数序为阳，偶数序为阴。",
            quote: "干，干也，其数十；支，枝也，其数十二，阴阳相配而成六十甲子。——《三命通会》"
          }, {
            id: "wuxing",
            cat: "阴阳五行",
            badge: "可交互",
            title: "五行生克环",
            desc: "悬停任意一行，看生克关系线动态绘出。",
            thumb: '<svg viewBox="0 0 120 110" width="110"><circle cx="60" cy="50" r="40" fill="none" stroke="var(--hairline)" stroke-width="1"/><circle cx="60" cy="14" r="11" fill="var(--wood)"/><text x="60" y="18" text-anchor="middle" fill="#fff" font-size="10" font-family="serif">木</text><circle cx="96" cy="37" r="11" fill="var(--fire)"/><text x="96" y="41" text-anchor="middle" fill="#fff" font-size="10" font-family="serif">火</text><circle cx="83" cy="80" r="11" fill="var(--earth)"/><text x="83" y="84" text-anchor="middle" fill="#fff" font-size="10" font-family="serif">土</text><circle cx="37" cy="80" r="11" fill="var(--metal)"/><text x="37" y="84" text-anchor="middle" fill="#fff" font-size="10" font-family="serif">金</text><circle cx="24" cy="37" r="11" fill="var(--water)"/><text x="24" y="41" text-anchor="middle" fill="#fff" font-size="10" font-family="serif">水</text></svg>',
            fullDesc: "五行相生：木→火→土→金→水→木，循环无端；五行相克：木克土，土克水，水克火，火克金，金克木。生者如母育子，克者如将制敌，生中有克，克中有生，方为平衡之道。",
            quote: "五行者，金木水火土也，更贵更贱，以知死生，以决成败。——《黄帝内经》"
          }, {
            id: "luoshu",
            cat: "阴阳五行",
            badge: "数理",
            title: "洛书九宫",
            desc: "点选一宫，连线自该宫向两端生长；可切换数字、方位、五行三种视图。",
            thumb: '<svg viewBox="0 0 90 90" width="86"><rect x="5" y="5" width="80" height="80" rx="4" fill="none" stroke="var(--hairline)" stroke-width="1"/><line x1="5" y1="32" x2="85" y2="32" stroke="var(--hairline)" stroke-width=".8"/><line x1="5" y1="58" x2="85" y2="58" stroke="var(--hairline)" stroke-width=".8"/><line x1="32" y1="5" x2="32" y2="85" stroke="var(--hairline)" stroke-width=".8"/><line x1="58" y1="5" x2="58" y2="85" stroke="var(--hairline)" stroke-width=".8"/><text x="18" y="24" text-anchor="middle" fill="var(--ink-2)" font-size="13" font-family="serif" font-weight="600">四</text><text x="45" y="24" text-anchor="middle" fill="var(--cinnabar)" font-size="13" font-family="serif" font-weight="600">九</text><text x="72" y="24" text-anchor="middle" fill="var(--ink-2)" font-size="13" font-family="serif" font-weight="600">二</text><text x="18" y="50" text-anchor="middle" fill="var(--cinnabar)" font-size="13" font-family="serif" font-weight="600">三</text><text x="45" y="50" text-anchor="middle" fill="var(--earth)" font-size="13" font-family="serif" font-weight="600">五</text><text x="72" y="50" text-anchor="middle" fill="var(--cinnabar)" font-size="13" font-family="serif" font-weight="600">七</text><text x="18" y="76" text-anchor="middle" fill="var(--ink-2)" font-size="13" font-family="serif" font-weight="600">八</text><text x="45" y="76" text-anchor="middle" fill="var(--cinnabar)" font-size="13" font-family="serif" font-weight="600">一</text><text x="72" y="76" text-anchor="middle" fill="var(--ink-2)" font-size="13" font-family="serif" font-weight="600">六</text></svg>',
            fullDesc: "洛书九宫数：戴九履一，左三右七，二四为肩，六八为足，五居中央。纵横斜三条线各三组，共八条，每条三数之和皆为十五。此数理被广泛应用于奇门遁甲、风水方位、针灸经络等领域。",
            quote: "河出图，洛出书，圣人则之。——《易经·系辞上》"
          }, {
            id: "jieqi",
            cat: "历法",
            badge: "历法",
            title: "二十四节气环",
            desc: "拖动滑块走完一年，节气、月支与太阳黄经联动显示。",
            thumb: '<svg viewBox="0 0 90 90" width="86"><circle cx="45" cy="45" r="38" fill="none" stroke="var(--hairline)" stroke-width="1.2"/><circle cx="45" cy="45" r="4" fill="var(--gold)"/><line x1="45" y1="45" x2="45" y2="12" stroke="var(--cinnabar)" stroke-width="1.6" stroke-linecap="round"/><text x="45" y="9" text-anchor="middle" fill="var(--ink-3)" font-size="7" font-family="serif">冬至</text><text x="80" y="48" text-anchor="middle" fill="var(--ink-3)" font-size="7" font-family="serif">春分</text><text x="45" y="84" text-anchor="middle" fill="var(--ink-3)" font-size="7" font-family="serif">夏至</text><text x="10" y="48" text-anchor="middle" fill="var(--ink-3)" font-size="7" font-family="serif">秋分</text></svg>',
            fullDesc: "二十四节气以太阳黄经为准，每15度一节气。从立春开始，经春分、夏至、秋分、冬至，完成一个回归年。节气与农历月支对应，是中国古代农业历法的核心。",
            quote: "天地之道，寒暑不时则疾，风雨不节则饥。——《管子》"
          }, {
            id: "bagua",
            cat: "八卦",
            badge: "可交互",
            title: "八卦方位图",
            desc: "点击任意卦，查看卦名、卦象、所属方位与五行属性。",
            thumb: '<svg viewBox="0 0 100 100" width="94"><circle cx="50" cy="50" r="44" fill="none" stroke="var(--hairline)" stroke-width="1"/><text x="50" y="16" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-family="serif">☰</text><text x="78" y="28" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-family="serif">☱</text><text x="86" y="54" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-family="serif">☲</text><text x="78" y="78" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-family="serif">☳</text><text x="50" y="90" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-family="serif">☷</text><text x="22" y="78" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-family="serif">☴</text><text x="14" y="54" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-family="serif">☵</text><text x="22" y="28" text-anchor="middle" fill="var(--ink-2)" font-size="11" font-family="serif">☶</text></svg>',
            fullDesc: "后天八卦方位（文王八卦）：坎北、离南、震东、兑西、乾西北、坤西南、艮东北、巽东南。与先天八卦（伏羲八卦）不同，后天八卦更多用于堪舆风水与六爻占卜中的方位判断。",
            quote: "易有太极，是生两仪，两仪生四象，四象生八卦。——《易经·系辞》"
          }, {
            id: "hexagrams",
            cat: "八卦",
            badge: "六十四卦",
            title: "六十四卦图谱",
            desc: "选择上卦与下卦即时组卦，点击六爻查看原文与爻位解释。",
            thumb: '<svg viewBox="0 0 120 90" width="108"><text x="24" y="28" fill="var(--ink-2)" font-size="16" font-family="serif">䷀</text><text x="52" y="28" fill="var(--wood)" font-size="16" font-family="serif">䷊</text><text x="80" y="28" fill="var(--ink-2)" font-size="16" font-family="serif">䷜</text><text x="24" y="58" fill="var(--gold)" font-size="16" font-family="serif">䷾</text><text x="52" y="58" fill="var(--ink-2)" font-size="16" font-family="serif">䷦</text><text x="80" y="58" fill="var(--cinnabar)" font-size="16" font-family="serif">䷿</text></svg>',
            fullDesc: "六十四卦由八个经卦两两相重而成：下三爻为下卦，上三爻为上卦。页面以组卦台呈现全部组合，选择上下卦即可成卦，再从初爻自下而上逐爻阅读经文与结构解释。",
            quote: "读图顺序：先选上卦与下卦，再从初爻自下而上读六爻；爻辞采用《周易》经文，卦名与序号采用通行的文王六十四卦次序。"
          }, {
            id: "tiangan",
            cat: "命理",
            badge: "对照表",
            title: "天干地支对照",
            desc: "点击任意天干或地支，高亮显示其阴阳、五行、藏干等完整属性。",
            thumb: '<svg viewBox="0 0 120 80" width="110"><rect x="4" y="4" width="112" height="32" rx="6" fill="var(--card)" stroke="var(--hairline)" stroke-width=".8"/><text x="16" y="24" fill="var(--ink-2)" font-size="10" font-family="serif">甲乙丙丁戊己庚辛壬癸</text><rect x="4" y="44" width="112" height="32" rx="6" fill="var(--card)" stroke="var(--hairline)" stroke-width=".8"/><text x="10" y="64" fill="var(--ink-2)" font-size="10" font-family="serif">子丑寅卯辰巳午未申酉戌亥</text></svg>',
            fullDesc: "十天干配五行：甲乙木、丙丁火、戊己土、庚辛金、壬癸水，奇为阳、偶为阴。十二地支各含藏干，子藏癸，丑藏己癸辛……地支藏干是四柱八字取格局、论用神的基础。",
            quote: "干，干也，其数十；支，枝也，其数十二。——《三命通会》"
          }, {
            id: "hetu",
            cat: "阴阳五行",
            badge: "数理",
            title: "河图数理",
            desc: "点选五方或一至十，查看生成数、阴阳奇偶与五行对应。",
            thumb: '<svg viewBox="0 0 90 90" width="86"><circle cx="45" cy="45" r="36" fill="none" stroke="var(--gold)" stroke-width="1"/><path d="M45 15v60M15 45h60" fill="none" stroke="var(--hairline)" stroke-width=".8"/><g font-family="serif" text-anchor="middle"><circle cx="45" cy="15" r="8" fill="var(--fire)" opacity=".88"/><text x="45" y="18" fill="#fffaf2" font-size="7">二七</text><circle cx="45" cy="75" r="8" fill="var(--water)" opacity=".88"/><text x="45" y="78" fill="#fffaf2" font-size="7">一六</text><circle cx="15" cy="45" r="8" fill="var(--wood)" opacity=".88"/><text x="15" y="48" fill="#fffaf2" font-size="7">三八</text><circle cx="75" cy="45" r="8" fill="var(--metal)" opacity=".88"/><text x="75" y="48" fill="#fffaf2" font-size="7">四九</text><circle cx="45" cy="45" r="10" fill="var(--earth)"/><text x="45" y="48" fill="#fffaf2" font-size="7">五十</text></g></svg>',
            fullDesc: "河图以一至十分配五方五行：一六居北为水，二七居南为火，三八居东为木，四九居西为金，五十居中为土。一至五为生数，六至十为成数；奇数为天数，偶数为地数，天数二十五、地数三十，天地之数合五十五。",
            quote: "天一生水，地六成之；地二生火，天七成之。——《尚书大传》"
          }, {
            id: "qimen",
            cat: "奇门",
            badge: "演示",
            title: "奇门九宫布局",
            desc: "切换阴阳遁与局数，点选九宫查看九星、八门和三奇六仪。",
            thumb: '<svg viewBox="0 0 90 90" width="86"><rect x="5" y="5" width="80" height="80" rx="4" fill="none" stroke="var(--hairline)" stroke-width="1"/><line x1="5" y1="32" x2="85" y2="32" stroke="var(--hairline)" stroke-width=".8"/><line x1="5" y1="58" x2="85" y2="58" stroke="var(--hairline)" stroke-width=".8"/><line x1="32" y1="5" x2="32" y2="85" stroke="var(--hairline)" stroke-width=".8"/><line x1="58" y1="5" x2="58" y2="85" stroke="var(--hairline)" stroke-width=".8"/><text x="18" y="22" text-anchor="middle" fill="var(--ink-3)" font-size="8" font-family="serif">巽四</text><text x="45" y="22" text-anchor="middle" fill="var(--cinnabar)" font-size="8" font-family="serif">离九</text><text x="72" y="22" text-anchor="middle" fill="var(--ink-3)" font-size="8" font-family="serif">坤二</text><text x="18" y="48" text-anchor="middle" fill="var(--cinnabar)" font-size="8" font-family="serif">震三</text><text x="45" y="48" text-anchor="middle" fill="var(--gold)" font-size="8" font-family="serif">中五</text><text x="72" y="48" text-anchor="middle" fill="var(--cinnabar)" font-size="8" font-family="serif">兑七</text><text x="18" y="74" text-anchor="middle" fill="var(--ink-3)" font-size="8" font-family="serif">艮八</text><text x="45" y="74" text-anchor="middle" fill="var(--cinnabar)" font-size="8" font-family="serif">坎一</text><text x="72" y="74" text-anchor="middle" fill="var(--ink-3)" font-size="8" font-family="serif">乾六</text></svg>',
            fullDesc: "奇门遁甲以洛书九宫为盘：巽四、离九、坤二居上，震三、中五、兑七居中，艮八、坎一、乾六居下。九星、八门与三奇六仪随阴阳遁和局数排布；本图用于认识盘面层级与顺逆飞布结构，实际起局仍需结合节气、日时与元局。",
            quote: "奇门之学，以天干入地支，以九星配八门，以三奇六仪布局，变化无穷。——《烟波钓叟歌》注"
          } ], f = "all", u = [ "基础知识", "阴阳五行", "八卦", "命理", "历法", "奇门" ], h = {
            "基础知识": {
              no: "01",
              sub: "干支关系 · 旺衰气机 · 十神基础",
              color: "var(--cinnabar)"
            },
            "阴阳五行": {
              no: "02",
              sub: "太极阴阳 · 五行生克 · 河洛数理",
              color: "var(--gold)"
            },
            "八卦": {
              no: "03",
              sub: "先后天方位 · 六十四卦图谱",
              color: "var(--wood)"
            },
            "命理": {
              no: "04",
              sub: "天干地支 · 五行藏气",
              color: "var(--earth)"
            },
            "历法": {
              no: "05",
              sub: "节气时序 · 太阳黄经",
              color: "var(--water)"
            },
            "奇门": {
              no: "06",
              sub: "九宫骨架 · 星门奇仪",
              color: "var(--metal)"
            }
          }, g = {
            basic_wangshuai: "旺",
            basic_tiangan_he: "合",
            basic_dizhi_relations: "支",
            basic_canggan: "藏",
            basic_changsheng: "生",
            basic_jiazi: "甲",
            basic_shishen: "神",
            yinyang_taiji: "太",
            yinyang_four: "律",
            yinyang_symbol: "爻",
            yinyang_ganzhi: "阴",
            wuxing: "行",
            luoshu: "洛",
            jieqi: "节",
            bagua: "卦",
            hexagrams: "易",
            tiangan: "干",
            hetu: "河",
            qimen: "遁"
          }, x = {
            basic_wangshuai: '<svg class="cover-diagram cover-diagram-wangshuai" viewBox="0 0 180 126" role="img" aria-label="旺相休囚死判定次序"><text x="90" y="14" text-anchor="middle" fill="var(--ink-3)" font-size="7" font-family="serif">以月令五行为中心</text>' + [ [ "旺", "得令", "var(--cinnabar)" ], [ "相", "我生", "var(--gold)" ], [ "休", "生我", "var(--wood)" ], [ "囚", "克我", "var(--water)" ], [ "死", "我克", "var(--ink-3)" ] ].map(function(e, t) {
              var n = 16 + 37 * t;
              return '<circle cx="' + n + '" cy="55" r="' + (15 - 1.2 * t) + '" fill="' + e[2] + '" opacity="' + (1 - .1 * t) + '"/><text x="' + n + '" y="59" text-anchor="middle" fill="#fffaf2" font-size="11" font-family="serif" font-weight="700">' + e[0] + '</text><text x="' + n + '" y="87" text-anchor="middle" fill="var(--ink-3)" font-size="6.5" font-family="serif">' + e[1] + "</text>" + (t < 4 ? '<line x1="' + (n + 16) + '" y1="55" x2="' + (n + 20) + '" y2="55" stroke="var(--hairline)" stroke-width="1"/>' : "");
            }).join("") + '<text x="90" y="112" text-anchor="middle" fill="var(--ink-3)" font-size="7" font-family="serif">气势次序，不直接等同吉凶</text></svg>',
            basic_tiangan_he: '<svg class="cover-diagram cover-diagram-he" viewBox="0 0 180 126" role="img" aria-label="天干五合完整关系">' + [ [ "甲", "己", "土", "var(--earth)" ], [ "乙", "庚", "金", "var(--metal)" ], [ "丙", "辛", "水", "var(--water)" ], [ "丁", "壬", "木", "var(--wood)" ], [ "戊", "癸", "火", "var(--fire)" ] ].map(function(e, t) {
              var n = 17 + 23 * t;
              return '<text x="22" y="' + (n + 4) + '" fill="var(--ink-2)" font-size="12" font-family="serif">' + e[0] + '</text><line x1="39" y1="' + n + '" x2="72" y2="' + n + '" stroke="' + e[3] + '" stroke-width="1.4"/><circle cx="90" cy="' + n + '" r="10" fill="' + e[3] + '" opacity=".9"/><text x="90" y="' + (n + 3.5) + '" text-anchor="middle" fill="#fffaf2" font-size="8" font-family="serif">' + e[2] + '</text><line x1="108" y1="' + n + '" x2="141" y2="' + n + '" stroke="' + e[3] + '" stroke-width="1.4"/><text x="149" y="' + (n + 4) + '" fill="var(--ink-2)" font-size="12" font-family="serif">' + e[1] + "</text>";
            }).join("") + "</svg>",
            basic_dizhi_relations: '<svg class="cover-diagram cover-diagram-branch" viewBox="0 0 180 128" role="img" aria-label="十二地支刑冲合害破完整速览">' + [ [ "合", "子丑 寅亥 卯戌 辰酉 巳申 午未", "var(--gold)" ], [ "冲", "子午 丑未 寅申 卯酉 辰戌 巳亥", "var(--cinnabar)" ], [ "刑", "寅巳申 丑未戌 子卯 辰午酉亥自刑", "var(--water)" ], [ "害", "子未 丑午 寅巳 卯辰 申亥 酉戌", "var(--wood)" ], [ "破", "子酉 丑辰 寅亥 卯午 巳申 未戌", "var(--ink-3)" ] ].map(function(e, t) {
              var n = 12 + 23 * t;
              return '<rect x="5" y="' + n + '" width="20" height="18" rx="4" fill="' + e[2] + '" opacity=".92"/><text x="15" y="' + (n + 12.5) + '" text-anchor="middle" fill="#fffaf2" font-size="8" font-family="serif">' + e[0] + '</text><text x="31" y="' + (n + 12.5) + '" fill="var(--ink-2)" font-size="' + (2 === t ? "6.2" : "6.8") + '" font-family="serif">' + e[1] + "</text>";
            }).join("") + "</svg>",
            basic_canggan: '<svg class="cover-diagram cover-diagram-canggan" viewBox="0 0 180 126" role="img" aria-label="十二地支藏干完整表">' + [ [ "子", "癸" ], [ "丑", "己癸辛" ], [ "寅", "甲丙戊" ], [ "卯", "乙" ], [ "辰", "戊乙癸" ], [ "巳", "丙庚戊" ], [ "午", "丁己" ], [ "未", "己丁乙" ], [ "申", "庚壬戊" ], [ "酉", "辛" ], [ "戌", "戊辛丁" ], [ "亥", "壬甲" ] ].map(function(e, t) {
              var n = Math.floor(t / 4), a = 8 + t % 4 * 43, i = 9 + 38 * n;
              return '<rect x="' + a + '" y="' + i + '" width="38" height="31" rx="4" fill="var(--paper-2)" stroke="var(--hairline)" stroke-width=".7"/><text x="' + (a + 7) + '" y="' + (i + 13) + '" fill="var(--cinnabar)" font-size="10" font-family="serif" font-weight="700">' + e[0] + '</text><text x="' + (a + 19) + '" y="' + (i + 25) + '" text-anchor="middle" fill="var(--ink-2)" font-size="7.5" font-family="serif">' + e[1] + "</text>";
            }).join("") + "</svg>",
            basic_changsheng: (e = [ "长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养" ],
            '<svg class="cover-diagram cover-diagram-changsheng" viewBox="0 0 180 126" role="img" aria-label="十二长生气势曲线"><line x1="7" y1="82" x2="173" y2="82" stroke="var(--hairline)" stroke-width=".8"/><polyline points="' + (t = [ 58, 52, 43, 27, 17, 36, 48, 64, 56, 74, 66, 61 ]).map(function(e, t) {
              return (9 + 14.6 * t).toFixed(1) + "," + e;
            }).join(" ") + '" fill="none" stroke="var(--cinnabar)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' + t.map(function(t, n) {
              var a = 9 + 14.6 * n;
              return '<circle cx="' + a.toFixed(1) + '" cy="' + t + '" r="' + (4 === n ? 4 : 2.4) + '" fill="' + (4 === n ? "var(--cinnabar)" : "var(--paper-2)") + '" stroke="var(--cinnabar)" stroke-width="1"/><text x="' + a.toFixed(1) + '" y="' + (95 + n % 2 * 12) + '" text-anchor="middle" fill="var(--ink-3)" font-size="5.8" font-family="serif">' + e[n] + "</text>";
            }).join("") + "</svg>"),
            basic_jiazi: '<svg class="cover-diagram cover-diagram-jiazi" viewBox="0 0 180 126" role="img" aria-label="六旬与旬空完整对照"><text x="11" y="13" fill="var(--ink-3)" font-size="6.5" font-family="serif">六旬</text><text x="151" y="13" text-anchor="middle" fill="var(--ink-3)" font-size="6.5" font-family="serif">旬空</text>' + [ [ "甲子旬", "戌亥" ], [ "甲戌旬", "申酉" ], [ "甲申旬", "午未" ], [ "甲午旬", "辰巳" ], [ "甲辰旬", "寅卯" ], [ "甲寅旬", "子丑" ] ].map(function(e, t) {
              var n = 20 + 17 * t;
              return '<line x1="10" y1="' + (n + 13) + '" x2="170" y2="' + (n + 13) + '" stroke="var(--hairline)" stroke-width=".6"/><text x="12" y="' + (n + 10) + '" fill="var(--ink-2)" font-size="8.5" font-family="serif">' + e[0] + '</text><text x="151" y="' + (n + 10) + '" text-anchor="middle" fill="var(--cinnabar)" font-size="8.5" font-family="serif">' + e[1] + "</text>";
            }).join("") + "</svg>",
            basic_shishen: '<svg class="cover-diagram cover-diagram-shishen" viewBox="0 0 180 126" role="img" aria-label="十神五类关系"><circle cx="90" cy="63" r="20" fill="var(--cinnabar)" opacity=".94"/><text x="90" y="67" text-anchor="middle" fill="#fffaf2" font-size="10" font-family="serif">日主</text>' + [ [ "生我", "印枭" ], [ "同我", "比劫" ], [ "我生", "食伤" ], [ "我克", "财才" ], [ "克我", "官杀" ] ].map(function(e, t) {
              var n = (-90 + 72 * t) * Math.PI / 180, a = 90 + 57 * Math.cos(n), i = 63 + 49 * Math.sin(n);
              return '<line x1="90" y1="63" x2="' + a.toFixed(1) + '" y2="' + i.toFixed(1) + '" stroke="var(--hairline)" stroke-width=".9"/><text x="' + a.toFixed(1) + '" y="' + (i - 2).toFixed(1) + '" text-anchor="middle" fill="var(--gold)" font-size="7" font-family="serif">' + e[0] + '</text><text x="' + a.toFixed(1) + '" y="' + (i + 9).toFixed(1) + '" text-anchor="middle" fill="var(--ink-2)" font-size="8.5" font-family="serif">' + e[1] + "</text>";
            }).join("") + "</svg>",
            yinyang_taiji: '<svg class="cover-diagram cover-diagram-taiji" viewBox="0 0 180 126" role="img" aria-label="标准阴阳太极图"><circle cx="90" cy="63" r="51" fill="var(--paper-2)" stroke="var(--hairline)" stroke-width="1"/><path d="M90 12 A51 51 0 0 1 90 114 A25.5 25.5 0 0 1 90 63 A25.5 25.5 0 0 0 90 12 Z" fill="var(--ink)"/><circle cx="90" cy="37.5" r="7" fill="var(--paper-2)"/><circle cx="90" cy="88.5" r="7" fill="var(--ink)"/></svg>',
            yinyang_symbol: '<svg class="cover-diagram cover-diagram-symbol" viewBox="0 0 180 126" role="img" aria-label="阴阳爻数色符号对照"><text x="17" y="18" fill="var(--cinnabar)" font-size="8" font-family="serif">阳</text><line x1="47" y1="15" x2="91" y2="15" stroke="var(--cinnabar)" stroke-width="7" stroke-linecap="square"/><text x="112" y="19" fill="var(--ink-2)" font-size="8" font-family="serif">奇 · 白 · 昼</text><text x="17" y="50" fill="var(--water)" font-size="8" font-family="serif">阴</text><line x1="47" y1="47" x2="64" y2="47" stroke="var(--water)" stroke-width="7" stroke-linecap="square"/><line x1="74" y1="47" x2="91" y2="47" stroke="var(--water)" stroke-width="7" stroke-linecap="square"/><text x="112" y="51" fill="var(--ink-2)" font-size="8" font-family="serif">偶 · 黑 · 夜</text><circle cx="64" cy="91" r="18" fill="var(--paper-2)" stroke="var(--cinnabar)" stroke-width="1"/><circle cx="116" cy="91" r="18" fill="var(--ink)"/><text x="64" y="95" text-anchor="middle" fill="var(--cinnabar)" font-size="8" font-family="serif">阳</text><text x="116" y="95" text-anchor="middle" fill="var(--paper-2)" font-size="8" font-family="serif">阴</text></svg>',
            yinyang_ganzhi: '<svg class="cover-diagram cover-diagram-ganzhi" viewBox="0 0 180 126" role="img" aria-label="十天干十二地支阴阳五行分布"><text x="7" y="20" fill="var(--gold)" font-size="8" font-family="serif">干</text>' + [ [ "甲", "木", "阳" ], [ "乙", "木", "阴" ], [ "丙", "火", "阳" ], [ "丁", "火", "阴" ], [ "戊", "土", "阳" ], [ "己", "土", "阴" ], [ "庚", "金", "阳" ], [ "辛", "金", "阴" ], [ "壬", "水", "阳" ], [ "癸", "水", "阴" ] ].map(function(e, t) {
              var n = 29 + 15.6 * t;
              return '<text x="' + n.toFixed(1) + '" y="20" text-anchor="middle" fill="' + ("阳" === e[2] ? "var(--cinnabar)" : "var(--ink-3)") + '" font-size="10" font-family="serif">' + e[0] + '</text><text x="' + n.toFixed(1) + '" y="33" text-anchor="middle" fill="var(--ink-3)" font-size="5.5" font-family="serif">' + e[1] + e[2] + "</text>";
            }).join("") + '<line x1="7" y1="52" x2="173" y2="52" stroke="var(--hairline)" stroke-width=".8"/><text x="7" y="76" fill="var(--gold)" font-size="8" font-family="serif">支</text>' + [ [ "子", "水", "阳" ], [ "丑", "土", "阴" ], [ "寅", "木", "阳" ], [ "卯", "木", "阴" ], [ "辰", "土", "阳" ], [ "巳", "火", "阴" ], [ "午", "火", "阳" ], [ "未", "土", "阴" ], [ "申", "金", "阳" ], [ "酉", "金", "阴" ], [ "戌", "土", "阳" ], [ "亥", "水", "阴" ] ].map(function(e, t) {
              var n = 25 + 13.5 * t;
              return '<text x="' + n.toFixed(1) + '" y="76" text-anchor="middle" fill="' + ("阳" === e[2] ? "var(--cinnabar)" : "var(--ink-3)") + '" font-size="10" font-family="serif">' + e[0] + '</text><text x="' + n.toFixed(1) + '" y="90" text-anchor="middle" fill="var(--ink-3)" font-size="5.3" font-family="serif">' + e[1] + e[2] + "</text>";
            }).join("") + '<text x="90" y="116" text-anchor="middle" fill="var(--ink-3)" font-size="7" font-family="serif">奇序为阳 · 偶序为阴</text></svg>',
            wuxing: '<svg class="cover-diagram cover-diagram-wuxing" viewBox="0 0 180 126" role="img" aria-label="五行相生相克完整关系"><polyline points="90,12 145,50 124,112 56,112 35,50 90,12" fill="none" stroke="var(--gold)" stroke-width="1.3"/><polyline points="90,12 124,112 35,50 145,50 56,112 90,12" fill="none" stroke="var(--cinnabar)" stroke-width=".9" opacity=".7"/>' + [ [ "木", 90, 12, "var(--wood)" ], [ "火", 145, 50, "var(--fire)" ], [ "土", 124, 112, "var(--earth)" ], [ "金", 56, 112, "var(--metal)" ], [ "水", 35, 50, "var(--water)" ] ].map(function(e) {
              return '<circle cx="' + e[1] + '" cy="' + e[2] + '" r="12" fill="' + e[3] + '"/><text x="' + e[1] + '" y="' + (e[2] + 3.5) + '" text-anchor="middle" fill="#fffaf2" font-size="9" font-family="serif">' + e[0] + "</text>";
            }).join("") + '<text x="8" y="13" fill="var(--gold)" font-size="6.5" font-family="serif">外环相生</text><text x="8" y="25" fill="var(--cinnabar)" font-size="6.5" font-family="serif">内线相克</text></svg>',
            jieqi: '<svg class="cover-diagram cover-diagram-jieqi" viewBox="0 0 180 126" role="img" aria-label="二十四节气与太阳黄经环"><circle cx="90" cy="63" r="49" fill="none" stroke="var(--hairline)" stroke-width="1"/>' + Array.from({
              length: 24
            }, function(e, t) {
              var n = (-90 + 15 * t) * Math.PI / 180, a = 90 + 49 * Math.cos(n), i = 63 + 49 * Math.sin(n), r = 90 + 55 * Math.cos(n), s = 63 + 55 * Math.sin(n);
              return '<line x1="' + a.toFixed(1) + '" y1="' + i.toFixed(1) + '" x2="' + r.toFixed(1) + '" y2="' + s.toFixed(1) + '" stroke="var(--ink-3)" stroke-width="' + (t % 6 == 0 ? "1.4" : ".7") + '"/>';
            }).join("") + '<line x1="90" y1="63" x2="132" y2="39" stroke="var(--cinnabar)" stroke-width="1.5"/><circle cx="90" cy="63" r="4" fill="var(--gold)"/><text x="90" y="8" text-anchor="middle" fill="var(--ink-3)" font-size="6.5" font-family="serif">夏至 90°</text><text x="170" y="66" text-anchor="end" fill="var(--ink-3)" font-size="6.5" font-family="serif">春分 0°</text><text x="90" y="125" text-anchor="middle" fill="var(--ink-3)" font-size="6.5" font-family="serif">冬至 270°</text><text x="10" y="66" fill="var(--ink-3)" font-size="6.5" font-family="serif">秋分 180°</text></svg>',
            bagua: '<svg class="cover-diagram cover-diagram-bagua" viewBox="0 0 180 128" role="img" aria-label="后天八卦方位"><circle cx="90" cy="64" r="49" fill="none" stroke="var(--hairline)" stroke-width="1"/><circle cx="90" cy="64" r="18" fill="var(--cinnabar-soft)" stroke="var(--cinnabar)" stroke-width=".8"/><text x="90" y="61" text-anchor="middle" fill="var(--cinnabar)" font-size="8" font-family="serif">后天</text><text x="90" y="72" text-anchor="middle" fill="var(--cinnabar)" font-size="8" font-family="serif">八卦</text>' + [ [ "离", "☲", 90, 13 ], [ "坤", "☷", 132, 28 ], [ "兑", "☱", 151, 64 ], [ "乾", "☰", 132, 101 ], [ "坎", "☵", 90, 116 ], [ "艮", "☶", 48, 101 ], [ "震", "☳", 29, 64 ], [ "巽", "☴", 48, 28 ] ].map(function(e) {
              return '<text x="' + e[2] + '" y="' + e[3] + '" text-anchor="middle" fill="var(--ink-2)" font-size="9" font-family="serif">' + e[1] + " " + e[0] + "</text>";
            }).join("") + '<text x="90" y="6" text-anchor="middle" fill="var(--ink-3)" font-size="5.5" font-family="serif">南</text><text x="90" y="127" text-anchor="middle" fill="var(--ink-3)" font-size="5.5" font-family="serif">北</text></svg>',
            hexagrams: '<svg class="cover-diagram cover-diagram-hexagrams" viewBox="0 0 180 126" role="img" aria-label="六十四卦图谱缩略图"><text x="10" y="12" fill="var(--ink-3)" font-size="6.5" font-family="serif">八卦相重 · 六十四象</text>' + [ [ "䷀", "乾", "01" ], [ "䷊", "泰", "11" ], [ "䷜", "坎", "29" ], [ "䷝", "离", "30" ], [ "䷾", "既济", "63" ], [ "䷿", "未济", "64" ] ].map(function(e, t) {
              var n = Math.floor(t / 3), a = 14 + t % 3 * 55, i = 22 + 47 * n;
              return '<rect x="' + a + '" y="' + i + '" width="47" height="39" rx="5" fill="var(--paper-2)" stroke="var(--hairline)" stroke-width=".7"/><text x="' + (a + 8) + '" y="' + (i + 23) + '" fill="var(--wood)" font-size="19" font-family="serif">' + e[0] + '</text><text x="' + (a + 31) + '" y="' + (i + 17) + '" text-anchor="middle" fill="var(--ink)" font-size="8" font-family="serif" font-weight="700">' + e[1] + '</text><text x="' + (a + 31) + '" y="' + (i + 29) + '" text-anchor="middle" fill="var(--ink-3)" font-size="6" font-family="serif">' + e[2] + "</text>";
            }).join("") + "</svg>",
            tiangan: '<svg class="cover-diagram cover-diagram-tiangan-dizhi" viewBox="0 0 180 126" role="img" aria-label="十天干与十二地支五行对照"><text x="8" y="12" fill="var(--gold)" font-size="6.5" font-family="serif" letter-spacing="1">天干 · 五行</text>' + [ [ "甲 乙", "木", "var(--wood)" ], [ "丙 丁", "火", "var(--fire)" ], [ "戊 己", "土", "var(--earth)" ], [ "庚 辛", "金", "var(--metal)" ], [ "壬 癸", "水", "var(--water)" ] ].map(function(e, t) {
              var n = 18 + 36 * t;
              return '<text x="' + n + '" y="34" text-anchor="middle" fill="' + e[2] + '" font-size="11" font-family="serif" font-weight="700">' + e[0] + '</text><line x1="' + (n - 12) + '" y1="43" x2="' + (n + 12) + '" y2="43" stroke="' + e[2] + '" stroke-width="1.2"/><text x="' + n + '" y="54" text-anchor="middle" fill="var(--ink-3)" font-size="6" font-family="serif">' + e[1] + "</text>";
            }).join("") + '<line x1="8" y1="65" x2="172" y2="65" stroke="var(--hairline)" stroke-width=".8"/><text x="8" y="77" fill="var(--gold)" font-size="6.5" font-family="serif" letter-spacing="1">地支 · 四时</text>' + [ [ "子", "var(--water)" ], [ "丑", "var(--earth)" ], [ "寅", "var(--wood)" ], [ "卯", "var(--wood)" ], [ "辰", "var(--earth)" ], [ "巳", "var(--fire)" ], [ "午", "var(--fire)" ], [ "未", "var(--earth)" ], [ "申", "var(--metal)" ], [ "酉", "var(--metal)" ], [ "戌", "var(--earth)" ], [ "亥", "var(--water)" ] ].map(function(e, t) {
              return '<text x="' + (12.5 + 14.1 * t).toFixed(1) + '" y="96" text-anchor="middle" fill="' + e[1] + '" font-size="9.5" font-family="serif" font-weight="700">' + e[0] + "</text>";
            }).join("") + '<line x1="9" y1="105" x2="51" y2="105" stroke="var(--water)" stroke-width="1"/><line x1="51" y1="105" x2="93" y2="105" stroke="var(--wood)" stroke-width="1"/><line x1="93" y1="105" x2="135" y2="105" stroke="var(--fire)" stroke-width="1"/><line x1="135" y1="105" x2="171" y2="105" stroke="var(--metal)" stroke-width="1"/><text x="30" y="117" text-anchor="middle" fill="var(--ink-3)" font-size="5.5" font-family="serif">冬</text><text x="72" y="117" text-anchor="middle" fill="var(--ink-3)" font-size="5.5" font-family="serif">春</text><text x="114" y="117" text-anchor="middle" fill="var(--ink-3)" font-size="5.5" font-family="serif">夏</text><text x="153" y="117" text-anchor="middle" fill="var(--ink-3)" font-size="5.5" font-family="serif">秋</text></svg>'
          };
          function p() {
            var e = document.getElementById("chartsGrid");
            e.innerHTML = "";
            var t = i.filter(function(e) {
              return "all" === f || e.cat === f;
            });
            ("all" === f ? u : [ f ]).forEach(function(n, i) {
              var r = t.filter(function(e) {
                return e.cat === n;
              });
              if (r.length) {
                var s = h[n], o = document.createElement("section");
                o.className = "chart-group reveal", o.style.setProperty("--group-color", s.color),
                o.innerHTML = '<header class="chart-group-head"><div class="chart-group-index">' + s.no + '</div><div class="chart-group-title"><span>' + n + "</span><small>" + s.sub + '</small></div><div class="chart-group-count">' + String(r.length).padStart(2, "0") + ' 项</div></header><div class="chart-group-grid"></div>';
                var l = o.querySelector(".chart-group-grid");
                r.forEach(function(e, t) {
                  var n = document.createElement("button");
                  n.type = "button", n.className = "chart-card reveal", n.dataset.chartId = e.id,
                  n.dataset.chartCat = e.cat, n.style.setProperty("--card-accent", s.color), n.style.transitionDelay = .055 * Math.min(t, 3) + "s",
                  n.setAttribute("aria-label", "打开" + e.title + "图解"), n.innerHTML = '<div class="chart-card-visual" aria-hidden="true"><span class="cover-series">GUANXIANG · ' + s.no + '</span><span class="cover-index">' + String(t + 1).padStart(2, "0") + '</span><div class="cover-mark">' + g[e.id] + '</div><div class="glyph">' + (x[e.id] || e.thumb) + '</div><span class="cover-seal">观象<br>图志</span></div><div class="chart-card-copy"><span class="badge">' + e.badge + '</span><h3 class="serif">' + e.title + "</h3><p>" + e.desc + '</p></div><div class="go-row"><span class="cat-tag">交互图解</span><span class="go-arrow" aria-hidden="true">进入 <b>›</b></span></div>',
                  n.addEventListener("click", function() {
                    v(e.id);
                  }), l.appendChild(n), setTimeout(function() {
                    a.observe(n);
                  }, 10);
                }), e.appendChild(o), setTimeout(function() {
                  a.observe(o);
                }, 10 + 30 * i);
              }
            });
          }
          function v(e) {
            y(e);
          }
          function y(e) {
            var t = i.find(function(t) {
              return t.id === e;
            });
            if (t) {
              var n = document.getElementById("detailPanel");
              n.dataset.chartId = e, document.getElementById("detailEye").textContent = t.cat + " · " + t.badge,
              document.getElementById("detailTitle").textContent = t.title, document.getElementById("detailDesc").textContent = t.fullDesc,
              document.getElementById("explainArea").innerHTML = "<h2>原理说明</h2><p>" + t.fullDesc + "</p>" + (t.quote ? "<blockquote>" + t.quote + "</blockquote>" : ""),
              document.getElementById("liveTip").textContent = "——";
              var a = document.getElementById("vizCanvas");
              a.innerHTML = "";
              var r = {
                basic_wangshuai: E,
                basic_tiangan_he: z,
                basic_dizhi_relations: A,
                basic_canggan: L,
                basic_changsheng: C,
                basic_jiazi: N,
                basic_shishen: _,
                yinyang_taiji: M,
                yinyang_four: S,
                yinyang_symbol: q,
                yinyang_ganzhi: T,
                wuxing: j,
                luoshu: H,
                jieqi: B,
                bagua: P,
                hexagrams: I,
                tiangan: D,
                hetu: F,
                qimen: W
              };
              r[e] && r[e](a), n.classList.add("open"),
              window.scrollTo(0, 0);
            }
          }
          function b(e) {
            document.getElementById("liveTip").textContent = e;
          }
          var w = {
            "木": "var(--wx-wood)",
            "火": "var(--wx-fire)",
            "土": "var(--wx-earth)",
            "金": "var(--wx-metal)",
            "水": "var(--wx-water)"
          };
          function k(e) {
            return w[e] || "var(--ink-2)";
          }
          function E(e) {
            var t = [ {
              season: "春",
              months: "寅卯辰",
              command: "木",
              image: "生发",
              summary: "春令木旺，气从地下升发，火得木生而相。",
              rows: [ {
                wx: "木",
                state: "旺",
                score: 100,
                relation: "得令",
                note: "当令最盛，主生发、条达、扩张。"
              }, {
                wx: "火",
                state: "相",
                score: 82,
                relation: "我生者相",
                note: "木生火，火得木助，气势跟进。"
              }, {
                wx: "水",
                state: "休",
                score: 58,
                relation: "生我者休",
                note: "水生木而泄气，退居其后。"
              }, {
                wx: "金",
                state: "囚",
                score: 34,
                relation: "克我者囚",
                note: "金虽克木，但春木当令，金受令气制约。"
              }, {
                wx: "土",
                state: "死",
                score: 16,
                relation: "我克者死",
                note: "木旺克土，土气最弱。"
              } ]
            }, {
              season: "夏",
              months: "巳午未",
              command: "火",
              image: "炎上",
              summary: "夏令火旺，光热外放，土得火生而相。",
              rows: [ {
                wx: "火",
                state: "旺",
                score: 100,
                relation: "得令",
                note: "当令炎上，火气最盛。"
              }, {
                wx: "土",
                state: "相",
                score: 82,
                relation: "我生者相",
                note: "火生土，土气随火而旺。"
              }, {
                wx: "木",
                state: "休",
                score: 58,
                relation: "生我者休",
                note: "木生火而泄气，转为休息。"
              }, {
                wx: "水",
                state: "囚",
                score: 34,
                relation: "克我者囚",
                note: "水虽克火，但夏火强盛，水被蒸制。"
              }, {
                wx: "金",
                state: "死",
                score: 16,
                relation: "我克者死",
                note: "火旺克金，金气最弱。"
              } ]
            }, {
              season: "秋",
              months: "申酉戌",
              command: "金",
              image: "肃降",
              summary: "秋令金旺，气机收敛肃降，水得金生而相。",
              rows: [ {
                wx: "金",
                state: "旺",
                score: 100,
                relation: "得令",
                note: "当令肃杀，金气最盛。"
              }, {
                wx: "水",
                state: "相",
                score: 82,
                relation: "我生者相",
                note: "金生水，水气相随。"
              }, {
                wx: "土",
                state: "休",
                score: 58,
                relation: "生我者休",
                note: "土生金而泄气，归于休息。"
              }, {
                wx: "火",
                state: "囚",
                score: 34,
                relation: "克我者囚",
                note: "火虽克金，但秋金当令，火受拘束。"
              }, {
                wx: "木",
                state: "死",
                score: 16,
                relation: "我克者死",
                note: "金旺克木，木气最弱。"
              } ]
            }, {
              season: "冬",
              months: "亥子丑",
              command: "水",
              image: "闭藏",
              summary: "冬令水旺，寒润内藏，木得水生而相。",
              rows: [ {
                wx: "水",
                state: "旺",
                score: 100,
                relation: "得令",
                note: "当令寒润，水气最盛。"
              }, {
                wx: "木",
                state: "相",
                score: 82,
                relation: "我生者相",
                note: "水生木，木气暗中相随。"
              }, {
                wx: "金",
                state: "休",
                score: 58,
                relation: "生我者休",
                note: "金生水而泄气，退为休息。"
              }, {
                wx: "土",
                state: "囚",
                score: 34,
                relation: "克我者囚",
                note: "土虽克水，但冬水强盛，土被湿困。"
              }, {
                wx: "火",
                state: "死",
                score: 16,
                relation: "我克者死",
                note: "水旺克火，火气最弱。"
              } ]
            }, {
              season: "四季",
              months: "辰戌丑未",
              command: "土",
              image: "归藏",
              summary: "四季月土旺，气归中央，金得土生而相。",
              rows: [ {
                wx: "土",
                state: "旺",
                score: 100,
                relation: "得令",
                note: "季月土气归藏，土为主令。"
              }, {
                wx: "金",
                state: "相",
                score: 82,
                relation: "我生者相",
                note: "土生金，金气相随。"
              }, {
                wx: "火",
                state: "休",
                score: 58,
                relation: "生我者休",
                note: "火生土而泄气，火势收敛。"
              }, {
                wx: "木",
                state: "囚",
                score: 34,
                relation: "克我者囚",
                note: "木虽克土，但土旺，木反受困。"
              }, {
                wx: "水",
                state: "死",
                score: 16,
                relation: "我克者死",
                note: "土旺克水，水气最弱。"
              } ]
            } ], n = {
              "旺": "当令主气",
              "相": "得生助起",
              "休": "生令泄气",
              "囚": "克令受制",
              "死": "被令所克"
            };
            e.style.width = "100%", e.style.maxWidth = "920px";
            var a = document.createElement("div");
            a.className = "wangshuai-board";
            var i = document.createElement("div");
            i.className = "wangshuai-tabs";
            var r = document.createElement("div");
            r.className = "wangshuai-hero", r.innerHTML = '<div class="wangshuai-command"><span class="wangshuai-season"></span><strong></strong><em></em></div><div class="wangshuai-summary"><span></span><p></p><div class="wangshuai-formula"><b>旺</b><i></i><b>相</b><i></i><b>休</b><i></i><b>囚</b><i></i><b>死</b></div></div><div class="wangshuai-rule"><span>判法</span><p>先看月令何五行当旺，再按「我生、生我、克我、我克」排出相、休、囚、死。</p></div>';
            var s = document.createElement("div");
            s.className = "wangshuai-ladder";
            var o = document.createElement("div");
            function l(e) {
              var a = t[e];
              Array.prototype.forEach.call(i.children, function(t, n) {
                t.classList.toggle("is-active", n === e), t.setAttribute("aria-pressed", n === e ? "true" : "false");
              });
              var o = k(a.command);
              r.style.setProperty("--command-color", o), r.querySelector(".wangshuai-season").textContent = a.season + "令",
              r.querySelector(".wangshuai-command strong").textContent = a.command, r.querySelector(".wangshuai-command em").textContent = "旺",
              r.querySelector(".wangshuai-summary span").textContent = a.months + "月 · " + a.image,
              r.querySelector(".wangshuai-summary p").textContent = a.summary, s.innerHTML = "",
              a.rows.forEach(function(e, t) {
                var i = document.createElement("button");
                i.type = "button", i.className = "wangshuai-card", i.style.setProperty("--wx-color", k(e.wx)),
                i.style.setProperty("--score", e.score + "%"), i.innerHTML = '<span class="wangshuai-rank">0' + (t + 1) + "</span><strong>" + e.wx + "</strong><em>" + e.state + '</em><div class="wangshuai-meter"><i></i></div><small>' + e.relation + '</small><span class="wangshuai-level">' + n[e.state] + "</span>",
                i.addEventListener("click", function() {
                  c(a, e, i);
                }), i.addEventListener("pointerenter", function() {
                  c(a, e, i);
                }), s.appendChild(i);
              }), c(a, a.rows[0], s.children[0]), b(a.season + "令：" + a.command + "旺，点击季节切换");
            }
            function c(e, t, a) {
              Array.prototype.forEach.call(s.children, function(e) {
                e.classList.remove("is-active");
              }), a && a.classList.add("is-active");
              var i = k(t.wx);
              o.style.setProperty("--wx-color", i), o.innerHTML = "<div><span>" + e.season + "令 · " + e.months + "月</span><strong>" + t.wx + "为" + t.state + "</strong></div><p>" + t.relation + "：" + t.note + "</p><small>气势参考 " + t.score + " / 100 · " + n[t.state] + "</small>",
              b(t.wx + "为" + t.state + "：" + t.note);
            }
            o.className = "wangshuai-detail", t.forEach(function(e, t) {
              var n = document.createElement("button");
              n.type = "button", n.className = "wangshuai-tab", n.innerHTML = "<strong>" + e.season + "</strong><span>" + e.months + "</span>",
              n.addEventListener("click", function() {
                l(t);
              }), i.appendChild(n);
            }), a.appendChild(i), a.appendChild(r), a.appendChild(s), a.appendChild(o), e.appendChild(a),
            l(0);
          }
          function z(e) {
            var t = {
              "甲": "var(--wx-wood)",
              "乙": "var(--wx-wood)",
              "丙": "var(--wx-fire)",
              "丁": "var(--wx-fire)",
              "戊": "var(--wx-earth)",
              "己": "var(--wx-earth)",
              "庚": "var(--wx-metal)",
              "辛": "var(--wx-metal)",
              "壬": "var(--wx-water)",
              "癸": "var(--wx-water)"
            }, n = [ {
              pair: "甲己",
              result: "合土",
              wx: "土",
              left: "阳木",
              right: "阴土",
              theme: "中正承载",
              note: "甲为阳木，己为阴土。合土成象时，多主牵连、承载、田宅、信用与中介。",
              condition: "得辰戌丑未月，或土气通根透出，较容易见化土之象。",
              caution: "先论有合，再看能否化土；土弱或木土相战时，只取牵绊之象。"
            }, {
              pair: "乙庚",
              result: "合金",
              wx: "金",
              left: "阴木",
              right: "阳金",
              theme: "规制成器",
              note: "乙为阴木，庚为阳金。合金多主约束、规则、决断，也常见合作中带压力。",
              condition: "申酉月或金气有根有助时，较容易见化金之象。",
              caution: "乙庚相合常带裁剪、规范之意；金不成气时，多是压力与约束。"
            }, {
              pair: "丙辛",
              result: "合水",
              wx: "水",
              left: "阳火",
              right: "阴金",
              theme: "明暗相感",
              note: "丙为阳火，辛为阴金。合水多主情感、智慧、流动、隐秘，也要防火金相战。",
              condition: "亥子月或水势成局时，较容易见化水之象。",
              caution: "火金本有相制，若无水势承接，容易表现为欲合不稳、明暗拉扯。"
            }, {
              pair: "丁壬",
              result: "合木",
              wx: "木",
              left: "阴火",
              right: "阳水",
              theme: "滋养生发",
              note: "丁为阴火，壬为阳水。合木多主生发、文思、计划、关系滋长。",
              condition: "寅卯月或木气通根时，较容易见化木之象。",
              caution: "水火相济才有生发；木气不足时，多看作情感、想法与计划的牵引。"
            }, {
              pair: "戊癸",
              result: "合火",
              wx: "火",
              left: "阳土",
              right: "阴水",
              theme: "蓄势显明",
              note: "戊为阳土，癸为阴水。合火多主显露、热度、欲望、名声，也有水土激发之意。",
              condition: "巳午月或火气透根时，较容易见化火之象。",
              caution: "戊癸合火最忌寒湿无火，条件不足时只见暗合、迟滞或内在欲望。"
            } ];
            e.style.width = "100%", e.style.maxWidth = "760px";
            var a = document.createElement("div");
            a.className = "tianganhe-board";
            var i = document.createElement("div");
            i.className = "tianganhe-tabs";
            var r = document.createElement("div");
            r.className = "tianganhe-hero", r.innerHTML = '<div class="tianganhe-scroll"><div class="tianganhe-pair"><div class="tianganhe-stem tianganhe-left"><strong></strong><span></span></div><div class="tianganhe-bridge"><i></i><em>合</em><i></i></div><div class="tianganhe-stem tianganhe-right"><strong></strong><span></span></div></div><div class="tianganhe-axis"><span>牵合</span><i></i><span>得势</span><i></i><span>化气</span></div></div><div class="tianganhe-result"><span>化气归属</span><strong></strong><small></small><p>合象先成立，化气后成立。若月令、根气、透出不助，只取牵合与羁绊之象。</p></div>';
            var s = document.createElement("div");
            s.className = "tianganhe-detail";
            var o = document.createElement("div");
            o.className = "tianganhe-condition";
            var l = document.createElement("div");
            function c(e) {
              var l = n[e], c = k(l.wx);
              Array.prototype.forEach.call(i.children, function(t, n) {
                t.classList.toggle("is-active", n === e), t.setAttribute("aria-pressed", n === e ? "true" : "false");
              }), a.style.setProperty("--he-color", c);
              var d = r.querySelectorAll(".tianganhe-stem"), m = l.pair[0], f = l.pair[1];
              d[0].querySelector("strong").textContent = m, d[0].querySelector("strong").style.color = t[m] || "var(--he-color)",
              d[0].querySelector("span").textContent = l.left, d[1].querySelector("strong").textContent = f,
              d[1].querySelector("strong").style.color = t[f] || "var(--he-color)", d[1].querySelector("span").textContent = l.right,
              r.querySelector(".tianganhe-result strong").textContent = l.wx, r.querySelector(".tianganhe-result small").textContent = l.theme,
              s.innerHTML = "<div><span>" + l.pair + " · " + l.result + "</span><strong>" + l.theme + "</strong></div><p>" + l.note + "</p><small>五合不是「见合必化」，成化要回到月令与全局气势。</small>",
              o.innerHTML = "<section><span>成化条件</span><p>" + l.condition + "</p></section><section><span>实盘提醒</span><p>" + l.caution + "</p></section><section><span>象意关键词</span><p>" + l.theme + " · " + l.left + "与" + l.right + "相牵，先看关系，再看成败。</p></section>",
              b(l.pair + "：" + l.result + "。合象先成立，化气看条件。");
            }
            l.className = "tianganhe-rule", l.innerHTML = "<span>判读顺序</span><ol><li>先见两干相合，判断人事牵连。</li><li>再看化神是否得月令、通根、透出。</li><li>条件不足时，不强论化气，只论合象。</li></ol>",
            n.forEach(function(e, t) {
              var n = document.createElement("button");
              n.type = "button", n.className = "tianganhe-tab", n.innerHTML = "<strong>" + e.pair + "</strong><span>" + e.result + "</span>",
              n.addEventListener("click", function() {
                c(t);
              }), i.appendChild(n);
            }), a.appendChild(i), a.appendChild(r), a.appendChild(s), a.appendChild(o), a.appendChild(l),
            e.appendChild(a), c(0);
          }
          function A(e) {
            var t = "子丑寅卯辰巳午未申酉戌亥".split(""), a = [ {
              name: "六合",
              color: "#b8893a",
              tone: "牵合成事",
              summary: "六合偏向关系粘连、合作、牵引与成事。成化与否另看月令、旺衰与局势。",
              note: "六合主牵合、成事、关系粘连，成化与否另看局势。",
              groups: [ [ "子", "丑", "合土" ], [ "寅", "亥", "合木" ], [ "卯", "戌", "合火" ], [ "辰", "酉", "合金" ], [ "巳", "申", "合水" ], [ "午", "未", "合土" ] ]
            }, {
              name: "六冲",
              color: "#c8472e",
              tone: "相对发动",
              summary: "六冲偏向变动、分离、碰撞与冲开。它不一定全凶，也可能表示突破停滞。",
              note: "六冲主动、变动、分离、碰撞，也可表示冲开与激发。",
              groups: [ [ "子", "午", "水火冲" ], [ "丑", "未", "燥湿土冲" ], [ "寅", "申", "木金冲" ], [ "卯", "酉", "木金冲" ], [ "辰", "戌", "燥湿土冲" ], [ "巳", "亥", "火水冲" ] ]
            }, {
              name: "三刑",
              color: "#1f1c18",
              tone: "失衡纠缠",
              summary: "三刑多看偏执、压力、纠缠与内耗。要结合旺衰和所问事项判断轻重。",
              note: "刑主偏执、纠缠、失衡与压力，需结合旺衰和用神判断轻重。",
              groups: [ [ "寅", "巳", "申", "无恩之刑" ], [ "丑", "戌", "未", "恃势之刑" ], [ "子", "卯", "无礼之刑" ], [ "辰", "辰", "自刑" ], [ "午", "午", "自刑" ], [ "酉", "酉", "自刑" ], [ "亥", "亥", "自刑" ] ]
            }, {
              name: "六害",
              color: "#8c6f3d",
              tone: "暗损牵制",
              summary: "六害不如冲明显，更多表现为暗处消耗、互相牵制、不顺眼处的损耗。",
              note: "害主暗损、牵制、不顺眼处的消耗，常不如冲明显。",
              groups: [ [ "子", "未", "相害" ], [ "丑", "午", "相害" ], [ "寅", "巳", "相害" ], [ "卯", "辰", "相害" ], [ "申", "亥", "相害" ], [ "酉", "戌", "相害" ] ]
            }, {
              name: "六破",
              color: "#5c564c",
              tone: "破散松动",
              summary: "六破主结构松动、破损、关系裂缝与旧局破散，常用于观察成败边界。",
              note: "破主破散、破损、旧结构松动，常用于看关系与成败边界。",
              groups: [ [ "子", "酉", "相破" ], [ "丑", "辰", "相破" ], [ "寅", "亥", "相破" ], [ "卯", "午", "相破" ], [ "巳", "申", "相破" ], [ "未", "戌", "相破" ] ]
            } ], i = 0, r = null;
            e.style.width = "100%", e.style.maxWidth = "920px";
            var s = document.createElement("div");
            s.className = "dizhi-rel-board";
            var o = document.createElement("div");
            o.className = "dizhi-rel-tabs", a.forEach(function(e, t) {
              var n = document.createElement("button");
              n.type = "button", n.className = "dizhi-rel-tab", n.innerHTML = "<strong>" + e.name + "</strong><span>" + e.tone + "</span>",
              n.addEventListener("click", function() {
                i = t, r = null, k();
              }), o.appendChild(n);
            });
            var l = document.createElement("div");
            l.className = "dizhi-rel-stage";
            var c = document.createElement("div");
            c.className = "dizhi-rel-chart";
            var d = document.createElementNS(n, "svg");
            d.setAttribute("viewBox", "0 0 340 340"), d.setAttribute("class", "dizhi-rel-svg");
            var m = document.createElementNS(n, "circle");
            m.setAttribute("cx", "170"), m.setAttribute("cy", "170"), m.setAttribute("r", "122"),
            m.setAttribute("fill", "none"), m.setAttribute("stroke", "var(--hairline)"), m.setAttribute("stroke-width", "1"),
            d.appendChild(m);
            var f = document.createElementNS(n, "circle");
            f.setAttribute("cx", "170"), f.setAttribute("cy", "170"), f.setAttribute("r", "78"),
            f.setAttribute("fill", "none"), f.setAttribute("stroke", "var(--hairline)"), f.setAttribute("stroke-width", ".8"),
            f.setAttribute("opacity", ".7"), d.appendChild(f);
            var u = document.createElementNS(n, "g");
            d.appendChild(u);
            var h = document.createElementNS(n, "g");
            d.appendChild(h);
            var g = document.createElement("div");
            g.className = "dizhi-rel-center", c.appendChild(d), c.appendChild(g);
            var x = document.createElement("div");
            x.className = "dizhi-rel-info";
            var p = document.createElement("div");
            function v(e) {
              var n = -Math.PI / 2 + t.indexOf(e) * Math.PI / 6;
              return [ 170 + 122 * Math.cos(n), 170 + 122 * Math.sin(n) ];
            }
            function y(e) {
              return !r || e.indexOf(r) >= 0;
            }
            function w(e, t, a, i) {
              var r = v(e), s = v(t), o = document.createElementNS(n, "line");
              o.setAttribute("x1", r[0]), o.setAttribute("y1", r[1]), o.setAttribute("x2", s[0]),
              o.setAttribute("y2", s[1]), o.setAttribute("stroke", a), o.setAttribute("stroke-width", i ? "2.3" : "1.1"),
              o.setAttribute("opacity", i ? ".9" : ".18"), o.setAttribute("stroke-linecap", "round"),
              o.setAttribute("class", "dizhi-rel-line"), o.style.animationDelay = 36 * u.children.length + "ms",
              u.appendChild(o);
            }
            function k() {
              var e = a[i], l = e.groups.filter(y);
              s.style.setProperty("--rel-color", e.color), Array.prototype.forEach.call(o.children, function(e, t) {
                e.classList.toggle("is-active", t === i), e.setAttribute("aria-pressed", t === i ? "true" : "false");
              }), u.innerHTML = "", h.innerHTML = "", p.innerHTML = "", e.groups.forEach(function(t) {
                var a = t.slice(0, t.length - 1), i = y(a);
                if (1 === a.length || 2 === a.length && a[0] === a[1]) {
                  var r = v(a[0]), s = document.createElementNS(n, "circle");
                  s.setAttribute("cx", r[0]), s.setAttribute("cy", r[1]), s.setAttribute("r", "23"),
                  s.setAttribute("fill", "none"), s.setAttribute("stroke", e.color), s.setAttribute("stroke-width", i ? "2.4" : "1.2"),
                  s.setAttribute("opacity", i ? ".92" : ".16"), s.setAttribute("class", "dizhi-rel-line"),
                  s.style.animationDelay = 36 * u.children.length + "ms", u.appendChild(s);
                } else {
                  for (var o = 0; o < a.length - 1; o++) w(a[o], a[o + 1], e.color, i);
                  a.length > 2 && w(a[a.length - 1], a[0], e.color, i);
                }
              }), t.forEach(function(a) {
                var i = v(a), s = l.some(function(e) {
                  return e.indexOf(a) >= 0;
                }), o = document.createElementNS(n, "g");
                o.setAttribute("class", "dizhi-rel-node" + (s ? " is-related" : "") + (r === a ? " is-focus" : "")),
                o.style.cursor = "pointer", o.style.animationDelay = 18 * t.indexOf(a) + "ms";
                var c = document.createElementNS(n, "circle");
                c.setAttribute("cx", i[0]), c.setAttribute("cy", i[1]), c.setAttribute("r", r === a ? "20" : "17"),
                c.setAttribute("fill", s ? e.color : "var(--card)"), c.setAttribute("stroke", s ? e.color : "rgba(31,28,24,.1)"),
                c.setAttribute("stroke-width", "1.2"), c.setAttribute("opacity", s ? "1" : ".78");
                var d = document.createElementNS(n, "text");
                d.setAttribute("x", i[0]), d.setAttribute("y", i[1] + 5), d.setAttribute("text-anchor", "middle"),
                d.setAttribute("fill", s ? "#fffdf7" : "var(--ink-3)"), d.setAttribute("font-size", "14"),
                d.setAttribute("font-family", '"Songti SC","STSong",serif'), d.style.pointerEvents = "none",
                d.textContent = a, o.appendChild(c), o.appendChild(d), h.appendChild(o), o.addEventListener("click", function() {
                  r = r === a ? null : a, k();
                });
              }), g.innerHTML = "<span>" + e.name + "</span><strong>" + (r || "十二支") + "</strong><small>" + e.tone + "</small>";
              var c = r ? "当前只看「" + r + "」相关关系" : "当前显示全部关系组";
              x.innerHTML = "<span>" + e.name + " · " + e.tone + "</span><strong>" + c + "</strong><p>" + e.summary + "</p><small>点击任一地支，可筛选与它相关的关系；再次点击取消筛选。</small>",
              e.groups.forEach(function(e) {
                var t = e.slice(0, e.length - 1), n = e[e.length - 1], a = y(t), i = document.createElement("button");
                i.type = "button", i.className = "dizhi-rel-card" + (a ? " is-active" : ""), i.style.animationDelay = 34 * p.children.length + "ms",
                i.innerHTML = "<span>" + t.join(" · ") + "</span><strong>" + n + "</strong>", i.addEventListener("click", function() {
                  r = t[0], k();
                }), p.appendChild(i);
              }), b((r ? r + "相关" : "全部") + " · " + e.name + "：" + e.note);
            }
            p.className = "dizhi-rel-list", l.appendChild(c), l.appendChild(x), s.appendChild(o),
            s.appendChild(l), s.appendChild(p), e.appendChild(s), k();
          }
          function L(e) {
            var t = [ {
              zhi: "子",
              wx: "水",
              month: "冬至前后",
              cang: [ [ "癸", "本气", "水" ] ],
              note: "子水纯粹，以癸水为根。"
            }, {
              zhi: "丑",
              wx: "土",
              month: "寒湿之土",
              cang: [ [ "己", "本气", "土" ], [ "癸", "中气", "水" ], [ "辛", "余气", "金" ] ],
              note: "丑为湿土，含水金之气。"
            }, {
              zhi: "寅",
              wx: "木",
              month: "初春木气",
              cang: [ [ "甲", "本气", "木" ], [ "丙", "中气", "火" ], [ "戊", "余气", "土" ] ],
              note: "寅木生发，内含火土萌动。"
            }, {
              zhi: "卯",
              wx: "木",
              month: "仲春木旺",
              cang: [ [ "乙", "本气", "木" ] ],
              note: "卯为纯木，以乙木为根。"
            }, {
              zhi: "辰",
              wx: "土",
              month: "春末湿土",
              cang: [ [ "戊", "本气", "土" ], [ "乙", "中气", "木" ], [ "癸", "余气", "水" ] ],
              note: "辰为水库湿土，木水余气仍在。"
            }, {
              zhi: "巳",
              wx: "火",
              month: "初夏火气",
              cang: [ [ "丙", "本气", "火" ], [ "戊", "中气", "土" ], [ "庚", "余气", "金" ] ],
              note: "巳火升腾，兼有土金伏藏。"
            }, {
              zhi: "午",
              wx: "火",
              month: "仲夏火旺",
              cang: [ [ "丁", "本气", "火" ], [ "己", "中气", "土" ] ],
              note: "午火极盛，己土随火而生。"
            }, {
              zhi: "未",
              wx: "土",
              month: "夏末燥土",
              cang: [ [ "己", "本气", "土" ], [ "丁", "中气", "火" ], [ "乙", "余气", "木" ] ],
              note: "未为燥土，火木余气仍存。"
            }, {
              zhi: "申",
              wx: "金",
              month: "初秋金气",
              cang: [ [ "庚", "本气", "金" ], [ "壬", "中气", "水" ], [ "戊", "余气", "土" ] ],
              note: "申金发令，水土同藏。"
            }, {
              zhi: "酉",
              wx: "金",
              month: "仲秋金旺",
              cang: [ [ "辛", "本气", "金" ] ],
              note: "酉为纯金，以辛金为根。"
            }, {
              zhi: "戌",
              wx: "土",
              month: "秋末燥土",
              cang: [ [ "戊", "本气", "土" ], [ "辛", "中气", "金" ], [ "丁", "余气", "火" ] ],
              note: "戌为火库燥土，金火余气并见。"
            }, {
              zhi: "亥",
              wx: "水",
              month: "初冬水气",
              cang: [ [ "壬", "本气", "水" ], [ "甲", "中气", "木" ] ],
              note: "亥水开冬，甲木在水中孕育。"
            } ], n = {
              "本气": "主气最重",
              "中气": "承接其势",
              "余气": "伏藏余韵"
            }, a = 0;
            e.style.width = "100%", e.style.maxWidth = "920px";
            var i = document.createElement("div");
            i.className = "canggan-board";
            var r = document.createElement("div");
            r.className = "canggan-grid";
            var s = document.createElement("div");
            s.className = "canggan-detail";
            var o = document.createElement("div");
            function l() {
              var e = t[a];
              Array.prototype.forEach.call(r.children, function(e, t) {
                e.classList.toggle("is-active", t === a), e.setAttribute("aria-pressed", t === a ? "true" : "false");
              }), s.innerHTML = '<div class="canggan-title"><div><span>地支藏干</span><strong>' + e.zhi + "</strong></div><small>" + e.wx + " · " + e.month + '</small></div><div class="canggan-layers"></div><p>' + e.note + "</p>";
              var i = s.querySelector(".canggan-layers");
              e.cang.forEach(function(e, t) {
                var a = document.createElement("section");
                a.className = "canggan-layer level-" + t, a.style.animationDelay = 70 * t + "ms",
                a.innerHTML = "<em>" + e[1] + "</em><strong>" + e[0] + "</strong><span>" + e[2] + " · " + (n[e[1]] || "藏气") + "</span>",
                i.appendChild(a);
              }), [ "中气", "余气" ].forEach(function(t) {
                if (!e.cang.some(function(e) {
                  return e[1] === t;
                })) {
                  var n = document.createElement("section");
                  n.className = "canggan-layer is-empty", n.innerHTML = "<em>" + t + "</em><strong>—</strong><span>此支不藏" + t + "</span>",
                  i.appendChild(n);
                }
              }), b(e.zhi + "藏干：" + e.cang.map(function(e) {
                return e[0] + e[1];
              }).join("，"));
            }
            o.className = "canggan-hint", o.innerHTML = "<strong>藏干读法</strong><p>地支不是单一五行，而是把天干之气收入其中。本气为根，中气为承，余气为伏；取格局、看通根，都先从这里入手。</p>",
            t.forEach(function(e, t) {
              var n = document.createElement("button");
              n.type = "button", n.className = "canggan-zhi", n.innerHTML = "<strong>" + e.zhi + "</strong><span>" + e.wx + "</span>",
              n.style.animationDelay = 22 * t + "ms", n.addEventListener("click", function() {
                a = t, l();
              }), r.appendChild(n);
            }), i.appendChild(r), i.appendChild(s), i.appendChild(o), e.appendChild(i), l();
          }
          function C(e) {
            var t = [ [ "长生", "初生", "气机初生，如人出生", 2.4 ], [ "沐浴", "洗濯", "新气洗濯，未定而动", 2.9 ], [ "冠带", "成形", "形气渐成，开始有序", 3.5 ], [ "临官", "任事", "气势成职，可以任事", 4.35 ], [ "帝旺", "极盛", "气势极盛，最为饱满", 5 ], [ "衰", "回落", "盛极转衰，力量回落", 3.75 ], [ "病", "失衡", "气机失衡，易见阻滞", 2.6 ], [ "死", "终尽", "旧气终尽，难再发用", 1.35 ], [ "墓", "归藏", "归藏入库，收束保存", 1.8 ], [ "绝", "断续", "前气断绝，等待转换", .85 ], [ "胎", "受孕", "新气受孕，尚未成形", 1.35 ], [ "养", "孕养", "孕养将成，等待出生", 1.9 ] ], a = {
              "甲": "亥子丑寅卯辰巳午未申酉戌".split(""),
              "乙": "午巳辰卯寅丑子亥戌酉申未".split(""),
              "丙": "寅卯辰巳午未申酉戌亥子丑".split(""),
              "丁": "酉申未午巳辰卯寅丑子亥戌".split(""),
              "戊": "寅卯辰巳午未申酉戌亥子丑".split(""),
              "己": "酉申未午巳辰卯寅丑子亥戌".split(""),
              "庚": "巳午未申酉戌亥子丑寅卯辰".split(""),
              "辛": "子亥戌酉申未午巳辰卯寅丑".split(""),
              "壬": "申酉戌亥子丑寅卯辰巳午未".split(""),
              "癸": "卯寅丑子亥戌酉申未午巳辰".split("")
            }, i = {
              "木": "亥子丑寅卯辰巳午未申酉戌".split(""),
              "火": "寅卯辰巳午未申酉戌亥子丑".split(""),
              "土": "申酉戌亥子丑寅卯辰巳午未".split(""),
              "金": "巳午未申酉戌亥子丑寅卯辰".split(""),
              "水": "申酉戌亥子丑寅卯辰巳午未".split("")
            }, r = {
              "甲": "木",
              "乙": "木",
              "丙": "火",
              "丁": "火",
              "戊": "土",
              "己": "土",
              "庚": "金",
              "辛": "金",
              "壬": "水",
              "癸": "水"
            }, s = "甲", o = "木", l = "gan", c = 4, d = !1;
            e.style.width = "100%", e.style.maxWidth = "980px";
            var m = document.createElement("div");
            m.className = "changsheng-board";
            var f = document.createElement("div");
            f.className = "changsheng-mode", [ {
              key: "gan",
              label: "天干十二长生",
              sub: "阳顺阴逆"
            }, {
              key: "wuxing",
              label: "五行十二长生",
              sub: "三合气局"
            } ].forEach(function(e) {
              var t = document.createElement("button");
              t.type = "button", t.className = "changsheng-mode-btn", t.dataset.mode = e.key,
              t.innerHTML = "<strong>" + e.label + "</strong><span>" + e.sub + "</span>", t.addEventListener("click", function() {
                l !== e.key && (l = e.key, c = 4, E(), A());
              }), f.appendChild(t);
            });
            var u = document.createElement("div");
            u.className = "changsheng-gans", Object.keys(a).forEach(function(e, t) {
              var n = document.createElement("button");
              n.type = "button", n.className = "changsheng-gan", n.style.setProperty("--gan-color", k(r[e])),
              n.style.animationDelay = 24 * t + "ms", n.textContent = e, n.addEventListener("click", function() {
                s !== e && (s = e, l = "gan", E(), A());
              }), u.appendChild(n);
            });
            var h = document.createElement("div");
            h.className = "changsheng-wuxing", Object.keys(i).forEach(function(e, t) {
              var n = document.createElement("button");
              n.type = "button", n.className = "changsheng-wu", n.style.setProperty("--gan-color", k(e)),
              n.style.animationDelay = 34 * t + "ms", n.innerHTML = "<strong>" + e + "</strong><span>" + i[e][0] + "长生</span>",
              n.addEventListener("click", function() {
                (o !== e || "wuxing" !== l) && (o = e, l = "wuxing", E(), A());
              }), h.appendChild(n);
            });
            var g = document.createElement("div");
            g.className = "changsheng-stage";
            var x = document.createElementNS(n, "svg");
            x.setAttribute("viewBox", "0 0 760 360"), x.setAttribute("class", "changsheng-svg"),
            g.appendChild(x);
            var p = document.createElement("div");
            p.className = "changsheng-scale";
            var v = document.createElement("div");
            v.className = "changsheng-detail";
            var y = document.createElement("div");
            function w(e, t, a, i, r, s, o) {
              var l = document.createElementNS(n, "text");
              return l.setAttribute("x", e), l.setAttribute("y", t), l.setAttribute("text-anchor", o || "middle"),
              l.setAttribute("fill", r || "var(--ink)"), l.setAttribute("font-size", i || 12),
              l.setAttribute("font-family", '"Songti SC","STSong",serif'), l.setAttribute("font-weight", s || "600"),
              l.style.pointerEvents = "none", l.textContent = a, l;
            }
            function E() {
              m.classList.remove("is-gan-shifting"), m.offsetWidth, m.classList.add("is-gan-shifting"),
              window.setTimeout(function() {
                m.classList.remove("is-gan-shifting");
              }, 520);
            }
            function z() {
              return "gan" === l ? s + "日干" : o + "行";
            }
            function A() {
              var e = "gan" === l ? a[s] : i[o], g = "gan" === l ? k(r[s]) : k(o);
              m.style.setProperty("--gan-color", g), Array.prototype.forEach.call(f.children, function(e) {
                e.classList.toggle("is-active", e.dataset.mode === l), e.setAttribute("aria-pressed", e.dataset.mode === l ? "true" : "false");
              }), Array.prototype.forEach.call(u.children, function(e) {
                e.classList.toggle("is-active", "gan" === l && e.textContent === s), e.setAttribute("aria-pressed", "gan" === l && e.textContent === s ? "true" : "false");
              }), Array.prototype.forEach.call(h.children, function(e) {
                var t = e.querySelector("strong").textContent;
                e.classList.toggle("is-active", "wuxing" === l && t === o), e.setAttribute("aria-pressed", "wuxing" === l && t === o ? "true" : "false");
              }), x.innerHTML = "";
              [ 1, 2, 3, 4, 5 ].forEach(function(e) {
                var t = 270 - (e - 1) / 4 * 228, a = document.createElementNS(n, "line");
                a.setAttribute("x1", 54), a.setAttribute("x2", 714), a.setAttribute("y1", t), a.setAttribute("y2", t),
                a.setAttribute("stroke", "rgba(184,137,58,.12)"), a.setAttribute("stroke-width", "1"),
                x.appendChild(a);
              }), x.appendChild(w(54, 28, z(), 18, g, 800, "start")), x.appendChild(w(714, 28, "gan" === l ? "十天干取气" : "五行取气", 12, "var(--ink-3)", 700, "end"));
              var y = t.map(function(t, n) {
                return {
                  x: 54 + 60 * n,
                  y: 270 - (t[3] - .75) / 4.25 * 228,
                  stage: t,
                  zhi: e[n],
                  index: n
                };
              }), E = document.createElementNS(n, "polyline");
              E.setAttribute("points", y.map(function(e) {
                return e.x + "," + e.y;
              }).join(" ")), E.setAttribute("fill", "none"), E.setAttribute("stroke", "rgba(184,137,58,.18)"),
              E.setAttribute("stroke-width", "10"), E.setAttribute("stroke-linejoin", "round"),
              E.setAttribute("stroke-linecap", "round"), x.appendChild(E);
              var L = document.createElementNS(n, "polyline");
              L.setAttribute("points", y.map(function(e) {
                return e.x + "," + e.y;
              }).join(" ")), L.setAttribute("fill", "none"), L.setAttribute("stroke", g), L.setAttribute("stroke-width", "3.2"),
              L.setAttribute("stroke-linejoin", "round"), L.setAttribute("stroke-linecap", "round"),
              L.setAttribute("class", "changsheng-curve"), x.appendChild(L), y.forEach(function(e, t) {
                var a = document.createElementNS(n, "g");
                a.setAttribute("class", "changsheng-node" + (t === c ? " is-active" : "")), a.style.cursor = "pointer",
                a.style.animationDelay = 34 * t + "ms";
                var i = document.createElementNS(n, "rect");
                i.setAttribute("x", e.x - 28), i.setAttribute("y", 26), i.setAttribute("width", "56"),
                i.setAttribute("height", 298), i.setAttribute("fill", "transparent");
                var r = document.createElementNS(n, "line");
                r.setAttribute("x1", e.x), r.setAttribute("x2", e.x), r.setAttribute("y1", e.y + 8),
                r.setAttribute("y2", 277), r.setAttribute("stroke", t === c ? "rgba(200,71,46,.32)" : "rgba(31,28,24,.07)"),
                r.setAttribute("stroke-width", "1");
                var s = document.createElementNS(n, "circle");
                s.setAttribute("cx", e.x), s.setAttribute("cy", e.y), s.setAttribute("r", t === c ? "8" : "5"),
                s.setAttribute("fill", t === c ? "var(--cinnabar)" : g), s.setAttribute("stroke", "#fffdf7"),
                s.setAttribute("stroke-width", "3");
                var o = w(e.x, 300, e.stage[0], 12, t === c ? "var(--cinnabar)" : "var(--ink)", t === c ? 800 : 650), l = w(e.x, 319, e.zhi + " · " + e.stage[1], 10, t === c ? "var(--gold)" : "var(--ink-3)", 700);
                a.appendChild(i), a.appendChild(r), a.appendChild(s), a.appendChild(o), a.appendChild(l),
                x.appendChild(a), a.addEventListener("click", function() {
                  c = t, A();
                });
              });
              var C = t[c], N = e[c];
              p.innerHTML = "", t.forEach(function(t, n) {
                var a = document.createElement("button");
                a.type = "button", a.className = "changsheng-step" + (n === c ? " is-active" : ""),
                a.innerHTML = "<strong>" + t[0] + "</strong><span>" + e[n] + "</span>", a.addEventListener("click", function() {
                  c = n, A();
                }), p.appendChild(a);
              }), v.innerHTML = '<span>气机阶段</span><strong><em style="color:' + g + '">' + ("gan" === l ? s : o) + "</em> · " + C[0] + "在" + N + "</strong><p>" + C[2] + "。十二长生用于观察天干在十二支中的气势进退，需与旺衰、通根、十神同看。</p><div><em>" + C[1] + "</em><em>" + N + "支</em><em>" + ("gan" === l ? "天干视图" : "五行视图") + "</em></div>",
              b(z() + "：" + C[0] + "在" + N), d || (d = !0, requestAnimationFrame(function() {
                m.classList.add("is-settled");
              }));
            }
            y.className = "changsheng-rule", y.innerHTML = "<strong>取法</strong><p>天干视图按阳干顺行、阴干逆行，丙戊同宫、丁己同宫；五行视图按三合气局取长生，木亥、火寅、金巳、水土申。折线只表达气机起伏，断命仍需合旺衰、通根、格局同看。</p>",
            m.appendChild(f), m.appendChild(u), m.appendChild(h), m.appendChild(g), m.appendChild(p),
            m.appendChild(v), m.appendChild(y), e.appendChild(m), A();
          }
          function N(e) {
            for (var t = "甲乙丙丁戊己庚辛壬癸".split(""), n = "子丑寅卯辰巳午未申酉戌亥".split(""), a = [ {
              label: "甲子旬",
              empty: "戌亥"
            }, {
              label: "甲戌旬",
              empty: "申酉"
            }, {
              label: "甲申旬",
              empty: "午未"
            }, {
              label: "甲午旬",
              empty: "辰巳"
            }, {
              label: "甲辰旬",
              empty: "寅卯"
            }, {
              label: "甲寅旬",
              empty: "子丑"
            } ], i = [], r = 0; r < 60; r++) i.push({
              name: t[r % 10] + n[r % 12],
              gan: t[r % 10],
              zhi: n[r % 12],
              index: r + 1,
              xun: Math.floor(r / 10)
            });
            var s = 0, o = !1;
            e.style.width = "100%", e.style.maxWidth = "960px";
            var l = document.createElement("div");
            l.className = "jiazi-board";
            var c = document.createElement("div");
            c.className = "jiazi-xuns";
            var d = document.createElement("div");
            d.className = "jiazi-detail";
            var m = document.createElement("div");
            m.className = "jiazi-rule", m.innerHTML = "<strong>旬空读法</strong><p>十干配十二支，每一旬十组干支用完后，剩下两个地支不入本旬，称为旬空。看盘时先定所属旬，再看空亡之支。</p>";
            var f = [];
            function u() {
              var e = i[s], t = a[e.xun];
              f.forEach(function(t, n) {
                var a = i[n].xun === e.xun;
                t.classList.toggle("is-active", n === s), t.classList.toggle("is-same-xun", a),
                t.setAttribute("aria-pressed", n === s ? "true" : "false");
              }), Array.prototype.forEach.call(c.children, function(t, n) {
                t.classList.toggle("is-active", n === e.xun);
              }), d.innerHTML = '<div class="jiazi-title"><span>当前甲子</span><strong>' + e.name + "</strong><small>第 " + e.index + ' 位</small></div><div class="jiazi-meta"><section><em>所属旬</em><strong>' + t.label + "</strong></section><section><em>旬空</em><strong>" + t.empty + "</strong></section><section><em>干支</em><strong>" + e.gan + "干 · " + e.zhi + "支</strong></section></div><p>本旬从 " + t.label.replace("旬", "") + " 起，十干依次配十支后，余下 " + t.empty + " 两支为空。旬空不是消失，而是此旬中气未实、应事需另看动静与旺衰。</p>",
              b(e.name + " · " + t.label + " · 旬空 " + t.empty), o || (o = !0, requestAnimationFrame(function() {
                l.classList.add("is-settled");
              }));
            }
            a.forEach(function(e, t) {
              var n = document.createElement("section");
              n.className = "jiazi-xun", n.style.animationDelay = 55 * t + "ms", n.innerHTML = "<header><strong>" + e.label + "</strong><span>空 " + e.empty + "</span></header><div></div>";
              var a = n.querySelector("div");
              i.filter(function(e) {
                return e.xun === t;
              }).forEach(function(e) {
                var t = document.createElement("button");
                t.type = "button", t.className = "jiazi-item", t.innerHTML = "<strong>" + e.name + "</strong><span>" + e.index + "</span>",
                t.addEventListener("click", function() {
                  s !== e.index - 1 && (s = e.index - 1, l.classList.remove("is-shifting"), l.offsetWidth,
                  l.classList.add("is-shifting"), u(), window.setTimeout(function() {
                    l.classList.remove("is-shifting");
                  }, 360));
                }), f[e.index - 1] = t, a.appendChild(t);
              }), c.appendChild(n);
            }), l.appendChild(c), l.appendChild(d), l.appendChild(m), e.appendChild(l), u();
          }
          function _(e) {
            var t = "甲乙丙丁戊己庚辛壬癸".split(""), n = [ "木", "火", "土", "金", "水" ], a = {
              "甲": {
                wx: "木",
                yin: "阳"
              },
              "乙": {
                wx: "木",
                yin: "阴"
              },
              "丙": {
                wx: "火",
                yin: "阳"
              },
              "丁": {
                wx: "火",
                yin: "阴"
              },
              "戊": {
                wx: "土",
                yin: "阳"
              },
              "己": {
                wx: "土",
                yin: "阴"
              },
              "庚": {
                wx: "金",
                yin: "阳"
              },
              "辛": {
                wx: "金",
                yin: "阴"
              },
              "壬": {
                wx: "水",
                yin: "阳"
              },
              "癸": {
                wx: "水",
                yin: "阴"
              }
            }, i = [ {
              name: "比肩",
              rel: "同我",
              wx: "same",
              yin: "same",
              note: "同类同气，主自我、同辈、竞争与分担。"
            }, {
              name: "劫财",
              rel: "同我",
              wx: "same",
              yin: "opp",
              note: "同类异性，主伙伴、争夺、行动力与财的流动。"
            }, {
              name: "食神",
              rel: "我生",
              wx: "out",
              yin: "same",
              note: "我所生且同阴阳，主表达、口福、才艺与温和输出。"
            }, {
              name: "伤官",
              rel: "我生",
              wx: "out",
              yin: "opp",
              note: "我所生且异阴阳，主锋芒、突破、技艺与不服约束。"
            }, {
              name: "偏财",
              rel: "我克",
              wx: "wealth",
              yin: "same",
              note: "我所克且同阴阳，主机会、流动财、经营与资源调度。"
            }, {
              name: "正财",
              rel: "我克",
              wx: "wealth",
              yin: "opp",
              note: "我所克且异阴阳，主稳定财、现实收益、责任与秩序。"
            }, {
              name: "七杀",
              rel: "克我",
              wx: "officer",
              yin: "same",
              note: "克我且同阴阳，主压力、挑战、权威、风险与执行力。"
            }, {
              name: "正官",
              rel: "克我",
              wx: "officer",
              yin: "opp",
              note: "克我且异阴阳，主规范、职位、名誉、制度与约束。"
            }, {
              name: "偏印",
              rel: "生我",
              wx: "resource",
              yin: "same",
              note: "生我且同阴阳，主灵感、偏门知识、保护与孤高。"
            }, {
              name: "正印",
              rel: "生我",
              wx: "resource",
              yin: "opp",
              note: "生我且异阴阳，主学习、文凭、贵人、庇护与承接。"
            } ], r = "甲", s = 0;
            e.style.width = "100%", e.style.maxWidth = "350px";
            var o = document.createElement("div");
            o.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:12px";
            var l = document.createElement("div");
            l.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px";
            var c = document.createElement("div");
            c.style.cssText = "border:1px solid var(--hairline);border-radius:16px;background:var(--card);padding:13px 14px;min-height:88px",
            t.forEach(function(e, t) {
              var n = document.createElement("button"), i = k(a[e].wx);
              n.style.cssText = "width:32px;height:32px;border-radius:10px;border:1px solid " + i + ";background:" + (0 === t ? i : "var(--card)") + ";color:" + (0 === t ? "#fff8f0" : i) + ";font-family:serif;font-size:15px;font-weight:700;cursor:pointer;transition:transform .45s var(--spring),background .2s,color .2s",
              n.textContent = e, n.addEventListener("click", function() {
                r = e, s = 0, g();
              }), o.appendChild(n);
            }), e.appendChild(o), e.appendChild(l), e.appendChild(c);
            var d = !1;
            e.style.width = "100%", e.style.maxWidth = "960px";
            var m = document.createElement("div");
            m.className = "shishen-board";
            var o = document.createElement("div");
            o.className = "shishen-gans";
            var f = document.createElement("div");
            f.className = "shishen-map";
            var c = document.createElement("div");
            c.className = "shishen-detail";
            var u = document.createElement("div");
            function h(e) {
              var i, s, o = a[r], l = (i = e.wx, s = n.indexOf(o.wx), "same" === i ? o.wx : "out" === i ? n[(s + 1) % 5] : "wealth" === i ? n[(s + 2) % 5] : "officer" === i ? n[(s + 3) % 5] : n[(s + 4) % 5]), c = "same" === e.yin ? o.yin : "阳" === o.yin ? "阴" : "阳";
              return {
                gan: function(e, n) {
                  for (var i = 0; i < t.length; i++) {
                    var r = t[i];
                    if (a[r].wx === e && a[r].yin === n) return r;
                  }
                  return "";
                }(l, c),
                wx: l,
                yin: c
              };
            }
            function g() {
              var e = a[r], t = k(e.wx);
              m.style.setProperty("--dm-color", t), Array.prototype.forEach.call(o.children, function(e) {
                e.classList.toggle("is-active", e.textContent === r), e.setAttribute("aria-pressed", e.textContent === r ? "true" : "false");
              }), f.innerHTML = '<div class="shishen-center"><span>日主</span><strong style="color:' + t + '">' + r + "</strong><small>" + e.yin + e.wx + '</small></div><div class="shishen-god-grid"></div>';
              var n = f.querySelector(".shishen-god-grid");
              i.forEach(function(e, t) {
                var a = h(e), i = document.createElement("button");
                i.type = "button", i.className = "shishen-god" + (t === s ? " is-active" : ""),
                i.style.animationDelay = 28 * t + "ms", i.innerHTML = "<em>" + e.rel + "</em><strong>" + e.name + "</strong><span><b>" + a.gan + "</b> · " + a.yin + a.wx + "</span>",
                i.addEventListener("click", function() {
                  s = t, g();
                }), n.appendChild(i);
              });
              var l = i[s], u = h(l), x = k(u.wx);
              c.innerHTML = '<div class="shishen-title"><span>当前十神</span><strong>' + l.name + "</strong><small>" + r + "见" + u.gan + '</small></div><div class="shishen-meta"><section><em>关系</em><strong>' + l.rel + '</strong></section><section><em>五行</em><strong style="color:' + x + '">' + u.wx + "</strong></section><section><em>阴阳</em><strong>" + u.yin + "</strong></section></div><p>" + l.note + "</p>",
              b(r + "日主见" + u.gan + "为" + l.name), d || (d = !0, requestAnimationFrame(function() {
                m.classList.add("is-settled");
              }));
            }
            u.className = "shishen-rule", u.innerHTML = "<strong>取法</strong><p>十神以日主为中心，先看五行生克，再看阴阳同异。同阴阳多为偏、异阴阳多为正；同我则分比肩与劫财。</p>",
            t.forEach(function(e, t) {
              var n = document.createElement("button");
              n.type = "button", n.className = "shishen-gan", n.style.setProperty("--gan-color", k(a[e].wx)),
              n.style.animationDelay = 22 * t + "ms", n.textContent = e, n.addEventListener("click", function() {
                r !== e && (r = e, s = 0, m.classList.remove("is-shifting"), m.offsetWidth, m.classList.add("is-shifting"),
                g(), window.setTimeout(function() {
                  m.classList.remove("is-shifting");
                }, 380));
              }), o.appendChild(n);
            }), m.appendChild(o), m.appendChild(f), m.appendChild(c), m.appendChild(u), e.innerHTML = "",
            e.appendChild(m), g();
          }
          function M(e) {
            var t, n, a, i, r, s, o, l;
            return (t = document.getElementById("explainArea")) && (t.innerHTML = '<div class="taiji-term-sections"><section><span>一</span><h2>太极为一</h2><p>太极不是黑白相加，而是一气未分的整体。万象虽有差别，根处仍归于一。</p></section><section><span>二</span><h2>阴阳互根</h2><p>阳中藏阴，阴中藏阳。任何一方都不是孤立存在，而在对方之中保留转化的契机。</p></section><section><span>三</span><h2>动静相因</h2><p>静则合为太极，动则分为阴阳。动不是破坏秩序，而是秩序显形的方式。</p></section><section><span>四</span><h2>消长有时</h2><p>阴阳在时间中此消彼长，盛极则转，衰极复生，所以太极图读的是循环，不是静态图案。</p></section></div>'),
            e.style.width = "100%", e.style.maxWidth = "760px", (n = document.createElement("div")).className = "taiji-term-intro",
            n.innerHTML = "<span>术语图解</span><strong>太极</strong><p>一体分两面，两面仍归一体。看太极图，不是看黑白，而是看“分而不离、动而有常”。</p>",
            e.appendChild(n), (a = document.createElement("div")).className = "taiji-simple-stage",
            a.innerHTML = '<div class="taiji-simple-halo"></div><div class="taiji-principle taiji-principle-one"><span>本体</span><strong>一气未分</strong></div><div class="taiji-principle taiji-principle-two"><span>互根</span><strong>阴阳相含</strong></div><div class="taiji-principle taiji-principle-three"><span>流行</span><strong>动静相因</strong></div><svg class="taiji-simple-symbol" viewBox="0 0 300 300" role="img" aria-label="太极图缓慢旋转动效"><defs><filter id="taijiSimpleSoft" x="-18%" y="-18%" width="136%" height="136%"><feGaussianBlur stdDeviation="1.4"/></filter></defs><g class="taiji-simple-spin"><circle cx="150" cy="150" r="118" fill="var(--ink)"/><path d="M150 32a118 118 0 0 1 0 236a59 59 0 0 1 0-118a59 59 0 0 0 0-118z" fill="var(--paper)"/><circle cx="150" cy="91" r="17" fill="var(--paper)" class="taiji-simple-eye taiji-simple-eye-light"/><circle cx="150" cy="209" r="17" fill="var(--ink)" class="taiji-simple-eye taiji-simple-eye-dark"/><circle cx="150" cy="150" r="119" fill="none" stroke="rgba(184,137,58,.34)" stroke-width="1.5"/><circle cx="150" cy="150" r="122" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1" filter="url(#taijiSimpleSoft)"/></g><circle class="taiji-simple-orbit" cx="150" cy="150" r="137" fill="none" stroke="var(--gold)" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="2 10"/></svg><div class="taiji-simple-caption"><strong>动之则分，静之则合</strong><span>一体 · 两仪 · 流行</span></div>',
            e.appendChild(a), (i = document.createElement("div")).className = "taiji-motion-note taiji-simple-note",
            i.innerHTML = "<strong>太极图读法</strong><p>外圆表示整体，黑白表示阴阳两面；鱼眼表示互根，缓旋表示气机流行。它讲的不是对立，而是对立如何在同一秩序里互相成就。</p>",
            e.appendChild(i), (r = document.createElement("div")).className = "taiji-motion-controls taiji-simple-controls",
            (s = document.createElement("button")).type = "button", s.className = "taiji-motion-play",
            s.textContent = "Ⅱ", s.setAttribute("aria-label", "播放或暂停太极动效"), r.appendChild(s),
            (o = document.createElement("div")).className = "taiji-speed-switch", [ {
              value: "slow",
              label: "慢"
            }, {
              value: "normal",
              label: "常"
            }, {
              value: "fast",
              label: "快"
            } ].forEach(function(e) {
              var t = document.createElement("button");
              t.type = "button", t.dataset.speed = e.value, t.textContent = e.label, "normal" === e.value && t.classList.add("is-active"),
              o.appendChild(t);
            }), r.appendChild(o), e.appendChild(r), l = !0, void (s.addEventListener("click", function() {
              l = !l, a.classList.toggle("is-paused", !l), s.classList.toggle("is-paused", !l),
              s.textContent = l ? "Ⅱ" : "▶";
            }), Array.prototype.forEach.call(o.children, function(e) {
              e.addEventListener("click", function() {
                Array.prototype.forEach.call(o.children, function(e) {
                  e.classList.remove("is-active");
                }), e.classList.add("is-active"), a.dataset.speed = e.dataset.speed;
              });
            }), b("太极缓旋：动静相因，阴阳互根"));
          }
          function S(e) {
            var t = [ {
              key: "对立制约",
              mark: "制",
              color: "var(--cinnabar)",
              summary: "阴阳相反相成，彼此牵制，使事物不偏向一端。",
              nature: "昼夜、寒热、动静互为界限，一方过盛，另一方便被压制。",
              method: "看局中哪一方过旺，再看是否有另一方来制衡。制约不是破坏，而是让结构回到可用的秩序。"
            }, {
              key: "互根互用",
              mark: "根",
              color: "var(--gold)",
              summary: "阴阳互为存在条件，没有孤立的阴，也没有孤立的阳。",
              nature: "夜尽天明，寒极生温；一方的尽处，往往藏着另一方的开端。",
              method: "判断人事时，不只看显露的一面，也要看它依赖什么、从哪里获得支撑。"
            }, {
              key: "消长平衡",
              mark: "衡",
              color: "var(--wood)",
              summary: "阴阳在时间中此消彼长，平衡不是静止，而是动态协调。",
              nature: "冬至以后阳气渐长，夏至以后阴气渐长，四时由此流行。",
              method: "大运流年、节气月令都在看气势消长。旺衰的重点，是气有没有得时、得地、得助。"
            }, {
              key: "相互转化",
              mark: "化",
              color: "var(--water)",
              summary: "当条件成熟，阴可转阳，阳可转阴，事物由量变进入质变。",
              nature: "盛极而衰，否极泰来；极端处往往就是转折点。",
              method: "实占实断里，转化要看条件：时间、位置、助力、阻力是否已经齐备。"
            } ], n = 0;
            e.style.width = "100%", e.style.maxWidth = "980px";
            var a = document.createElement("div");
            a.className = "yinlaw-board";
            var i = document.createElement("div");
            i.className = "yinlaw-intro", i.innerHTML = "<span>阴阳规律</span><strong>四法同归于衡</strong><p>四大规律不是四个孤立概念，而是阴阳运行的四种观察角度。</p>",
            a.appendChild(i);
            var r = document.createElement("div");
            r.className = "yinlaw-stage", r.innerHTML = '<div class="yinlaw-balance" aria-hidden="true"><span class="yinlaw-yang">阳</span><i></i><span class="yinlaw-yin">阴</span></div><div class="yinlaw-ring" aria-hidden="true"></div><div class="yinlaw-rule-grid"></div><div class="yinlaw-detail"></div>',
            a.appendChild(r);
            var s = r.querySelector(".yinlaw-rule-grid"), o = r.querySelector(".yinlaw-detail");
            function l(e) {
              var n = t[e];
              Array.prototype.forEach.call(s.children, function(t, n) {
                t.classList.toggle("is-active", n === e);
              }), o.style.setProperty("--rule-color", n.color), o.innerHTML = '<div class="yinlaw-detail-head"><span>' + n.mark + "</span><strong>" + n.key + "</strong></div><section><em>核心</em><p>" + n.summary + "</p></section><section><em>自然</em><p>" + n.nature + "</p></section><section><em>术数</em><p>" + n.method + "</p></section>",
              b("阴阳四大规律：" + n.key);
            }
            t.forEach(function(e, t) {
              var i = document.createElement("button");
              i.type = "button", i.className = "yinlaw-card" + (0 === t ? " is-active" : ""),
              i.style.setProperty("--rule-color", e.color), i.innerHTML = "<em>" + e.mark + "</em><strong>" + e.key + "</strong><span>" + e.summary + "</span>",
              i.addEventListener("click", function() {
                n !== t && (n = t, a.classList.add("is-changing"), l(t), setTimeout(function() {
                  a.classList.remove("is-changing");
                }, 430));
              }), s.appendChild(i);
            }), e.appendChild(a), l(0);
            var c = document.getElementById("explainArea");
            c && (c.innerHTML = '<div class="yinlaw-explain">' + t.map(function(e) {
              return '<section style="--rule-color:' + e.color + '"><span>' + e.mark + "</span><strong>" + e.key + "</strong><p>" + e.summary + "</p></section>";
            }).join("") + "</div>"), setTimeout(function() {
              a.classList.add("is-settled");
            }, 700);
          }
          function q(e) {
            var t = [ {
              name: "爻象",
              mark: "爻",
              gist: "一画为阳，断画为阴，是《易》里最基础的阴阳符号。",
              yang: {
                sym: "—",
                label: "阳爻",
                note: "完整不断，象征主动、显露、上升。"
              },
              yin: {
                sym: "--",
                label: "阴爻",
                note: "中间有缺，象征承载、含藏、下降。"
              }
            }, {
              name: "数字",
              mark: "数",
              gist: "奇偶分阴阳，奇数为阳，偶数为阴。",
              yang: {
                sym: "一三五七九",
                label: "阳数",
                note: "奇数主动，常归天数、动数。"
              },
              yin: {
                sym: "二四六八十",
                label: "阴数",
                note: "偶数主静，常归地数、成数。"
              }
            }, {
              name: "颜色",
              mark: "色",
              gist: "颜色不是绝对标签，而是用明暗、温凉来表达阴阳。",
              yang: {
                sym: "赤 明",
                label: "阳色",
                note: "明亮、温热、外发，常取阳象。"
              },
              yin: {
                sym: "玄 素",
                label: "阴色",
                note: "幽深、清冷、内敛，常取阴象。"
              }
            }, {
              name: "天干",
              mark: "干",
              gist: "十天干按序分阴阳，奇位为阳，偶位为阴。",
              yang: {
                sym: "甲丙戊庚壬",
                label: "五阳干",
                note: "气势偏刚，主动外达。"
              },
              yin: {
                sym: "乙丁己辛癸",
                label: "五阴干",
                note: "气势偏柔，承接内藏。"
              }
            }, {
              name: "地支",
              mark: "支",
              gist: "十二地支同样按序分阴阳，配合时令与藏干理解。",
              yang: {
                sym: "子寅辰午申戌",
                label: "六阳支",
                note: "奇位为阳，气机偏动。"
              },
              yin: {
                sym: "丑卯巳未酉亥",
                label: "六阴支",
                note: "偶位为阴，气机偏静。"
              }
            } ], n = 0;
            e.style.width = "100%", e.style.maxWidth = "920px";
            var a = document.createElement("div");
            a.className = "yinsym-board";
            var i = document.createElement("div");
            i.className = "yinsym-tabs";
            var r = document.createElement("div");
            function s(e) {
              var n = t[e];
              Array.prototype.forEach.call(i.children, function(t, n) {
                t.classList.toggle("is-active", n === e);
              }), r.innerHTML = '<div class="yinsym-head"><span>' + n.mark + "</span><div><strong>" + n.name + "</strong><p>" + n.gist + '</p></div></div><div class="yinsym-pair"><section class="is-yang"><em>阳</em><strong>' + n.yang.sym + "</strong><span>" + n.yang.label + "</span><p>" + n.yang.note + '</p></section><section class="is-yin"><em>阴</em><strong>' + n.yin.sym + "</strong><span>" + n.yin.label + "</span><p>" + n.yin.note + '</p></section></div><div class="yinsym-note"><strong>读法</strong><p>符号只是一层入口，真正要看的是它背后的动静、内外、明暗、刚柔与时位关系。</p></div>',
              b("阴阳符号表达：" + n.name);
            }
            r.className = "yinsym-display", a.appendChild(i), a.appendChild(r), t.forEach(function(e, t) {
              var r = document.createElement("button");
              r.type = "button", r.className = "yinsym-tab" + (0 === t ? " is-active" : ""), r.innerHTML = "<span>" + e.mark + "</span><strong>" + e.name + "</strong>",
              r.addEventListener("click", function() {
                n !== t && (n = t, a.classList.add("is-changing"), s(t), setTimeout(function() {
                  a.classList.remove("is-changing");
                }, 420));
              }), i.appendChild(r);
            }), e.appendChild(a), s(0);
            var o = document.getElementById("explainArea");
            o && (o.innerHTML = '<div class="yinsym-explain">' + t.map(function(e) {
              return "<section><span>" + e.mark + "</span><strong>" + e.name + "</strong><p>" + e.gist + "</p></section>";
            }).join("") + "</div>");
          }
          function T(e) {
            var t = [ {
              ch: "甲",
              yx: "阳",
              wx: "木",
              col: "var(--wood)",
              sym: "⊕",
              note: "阳木，主生发、上进"
            }, {
              ch: "乙",
              yx: "阴",
              wx: "木",
              col: "var(--wood)",
              sym: "⊖",
              note: "阴木，主柔顺、随从"
            }, {
              ch: "丙",
              yx: "阳",
              wx: "火",
              col: "var(--fire)",
              sym: "⊕",
              note: "阳火，主光明、热烈"
            }, {
              ch: "丁",
              yx: "阴",
              wx: "火",
              col: "var(--fire)",
              sym: "⊖",
              note: "阴火，主温暖、内敛"
            }, {
              ch: "戊",
              yx: "阳",
              wx: "土",
              col: "var(--earth)",
              sym: "⊕",
              note: "阳土，主厚重、稳固"
            }, {
              ch: "己",
              yx: "阴",
              wx: "土",
              col: "var(--earth)",
              sym: "⊖",
              note: "阴土，主湿润、含藏"
            }, {
              ch: "庚",
              yx: "阳",
              wx: "金",
              col: "var(--metal)",
              sym: "⊕",
              note: "阳金，主刚毅、肃杀"
            }, {
              ch: "辛",
              yx: "阴",
              wx: "金",
              col: "var(--metal)",
              sym: "⊖",
              note: "阴金，主精致、收敛"
            }, {
              ch: "壬",
              yx: "阳",
              wx: "水",
              col: "var(--water)",
              sym: "⊕",
              note: "阳水，主流动、智慧"
            }, {
              ch: "癸",
              yx: "阴",
              wx: "水",
              col: "var(--water)",
              sym: "⊖",
              note: "阴水，主滋润、潜藏"
            } ], n = [ {
              ch: "子",
              yx: "阳",
              wx: "水",
              col: "var(--water)",
              note: "冬至，阳气始生，藏癸"
            }, {
              ch: "丑",
              yx: "阴",
              wx: "土",
              col: "var(--earth)",
              note: "小寒，阴土，藏己癸辛"
            }, {
              ch: "寅",
              yx: "阳",
              wx: "木",
              col: "var(--wood)",
              note: "立春，阳木始动，藏甲丙戊"
            }, {
              ch: "卯",
              yx: "阴",
              wx: "木",
              col: "var(--wood)",
              note: "春分，阴木旺，藏乙"
            }, {
              ch: "辰",
              yx: "阳",
              wx: "土",
              col: "var(--earth)",
              note: "清明，阳土，藏戊乙癸"
            }, {
              ch: "巳",
              yx: "阴",
              wx: "火",
              col: "var(--fire)",
              note: "立夏，阴火，藏丙庚戊"
            }, {
              ch: "午",
              yx: "阳",
              wx: "火",
              col: "var(--fire)",
              note: "夏至，阳火旺，藏丁己"
            }, {
              ch: "未",
              yx: "阴",
              wx: "土",
              col: "var(--earth)",
              note: "小暑，阴土，藏己丁乙"
            }, {
              ch: "申",
              yx: "阳",
              wx: "金",
              col: "var(--metal)",
              note: "立秋，阳金，藏庚壬戊"
            }, {
              ch: "酉",
              yx: "阴",
              wx: "金",
              col: "var(--metal)",
              note: "秋分，阴金旺，藏辛"
            }, {
              ch: "戌",
              yx: "阳",
              wx: "土",
              col: "var(--earth)",
              note: "寒露，阳土，藏戊辛丁"
            }, {
              ch: "亥",
              yx: "阴",
              wx: "水",
              col: "var(--water)",
              note: "立冬，阴水，藏壬甲"
            } ], a = "tg";
            e.style.width = "100%", e.style.maxWidth = "940px";
            var i = document.createElement("div");
            i.className = "yygz-board";
            var r = document.createElement("div");
            r.className = "yygz-tabs", [ "天干", "地支" ].forEach(function(e, t) {
              var n = document.createElement("button");
              n.type = "button", n.className = "yygz-tab" + (0 === t ? " is-active" : ""), n.textContent = e,
              n.addEventListener("click", function() {
                a !== (0 === t ? "tg" : "dz") && (a = 0 === t ? "tg" : "dz", i.classList.add("is-changing"),
                Array.prototype.forEach.call(r.children, function(e, n) {
                  e.classList.toggle("is-active", n === t);
                }), d(), setTimeout(function() {
                  i.classList.remove("is-changing");
                }, 420));
              }), r.appendChild(n);
            });
            var s = document.createElement("div");
            s.className = "yygz-content", s.innerHTML = '<div class="yygz-groups"><section class="yygz-group is-yang"><div class="yygz-group-head"><span>阳</span><strong>主动外达</strong></div><div class="yygz-chars"></div></section><section class="yygz-group is-yin"><div class="yygz-group-head"><span>阴</span><strong>承接内藏</strong></div><div class="yygz-chars"></div></section></div><aside class="yygz-detail"></aside>',
            i.appendChild(r), i.appendChild(s), e.appendChild(i);
            var o = s.querySelector(".is-yang .yygz-chars"), l = s.querySelector(".is-yin .yygz-chars"), c = s.querySelector(".yygz-detail");
            function d() {
              o.innerHTML = "", l.innerHTML = "";
              var e = "tg" === a ? t : n;
              e.forEach(function(e, t) {
                var n = document.createElement("button");
                n.type = "button", n.className = "yygz-char", n.style.setProperty("--item-color", e.col),
                n.innerHTML = "<strong>" + e.ch + "</strong><span>" + e.wx + "</span>", n.addEventListener("click", function() {
                  Array.prototype.forEach.call(s.querySelectorAll(".yygz-char"), function(e) {
                    e.classList.remove("is-active");
                  }), n.classList.add("is-active"), m(e), b(e.ch + "：" + e.yx + "，" + e.wx);
                }), ("阳" === e.yx ? o : l).appendChild(n);
              }), m(e[0]);
              var i = ("阳" === e[0].yx ? o : l).querySelector(".yygz-char");
              i && i.classList.add("is-active"), b("点击任意" + ("tg" === a ? "天干" : "地支") + "查看阴阳属性");
            }
            function m(e) {
              c.style.setProperty("--item-color", e.col), c.innerHTML = '<div class="yygz-detail-head"><span>' + e.ch + "</span><div><strong>" + e.yx + e.wx + "</strong><small>" + e.note + '</small></div></div><div class="yygz-meta"><section><em>阴阳</em><strong>' + e.yx + "</strong></section><section><em>五行</em><strong>" + e.wx + "</strong></section><section><em>" + ("tg" === a ? "序法" : "时位") + "</em><strong>" + ("阳" === e.yx ? "奇位" : "偶位") + "</strong></section></div><p>" + ("tg" === a ? "天干重在气的显隐与作用方向，阴阳用于判断刚柔、动静、偏正。" : "地支兼具时令、方位与藏干，阴阳要结合月令气势一起看。") + "</p>";
            }
            d();
            var f = document.getElementById("explainArea");
            f && (f.innerHTML = '<div class="yygz-explain"><section><span>干</span><strong>天干</strong><p>甲丙戊庚壬为阳，乙丁己辛癸为阴。奇位外达，偶位内藏。</p></section><section><span>支</span><strong>地支</strong><p>子寅辰午申戌为阳，丑卯巳未酉亥为阴。地支还要结合时令与藏干。</p></section><section><span>用</span><strong>读法</strong><p>先看阴阳动静，再看五行属性，最后回到具体场景判断象意。</p></section></div>');
          }
          function j(e) {
            var t = [ {
              ch: "木",
              color: "var(--wood)",
              sheng: "火",
              ke: "土",
              shengBy: "水",
              keBy: "金",
              xiang: "生发、条达、向外舒展"
            }, {
              ch: "火",
              color: "var(--fire)",
              sheng: "土",
              ke: "金",
              shengBy: "木",
              keBy: "水",
              xiang: "炎上、显明、由内而外"
            }, {
              ch: "土",
              color: "var(--earth)",
              sheng: "金",
              ke: "水",
              shengBy: "火",
              keBy: "木",
              xiang: "承载、化育、居中调和"
            }, {
              ch: "金",
              color: "var(--metal)",
              sheng: "水",
              ke: "木",
              shengBy: "土",
              keBy: "火",
              xiang: "收敛、肃降、成形有界"
            }, {
              ch: "水",
              color: "var(--water)",
              sheng: "木",
              ke: "火",
              shengBy: "金",
              keBy: "土",
              xiang: "润下、收藏、流动潜藏"
            } ], a = {};
            t.forEach(function(e, t) {
              e.index = t, a[e.ch] = e;
            });
            var i = "sheng", r = 0, s = null, o = !1, l = document.createElement("div");
            l.className = "wuxing-board", l.innerHTML = '<div class="wuxing-tabs"><button type="button" class="wuxing-tab is-active" data-mode="sheng"><strong>相生</strong><span>流通成环</span></button><button type="button" class="wuxing-tab" data-mode="ke"><strong>相克</strong><span>制约成序</span></button></div><div class="wuxing-stage"><div class="wuxing-orbit"></div><div class="wuxing-info"></div></div><div class="wuxing-relations"></div>',
            e.appendChild(l), l.querySelector(".wuxing-stage");
            var c = l.querySelector(".wuxing-orbit"), d = l.querySelector(".wuxing-info"), m = l.querySelector(".wuxing-relations"), f = document.createElementNS(n, "svg");
            f.setAttribute("viewBox", "0 0 520 430"), f.setAttribute("class", "wuxing-svg"),
            f.setAttribute("aria-hidden", "true");
            var u = document.createElementNS(n, "defs");
            u.innerHTML = '<marker id="wxArrow" viewBox="0 0 10 10" refX="8.4" refY="5" markerWidth="5.4" markerHeight="5.4" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M0.6 1.1 L9 5 L0.6 8.9 L2.5 5 Z" fill="context-stroke"/></marker><marker id="wxArrowHot" viewBox="0 0 10 10" refX="8.4" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M0.6 1.1 L9 5 L0.6 8.9 L2.5 5 Z" fill="context-stroke"/></marker>',
            f.appendChild(u);
            var h = document.createElementNS(n, "g"), g = document.createElementNS(n, "g"), x = document.createElementNS(n, "g"), p = document.createElementNS(n, "g");
            f.appendChild(h), f.appendChild(g), f.appendChild(x), f.appendChild(p), c.appendChild(f);
            var v = t.map(function(e, t) {
              var n = -Math.PI / 2 + t * Math.PI * 2 / 5;
              return {
                x: 260 + 148 * Math.cos(n),
                y: 204 + 148 * Math.sin(n)
              };
            }), y = document.createElementNS(n, "circle");
            y.setAttribute("class", "wuxing-guide"), y.setAttribute("cx", 260), y.setAttribute("cy", 204),
            y.setAttribute("r", 148), h.appendChild(y);
            var w = document.createElementNS(n, "g");
            w.setAttribute("class", "wuxing-hub"), w.setAttribute("transform", "translate(260 204)");
            var k = document.createElementNS(n, "circle");
            k.setAttribute("class", "wuxing-hub-ring"), k.setAttribute("r", "31");
            var E = document.createElementNS(n, "text");
            function z(e, t) {
              var a = v[t], i = document.createElementNS(n, "g");
              i.setAttribute("class", "wuxing-node" + (t === r ? " is-active" : "")), i.style.setProperty("--node-color", e.color),
              i.setAttribute("transform", "translate(" + a.x + " " + a.y + ")");
              var s = document.createElementNS(n, "circle");
              s.setAttribute("r", "34");
              var o = document.createElementNS(n, "text");
              o.setAttribute("text-anchor", "middle"), o.setAttribute("dominant-baseline", "central"),
              o.textContent = e.ch, i.appendChild(s), i.appendChild(o), p.appendChild(i), i.addEventListener("pointerenter", function() {
                A(t, !1);
              }), i.addEventListener("click", function() {
                A(t, !1);
              });
            }
            function A(e, a) {
              if (e !== r || a) {
                r = e, l.style.setProperty("--active-color", t[e].color), l.classList.add("is-changing"),
                g.innerHTML = "", p.innerHTML = "", l.setAttribute("data-mode", i), E.textContent = "sheng" === i ? "生" : "克",
                (c = "sheng" === i ? [ 0, 1, 2, 3, 4, 0 ] : [ 0, 2, 4, 1, 3, 0 ]).slice(0, -1).forEach(function(e, a) {
                  var s, o, l, d, m, f, u, h, x, p, y, b, w = c[a + 1], k = e === r;
                  s = "wuxing-line " + ("sheng" === i ? "is-sheng" : "is-ke") + (k ? " is-hot" : ""),
                  o = k ? t[e].color : "sheng" === i ? "var(--gold)" : "var(--cinnabar)", l = !k,
                  d = v[e], h = Math.hypot(f = (m = v[w]).x - d.x, u = m.y - d.y) || 1, x = (e === r ? 42 : 34) + 7,
                  p = (w === r ? 42 : 34) + 13, y = {
                    x1: d.x + f / h * x,
                    y1: d.y + u / h * x,
                    x2: m.x - f / h * p,
                    y2: m.y - u / h * p
                  }, (b = document.createElementNS(n, "line")).setAttribute("class", s + (l ? " is-dim" : "")),
                  b.setAttribute("x1", y.x1), b.setAttribute("y1", y.y1), b.setAttribute("x2", y.x2),
                  b.setAttribute("y2", y.y2), b.setAttribute("stroke", o), b.setAttribute("pathLength", "1"),
                  b.setAttribute("marker-end", "url(#" + (l ? "wxArrow" : "wxArrowHot") + ")"), g.appendChild(b);
                }), t.forEach(z), f = t[r], d.style.setProperty("--node-color", f.color), d.innerHTML = "<span>" + ("sheng" === i ? "相生之气" : "相克之力") + "</span><strong>" + f.ch + "</strong><small>" + f.xiang + "</small><p>" + ("sheng" === i ? f.ch + "生" + f.sheng + "，" + f.shengBy + "生" + f.ch + "，气脉一出一入。" : f.ch + "克" + f.ke + "，" + f.keBy + "克" + f.ch + "，制约使气不偏。") + "</p>",
                m.innerHTML = L("我生", "生", f.sheng, "sheng") + L("生我", "承", f.shengBy, "shengby") + L("我克", "克", f.ke, "ke") + L("克我", "制", f.keBy, "keby"),
                o || (o = !0, setTimeout(function() {
                  l.classList.add("is-settled");
                }, 520)), s && clearTimeout(s), s = setTimeout(function() {
                  l.classList.remove("is-changing");
                }, 440);
                var c, f, u = t[e];
                b(u.ch + "：我生" + u.sheng + "，生我" + u.shengBy + "；我克" + u.ke + "，克我" + u.keBy);
              }
            }
            function L(e, t, n, i) {
              return '<section class="wuxing-relation is-' + i + '" style="--rel-color:' + a[n].color + '"><em>' + e + "</em><strong>" + t + "</strong><span>" + n + "</span></section>";
            }
            E.setAttribute("class", "wuxing-hub-text"), E.setAttribute("text-anchor", "middle"),
            E.setAttribute("dominant-baseline", "central"), w.appendChild(k), w.appendChild(E),
            x.appendChild(w), Array.prototype.forEach.call(l.querySelectorAll(".wuxing-tab"), function(e) {
              e.addEventListener("click", function() {
                i = e.getAttribute("data-mode"), Array.prototype.forEach.call(l.querySelectorAll(".wuxing-tab"), function(t) {
                  t.classList.toggle("is-active", t === e);
                }), A(r, !0);
              });
            }), A(0, !0);
            var C = document.getElementById("explainArea");
            C && (C.innerHTML = '<div class="wuxing-explain"><section><span>生</span><strong>流通</strong><p>木生火，火生土，土生金，金生水，水生木。生是传递与滋养，不是单纯的吉。</p></section><section><span>克</span><strong>制衡</strong><p>木克土，土克水，水克火，火克金，金克木。克是约束与成形，不是单纯的凶。</p></section><section><span>中</span><strong>平衡</strong><p>五行贵在流通有序，过生则泄，过克则伤；判断时要回到旺衰、位置与时令。</p></section></div>');
          }
          function H(e) {
            var t = [ 4, 9, 2, 3, 5, 7, 8, 1, 6 ], n = [ "一", "二", "三", "四", "五", "六", "七", "八", "九" ], a = [ "巽", "离", "坤", "震", "中", "兑", "艮", "坎", "乾" ], i = {
              "坎": {
                dir: "正北",
                wx: "水"
              },
              "坤": {
                dir: "西南",
                wx: "土"
              },
              "震": {
                dir: "正东",
                wx: "木"
              },
              "巽": {
                dir: "东南",
                wx: "木"
              },
              "中": {
                dir: "中央",
                wx: "土"
              },
              "乾": {
                dir: "西北",
                wx: "金"
              },
              "兑": {
                dir: "正西",
                wx: "金"
              },
              "艮": {
                dir: "东北",
                wx: "土"
              },
              "离": {
                dir: "正南",
                wx: "火"
              }
            }, r = [ {
              idx: [ 0, 1, 2 ],
              name: "上横"
            }, {
              idx: [ 3, 4, 5 ],
              name: "中横"
            }, {
              idx: [ 6, 7, 8 ],
              name: "下横"
            }, {
              idx: [ 0, 3, 6 ],
              name: "左纵"
            }, {
              idx: [ 1, 4, 7 ],
              name: "中纵"
            }, {
              idx: [ 2, 5, 8 ],
              name: "右纵"
            }, {
              idx: [ 0, 4, 8 ],
              name: "撇斜"
            }, {
              idx: [ 2, 4, 6 ],
              name: "捺斜"
            } ], s = [ {
              k: "number",
              label: "数字"
            }, {
              k: "palace",
              label: "方位"
            }, {
              k: "wuxing",
              label: "五行"
            } ], o = "http://www.w3.org/2000/svg", l = null, c = "number", d = null;
            function m(e) {
              return r.filter(function(t) {
                return t.idx.indexOf(e) >= 0;
              });
            }
            var f = document.createElement("div");
            f.className = "luoshu";
            var u = document.createElement("div");
            u.className = "luo-stage";
            var h = document.createElement("div");
            h.className = "luo-board";
            var g = document.createElementNS(o, "svg");
            g.setAttribute("class", "luo-links"), g.setAttribute("viewBox", "0 0 300 300"),
            g.setAttribute("aria-hidden", "true");
            var x = document.createElementNS(o, "g");
            g.appendChild(x);
            var p = document.createElement("div");
            p.className = "luo-grid", p.setAttribute("role", "grid"), p.setAttribute("aria-label", "洛书九宫");
            var v = t.map(function(e, t) {
              var r = i[a[t]], s = document.createElement("button");
              s.type = "button", s.className = "luo-cell m-number", s.setAttribute("role", "gridcell"),
              s.tabIndex = 4 === t ? 0 : -1, s.style.setProperty("--wxc", k(r.wx));
              var o = document.createElement("div");
              return o.className = "luo-face", o.appendChild(y("luo-glyph", [ [ "g-num", n[e - 1] ], [ "g-palace", a[t] ], [ "g-wx", r.wx ] ])),
              o.appendChild(y("luo-sub", [ [ "s-palace", a[t] ], [ "s-dir", r.dir ], [ "s-num", n[e - 1] ] ])),
              s.appendChild(o), s.addEventListener("click", function() {
                I(t);
              }), p.appendChild(s), s;
            });
            function y(e, t) {
              var n = document.createElement("span");
              return n.className = e, t.forEach(function(e) {
                var t = document.createElement("span");
                t.className = e[0], t.textContent = e[1], n.appendChild(t);
              }), n;
            }
            p.addEventListener("keydown", function(e) {
              var t = {
                ArrowLeft: -1,
                ArrowRight: 1,
                ArrowUp: -3,
                ArrowDown: 3
              }[e.key];
              if (t) {
                e.preventDefault();
                var n = null == l ? 4 : l, a = n % 3, i = n + t;
                ("ArrowLeft" === e.key && 0 === a || "ArrowRight" === e.key && 2 === a || i < 0 || i > 8) && (i = n),
                I(i, !0), v[i].focus();
              }
            }), h.appendChild(g), h.appendChild(p);
            var w = document.createElement("div");
            w.className = "luo-seg", w.setAttribute("role", "tablist");
            var E = document.createElement("span");
            E.className = "luo-seg-thumb", w.appendChild(E);
            var z = s.map(function(e, t) {
              var n = document.createElement("button");
              return n.type = "button", n.className = "luo-seg-btn" + (0 === t ? " is-active" : ""),
              n.textContent = e.label, n.setAttribute("role", "tab"), n.setAttribute("aria-selected", 0 === t ? "true" : "false"),
              n.addEventListener("click", function() {
                var t = e.k;
                if (t !== c) {
                  c = t;
                  var n = 0;
                  s.forEach(function(e, a) {
                    e.k === t && (n = a);
                  }), E.style.transform = "translateX(" + 100 * n + "%)", E.classList.add("is-moving"),
                  clearTimeout(d), d = setTimeout(function() {
                    E.classList.remove("is-moving");
                  }, 300), z.forEach(function(e, t) {
                    e.classList.toggle("is-active", t === n), e.setAttribute("aria-selected", t === n ? "true" : "false");
                  }), f.classList.toggle("is-wuxing", "wuxing" === t), v.forEach(function(e, n) {
                    e.style.setProperty("--wd", (n % 3 + Math.floor(n / 3)) * 38 + "ms"), e.classList.remove("m-number", "m-palace", "m-wuxing"),
                    e.classList.add("m-" + t);
                  });
                }
              }), w.appendChild(n), n;
            }), A = document.createElement("p");
            A.className = "luo-note", u.appendChild(h), u.appendChild(w);
            var L = document.createElement("div");
            function C() {
              for (;x.firstChild; ) x.removeChild(x.firstChild);
            }
            function N() {
              var e = {};
              null != l && m(l).forEach(function(t) {
                t.idx.forEach(function(t) {
                  e[t] = 1;
                });
              }), v.forEach(function(t, n) {
                if (t.classList.remove("is-on", "is-link", "is-off", "is-pulse"), t.tabIndex = (null == l ? 4 === n : n === l) ? 0 : -1,
                null == l) {
                  t.style.setProperty("--d", (n % 3 + Math.floor(n / 3)) * 36 + "ms"), t.setAttribute("aria-pressed", "false");
                  return;
                }
                var a = Math.max(Math.abs(n % 3 - l % 3), Math.abs(Math.floor(n / 3) - Math.floor(l / 3)));
                t.style.setProperty("--d", 58 * a + "ms"), t.setAttribute("aria-pressed", n === l ? "true" : "false"),
                n === l ? t.classList.add("is-on") : e[n] ? t.classList.add("is-link") : t.classList.add("is-off");
              }), null != l && (p.offsetWidth, v.forEach(function(e) {
                e.classList.contains("is-link") && e.classList.add("is-pulse");
              }));
            }
            L.className = "luo-panel", f.appendChild(u), f.appendChild(L), f.appendChild(A),
            e.appendChild(f);
            var _ = document.createElement("div");
            _.className = "luo-hero", _.innerHTML = '<span class="luo-hero-glyph"></span><span class="luo-hero-main"><span class="luo-hero-t"></span><span class="luo-hero-s"></span></span><span class="luo-tag"></span>';
            var M = _.querySelector(".luo-hero-glyph"), S = _.querySelector(".luo-hero-t"), q = _.querySelector(".luo-hero-s"), T = _.querySelector(".luo-tag"), j = document.createElement("div");
            j.className = "luo-rows";
            var H = r.map(function(e, a) {
              var i = e.idx.map(function(e) {
                return n[t[e] - 1];
              }), r = document.createElement("div");
              return r.className = "luo-row", r.style.setProperty("--d", 46 * a + 120 + "ms"),
              r.innerHTML = '<span class="luo-row-name">' + e.name + '</span><span class="luo-row-eq"><b>' + i[0] + "</b><i>+</i><b>" + i[1] + "</b><i>+</i><b>" + i[2] + '</b><i>=</i><span class="luo-row-sum">十五</span></span>',
              j.appendChild(r), r;
            });
            function B() {
              M.classList.remove("is-swap"), _.classList.remove("is-swap"), T.classList.remove("is-swap"),
              M.offsetWidth, M.classList.add("is-swap"), _.classList.add("is-swap"), T.classList.add("is-swap");
            }
            function P() {
              if (null == l) {
                M.textContent = "五", M.style.color = "var(--cinnabar)", M.style.background = "var(--cinnabar-soft)",
                S.textContent = "洛书九宫", q.textContent = "纵横斜八线 · 三数之和皆十五", T.textContent = "全览",
                T.style.color = "var(--gold)", H.forEach(function(e) {
                  e.classList.remove("is-hot", "is-mute");
                }), A.textContent = "戴九履一，左三右七，二四为肩，六八为足，五居中央。点选任意一宫，只看过该宫的连线。", b("洛书九宫 · 纵横斜八线，三数之和皆十五"),
                B();
                return;
              }
              var e = t[l], s = i[a[l]], o = a[l], c = m(l);
              M.textContent = n[e - 1], M.style.color = k(s.wx), M.style.background = "color-mix(in srgb," + k(s.wx) + " 12%,transparent)",
              S.textContent = o + "宫 · " + s.dir, q.textContent = "洛书数 " + e + " · 过此 " + c.length + " 线",
              T.textContent = s.wx, T.style.color = k(s.wx), H.forEach(function(e, t) {
                var n = r[t].idx.indexOf(l) >= 0;
                e.classList.toggle("is-hot", n), e.classList.toggle("is-mute", !n);
              }), A.textContent = "连线自「" + o + "」宫向两端生长；再次点选该宫可返回八线全览。", b("「" + n[e - 1] + "」" + o + "宫 · " + s.dir + " · 五行" + s.wx + " · 过此 " + c.length + " 线，每线皆十五"),
              B();
            }
            function I(e, t) {
              l = e !== l || t ? e : null, N(), C(), P();
            }
            L.appendChild(_), L.appendChild(j), N(), P(), C();
            var D = document.getElementById("explainArea");
            D && (D.innerHTML = '<div class="luoshu-explain"><section><span class="le-icon le-icon-1"></span><strong>戴九履一</strong><p>洛书九宫的数字排列：头戴九、脚踩一，左三右七，二四为肩，六八为足，五居中央。这个排列使纵横斜八条线，每线三数之和皆为十五。</p></section><section><span class="le-icon le-icon-2"></span><strong>纵横皆十五</strong><p>点选任意一宫，连线会从该宫向两端生长，只显示经过它的两到四条线；右侧八式同步高亮，再次点选同一宫即可回到全览。</p></section><section><span class="le-icon le-icon-3"></span><strong>方位与五行</strong><p>九宫对应后天八卦方位：坎北水、离南火、震东木、兑西金、中宫土。切换「方位」「五行」视图，可看同一盘面的另一层含义。</p></section><section><span class="le-icon le-icon-4"></span><strong>术数应用</strong><p>洛书九宫是奇门遁甲的盘面基础，也是风水飞星、针灸灵龟八法等术数体系共用的空间框架。</p></section></div>');
          }
          function B(e) {
            var t, a, i, r, s, o, l, c, d = [ {
              name: "立春",
              season: "春",
              month: "寅",
              lon: 315,
              note: "阳气始生，岁序开端。"
            }, {
              name: "雨水",
              season: "春",
              month: "寅",
              lon: 330,
              note: "雨泽渐至，冰雪消融。"
            }, {
              name: "惊蛰",
              season: "春",
              month: "卯",
              lon: 345,
              note: "雷动虫醒，生机外发。"
            }, {
              name: "春分",
              season: "春",
              month: "卯",
              lon: 0,
              note: "昼夜平分，阴阳均衡。"
            }, {
              name: "清明",
              season: "春",
              month: "辰",
              lon: 15,
              note: "气清景明，万物显荣。"
            }, {
              name: "谷雨",
              season: "春",
              month: "辰",
              lon: 30,
              note: "雨生百谷，春气将尽。"
            }, {
              name: "立夏",
              season: "夏",
              month: "巳",
              lon: 45,
              note: "火气始盛，万物并秀。"
            }, {
              name: "小满",
              season: "夏",
              month: "巳",
              lon: 60,
              note: "麦气渐满，未至极盛。"
            }, {
              name: "芒种",
              season: "夏",
              month: "午",
              lon: 75,
              note: "有芒可种，农事转急。"
            }, {
              name: "夏至",
              season: "夏",
              month: "午",
              lon: 90,
              note: "阳极阴生，日影最短。"
            }, {
              name: "小暑",
              season: "夏",
              month: "未",
              lon: 105,
              note: "暑气初蒸，热势渐起。"
            }, {
              name: "大暑",
              season: "夏",
              month: "未",
              lon: 120,
              note: "暑热至极，土气承化。"
            }, {
              name: "立秋",
              season: "秋",
              month: "申",
              lon: 135,
              note: "金气初行，暑退未尽。"
            }, {
              name: "处暑",
              season: "秋",
              month: "申",
              lon: 150,
              note: "暑气止息，凉意渐生。"
            }, {
              name: "白露",
              season: "秋",
              month: "酉",
              lon: 165,
              note: "露凝而白，收敛成象。"
            }, {
              name: "秋分",
              season: "秋",
              month: "酉",
              lon: 180,
              note: "昼夜再均，阴阳半分。"
            }, {
              name: "寒露",
              season: "秋",
              month: "戌",
              lon: 195,
              note: "露冷将寒，肃杀渐深。"
            }, {
              name: "霜降",
              season: "秋",
              month: "戌",
              lon: 210,
              note: "霜始降下，秋气入藏。"
            }, {
              name: "立冬",
              season: "冬",
              month: "亥",
              lon: 225,
              note: "水气始旺，万物归藏。"
            }, {
              name: "小雪",
              season: "冬",
              month: "亥",
              lon: 240,
              note: "寒气成雪，未至大盛。"
            }, {
              name: "大雪",
              season: "冬",
              month: "子",
              lon: 255,
              note: "雪势渐盛，阴气深藏。"
            }, {
              name: "冬至",
              season: "冬",
              month: "子",
              lon: 270,
              note: "阴极阳生，一阳来复。"
            }, {
              name: "小寒",
              season: "冬",
              month: "丑",
              lon: 285,
              note: "寒气已深，岁末凝结。"
            }, {
              name: "大寒",
              season: "冬",
              month: "丑",
              lon: 300,
              note: "寒极将尽，春气暗萌。"
            } ], m = {
              "春": "var(--wood)",
              "夏": "var(--fire)",
              "秋": "var(--metal)",
              "冬": "var(--water)"
            }, f = 0, u = !1, h = 0, g = [], x = document.createElement("div");
            x.className = "jieqi-board", x.innerHTML = '<div class="jieqi-stage"><div class="jieqi-ring"></div><aside class="jieqi-info"></aside></div><div class="jieqi-list"></div>',
            e.appendChild(x);
            var p = x.querySelector(".jieqi-ring"), v = x.querySelector(".jieqi-info"), y = x.querySelector(".jieqi-list"), w = document.createElementNS(n, "svg");
            function k(e, t) {
              var n = -Math.PI / 2 + t * Math.PI * 2 / 24;
              return {
                x: 260 + e * Math.cos(n),
                y: 260 + e * Math.sin(n)
              };
            }
            function E(e, t) {
              var a = document.createElementNS(n, e);
              return Object.keys(t).forEach(function(e) {
                a.setAttribute(e, t[e]);
              }), a;
            }
            function z() {
              var e = d[f], t = m[e.season];
              g.forEach(function(e, t) {
                e.setAttribute("fill", t === f ? m[d[t].season] : "var(--ink-3)"), e.setAttribute("font-weight", t === f ? "700" : "500");
              });
              var n = w.querySelector(".jieqi-pointer");
              n && (n.style.transform = "rotate(" + h + "deg)"), r && r.setAttribute("stroke", t),
              s && s.setAttribute("fill", t), o && (o.textContent = e.season + "令 · " + e.month + "月"),
              l && (l.textContent = e.name, l.setAttribute("fill", t)), c && (c.textContent = "太阳黄经 " + e.lon + "°");
            }
            w.setAttribute("viewBox", "0 0 520 520"), w.setAttribute("class", "jieqi-svg"),
            w.setAttribute("aria-hidden", "true"), p.appendChild(w);
            w.innerHTML = "", g = [], w.appendChild(E("circle", {
              cx: 260,
              cy: 260,
              r: 184,
              fill: "none",
              stroke: "rgba(184,137,58,.16)",
              "stroke-width": "1.2"
            })), w.appendChild(E("circle", {
              cx: 260,
              cy: 260,
              r: 130,
              fill: "none",
              stroke: "rgba(184,137,58,.1)",
              "stroke-width": "1"
            })), d.forEach(function(e, t) {
              var n = k(172, t), a = k(184 + (t % 2 == 0 ? 8 : 1), t);
              w.appendChild(E("line", {
                x1: n.x,
                y1: n.y,
                x2: a.x,
                y2: a.y,
                stroke: t % 2 == 0 ? "rgba(184,137,58,.42)" : "rgba(31,28,24,.12)",
                "stroke-width": t % 2 == 0 ? "1.4" : ".8",
                "stroke-linecap": "round"
              }));
              var i = k(t % 2 == 0 ? 215 : 208, t), r = E("text", {
                x: i.x,
                y: i.y,
                "text-anchor": "middle",
                "dominant-baseline": "central",
                "font-size": t % 2 == 0 ? "14" : "11",
                fill: t === f ? m[e.season] : "var(--ink-3)",
                "font-family": '"Songti SC","STSong",serif',
                "font-weight": t === f ? "700" : "500"
              });
              r.textContent = e.name, g.push(r), w.appendChild(r);
            }), t = d[f], a = E("g", {
              class: "jieqi-pointer"
            }), r = E("line", {
              x1: 260,
              y1: 260,
              x2: 260,
              y2: 122,
              stroke: m[t.season],
              "stroke-width": "3",
              "stroke-linecap": "round"
            }), s = E("circle", {
              class: "jieqi-dot",
              cx: 260,
              cy: 122,
              r: "8",
              fill: m[t.season]
            }), a.appendChild(r), a.appendChild(s), w.appendChild(a), (i = E("g", {
              class: "jieqi-center"
            })).appendChild(E("circle", {
              cx: 260,
              cy: 260,
              r: "76",
              fill: "rgba(255,253,247,.9)",
              stroke: "rgba(184,137,58,.14)",
              "stroke-width": "1"
            })), o = E("text", {
              x: 260,
              y: 227,
              "text-anchor": "middle",
              "dominant-baseline": "central",
              "font-size": "12",
              fill: "var(--gold)",
              "font-weight": "700"
            }), l = E("text", {
              x: 260,
              y: 262,
              "text-anchor": "middle",
              "dominant-baseline": "central",
              "font-size": "34",
              fill: m[t.season],
              "font-family": '"Songti SC","STSong",serif',
              "font-weight": "700"
            }), c = E("text", {
              x: 260,
              y: 296,
              "text-anchor": "middle",
              "dominant-baseline": "central",
              "font-size": "12",
              fill: "var(--ink-3)",
              "font-weight": "700"
            }), i.appendChild(o), i.appendChild(l), i.appendChild(c), w.appendChild(i), z(),
            function e(t) {
              if (t !== f || !u) {
                var n, a, i, r = (h % 360 + 360) % 360;
                h += (15 * t - r + 540) % 360 - 180, f = t, z(), n = d[f], a = d[(f + 23) % 24],
                i = d[(f + 1) % 24], v.style.setProperty("--season-color", m[n.season]), v.innerHTML = "<span>" + n.season + "令节气</span><strong>" + n.name + "</strong><small>" + n.month + "月 · 太阳黄经 " + n.lon + "°</small><p>" + n.note + "</p><div><em>前一候</em><b>" + a.name + "</b><em>后一候</em><b>" + i.name + "</b></div>",
                y.innerHTML = "", d.forEach(function(t, n) {
                  var a = document.createElement("button");
                  a.type = "button", a.className = "jieqi-pill" + (n === f ? " is-active" : ""), a.style.setProperty("--season-color", m[t.season]),
                  a.innerHTML = "<strong>" + t.name + "</strong><span>" + t.month + "月</span>", a.addEventListener("click", function() {
                    e(n);
                  }), y.appendChild(a);
                }), u = !0;
                var s = d[f];
                b(s.name + " · " + s.month + "月 · 太阳黄经 " + s.lon + "°");
              }
            }(0);
            var A = document.getElementById("explainArea");
            A && (A.innerHTML = '<div class="jieqi-explain"><section><span>度</span><strong>黄经定节</strong><p>二十四节气按太阳黄经划分，每十五度一节气，所以它是太阳历法的一套时间刻度。</p></section><section><span>月</span><strong>月令入盘</strong><p>节气决定月令，寅卯辰为春，巳午未为夏，申酉戌为秋，亥子丑为冬。</p></section><section><span>气</span><strong>阴阳消长</strong><p>春生、夏长、秋收、冬藏，节气环看的不是日期本身，而是一年气机的转换。</p></section></div>');
          }
          function P(e) {
            var t = {
              "乾": {
                sym: "☰",
                wux: "金",
                image: "天",
                family: "父",
                nature: "健",
                lines: "三阳"
              },
              "兑": {
                sym: "☱",
                wux: "金",
                image: "泽",
                family: "少女",
                nature: "悦",
                lines: "上缺"
              },
              "离": {
                sym: "☲",
                wux: "火",
                image: "火",
                family: "中女",
                nature: "丽",
                lines: "中虚"
              },
              "震": {
                sym: "☳",
                wux: "木",
                image: "雷",
                family: "长男",
                nature: "动",
                lines: "下动"
              },
              "巽": {
                sym: "☴",
                wux: "木",
                image: "风",
                family: "长女",
                nature: "入",
                lines: "下断"
              },
              "坎": {
                sym: "☵",
                wux: "水",
                image: "水",
                family: "中男",
                nature: "陷",
                lines: "中满"
              },
              "艮": {
                sym: "☶",
                wux: "土",
                image: "山",
                family: "少男",
                nature: "止",
                lines: "上实"
              },
              "坤": {
                sym: "☷",
                wux: "土",
                image: "地",
                family: "母",
                nature: "顺",
                lines: "三阴"
              }
            }, a = {
              "北": [ 180, 46, 0 ],
              "东北": [ 275, 85, 45 ],
              "东": [ 314, 180, 90 ],
              "东南": [ 275, 275, 135 ],
              "南": [ 180, 314, 180 ],
              "西南": [ 85, 275, 225 ],
              "西": [ 46, 180, 270 ],
              "西北": [ 85, 85, 315 ]
            }, i = {
              houtian: {
                title: "后天八卦",
                sub: "文王八卦 · 用事应方",
                badge: "用",
                note: "后天重四时流行与人事应用，常用于风水、六爻、奇门等方位判断。",
                order: [ {
                  gua: "坎",
                  dir: "北",
                  num: "一"
                }, {
                  gua: "艮",
                  dir: "东北",
                  num: "八"
                }, {
                  gua: "震",
                  dir: "东",
                  num: "三"
                }, {
                  gua: "巽",
                  dir: "东南",
                  num: "四"
                }, {
                  gua: "离",
                  dir: "南",
                  num: "九"
                }, {
                  gua: "坤",
                  dir: "西南",
                  num: "二"
                }, {
                  gua: "兑",
                  dir: "西",
                  num: "七"
                }, {
                  gua: "乾",
                  dir: "西北",
                  num: "六"
                } ]
              },
              xiantian: {
                title: "先天八卦",
                sub: "伏羲八卦 · 体象对待",
                badge: "体",
                note: "先天重阴阳对待与天地定位，用来看卦象本体：乾坤、坎离、震巽、艮兑相对。",
                order: [ {
                  gua: "坤",
                  dir: "北",
                  num: "八"
                }, {
                  gua: "艮",
                  dir: "西北",
                  num: "七"
                }, {
                  gua: "坎",
                  dir: "西",
                  num: "六"
                }, {
                  gua: "巽",
                  dir: "西南",
                  num: "五"
                }, {
                  gua: "乾",
                  dir: "南",
                  num: "一"
                }, {
                  gua: "兑",
                  dir: "东南",
                  num: "二"
                }, {
                  gua: "离",
                  dir: "东",
                  num: "三"
                }, {
                  gua: "震",
                  dir: "东北",
                  num: "四"
                } ]
              }
            }, r = {
              "木": "var(--wood)",
              "火": "var(--fire)",
              "土": "var(--earth)",
              "金": "var(--metal)",
              "水": "var(--water)"
            }, s = "houtian", o = "坎";
            e.style.width = "100%";
            var l = document.createElement("div");
            l.className = "bagua-board";
            var c = document.createElement("div");
            c.className = "bagua-tabs", c.setAttribute("role", "tablist"), c.setAttribute("aria-label", "八卦方位图类型"),
            c.innerHTML = '<button class="bagua-tab is-active" data-mode="houtian" type="button" role="tab" aria-selected="true"><strong>后天八卦</strong><span>文王 · 用</span></button><button class="bagua-tab" data-mode="xiantian" type="button" role="tab" aria-selected="false"><strong>先天八卦</strong><span>伏羲 · 体</span></button>';
            var d = document.createElement("div");
            d.className = "bagua-stage";
            var m = document.createElement("div");
            m.className = "bagua-info";
            var f = document.createElement("div");
            function u() {
              var e = i[s];
              d.innerHTML = "";
              var l = document.createElementNS(n, "svg");
              l.setAttribute("viewBox", "0 0 360 360"), l.setAttribute("class", "bagua-svg"),
              l.setAttribute("role", "img"), l.setAttribute("aria-label", e.title + "方位图");
              var c = document.createElementNS(n, "circle");
              c.setAttribute("cx", "180"), c.setAttribute("cy", "180"), c.setAttribute("r", "142"),
              c.setAttribute("class", "bagua-ring-outer"), l.appendChild(c);
              var m = document.createElementNS(n, "circle");
              m.setAttribute("cx", "180"), m.setAttribute("cy", "180"), m.setAttribute("r", "82"),
              m.setAttribute("class", "bagua-ring-inner"), l.appendChild(m);
              for (var f = 0; f < 360; f += 45) {
                var u = f * Math.PI / 180, p = 180 + 92 * Math.sin(u), v = 180 - 92 * Math.cos(u), y = 180 + 136 * Math.sin(u), b = 180 - 136 * Math.cos(u), w = document.createElementNS(n, "line");
                w.setAttribute("x1", p.toFixed(2)), w.setAttribute("y1", v.toFixed(2)), w.setAttribute("x2", y.toFixed(2)),
                w.setAttribute("y2", b.toFixed(2)), w.setAttribute("class", "bagua-spoke"), l.appendChild(w);
              }
              var k = document.createElementNS(n, "g");
              k.setAttribute("class", "bagua-center-mark"), k.innerHTML = '<circle cx="180" cy="180" r="47"></circle><path d="M180,133 A47,47 0 0 1 180,227 A23.5,23.5 0 0 1 180,180 A23.5,23.5 0 0 0 180,133 Z"></path><circle class="light" cx="180" cy="156.5" r="7"></circle><circle class="dark" cx="180" cy="203.5" r="7"></circle><text x="180" y="184" text-anchor="middle">' + e.badge + "</text>",
              l.appendChild(k), e.order.forEach(function(e, i) {
                var s = t[e.gua], c = a[e.dir], d = r[s.wux] || "var(--ink)", m = document.createElementNS(n, "g");
                m.setAttribute("class", "bagua-node" + (e.gua === o ? " is-active" : "")), m.setAttribute("tabindex", "0"),
                m.setAttribute("role", "button"), m.style.setProperty("--node-color", d), m.style.setProperty("--node-delay", .035 * i + "s"),
                m.setAttribute("transform", "translate(" + c[0] + " " + c[1] + ")"), m.innerHTML = '<circle class="bagua-node-halo" r="32"></circle><circle class="bagua-node-face" r="27"></circle><text class="bagua-sym" x="0" y="-8" text-anchor="middle">' + s.sym + '</text><text class="bagua-name" x="0" y="13" text-anchor="middle">' + e.gua + '</text><text class="bagua-num" x="0" y="38" text-anchor="middle">' + e.dir + " · " + e.num + "</text>",
                m.addEventListener("pointerenter", function() {
                  h(e.gua, !1);
                }), m.addEventListener("click", function() {
                  h(e.gua, !0);
                }), m.addEventListener("keydown", function(t) {
                  ("Enter" === t.key || " " === t.key) && (t.preventDefault(), h(e.gua, !0));
                }), l.appendChild(m);
              }), d.appendChild(l), g(), x();
            }
            function h(e, n) {
              o = e, g(), d.querySelectorAll(".bagua-node").forEach(function(t) {
                var n = t.querySelector(".bagua-name").textContent;
                t.classList.toggle("is-active", n === e);
              });
              var a = i[s].order.find(function(t) {
                return t.gua === e;
              }), r = t[e];
              b(i[s].title + " · " + e + "卦 · " + a.dir + " · " + r.wux + " · " + r.image), n && x();
            }
            function g() {
              var e = i[s], n = e.order.find(function(e) {
                return e.gua === o;
              }) || e.order[0], a = t[n.gua];
              m.style.setProperty("--gua-color", r[a.wux] || "var(--ink)"), m.innerHTML = '<div class="bagua-info-title"><span>' + e.sub + "</span><strong>" + n.gua + "卦 " + a.sym + '</strong></div><div class="bagua-info-grid"><section><em>方位</em><b>' + n.dir + "</b></section><section><em>五行</em><b>" + a.wux + "</b></section><section><em>卦象</em><b>" + a.image + "</b></section><section><em>卦德</em><b>" + a.nature + "</b></section></div><p><span>" + n.gua + "卦</span>" + a.lines + "，象为" + a.image + "，家人象为" + a.family + "。" + e.note + "</p>";
            }
            function x() {
              var e = i[s], t = "xiantian" === s ? [ "乾坤相对", "坎离相对", "震巽相对", "艮兑相对" ] : [ "坎离定南北", "震兑定东西", "乾巽承西北东南", "艮坤承东北西南" ];
              f.innerHTML = '<div class="bagua-pairs-head"><strong>' + e.title + "</strong><span>" + e.note + "</span></div>" + t.map(function(e) {
                return "<section><strong>" + e + "</strong><p>" + ({
                  "乾坤相对": "天地定位，纯阳纯阴相持，是先天盘的主轴。",
                  "坎离相对": "水火不相射，中男中女成一组阴阳平衡。",
                  "震巽相对": "雷风相薄，一动一入，木气分阴阳。",
                  "艮兑相对": "山泽通气，一止一悦，少男少女相应。",
                  "坎离定南北": "水居北、火居南，定寒暑升降。",
                  "震兑定东西": "雷动东方、泽悦西方，定春秋开收。",
                  "乾巽承西北东南": "乾金居西北，巽木居东南，承接天地出入之气。",
                  "艮坤承东北西南": "艮止东北，坤顺西南，含土气转折与承载。"
                }[e] || "") + "</p></section>";
              }).join("");
            }
            f.className = "bagua-pairs", l.appendChild(c), l.appendChild(d), l.appendChild(m),
            l.appendChild(f), e.appendChild(l), c.addEventListener("click", function(e) {
              var t = e.target.closest(".bagua-tab");
              t && t.dataset.mode !== s && (o = i[s = t.dataset.mode].order[0].gua, c.querySelectorAll(".bagua-tab").forEach(function(e) {
                var n = e === t;
                e.classList.toggle("is-active", n), e.setAttribute("aria-selected", n ? "true" : "false");
              }), u());
            }), u(), b("切换先天/后天，点击任意卦查看方位与卦象");
            var p = document.getElementById("explainArea");
            p && (p.innerHTML = '<div class="bagua-explain"><section><strong>后天重应用</strong><p>后天八卦以坎北、离南、震东、兑西为骨架，强调四时流行与方位用事。</p></section><section><strong>先天重对待</strong><p>先天八卦以乾南坤北、离东坎西为主轴，强调阴阳、天地、水火等相对关系。</p></section><section><strong>同盘看体用</strong><p>读图时先定当前模式，再看卦名、方位、五行、卦象，不把先天与后天方位混用。</p></section></div>');
          }
          function I(e) {
            var t = l[0], n = 0, a = {
              upper: t.upper,
              lower: t.lower
            };
            e.style.width = "100%";
            var i = document.createElement("div");
            i.className = "hexagrams-board hexagrams-composer-mode", i.innerHTML = '<section class="hexagrams-compose" aria-label="上下卦组卦台"><header class="hexagrams-compose-head"><div><span>上下卦组卦台</span><strong>选两卦，观六爻</strong></div><button class="hexagrams-swap" type="button" aria-label="交换上下卦"><i aria-hidden="true">⇅</i> 交换上下</button></header><div class="hexagrams-picker" data-level="upper" role="group" aria-label="选择上卦"></div><div class="hexagrams-compose-body"><section class="hexagrams-figure" aria-live="polite"></section><section class="hexagrams-yao-reading" aria-live="polite"></section></div><div class="hexagrams-picker" data-level="lower" role="group" aria-label="选择下卦"></div></section><details class="hexagrams-atlas-panel"><summary><span><b>六十四卦总览</b><small>按文王卦序快速查找</small></span><i>展开</i></summary><div class="hexagrams-atlas-tools"><label><span>检索</span><input type="search" inputmode="search" autocomplete="off" placeholder="输入卦名或序号" aria-label="搜索六十四卦"></label><em aria-live="polite">64 卦</em></div><div class="hexagrams-atlas-list" role="listbox" aria-label="文王六十四卦总览"></div></details>',
            e.appendChild(i);
            var r = i.querySelector(".hexagrams-figure"), m = i.querySelector(".hexagrams-yao-reading"), f = i.querySelector('.hexagrams-picker[data-level="upper"]'), u = i.querySelector('.hexagrams-picker[data-level="lower"]'), h = i.querySelector(".hexagrams-atlas-list"), g = i.querySelector(".hexagrams-atlas-panel"), x = i.querySelector(".hexagrams-atlas-tools input"), p = i.querySelector(".hexagrams-atlas-tools em");
            function v(e) {
              return e.upper === e.lower ? e.name + "为" + o[e.upper].image : o[e.upper].image + o[e.lower].image + e.name;
            }
            function y(e, t) {
              var n = t ? "九" : "六";
              return 0 === e ? "初" + n : 5 === e ? "上" + n : n + [ "", "二", "三", "四", "五" ][e];
            }
            function w(e) {
              return '<div class="hexagrams-picker-label"><span>' + ("upper" === e ? "上卦 · 外卦" : "下卦 · 内卦") + "</span><small>" + ("upper" === e ? "事情外在呈现" : "事情内在根基") + '</small></div><div class="hexagrams-picker-options">' + s.map(function(e) {
                var t = o[e];
                return '<button type="button" data-trigram="' + e + '" aria-pressed="false"><strong>' + t.symbol + "</strong><b>" + e + "</b><small>" + t.image + " · " + t.element + "</small></button>";
              }).join("") + "</div>";
            }
            function E() {
              [ f, u ].forEach(function(e) {
                var t = e.dataset.level;
                e.querySelectorAll("[data-trigram]").forEach(function(e) {
                  var n = e.dataset.trigram === a[t];
                  e.classList.toggle("is-active", n), e.setAttribute("aria-pressed", n ? "true" : "false");
                });
              });
            }
            function z() {
              var e = o[t.upper], a = o[t.lower], i = a.lines.concat(e.lines);
              r.style.setProperty("--upper-color", k(e.element)), r.style.setProperty("--lower-color", k(a.element)),
              r.innerHTML = '<div class="hexagrams-figure-head"><span>文王卦序 · ' + String(t.number).padStart(2, "0") + "</span><div><strong>" + c(t.number) + "</strong><h2>" + t.name + "卦</h2></div><p>" + v(t) + " · " + t.meaning + '</p></div><div class="hexagrams-six-lines" aria-label="' + t.name + '卦六爻，点击查看爻辞">' + i.map(function(e, t) {
                var a = y(t, e);
                return '<button type="button" class="hexagrams-line-button ' + (t >= 3 ? "is-upper" : "is-lower") + (t === n ? " is-active" : "") + '" data-line="' + t + '" aria-pressed="' + (t === n ? "true" : "false") + '" style="--line-order:' + t + '" aria-label="' + a + '，点击查看爻辞"><span>' + a + '</span><i class="' + (e ? "is-yang" : "is-yin") + '">' + (e ? "<b></b>" : "<b></b><b></b>") + "</i><em>" + (t === n ? "正在解读" : "查看") + "</em></button>";
              }).reverse().join("") + '</div><div class="hexagrams-figure-foot"><span><b>' + e.symbol + " " + t.upper + "</b> 上卦 · " + e.image + "</span><i></i><span><b>" + a.symbol + " " + t.lower + "</b> 下卦 · " + a.image + "</span></div>",
              r.querySelectorAll(".hexagrams-line-button").forEach(function(e) {
                e.addEventListener("click", function() {
                  n = Number(e.dataset.line), z(), A();
                });
              });
            }
            function A() {
              var e, a, i, r, s, l, c, f = !!o[t.lower].lines.concat(o[t.upper].lines)[n], u = y(n, f), h = (e = t,
              a = n, i = v(e), (d.vS[i] || d.T9[i] || [])[a] || "本爻经文待校补"), g = (s = 1 === (r = n) || 4 === r,
              l = f === (r % 2 == 0), {
                zone: r < 3 ? "内卦" : "外卦",
                phase: d.fK[r],
                central: s ? "得中" : "不中",
                correct: l ? "当位" : "不当位",
                note: (s ? "居中，较能把握分寸" : "不居中，尤其要留意行动尺度") + "；" + (l ? "阴阳与爻位相应，结构较正" : "阴阳与爻位不相应，需靠修正与配合化解") + "。"
              }), x = (c = [], /元吉|大吉/.test(h) ? c.push("经文明确标举大吉，表示条件成熟时可积极把握") : /吉/.test(h) && c.push("经文见“吉”，表示守住相应条件，结果较为顺遂"),
              /凶/.test(h) && c.push("经文见“凶”，提醒当前做法可能引出明显风险"), /厉/.test(h) && c.push("“厉”表示处境有危险，行动前需要保持戒惧"),
              /吝/.test(h) && c.push("“吝”多指局面受限或留下遗憾，宜及时调整"), /无咎/.test(h) && c.push("“无咎”不是无条件顺利，而是按其要求行事可免过失"),
              /悔亡/.test(h) && c.push("“悔亡”表示修正行为后，原有忧悔可以消解"), /利贞|贞吉|永贞/.test(h) && c.push("重点在“贞”：守正、守常，不因外界变化轻易失序"),
              /不利|勿用|勿逐|勿往|无攸利/.test(h) ? c.push("经文不主张贸然推进，先停下来辨明条件更合适") : /利有攸往|往吉|征吉|利涉大川/.test(h) && c.push("经文允许有所行动，但仍要依照前文所列条件"),
              /有孚|孚/.test(h) && c.push("“孚”强调诚信、真实与相互信任，是此爻成立的关键"), c.length ? c.slice(0, 2).join("；") + "。" : "");
              m.innerHTML = "<header><span>第" + (n + 1) + "爻 · " + g.zone + "</span><strong>" + u + "</strong><div><i>" + g.central + "</i><i>" + g.correct + "</i><i>" + (f ? "阳爻" : "阴爻") + '</i></div></header><section class="hexagrams-yao-classic"><span>爻辞原文</span><blockquote>“' + h + '”</blockquote></section><section class="hexagrams-yao-plain"><span>简明解释</span><p>' + g.phase + "</p><p>" + g.note + "</p>" + (x ? "<p>" + x + "</p>" : "") + '</section><p class="hexagrams-yao-source">解释用于理解经文与爻位结构，不代替具体占断。</p>',
              b(t.name + "卦 · " + u + "：" + h);
            }
            function L(e, i) {
              t = e, a.upper = e.upper, a.lower = e.lower, n = 0, E(), z(), A(), N(), i && window.matchMedia("(max-width: 760px)").matches && r.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
            }
            function C() {
              var e = l.find(function(e) {
                return e.upper === a.upper && e.lower === a.lower;
              });
              e && L(e, !1);
            }
            function N() {
              var e = x.value.trim(), n = l.filter(function(t) {
                return !e || [ t.number, t.name, v(t), t.upper, t.lower ].join("").indexOf(e) >= 0;
              });
              p.textContent = n.length + " 卦", h.innerHTML = n.map(function(e) {
                return '<button type="button" data-number="' + e.number + '" class="' + (e.number === t.number ? "is-active" : "") + '" role="option" aria-selected="' + (e.number === t.number ? "true" : "false") + '"><span>' + String(e.number).padStart(2, "0") + "</span><strong>" + c(e.number) + "</strong><b>" + e.name + "</b><small>" + e.upper + "上 · " + e.lower + "下</small></button>";
              }).join("") || '<p class="hexagrams-atlas-empty">未找到对应卦象，请更换关键词。</p>';
            }
            f.innerHTML = w("upper"), u.innerHTML = w("lower"), [ f, u ].forEach(function(e) {
              e.addEventListener("click", function(t) {
                var n = t.target.closest("[data-trigram]");
                n && (a[e.dataset.level] = n.dataset.trigram, C());
              });
            }), i.querySelector(".hexagrams-swap").addEventListener("click", function() {
              var e = a.upper;
              a.upper = a.lower, a.lower = e, C();
            }), h.addEventListener("click", function(e) {
              var t = e.target.closest("[data-number]");
              if (t) {
                var n = l.find(function(e) {
                  return e.number === Number(t.dataset.number);
                });
                n && (L(n, !0), g.open = !1);
              }
            }), x.addEventListener("input", N), E(), z(), A(), N(), b("先选上卦与下卦，再点击任一爻查看爻辞和爻位解释");
            var _ = document.getElementById("explainArea");
            _ && (_.innerHTML = '<div class="hexagrams-explain"><section><span>一</span><strong>先组上下卦</strong><p>先选上卦与下卦，两卦相重即成六爻卦；交换上下卦会得到另一种结构。</p></section><section><span>二</span><strong>逐爻点击阅读</strong><p>六爻从初爻自下而上。点击爻画，可查看对应爻辞、爻位阶段、得中与当位关系。</p></section><section><span>三</span><strong>解释只讲结构</strong><p>页面解释帮助理解经文与爻位，不自动生成个人吉凶结论；具体研习应回到卦义与原典语境。</p></section></div>');
          }
          function D(e) {
            var t = [ {
              ch: "甲",
              yin: "阳",
              wx: "木",
              fang: "东",
              season: "春",
              image: "参天大木",
              pair: "乙",
              order: "第一位",
              note: "阳木挺拔向上，取象栋梁、乔木与开创之气。"
            }, {
              ch: "乙",
              yin: "阴",
              wx: "木",
              fang: "东",
              season: "春",
              image: "花草藤蔓",
              pair: "甲",
              order: "第二位",
              note: "阴木柔韧曲直，取象花草、藤蔓与细密生发。"
            }, {
              ch: "丙",
              yin: "阳",
              wx: "火",
              fang: "南",
              season: "夏",
              image: "太阳烈火",
              pair: "丁",
              order: "第三位",
              note: "阳火光明外放，取象太阳、炉火与显达之气。"
            }, {
              ch: "丁",
              yin: "阴",
              wx: "火",
              fang: "南",
              season: "夏",
              image: "灯烛星火",
              pair: "丙",
              order: "第四位",
              note: "阴火温润内明，取象灯烛、星光与文明之火。"
            }, {
              ch: "戊",
              yin: "阳",
              wx: "土",
              fang: "中",
              season: "四季",
              image: "高山厚土",
              pair: "己",
              order: "第五位",
              note: "阳土厚重高亢，取象山岳、城墙与承载之力。"
            }, {
              ch: "己",
              yin: "阴",
              wx: "土",
              fang: "中",
              season: "四季",
              image: "田园沃土",
              pair: "戊",
              order: "第六位",
              note: "阴土柔润包容，取象田园、泥土与培育之功。"
            }, {
              ch: "庚",
              yin: "阳",
              wx: "金",
              fang: "西",
              season: "秋",
              image: "矿铁刀斧",
              pair: "辛",
              order: "第七位",
              note: "阳金刚健肃杀，取象矿铁、刀斧与变革之力。"
            }, {
              ch: "辛",
              yin: "阴",
              wx: "金",
              fang: "西",
              season: "秋",
              image: "珠玉精金",
              pair: "庚",
              order: "第八位",
              note: "阴金清润精致，取象珠玉、首饰与琢磨之功。"
            }, {
              ch: "壬",
              yin: "阳",
              wx: "水",
              fang: "北",
              season: "冬",
              image: "江河大海",
              pair: "癸",
              order: "第九位",
              note: "阳水奔流不息，取象江海、洪流与通达之势。"
            }, {
              ch: "癸",
              yin: "阴",
              wx: "水",
              fang: "北",
              season: "冬",
              image: "雨露泉水",
              pair: "壬",
              order: "第十位",
              note: "阴水细润潜藏，取象雨露、泉水与滋养之气。"
            } ], n = [ {
              ch: "子",
              yin: "阳",
              wx: "水",
              fang: "北",
              season: "仲冬",
              time: "23–01时",
              animal: "鼠",
              cang: "癸",
              order: "第一支",
              note: "水气至盛而一阳初生，子为冬至前后的阴阳转关。"
            }, {
              ch: "丑",
              yin: "阴",
              wx: "土",
              fang: "东北",
              season: "季冬",
              time: "01–03时",
              animal: "牛",
              cang: "己 · 癸 · 辛",
              order: "第二支",
              note: "寒土蓄藏，内含土水金三气，是冬末向春初的转折。"
            }, {
              ch: "寅",
              yin: "阳",
              wx: "木",
              fang: "东北",
              season: "孟春",
              time: "03–05时",
              animal: "虎",
              cang: "甲 · 丙 · 戊",
              order: "第三支",
              note: "木气发动，丙火与戊土随生，象征春令开启。"
            }, {
              ch: "卯",
              yin: "阴",
              wx: "木",
              fang: "东",
              season: "仲春",
              time: "05–07时",
              animal: "兔",
              cang: "乙",
              order: "第四支",
              note: "纯木当令，日出东方，象征条达、繁茂与春分之气。"
            }, {
              ch: "辰",
              yin: "阳",
              wx: "土",
              fang: "东南",
              season: "季春",
              time: "07–09时",
              animal: "龙",
              cang: "戊 · 乙 · 癸",
              order: "第五支",
              note: "湿土收纳春木余气，也含水库之意，承春启夏。"
            }, {
              ch: "巳",
              yin: "阴",
              wx: "火",
              fang: "东南",
              season: "孟夏",
              time: "09–11时",
              animal: "蛇",
              cang: "丙 · 戊 · 庚",
              order: "第六支",
              note: "火气初盛，土金伏藏其中，象征阳气进一步外达。"
            }, {
              ch: "午",
              yin: "阳",
              wx: "火",
              fang: "南",
              season: "仲夏",
              time: "11–13时",
              animal: "马",
              cang: "丁 · 己",
              order: "第七支",
              note: "火居极盛，昼日当中，是夏至前后的阴阳转关。"
            }, {
              ch: "未",
              yin: "阴",
              wx: "土",
              fang: "西南",
              season: "季夏",
              time: "13–15时",
              animal: "羊",
              cang: "己 · 丁 · 乙",
              order: "第八支",
              note: "燥土承接火木余气，含木库之意，由夏转秋。"
            }, {
              ch: "申",
              yin: "阳",
              wx: "金",
              fang: "西南",
              season: "孟秋",
              time: "15–17时",
              animal: "猴",
              cang: "庚 · 壬 · 戊",
              order: "第九支",
              note: "金气发动，水土同藏，象征秋令肃降开始。"
            }, {
              ch: "酉",
              yin: "阴",
              wx: "金",
              fang: "西",
              season: "仲秋",
              time: "17–19时",
              animal: "鸡",
              cang: "辛",
              order: "第十支",
              note: "纯金当令，日落西方，象征收敛、成实与秋分之气。"
            }, {
              ch: "戌",
              yin: "阳",
              wx: "土",
              fang: "西北",
              season: "季秋",
              time: "19–21时",
              animal: "狗",
              cang: "戊 · 辛 · 丁",
              order: "第十一支",
              note: "燥土收纳秋金余气，也含火库之意，承秋启冬。"
            }, {
              ch: "亥",
              yin: "阴",
              wx: "水",
              fang: "西北",
              season: "孟冬",
              time: "21–23时",
              animal: "猪",
              cang: "壬 · 甲",
              order: "第十二支",
              note: "水气初旺而木气伏生，象征万物闭藏、冬令开始。"
            } ], a = {
              "木": "var(--wood)",
              "火": "var(--fire)",
              "土": "var(--earth)",
              "金": "var(--metal)",
              "水": "var(--water)"
            }, i = {
              mode: "gan",
              index: 0
            };
            e.style.width = "100%";
            var r = document.createElement("div");
            r.className = "ganzhi-board", r.innerHTML = '<div class="ganzhi-tabs" role="tablist" aria-label="天干地支类型"><span class="ganzhi-thumb" aria-hidden="true"></span><button class="ganzhi-tab is-active" data-mode="gan" type="button" role="tab" aria-selected="true"><strong>十天干</strong><span>天行之气</span></button><button class="ganzhi-tab" data-mode="zhi" type="button" role="tab" aria-selected="false"><strong>十二地支</strong><span>地承之序</span></button></div><div class="ganzhi-strip" role="listbox" aria-label="干支字符序列"></div><div class="ganzhi-content"></div>',
            e.appendChild(r);
            var s = r.querySelector(".ganzhi-tabs"), o = r.querySelector(".ganzhi-thumb"), l = r.querySelector(".ganzhi-strip"), c = r.querySelector(".ganzhi-content"), d = null;
            function m() {
              return "gan" === i.mode ? t : n;
            }
            function f() {
              l.innerHTML = m().map(function(e, t) {
                return '<button class="ganzhi-item' + (t === i.index ? " is-active" : "") + '" data-index="' + t + '" type="button" role="option" aria-selected="' + (t === i.index ? "true" : "false") + '" style="--gz-color:' + a[e.wx] + '"><strong>' + e.ch + "</strong><span>" + e.yin + " · " + e.wx + "</span></button>";
              }).join("");
              var e = l.querySelector(".ganzhi-item.is-active");
              e && e.scrollIntoView && e.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
              });
            }
            function u() {
              var e = m()[i.index], t = "gan" === i.mode;
              c.style.setProperty("--gz-color", a[e.wx]), c.innerHTML = '<div class="ganzhi-focus"><span>' + (t ? "天干" : "地支") + " · " + e.order + "</span><strong>" + e.ch + "</strong><em>" + e.yin + e.wx + '</em></div><div class="ganzhi-detail"><div class="ganzhi-detail-head"><span>' + (t ? "干为天行之气" : "支为地承之序") + "</span><strong>" + e.ch + " · " + e.yin + e.wx + '</strong></div><div class="ganzhi-facts"><section><em>阴阳</em><b>' + e.yin + "</b></section><section><em>五行</em><b>" + e.wx + "</b></section><section><em>方位</em><b>" + e.fang + "</b></section><section><em>时令</em><b>" + e.season + "</b></section><section><em>" + (t ? "物象" : "时辰") + "</em><b>" + (t ? e.image : e.time) + "</b></section><section><em>" + (t ? "阴阳配对" : "生肖") + "</em><b>" + (t ? e.pair : e.animal) + "</b></section></div>" + (t ? "" : '<div class="ganzhi-hidden"><span>藏干</span><strong>' + e.cang + "</strong></div>") + "<p>" + e.note + "</p></div>",
              b(e.ch + " · " + e.yin + e.wx + " · " + e.fang + " · " + e.season + (t ? "" : " · 藏干 " + e.cang));
            }
            s.addEventListener("click", function(e) {
              var t = e.target.closest(".ganzhi-tab");
              if (t && t.dataset.mode !== i.mode) {
                var n = s.querySelectorAll(".ganzhi-tab"), a = Array.prototype.indexOf.call(n, t);
                i.mode = t.dataset.mode, i.index = 0, n.forEach(function(e) {
                  var n = e === t;
                  e.classList.toggle("is-active", n), e.setAttribute("aria-selected", n ? "true" : "false");
                }), o.style.transform = "translateX(" + 100 * a + "%)", o.classList.add("is-moving"),
                clearTimeout(d), d = setTimeout(function() {
                  o.classList.remove("is-moving");
                }, 300), f(), u();
              }
            }), l.addEventListener("click", function(e) {
              var t = e.target.closest(".ganzhi-item");
              t && (i.index = Number(t.dataset.index) || 0, f(), u());
            }), f(), u();
            var h = document.getElementById("explainArea");
            h && (h.innerHTML = '<div class="ganzhi-explain"><section><strong>阴阳相间</strong><p>天干与地支都按阳、阴交替排列。单看五行还不够，须同时辨别阴阳属性。</p></section><section><strong>五行成序</strong><p>天干两两同属一行；地支随四时运行，土支分居季末，承担四季转换。</p></section><section><strong>支中藏干</strong><p>地支并非单一五行，所藏天干分本气、中气、余气，是四柱取用的重要基础。</p></section></div>');
          }
          function F(e) {
            var t, a = [ {
              dir: "南",
              wx: "火",
              sheng: 2,
              cheng: 7,
              color: "var(--fire)",
              x: 180,
              y: 52,
              formula: "地二生火，天七成之",
              season: "夏",
              nature: "炎上",
              note: "火居南方。二为阴、属地数，七为阳、属天数；一生一成，共成南方火数。"
            }, {
              dir: "北",
              wx: "水",
              sheng: 1,
              cheng: 6,
              color: "var(--water)",
              x: 180,
              y: 308,
              formula: "天一生水，地六成之",
              season: "冬",
              nature: "润下",
              note: "水居北方。一为阳、属天数，六为阴、属地数；河图从一生水开始展开五行生成。"
            }, {
              dir: "东",
              wx: "木",
              sheng: 3,
              cheng: 8,
              color: "var(--wood)",
              x: 52,
              y: 180,
              formula: "天三生木，地八成之",
              season: "春",
              nature: "曲直",
              note: "木居东方。三为阳、属天数，八为阴、属地数；东方木气对应春令生发。"
            }, {
              dir: "西",
              wx: "金",
              sheng: 4,
              cheng: 9,
              color: "var(--metal)",
              x: 308,
              y: 180,
              formula: "地四生金，天九成之",
              season: "秋",
              nature: "从革",
              note: "金居西方。四为阴、属地数，九为阳、属天数；西方金气对应秋令收敛。"
            }, {
              dir: "中",
              wx: "土",
              sheng: 5,
              cheng: 10,
              color: "var(--earth)",
              x: 180,
              y: 180,
              formula: "天五生土，地十成之",
              season: "四季",
              nature: "稼穑",
              note: "土居中央。五为阳、属天数，十为阴、属地数；中央土承载并调和四方。"
            } ], i = [ "", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十" ], r = "all", s = 0, o = null;
            e.style.width = "100%", e.style.maxWidth = "980px";
            var l = document.createElement("div");
            l.className = "hetu-board is-all", l.innerHTML = '<div class="hetu-modes" role="tablist"><button class="hetu-mode is-active" type="button" data-mode="all" role="tab" aria-selected="true"><strong>生成合观</strong><span>一生一成</span></button><button class="hetu-mode" type="button" data-mode="sheng" role="tab" aria-selected="false"><strong>生数</strong><span>一至五</span></button><button class="hetu-mode" type="button" data-mode="cheng" role="tab" aria-selected="false"><strong>成数</strong><span>六至十</span></button></div><div class="hetu-orientation"><span>河图方位</span><strong>上南下北 · 左东右西</strong></div><div class="hetu-stage"><div class="hetu-visual"></div><div class="hetu-info"></div></div><div class="hetu-number-wrap"><div class="hetu-number-head"><strong>天地之数</strong><span>点选数字，反查所属方位与生成关系</span></div><div class="hetu-numbers"></div></div><div class="hetu-summary"><section><span>生数</span><strong>一 · 二 · 三 · 四 · 五</strong><p>五行由此而生，合数十五。</p></section><section><span>成数</span><strong>六 · 七 · 八 · 九 · 十</strong><p>生数各加五而成，合数四十。</p></section><section><span>天数</span><strong>一 · 三 · 五 · 七 · 九</strong><p>奇数属阳，五个天数合二十五。</p></section><section><span>地数</span><strong>二 · 四 · 六 · 八 · 十</strong><p>偶数属阴，五个地数合三十。</p></section></div>',
            e.appendChild(l);
            var c = l.querySelector(".hetu-visual"), d = l.querySelector(".hetu-info"), m = l.querySelector(".hetu-numbers");
            function f(e) {
              s = e, o = "sheng" === r ? a[e].sheng : "cheng" === r ? a[e].cheng : null, u();
            }
            function u() {
              var e = a[s];
              c.querySelectorAll(".hetu-node").forEach(function(e, t) {
                e.classList.toggle("is-active", t === s);
              }), d.style.setProperty("--focus-color", e.color);
              var t = o ? i[o] + " · " + (o <= 5 ? "生数" : "成数") : i[e.sheng] + "生 · " + i[e.cheng] + "成", n = o ? o % 2 ? "奇数属阳 · 天数" : "偶数属阴 · 地数" : "生数与成数相差五";
              d.innerHTML = '<div class="hetu-info-head"><span>' + e.formula + "</span><strong>" + e.dir + "方 · " + e.wx + "</strong><em>" + t + '</em></div><div class="hetu-facts"><section><em>生数</em><b>' + i[e.sheng] + "</b></section><section><em>成数</em><b>" + i[e.cheng] + "</b></section><section><em>方位</em><b>" + e.dir + "</b></section><section><em>五行</em><b>" + e.wx + "</b></section><section><em>时令</em><b>" + e.season + "</b></section><section><em>五性</em><b>" + e.nature + "</b></section></div><p>" + e.note + "</p><small>" + n + "。点击图中五方，或从下方一至十直接反查。</small>",
              m.innerHTML = "";
              for (var f = 1; f <= 10; f++) !function(e) {
                var t = a.findIndex(function(t) {
                  return t.sheng === e || t.cheng === e;
                }), n = a[t], c = document.createElement("button");
                c.type = "button", c.className = "hetu-number" + (o === e ? " is-active" : ""),
                c.style.setProperty("--number-color", n.color), c.innerHTML = "<strong>" + i[e] + "</strong><span>" + (e <= 5 ? "生数" : "成数") + "</span><em>" + (e % 2 ? "天 · 阳" : "地 · 阴") + "</em>",
                c.addEventListener("click", function() {
                  s = t, o = e, l.className = "hetu-board is-" + (r = e <= 5 ? "sheng" : "cheng"),
                  l.querySelectorAll(".hetu-mode").forEach(function(e) {
                    var t = e.dataset.mode === r;
                    e.classList.toggle("is-active", t), e.setAttribute("aria-selected", t ? "true" : "false");
                  }), u();
                }), m.appendChild(c);
              }(f);
              b("河图 · " + e.dir + "方 · " + e.wx + " · " + i[e.sheng] + "生" + i[e.cheng] + "成");
            }
            l.querySelector(".hetu-modes").addEventListener("click", function(e) {
              var t = e.target.closest(".hetu-mode");
              t && t.dataset.mode !== r && (o = "sheng" === (r = t.dataset.mode) ? a[s].sheng : "cheng" === r ? a[s].cheng : null,
              l.className = "hetu-board is-" + r, l.querySelectorAll(".hetu-mode").forEach(function(e) {
                var n = e === t;
                e.classList.toggle("is-active", n), e.setAttribute("aria-selected", n ? "true" : "false");
              }), u());
            }), (t = document.createElementNS(n, "svg")).setAttribute("viewBox", "0 0 360 360"),
            t.setAttribute("class", "hetu-svg"), t.setAttribute("role", "img"), t.setAttribute("aria-label", "河图五方生成数"),
            t.innerHTML = '<circle class="hetu-ring" cx="180" cy="180" r="142"></circle><circle class="hetu-ring is-inner" cx="180" cy="180" r="75"></circle><path class="hetu-axis" d="M180 78V282M78 180H282"></path>',
            a.forEach(function(e, a) {
              var r = document.createElementNS(n, "g");
              r.setAttribute("class", "hetu-node" + (a === s ? " is-active" : "")), r.setAttribute("transform", "translate(" + e.x + " " + e.y + ")"),
              r.setAttribute("role", "button"), r.setAttribute("tabindex", "0"), r.style.setProperty("--node-color", e.color),
              r.style.setProperty("--node-delay", .045 * a + "s"), r.innerHTML = '<circle class="hetu-node-halo" r="' + (4 === a ? "47" : "42") + '"></circle><circle class="hetu-node-face" r="' + (4 === a ? "38" : "34") + '"></circle><text class="hetu-node-title" x="0" y="-13" text-anchor="middle">' + e.wx + '</text><text class="hetu-node-number hetu-num-sheng" x="-9" y="13" text-anchor="middle">' + i[e.sheng] + '</text><text class="hetu-node-separator" x="0" y="13" text-anchor="middle">·</text><text class="hetu-node-number hetu-num-cheng" x="10" y="13" text-anchor="middle">' + i[e.cheng] + '</text><text class="hetu-node-foot" x="0" y="29" text-anchor="middle">' + e.dir + "方</text>",
              r.addEventListener("click", function() {
                f(a);
              }), r.addEventListener("pointerenter", function() {
                f(a);
              }), r.addEventListener("keydown", function(e) {
                ("Enter" === e.key || " " === e.key) && (e.preventDefault(), f(a));
              }), t.appendChild(r);
            }), c.appendChild(t), u();
            var h = document.getElementById("explainArea");
            h && (h.innerHTML = '<div class="hetu-explain"><section><strong>五方生成</strong><p>一六水居北、二七火居南、三八木居东、四九金居西、五十土居中。</p></section><section><strong>生成相差五</strong><p>一至五为生数，各自加五得到六至十成数，五组关系一一对应。</p></section><section><strong>天地合五十五</strong><p>奇数为天数，合二十五；偶数为地数，合三十；天地之数共五十五。</p></section></div>');
          }
          function W(e) {
            var t = [ {
              gua: "巽",
              num: 4,
              dir: "东南",
              wx: "木",
              color: "var(--wood)",
              image: "风",
              meaning: "入、顺、渗透"
            }, {
              gua: "离",
              num: 9,
              dir: "南",
              wx: "火",
              color: "var(--fire)",
              image: "火",
              meaning: "明、丽、显现"
            }, {
              gua: "坤",
              num: 2,
              dir: "西南",
              wx: "土",
              color: "var(--earth)",
              image: "地",
              meaning: "顺、载、包容"
            }, {
              gua: "震",
              num: 3,
              dir: "东",
              wx: "木",
              color: "var(--wood)",
              image: "雷",
              meaning: "动、发、振起"
            }, {
              gua: "中",
              num: 5,
              dir: "中央",
              wx: "土",
              color: "var(--earth)",
              image: "枢",
              meaning: "统摄、寄宫、枢纽"
            }, {
              gua: "兑",
              num: 7,
              dir: "西",
              wx: "金",
              color: "var(--metal)",
              image: "泽",
              meaning: "悦、说、交流"
            }, {
              gua: "艮",
              num: 8,
              dir: "东北",
              wx: "土",
              color: "var(--earth)",
              image: "山",
              meaning: "止、界、积累"
            }, {
              gua: "坎",
              num: 1,
              dir: "北",
              wx: "水",
              color: "var(--water)",
              image: "水",
              meaning: "陷、险、流动"
            }, {
              gua: "乾",
              num: 6,
              dir: "西北",
              wx: "金",
              color: "var(--metal)",
              image: "天",
              meaning: "健、刚、主导"
            } ], n = [ "天辅", "天英", "天芮", "天冲", "天禽", "天柱", "天任", "天蓬", "天心" ], a = [ "辛", "乙", "己", "庚", "壬", "丁", "丙", "戊", "癸" ], i = [ 0, 1, 2, 5, 8, 7, 6, 3 ], r = [ "杜门", "景门", "死门", "惊门", "开门", "休门", "生门", "伤门" ], s = {
              "休门": "休养、和缓、求见",
              "生门": "生发、营求、财利",
              "伤门": "损伤、竞争、行动",
              "杜门": "闭藏、技术、保密",
              "景门": "显扬、文书、传播",
              "死门": "终止、收束、沉静",
              "惊门": "惊疑、口舌、变动",
              "开门": "开拓、事业、通达",
              "中宫": "八门不落中宫"
            }, o = "yang", l = 1, c = 0;
            e.style.width = "100%", e.style.maxWidth = "1020px";
            var d = document.createElement("div");
            d.className = "qimen-board is-yang", d.innerHTML = '<div class="qimen-toolbar"><div class="qimen-mode" role="tablist"><button class="is-active" type="button" data-mode="yang" role="tab" aria-selected="true"><strong>阳遁</strong><span>顺飞</span></button><button type="button" data-mode="yin" role="tab" aria-selected="false"><strong>阴遁</strong><span>逆飞</span></button></div><div class="qimen-status"><span>当前演示</span><strong>阳遁一局</strong><em>顺飞九宫</em></div></div><div class="qimen-ju-wrap"><div class="qimen-ju-head"><strong>九局</strong><span>选择局数，观察星、门、奇仪的飞布变化</span></div><div class="qimen-jus" role="tablist"></div></div><div class="qimen-stage"><div class="qimen-grid" role="grid"></div><div class="qimen-info"></div></div><div class="qimen-legend"><section><span class="is-star">星</span><strong>九星</strong><p>天蓬至天英，观察天时与事物气势。</p></section><section><span class="is-door">门</span><strong>八门</strong><p>休生伤杜景死惊开，观察人事路径。</p></section><section><span class="is-stem">干</span><strong>三奇六仪</strong><p>乙丙丁为三奇，戊己庚辛壬癸为六仪。</p></section><section><span class="is-palace">宫</span><strong>九宫方位</strong><p>宫卦与洛书数固定，是盘面的空间骨架。</p></section></div>',
            e.appendChild(d);
            for (var m = d.querySelector(".qimen-grid"), f = d.querySelector(".qimen-info"), u = d.querySelector(".qimen-status"), h = d.querySelector(".qimen-jus"), g = 1; g <= 9; g++) !function(e) {
              var t = document.createElement("button");
              t.type = "button", t.className = "qimen-ju" + (1 === e ? " is-active" : ""), t.dataset.ju = e,
              t.setAttribute("role", "tab"), t.setAttribute("aria-selected", 1 === e ? "true" : "false"),
              t.innerHTML = "<strong>" + [ "", "一", "二", "三", "四", "五", "六", "七", "八", "九" ][e] + "</strong><span>局</span>",
              t.addEventListener("click", function() {
                l = e, c = 0, p();
              }), h.appendChild(t);
            }(g);
            function x(e) {
              var t = (l - 1) * ("yang" === o ? 1 : -1), s = (e - t) % 9;
              s < 0 && (s += 9);
              var c = i.indexOf(e), d = "中宫";
              if (c >= 0) {
                var m = (c - t) % 8;
                m < 0 && (m += 8), d = r[m];
              }
              return {
                star: n[s],
                stem: a[s],
                door: d
              };
            }
            function p() {
              m.innerHTML = "", t.forEach(function(e, t) {
                var n = x(t), a = document.createElement("button");
                a.type = "button", a.className = "qimen-cell" + (t === c ? " is-active" : "") + (4 === t ? " is-center" : ""),
                a.style.setProperty("--palace-color", e.color), a.style.setProperty("--cell-delay", .035 * t + "s"),
                a.setAttribute("role", "gridcell"), a.setAttribute("aria-label", e.gua + e.num + "宫，" + n.star + "，" + n.door + "，" + n.stem),
                a.innerHTML = '<div class="qimen-cell-head"><span>' + e.dir + "</span><strong>" + e.gua + e.num + '</strong></div><div class="qimen-cell-main"><em>' + n.stem + "</em><div><strong>" + n.star + "</strong><span>" + n.door + "</span></div></div><small>" + e.wx + " · " + e.image + "</small>",
                a.addEventListener("click", function() {
                  c = t, v();
                }), a.addEventListener("pointerenter", function() {
                  c = t, v();
                }), m.appendChild(a);
              }), Array.prototype.forEach.call(h.children, function(e) {
                var t = +e.dataset.ju === l;
                e.classList.toggle("is-active", t), e.setAttribute("aria-selected", t ? "true" : "false");
              }), u.innerHTML = "<span>当前演示</span><strong>" + ("yang" === o ? "阳遁" : "阴遁") + [ "", "一", "二", "三", "四", "五", "六", "七", "八", "九" ][l] + "局</strong><em>" + ("yang" === o ? "顺飞九宫" : "逆飞九宫") + "</em>",
              v();
            }
            function v() {
              m.querySelectorAll(".qimen-cell").forEach(function(e, t) {
                e.classList.toggle("is-active", t === c);
              });
              var e = t[c], n = x(c);
              f.style.setProperty("--palace-color", e.color), f.innerHTML = '<div class="qimen-info-head"><span>' + ("yang" === o ? "阳遁顺飞" : "阴遁逆飞") + " · " + [ "", "一", "二", "三", "四", "五", "六", "七", "八", "九" ][l] + "局</span><strong>" + e.gua + e.num + "宫</strong><em>" + e.dir + " · " + e.wx + '</em></div><div class="qimen-info-focus"><section><span>九星</span><strong>' + n.star + "</strong></section><section><span>八门</span><strong>" + n.door + "</strong></section><section><span>奇仪</span><strong>" + n.stem + '</strong></section></div><div class="qimen-info-facts"><section><em>宫象</em><b>' + e.image + "</b></section><section><em>宫义</em><b>" + e.meaning + "</b></section></div><p>" + ("中宫" === n.door ? "中五为盘面枢纽，八门不直接落入中宫；九星与奇仪仍用于观察中央层级。" : n.door + "主" + s[n.door] + "。") + "</p><small>此处用于理解盘面结构与顺逆飞布，不代替按具体年月日时起出的实盘。</small>",
              b(("yang" === o ? "阳遁" : "阴遁") + l + "局 · " + e.gua + e.num + "宫 · " + n.star + " · " + n.door + " · " + n.stem);
            }
            d.querySelector(".qimen-mode").addEventListener("click", function(e) {
              var t = e.target.closest("button");
              t && t.dataset.mode !== o && (o = t.dataset.mode, c = 0, d.className = "qimen-board is-" + o,
              d.querySelectorAll(".qimen-mode button").forEach(function(e) {
                var n = e === t;
                e.classList.toggle("is-active", n), e.setAttribute("aria-selected", n ? "true" : "false");
              }), p());
            }), p();
            var y = document.getElementById("explainArea");
            y && (y.innerHTML = '<div class="qimen-explain"><section><strong>先认九宫骨架</strong><p>巽四、离九、坤二；震三、中五、兑七；艮八、坎一、乾六，宫位与方位固定。</p></section><section><strong>再分盘面层级</strong><p>九星看天时，八门看人事，奇仪看干气；同一宫内分层阅读，不把星、门、干混作一项。</p></section><section><strong>最后看顺逆飞布</strong><p>阳遁取顺行、阴遁取逆行。完整起局还需节气、三元与日时，本图只演示结构。</p></section></div>');
          }


  var chips = document.getElementById("chips");
  if (chips) {
    chips.addEventListener("click", function(e) {
      var t = e.target.closest(".chip");
      t && (document.querySelectorAll(".chip").forEach(function(e) {
        var n = e === t;
        e.classList.toggle("on", n), e.setAttribute("aria-pressed", n ? "true" : "false");
      }), f = t.dataset.cat, p());
    });
  }
  var back = document.getElementById("detailBack");
  if (back) {
    back.addEventListener("click", function() {
      document.getElementById("detailPanel").classList.remove("open"), document.body.style.overflow = "";
    });
  }
  if (renderIndex) p();
  if (initialChart && i.some(function(item) { return item.id === initialChart })) v(initialChart);
  return { charts: i, open: v, setTip: b };
}

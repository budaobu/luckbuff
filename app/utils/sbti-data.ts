import type { SbtiAnswer, SbtiDimension, SbtiOption, SbtiPersonality, SbtiQuestion, Grade, DimensionId, Rarity } from '~/types/sbti'

export const dimensionOrder: DimensionId[] = [
  'S1', 'S2', 'S3',
  'E1', 'E2', 'E3',
  'A1', 'A2', 'A3',
  'Ac1', 'Ac2', 'Ac3',
  'So1', 'So2', 'So3',
]

export const sbtiDimensions: SbtiDimension[] = [
  { id: 'S1', model: 'S', name: '自尊自信' },
  { id: 'S2', model: 'S', name: '自我清晰度' },
  { id: 'S3', model: 'S', name: '核心价值' },
  { id: 'E1', model: 'E', name: '依恋安全感' },
  { id: 'E2', model: 'E', name: '情感投入度' },
  { id: 'E3', model: 'E', name: '边界与依赖' },
  { id: 'A1', model: 'A', name: '世界观倾向' },
  { id: 'A2', model: 'A', name: '规则与灵活度' },
  { id: 'A3', model: 'A', name: '人生意义感' },
  { id: 'Ac1', model: 'Ac', name: '动机导向' },
  { id: 'Ac2', model: 'Ac', name: '决策风格' },
  { id: 'Ac3', model: 'Ac', name: '执行模式' },
  { id: 'So1', model: 'So', name: '社交主动性' },
  { id: 'So2', model: 'So', name: '人际边界感' },
  { id: 'So3', model: 'So', name: '表达与真实度' },
]

function opt(id: string, text: string, score: number, extra: Partial<SbtiOption> = {}): SbtiOption {
  return { id, text, score, ...extra }
}

export function getSbtiMainQuestions(): SbtiQuestion[] {
  return [
    {
      id: 'q1',
      dimension: 'S1',
      text: '我不仅是屌丝，我还是joker，我还是咸鱼，这辈子没谈过一场恋爱，胆怯又自卑，我的青春就是一场又一场的意淫……求求哥们给我们这种小丑一点活路吧，我真的不想在白天把枕巾哭湿一大片',
      options: [
        opt('q1-a', '我哭了。。', 1),
        opt('q1-b', '这是什么。。', 2),
        opt('q1-c', '这不是我！', 3),
      ],
    },
    {
      id: 'q2',
      dimension: 'S1',
      text: '我不够好，周围的人都比我优秀',
      options: [
        opt('q2-a', '确实', 1),
        opt('q2-b', '有时', 2),
        opt('q2-c', '不是', 3),
      ],
    },
    {
      id: 'q3',
      dimension: 'S2',
      text: '我很清楚真正的自己是什么样的',
      options: [
        opt('q3-a', '不认同', 1),
        opt('q3-b', '中立', 2),
        opt('q3-c', '认同', 3),
      ],
    },
    {
      id: 'q4',
      dimension: 'S2',
      text: '我内心有真正追求的东西',
      options: [
        opt('q4-a', '不认同', 1),
        opt('q4-b', '中立', 2),
        opt('q4-c', '认同', 3),
      ],
    },
    {
      id: 'q5',
      dimension: 'S3',
      text: '我一定要不断往上爬、变得更厉害',
      options: [
        opt('q5-a', '不认同', 1),
        opt('q5-b', '中立', 2),
        opt('q5-c', '认同', 3),
      ],
    },
    {
      id: 'q6',
      dimension: 'S3',
      text: '外人的评价对我来说无所吊谓。',
      options: [
        opt('q6-a', '不认同', 1),
        opt('q6-b', '中立', 2),
        opt('q6-c', '认同', 3),
      ],
    },
    {
      id: 'q7',
      dimension: 'E1',
      text: '对象超过5小时没回消息，说自己窜稀了，你会怎么想？',
      options: [
        opt('q7-a', '拉稀不可能5小时，也许ta隐瞒了我。', 1),
        opt('q7-b', '在信任和怀疑之间摇摆。', 2),
        opt('q7-c', '也许今天ta真的不太舒服。', 3),
      ],
    },
    {
      id: 'q8',
      dimension: 'E1',
      text: '我在感情里经常担心被对方抛弃',
      options: [
        opt('q8-a', '是的', 1),
        opt('q8-b', '偶尔', 2),
        opt('q8-c', '不是', 3),
      ],
    },
    {
      id: 'q9',
      dimension: 'E2',
      text: '我对天发誓，我对待每一份感情都是认真的！',
      options: [
        opt('q9-a', '并没有', 1),
        opt('q9-b', '也许？', 2),
        opt('q9-c', '是的！（问心无愧骄傲脸）', 3),
      ],
    },
    {
      id: 'q10',
      dimension: 'E2',
      text: '你的恋爱对象是一个尊老爱幼，温柔敦厚，洁身自好……花容月貌的人，此时你会？',
      options: [
        opt('q10-a', '就算ta再优秀我也不会陷入太深。', 1),
        opt('q10-b', '会介于A和C之间。', 2),
        opt('q10-c', '会非常珍惜ta，也许会变成恋爱脑。', 3),
      ],
    },
    {
      id: 'q11',
      dimension: 'E3',
      text: '恋爱后，对象非常黏人，你作何感想？',
      options: [
        opt('q11-a', '那很爽了', 1),
        opt('q11-b', '都行无所谓', 2),
        opt('q11-c', '我更喜欢保留独立空间', 3),
      ],
    },
    {
      id: 'q12',
      dimension: 'E3',
      text: '我在任何关系里都很重视个人空间',
      options: [
        opt('q12-a', '我更喜欢依赖与被依赖', 1),
        opt('q12-b', '看情况', 2),
        opt('q12-c', '是的！（斩钉截铁地说道）', 3),
      ],
    },
    {
      id: 'q13',
      dimension: 'A1',
      text: '大多数人是善良的',
      options: [
        opt('q13-a', '其实邪恶的人心比世界上的痔疮更多。', 1),
        opt('q13-b', '也许吧。', 2),
        opt('q13-c', '是的，我愿相信好人更多。', 3),
      ],
    },
    {
      id: 'q14',
      dimension: 'A1',
      text: '你走在街上，一位萌萌的小女孩递给你一根棒棒糖，此时你作何感想？',
      options: [
        opt('q14-a', '这也许是一种新型诈骗？还是走开为好。', 1),
        opt('q14-b', '一脸懵逼，作挠头状', 2),
        opt('q14-c', '呜呜她真好真可爱！居然给我棒棒糖！', 3),
      ],
    },
    {
      id: 'q15',
      dimension: 'A2',
      text: '快考试了，学校规定必须上晚自习，但今晚你约了男/女神一起玩《绝地求生》，你怎么办？',
      options: [
        opt('q15-a', '翘了！反正就一次！', 1),
        opt('q15-b', '干脆请个假吧。', 2),
        opt('q15-c', '都快考试了还去啥。', 3),
      ],
    },
    {
      id: 'q16',
      dimension: 'A2',
      text: '我喜欢打破常规，不喜欢被束缚',
      options: [
        opt('q16-a', '认同', 1),
        opt('q16-b', '保持中立', 2),
        opt('q16-c', '不认同', 3),
      ],
    },
    {
      id: 'q17',
      dimension: 'A3',
      text: '我做事通常有目标。',
      options: [
        opt('q17-a', '不认同', 1),
        opt('q17-b', '中立', 2),
        opt('q17-c', '认同', 3),
      ],
    },
    {
      id: 'q18',
      dimension: 'A3',
      text: '突然某一天，我意识到人生哪有什么他妈的狗屁意义，人不过是和动物一样被各种欲望支配着……',
      options: [
        opt('q18-a', '是这样的。', 1),
        opt('q18-b', '也许是，也许不是。', 2),
        opt('q18-c', '这简直是胡扯', 3),
      ],
    },
    {
      id: 'q19',
      dimension: 'Ac1',
      text: '我做事主要为了取得成果和进步，而不是避免麻烦和风险。',
      options: [
        opt('q19-a', '不认同', 1),
        opt('q19-b', '中立', 2),
        opt('q19-c', '认同', 3),
      ],
    },
    {
      id: 'q20',
      dimension: 'Ac1',
      text: '你因便秘坐在马桶上（已长达30分钟），拉不出很难受。此时你更像',
      options: [
        opt('q20-a', '再坐三十分钟看看，说不定就有了。', 1),
        opt('q20-b', '用力拍打自己的屁股并说："死屁股，快拉啊！"', 2),
        opt('q20-c', '使用开塞露，快点拉出来才好。', 3),
      ],
    },
    {
      id: 'q21',
      dimension: 'Ac2',
      text: '我做决定比较果断，不喜欢犹豫',
      options: [
        opt('q21-a', '不认同', 1),
        opt('q21-b', '中立', 2),
        opt('q21-c', '认同', 3),
      ],
    },
    {
      id: 'q22',
      dimension: 'Ac2',
      text: '此题没有题目，请盲选',
      options: [
        opt('q22-a', '反复思考后感觉应该选A？', 1),
        opt('q22-b', '啊，要不选B？', 2),
        opt('q22-c', '不会就选C？', 3),
      ],
    },
    {
      id: 'q23',
      dimension: 'Ac3',
      text: '别人说你"执行力强"，你内心更接近哪句？',
      options: [
        opt('q23-a', '我被逼到最后确实执行力超强。。。', 1),
        opt('q23-b', '啊，有时候吧。', 2),
        opt('q23-c', '是的，事情本来就该被推进', 3),
      ],
    },
    {
      id: 'q24',
      dimension: 'Ac3',
      text: '我做事常常有计划，____',
      options: [
        opt('q24-a', '然而计划不如变化快。', 1),
        opt('q24-b', '有时能完成，有时不能。', 2),
        opt('q24-c', '我讨厌被打破计划。', 3),
      ],
    },
    {
      id: 'q25',
      dimension: 'So1',
      text: '你因玩《第五人格》而结识许多网友，并被邀请线下见面，你的想法是？',
      options: [
        opt('q25-a', '网上口嗨下就算了，真见面还是有点忐忑。', 1),
        opt('q25-b', '见网友也挺好，反正谁来聊我就聊两句。', 2),
        opt('q25-c', '我会打扮一番并热情聊天，万一呢？', 3),
      ],
    },
    {
      id: 'q26',
      dimension: 'So1',
      text: '朋友带了ta的朋友一起来玩，你最可能的状态是',
      options: [
        opt('q26-a', '对"朋友的朋友"天然有点距离感', 1),
        opt('q26-b', '看对方，能玩就玩。', 2),
        opt('q26-c', '朋友的朋友应该也算我的朋友！', 3),
      ],
    },
    {
      id: 'q27',
      dimension: 'So2',
      text: '我和人相处主打一个电子围栏，靠太近会自动报警。',
      options: [
        opt('q27-a', '认同', 3),
        opt('q27-b', '中立', 2),
        opt('q27-c', '不认同', 1),
      ],
    },
    {
      id: 'q28',
      dimension: 'So2',
      text: '我渴望和我信任的人关系密切，熟得像失散多年的亲戚。',
      options: [
        opt('q28-a', '认同', 1),
        opt('q28-b', '中立', 2),
        opt('q28-c', '不认同', 3),
      ],
    },
    {
      id: 'q29',
      dimension: 'So3',
      text: '有时候你明明对一件事有负面看法，但最后没说出来。多数情况下原因是：',
      options: [
        opt('q29-a', '这种情况较少。', 1),
        opt('q29-b', '可能碍于情面或者关系。', 2),
        opt('q29-c', '不想让别人知道自己是个阴暗的人。', 3),
      ],
    },
    {
      id: 'q30',
      dimension: 'So3',
      text: '我在不同人面前会表现出不一样的自己',
      options: [
        opt('q30-a', '不认同', 1),
        opt('q30-b', '中立', 2),
        opt('q30-c', '认同', 3),
      ],
    },
  ]
}

export function getGateQuestion(): SbtiQuestion {
  return {
    id: 'gate',
    dimension: 'S1',
    text: '您平时有什么爱好？',
    isHidden: true,
    options: [
      opt('gate-a', '吃喝拉撒', 0),
      opt('gate-b', '艺术爱好', 0),
      opt('gate-c', '饮酒', 0, { triggerHidden: true }),
      opt('gate-d', '健身', 0),
    ],
  }
}

export function getDrunkQuestion(): SbtiQuestion {
  return {
    id: 'drunk',
    dimension: 'S1',
    text: '您对饮酒的态度是？',
    isHidden: true,
    options: [
      opt('drunk-a', '小酌怡情，喝不了太多。', 0),
      opt('drunk-b', '我习惯将白酒灌在保温杯，当白开水喝，酒精令我信服。', 0, { drunkLock: true }),
    ],
  }
}

export const sbtiPersonalities: SbtiPersonality[] = [
  {
    code: 'CTRL',
    name: '拿捏者',
    alias: 'CTRL',
    pattern: 'HHH-HMH-MHH-HHH-MHM',
    rarity: 'SR',
    percent: 3.2,
    quote: '怎么样，被我拿捏了吧？',
    description: '此型极为罕见，被视为熵增定律的天然对抗者。规则只是基础参数，计划不过随手涂鸦。他们像人形任务管理中心，总能在朋友即将脱轨前用一套无法拒绝的逻辑将其拽回正轨，是混乱生活最后的备份与重启键。',
    traits: '高度自尊、自我清晰与价值感；世界观积极；动机、决策、执行均强；社交主动，人际边界适中，表达偏内敛。',
    gradient: ['#8B5CF6', '#C4B5FD'],
    icon: '🎮',
  },
  {
    code: 'ATM-er',
    name: '送钱者',
    alias: 'ATM-er',
    pattern: 'HHH-HHM-HHH-HMH-MHL',
    rarity: 'SR',
    percent: 3.5,
    quote: '你以为我很有钱吗？',
    description: '这类人总在“支付”：时间、精力、耐心乃至本该安宁的夜晚。他们像一台老旧却坚固的 ATM，吞进他人的焦虑与麻烦，吐出“没事，有我”的安心。他们以磐石般的可靠承受着瀑布般的索取，偶尔夜深时为自己的责任心叹息。',
    traits: '自我层面强大；情感投入高但安全感居中；态度积极；行动偏稳健；社交主动、边界清晰、表达度低。',
    gradient: ['#10B981', '#6EE7B7'],
    icon: '🏧',
  },
  {
    code: 'Dior-s',
    name: '屌丝',
    alias: 'Dior-s',
    pattern: 'MHM-MMH-MHM-HMH-LHL',
    rarity: 'N',
    percent: 6.4,
    quote: '等着我屌丝逆袭。',
    description: '并非世俗意义上的“屌丝”，而是犬儒主义哲人的精神传人。他们看穿消费主义与成功学的陷阱，认为所谓上进不过是更精致的牢笼。他们像躺在精神木桶里晒太阳，信奉“躺着比站着舒服”“到点就得吃饭”的生存法则。',
    traits: '自我与情感多居中；态度灵活而务实；行动力中等；社交被动、边界清晰、表达真实。',
    gradient: ['#64748B', '#94A3B8'],
    icon: '🛋️',
  },
  {
    code: 'BOSS',
    name: '领导者',
    alias: 'BOSS',
    pattern: 'HHH-HMH-MMH-HHH-LHL',
    rarity: 'SR',
    percent: 3.1,
    quote: '方向盘给我，我来开。',
    description: '永远手握方向盘的人。哪怕油箱报警、导航失灵，也能面无表情地说“我来开”，并把车开到目的地。他们以效率为信仰、秩序为呼吸，看世界像已通关者看新手教程，自我突破对他们而言如同常人的自律训练。',
    traits: '自我极强；情感中等；态度规则感强、意义感中；动机、决策、执行均强；社交被动、边界清晰、表达低。',
    gradient: ['#F59E0B', '#FCD34D'],
    icon: '🚗',
  },
  {
    code: 'THAN-K',
    name: '感恩者',
    alias: 'THAN-K',
    pattern: 'MHM-HMM-HHM-MMH-MHL',
    rarity: 'N',
    percent: 6.2,
    quote: '我感谢苍天！我感谢大地！',
    description: '拥有温润性格与宽广胸怀，认为世界没有绝对的坏人，只有“尚未被感恩之光照耀的朋友”。堵车也能变成欣赏音乐与窗外焦虑面容的机会。他们像一座永不枯竭的正能量发射塔，甚至能从墙角的霉斑里看出星空。',
    traits: '自我居中；情感安全感低、投入度中、边界独立；态度积极；行动力中等；社交主动、边界清晰、表达低。',
    gradient: ['#F97316', '#FDBA74'],
    icon: '🙏',
  },
  {
    code: 'OH-NO',
    name: '哦不人',
    alias: 'OH-NO',
    pattern: 'HHL-LMH-LHH-HHM-LHL',
    rarity: 'SSR',
    percent: 1.8,
    quote: '哦不！我怎么会是这个人格？！',
    description: '“哦不”不是恐惧，而是一种顶级智慧。桌沿的水杯在他们眼中可能演化成水渍、短路、火灾、疏散、经济损失、蝴蝶效应直至世界末日的史诗。因此他们会把杯子移到桌面中央并垫上杯垫。他们对边界近乎偏执，是秩序的守护神。',
    traits: '自尊高但自我清晰度低；情感安全感低；世界观谨慎、规则感强、意义感高；决策与执行中等；社交被动、边界清晰、表达低。',
    gradient: ['#6366F1', '#A5B4FC'],
    icon: '😰',
  },
  {
    code: 'GOGO',
    name: '行者',
    alias: 'GOGO',
    pattern: 'HHM-HMH-MMH-HHH-MHM',
    rarity: 'R',
    percent: 4.7,
    quote: 'gogo go~ 出发咯',
    description: '生活在极致的“所见即所得”世界：闭眼即天黑，花光即没钱，站上斑马线就是行人。逻辑自洽，无法反驳。他们不“解决问题”，而是“清除待办事项”。世界只有两种状态：已完成，和即将被他们完成。',
    traits: '自尊高、自我清晰度中、价值高；情感安全感高、投入中、边界独立；态度规则感中、意义感高；行动驱力极强；社交主动、边界适中、表达克制。',
    gradient: ['#14B8A6', '#5EEAD4'],
    icon: '🏃',
  },
  {
    code: 'SEXY',
    name: '尤物',
    alias: 'SEXY',
    pattern: 'HMH-HHL-HMM-HMM-HLH',
    rarity: 'SR',
    percent: 3.6,
    quote: '您就是天生的尤物！',
    description: '走进房间时，照明系统仿佛会自动调暗以节省能源。微笑能让空气湿度下降，因为水蒸气都凝结成了他人眼中的爱心。无论何人，都容易对他们投入超标注意力。他们无需卖力表达，单是存在本身就像一篇华丽得过分的赋。',
    traits: '自尊高但自我清晰度中；情感安全感高但投入低；世界观中、规则感中、意义感低；行动力中；社交主动、边界低、表达高。',
    gradient: ['#EC4899', '#F9A8D4'],
    icon: '💋',
  },
  {
    code: 'LOVE-R',
    name: '多情者',
    alias: 'LOVE-R',
    pattern: 'MLH-LHL-HLH-MLM-MLH',
    rarity: 'SR',
    percent: 3.4,
    quote: '爱意太满，现实显得有点贫瘠。',
    description: '像从神话时代幸存至今的珍稀物种，情感处理器不是二进制而是彩虹制。常人眼中一片落叶只是秋天来了，在他们眼中却是一出关于轮回、牺牲与无言之爱的十三幕悲喜剧。他们内心像一座永不关门的主题公园，一生寻找愿意陪自己坐旋转木马到宇宙尽头的灵魂伴侣。',
    traits: '自尊中但自我清晰度低；情感安全感低、投入高、边界低；世界观高、规则感低、意义感高；行动力中；社交被动、边界低、表达高。',
    gradient: ['#F43F5E', '#FDA4AF'],
    icon: '💘',
  },
  {
    code: 'MUM',
    name: '妈妈',
    alias: 'MUM',
    pattern: 'MMH-MHL-HMM-LMM-HLL',
    rarity: 'R',
    percent: 5.1,
    quote: '或许...我可以叫你妈妈吗....?',
    description: '底色温柔，擅长感知情绪，共情力极强，知道何时该停下、何时该对自己说“算了”。他们像医生一样治愈他人的不开心，但自己落泪时，给自己开的药剂量总比给别人小一号。',
    traits: '自我居中但安全感偏低；情感投入高、边界独立；态度中；行动力低；社交主动、边界低、表达低。',
    gradient: ['#84CC16', '#BEF264'],
    icon: '🤱',
  },
  {
    code: 'FAKE',
    name: '伪人',
    alias: 'FAKE',
    pattern: 'HLM-MML-MLM-MLM-HLH',
    rarity: 'R',
    percent: 4.9,
    quote: '已经，没有人类了。',
    description: '在社交场合八面玲珑，切换人格面具比切换输入法还快。上一秒是推心置腹的好友，下一秒领导出现便切换为沉稳可靠模式。夜深人静时摘下面具，才发现面具之下空无一物，正是这些面具构成了自己。',
    traits: '自尊高但自我清晰度低；情感投入中、边界低；世界观中、规则感低、意义感中；行动力中；社交主动、边界低、表达高。',
    gradient: ['#8B5CF6', '#C4B5FD'],
    icon: '🎭',
  },
  {
    code: 'OJBK',
    name: '无所谓人',
    alias: 'OJBK',
    pattern: 'MMH-MMM-HML-LMM-MML',
    rarity: 'N',
    percent: 7.3,
    quote: '我说随便，是真的随便。',
    description: '这不是一种人格，而是一种统治哲学。凡人面对“米饭还是面条”激烈燃烧卡路里时，他们像批阅奏章般淡然说出“都行”。并非没主见，而是视凡俗选择如蝼蚁。不与草履虫辩论宇宙未来，也不在意脚下尘埃飘向何方。',
    traits: '各维度普遍居中或偏低；态度世界观高、规则感中、意义感低；行动力低；社交居中、边界居中、表达低。',
    gradient: ['#94A3B8', '#CBD5E1'],
    icon: '🤷',
  },
  {
    code: 'MALO',
    name: '吗喽',
    alias: 'MALO',
    pattern: 'MLH-MHM-MLH-MLH-LMH',
    rarity: 'R',
    percent: 4.8,
    quote: '人生是个副本，而我只是一只吗喽。',
    description: '灵魂还停留在挂在树上荡秋千、看见香蕉就两眼放光的快乐时代。他们看透文明不过是一场无聊且不好玩的付费游戏。规则可以打破，天花板用来倒挂，会议室适合表演后空翻。他们本身就像一个从巨大脑洞里掉出来、忘了关门的奇思妙想。',
    traits: '自尊中、自我清晰度低、价值高；情感安全感中、投入高、边界低；世界观中、规则感低、意义感高；行动力中；社交被动、边界高、表达中。',
    gradient: ['#A16207', '#FDE047'],
    icon: '🐒',
  },
  {
    code: 'JOKE-R',
    name: '小丑',
    alias: 'JOKE-R',
    pattern: 'LLH-LHL-LML-LLL-MLM',
    rarity: 'SSR',
    percent: 1.5,
    quote: '原来我们都是小丑。',
    description: '像是把笑话穿在身上。打开一层是段子，再打开一层还是段子，层层剥开到最后，里面空空如也，只剩微弱的回声在说“哈，没想到吧”。他们是社交场合的气氛组组长，所有人笑得前仰后合时，他们笑得最大声，只为盖住心碎的声音。',
    traits: '自尊低、自我清晰度低但价值高；情感安全感低、投入高、边界低；世界观低、规则感低、意义感中；行动力极低；社交居中、边界低、表达中。',
    gradient: ['#EAB308', '#FEF08A'],
    icon: '🤡',
  },
  {
    code: 'WOC!',
    name: '握草人',
    alias: 'WOC!',
    pattern: 'HHL-HMH-MMH-HHM-LHH',
    rarity: 'SR',
    percent: 3.3,
    quote: '卧槽，我怎么是这个人格？',
    description: '拥有两套独立操作系统：表面的“我操”“牛逼”“啊？”负责大惊小怪；后台则冷静分析“果然不出所料”。他们只卧槽不多管闲事，深知给愚蠢者讲道理如同扶烂泥上墙，既费体力又沾一手屎。于是他们握着一根智慧的大草，用一声深情的“WOC！”向这个疯狂世界致敬。',
    traits: '自尊高但自我清晰度低；情感安全感高、投入中、边界独立；态度规则感中、意义感中；决策与执行中等；社交被动、边界高、表达高。',
    gradient: ['#22C55E', '#86EFAC'],
    icon: '🌿',
  },
  {
    code: 'THIN-K',
    name: '思考者',
    alias: 'THIN-K',
    pattern: 'HHL-HMH-MLH-MHM-LHH',
    rarity: 'SR',
    percent: 3.2,
    quote: '已深度思考100s。',
    description: '大脑长时间处于思考状态，善于审判信息，重视论点、论据、逻辑推理、潜在偏见乃至作者的思想背景。在信息爆炸时代绝不盲从，会在关系中衡量利弊，也极力捍卫自我空间。别人以为他们在发呆，其实大脑正在对接收到的信息进行分类、归档与销毁。',
    traits: '自尊高、自我清晰度低；情感安全感高、投入中、边界独立；世界观中、规则感低、意义感高；决策中、执行高；社交被动、边界高、表达高。',
    gradient: ['#3B82F6', '#93C5FD'],
    icon: '🧠',
  },
  {
    code: 'SHIT',
    name: '愤世者',
    alias: 'SHIT',
    pattern: 'HHL-HLH-LMM-HHM-LHH',
    rarity: 'SSR',
    percent: 1.7,
    quote: '这个世界，构石一坨。',
    description: '嘴上说着项目是屎，手上却默默打开 Excel 构建函数模型与甘特图；嘴上骂同事是屎，手上却在他们搞砸后熬夜收拾烂摊子；嘴上宣称世界是屎赶紧毁灭，第二天早上七点仍准时挤上地铁去干那份工作。别怕那声抱怨，那不是末日警报，而是他们即将拯救世界的冲锋号。',
    traits: '自尊高但自我清晰度低；情感安全感高、投入高、边界独立；世界观低、规则感中、意义感低；决策与执行中等；社交被动、边界高、表达高。',
    gradient: ['#78350F', '#B45309'],
    icon: '💩',
  },
  {
    code: 'ZZZZ',
    name: '装死者',
    alias: 'ZZZZ',
    pattern: 'MHL-MLH-LML-MML-LHM',
    rarity: 'R',
    percent: 5.3,
    quote: '我没死，我只是在睡觉。',
    description: '对群里 99+ 消息视而不见，但当出现“@全体成员还有半小时就截止了”的最后通牒时，会像从千年古墓苏醒般缓缓敲出“收到”，并在 29 分钟内交出一份及格答卷。截止日期是唯一最高权限指令。他们向宇宙证明：有时什么都不做，就不会做错。',
    traits: '自尊中、自我清晰度高、价值低；情感安全感中、投入低、边界高；世界观低、规则感低、意义感中；行动力低；社交被动、边界高、表达中。',
    gradient: ['#475569', '#94A3B8'],
    icon: '😴',
  },
  {
    code: 'POOR',
    name: '贫困者',
    alias: 'POOR',
    pattern: 'HHL-MLH-LMH-HHH-LHL',
    rarity: 'SSR',
    percent: 1.4,
    quote: '我穷，但我很专。',
    description: '“贫困”不是钱包余额的判决，而是欲望断舍离后的资源再分配。别人把精力撒成漫天二维码，他们却把精力压成一束激光。热闹、社交、虚荣、刷存在感都被降噪，重要的事则被狠狠干到底。他们不是资源少，而是把所有资源灌进一个坑里，外表像贫困，内里像矿井。',
    traits: '自尊高、自我清晰度低、价值高；情感安全感中、投入低、边界高；世界观低、规则感中、意义感高；行动驱力极强；社交被动、边界清晰、表达低。',
    gradient: ['#0F766E', '#2DD4BF'],
    icon: '⛏️',
  },
  {
    code: 'MONK',
    name: '僧人',
    alias: 'MONK',
    pattern: 'HHL-LLH-LLM-MML-LHM',
    rarity: 'SR',
    percent: 3.5,
    quote: '没有那种世俗的欲望。',
    description: '别人在 KTV 参悟爱恨，他们选择在家参悟大道。已然看破红尘，不希望闲人扰其清修。个人空间是他们的结界、须弥山与绝对领域，踏入者会感受到灵魂深处的窒息。他们不黏不缠，因为在他们看来万物皆有独立轨道，行星之间保持距离才构成和谐宇宙。',
    traits: '自尊高、自我清晰度低、价值高；情感安全感低、投入高、边界独立；世界观低、规则感低、意义感中；行动力低；社交被动、边界高、表达中。',
    gradient: ['#71717A', '#D4D4D8'],
    icon: '🧘',
  },
  {
    code: 'IMSB',
    name: '傻者',
    alias: 'IMSB',
    pattern: 'LLM-LMM-LLL-LLL-MLM',
    rarity: 'SR',
    percent: 3.8,
    quote: '认真的么？我真的是傻逼么？',
    description: '大脑里住着两个不死不休的战士：一个叫“我他妈冲了！”，一个叫“我是个傻逼！”。面对喜欢的人，前者怂恿去要微信、去约饭、爱要大声说；后者立刻反驳“人家凭什么看得上你”。最终结果往往是盯着对方背影直到消失，然后掏出手机搜索“如何克服社交恐惧症”。他们不是真傻，只是内心戏比漫威宇宙所有电影加起来都长。',
    traits: '自尊低、自我清晰度中、价值低；情感安全感低、投入中、边界低；世界观低、规则感低、意义感低；行动力极低；社交居中、边界低、表达中。',
    gradient: ['#4B5563', '#9CA3AF'],
    icon: '🤯',
  },
  {
    code: 'SOLO',
    name: '孤儿',
    alias: 'SOLO',
    pattern: 'LML-LLH-LHL-LML-LHM',
    rarity: 'SR',
    percent: 3.3,
    quote: '我哭了，我怎么会是孤儿？',
    description: '自我价值感偏低，因此有时会主动疏远他人。他们在灵魂外围筑起名为“莫挨老子”的万里长城，每一块砖都是过去的一道伤口。他们像把所有软肋藏起来的刺猬，用最硬的刺对着世界。那些尖刺不是攻击，而是一句句说不出口的“别过来，我怕你也受伤”和“求求你，别离开”。',
    traits: '自尊低、自我清晰度中、价值低；情感安全感低、投入高、边界独立；世界观低、规则感高、意义感低；行动力低；社交被动、边界高、表达中。',
    gradient: ['#374151', '#6B7280'],
    icon: '🦔',
  },
  {
    code: 'FUCK',
    name: '草者',
    alias: 'FUCK',
    pattern: 'MLL-LHL-LLM-MLL-HLH',
    rarity: 'SSR',
    percent: 1.6,
    quote: '操！这是什么人格？',
    description: '人类文明城市里出现的一株无法被除草剂杀死的超级生命力人形野草。在他们世界观里世俗规则毫无意义，情绪开关是物理拨片式的：要么 FUCK YEAH，要么 FUCK OFF。他们追求的不仅是当下快感，更是一种在体内横冲直撞的生命力。当所有人都被驯化成温顺家禽，他们是荒野上最后一声狼嚎。',
    traits: '自尊中、自我清晰度低、价值低；情感安全感低、投入高、边界独立；世界观低、规则感低、意义感中；动机中、决策低、执行低；社交主动、边界低、表达高。',
    gradient: ['#DC2626', '#FCA5A5'],
    icon: '🌶️',
  },
  {
    code: 'DEAD',
    name: '死者',
    alias: 'DEAD',
    pattern: 'LLL-LLM-LML-LLL-LHM',
    rarity: 'SSR',
    percent: 1.3,
    quote: '我，还活着吗？',
    description: '已看透无意义的哲学思考，对一切似乎都失去了兴趣。他们看世界的眼神，像顶级玩家通关了所有主线、支线、隐藏任务，删档重开 999 次后终于发现这游戏没意思。他们超越了欲望与目标，是终极贤者。他们的存在，是对喧嚣世界最沉默也最彻底的抗议。',
    traits: '各维度普遍极低；社交被动、边界高、表达中。',
    gradient: ['#1F2937', '#4B5563'],
    icon: '💀',
  },
  {
    code: 'IMFW',
    name: '废物',
    alias: 'IMFW',
    pattern: 'LLH-LHL-LML-LLL-MLL',
    rarity: 'SSR',
    percent: 1.2,
    quote: '我真的...是废物吗？',
    description: '自尊通常脆弱，缺乏安全感，偶尔也缺乏主见。他们能精准感知周围最强的 WiFi 信号——也就是心里最可靠的人。走进他们的生活就像走进顶级兰花温室：需要精确控制温度、湿度，并每天定时进行“我爱你”的言语光合作用。给他们一颗糖，他们会还你一个完全信任、亮晶晶的眼神。你未必是废物，只是太没防备、太容易认真。',
    traits: '自尊低但价值高；情感安全感低、投入高、边界低；世界观低、规则感低、意义感中；行动力极低；社交居中、边界低、表达低。',
    gradient: ['#BE185D', '#FBCFE8'],
    icon: '🥺',
  },
]

export const fallbackSbtiPersonality: SbtiPersonality = {
  code: 'HHHH',
  name: '傻乐者',
  alias: 'HHHH',
  pattern: '',
  rarity: 'N',
  percent: 7.8,
  quote: '哈哈哈哈哈哈。',
  description: '兜底人格。当第一人格匹配率低于 60% 时强制匹配。特质就是“哈哈哈哈哈哈”。可以查看十五维度进行不专业的自我评估，因为作者设置人格时考虑不周。笑着笑着，便哭了出来。',
  traits: '无固定维度模式，用于覆盖无法归入常规类型的思维回路。',
  gradient: ['#FBBF24', '#FDE68A'],
  icon: '😂',
}

export const drunkSbtiPersonality: SbtiPersonality = {
  code: 'DRUNK',
  name: '酒鬼',
  alias: 'DRUNK',
  pattern: '',
  rarity: 'SSR',
  percent: 0.5,
  quote: '烈酒烧喉，不得不醉。',
  description: '走路摇摇晃晃、情绪高涨、看东西重影，因为体内流淌的是美味的白酒。它让人在饭桌上谈笑风生，在厕所里抱着马桶忏悔人生，觉得自己是夜场诗人、宇宙中心那团不灭的火，直到第二天上午十点头像裂开的核桃，灵魂缩在角落。',
  traits: '由特定行为触发，不依赖 15 维编码匹配。',
  gradient: ['#B45309', '#F59E0B'],
  icon: '🍶',
}

const gradeValue: Record<Grade, number> = { L: 1, M: 2, H: 3 }
const maxDistance = 30

export function calculateSbtiDimensionScores(answers: SbtiAnswer[]): Record<DimensionId, number> {
  const scores = Object.fromEntries(dimensionOrder.map(d => [d, 0])) as Record<DimensionId, number>
  const allQuestions = [...getSbtiMainQuestions(), getGateQuestion(), getDrunkQuestion()]
  const questionMap = new Map(allQuestions.map(q => [q.id, q]))
  for (const ans of answers) {
    const q = questionMap.get(ans.questionId)
    if (!q || q.isHidden) continue
    const option = q.options.find(o => o.id === ans.optionId)
    if (!option) continue
    scores[q.dimension] += option.score
  }
  return scores
}

export function totalToGrade(total: number): Grade {
  if (total <= 3) return 'L'
  if (total === 4) return 'M'
  return 'H'
}

export function buildGradeCode(scores: Record<DimensionId, number>): string {
  const parts: string[] = []
  for (let i = 0; i < dimensionOrder.length; i += 3) {
    const chunk = dimensionOrder.slice(i, i + 3)
    parts.push(chunk.map(d => totalToGrade(scores[d])).join(''))
  }
  return parts.join('-')
}

export function matchPattern(gradeCode: string, pattern: string): { similarity: number; exactMatches: number } {
  const cleanCode = gradeCode.replace(/-/g, '')
  const cleanPattern = pattern.replace(/-/g, '')
  if (cleanCode.length !== 15 || cleanPattern.length !== 15) return { similarity: 0, exactMatches: 0 }
  let distance = 0
  let exact = 0
  for (let i = 0; i < 15; i++) {
    const a = gradeValue[cleanCode[i] as Grade]
    const b = gradeValue[cleanPattern[i] as Grade]
    distance += Math.abs(a - b)
    if (cleanCode[i] === cleanPattern[i]) exact++
  }
  return { similarity: Math.round((1 - distance / maxDistance) * 1000) / 10, exactMatches: exact }
}

export function getRarity(gradeCode: string): Rarity {
  const mCount = (gradeCode.match(/M/g) ?? []).length
  if (mCount <= 3) return 'SSR'
  if (mCount <= 5) return 'SR'
  if (mCount <= 7) return 'R'
  return 'N'
}

export function isDrunk(answers: SbtiAnswer[]): boolean {
  const drunkAnswer = answers.find(a => a.questionId === 'drunk')
  if (!drunkAnswer) return false
  const q = getDrunkQuestion()
  const opt = q.options.find(o => o.id === drunkAnswer.optionId)
  return !!opt?.drunkLock
}

export function calculateSbtiPersonality(answers: SbtiAnswer[]) {
  if (isDrunk(answers)) {
    return { ...drunkSbtiPersonality, similarity: 100, gradeCode: 'DRUNK' }
  }
  const scores = calculateSbtiDimensionScores(answers)
  const gradeCode = buildGradeCode(scores)
  let best: SbtiPersonality = fallbackSbtiPersonality
  let bestSim = 0
  let bestExact = -1
  for (const p of sbtiPersonalities) {
    if (!p.pattern) continue
    const { similarity, exactMatches } = matchPattern(gradeCode, p.pattern)
    if (similarity > bestSim || (similarity === bestSim && exactMatches > bestExact)) {
      best = p
      bestSim = similarity
      bestExact = exactMatches
    }
  }
  if (bestSim < 60) {
    return { ...fallbackSbtiPersonality, similarity: bestSim, gradeCode }
  }
  return { ...best, similarity: bestSim, gradeCode }
}

export function getSbtiPersonalityByCode(code: string): SbtiPersonality | undefined {
  const normalized = code.toUpperCase()
  if (normalized === 'HHHH') return fallbackSbtiPersonality
  if (normalized === 'DRUNK') return drunkSbtiPersonality
  return sbtiPersonalities.find(p => p.code.toUpperCase() === normalized)
}

export function getAllSbtiPersonalities(): SbtiPersonality[] {
  return [...sbtiPersonalities, fallbackSbtiPersonality, drunkSbtiPersonality]
}

export function formatSbtiGradeCode(gradeCode: string): string {
  if (gradeCode.length === 15 && !gradeCode.includes('-')) {
    const parts: string[] = []
    for (let i = 0; i < 15; i += 3) parts.push(gradeCode.slice(i, i + 3))
    return parts.join('-')
  }
  return gradeCode
}

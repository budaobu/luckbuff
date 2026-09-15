export type OmikujiLocale = 'zh-CN' | 'zh-TW' | 'en' | 'ja'
type LocalizedText = Record<OmikujiLocale, string>

export type OmikujiRankCode =
  | 'daikichi'
  | 'kichi'
  | 'chukichi'
  | 'shokichi'
  | 'hankichi'
  | 'suekichi'
  | 'sue-shokichi'
  | 'kyo'
  | 'daikyo'

export type OmikujiAspectKey =
  | 'wish'
  | 'love'
  | 'awaited-person'
  | 'parting'
  | 'marriage'
  | 'business'
  | 'work'
  | 'money'
  | 'lost-item'
  | 'residence'
  | 'travel'
  | 'health'
  | 'study'
  | 'dispute'
  | 'employment'
  | 'pregnancy'
  | 'family'
  | 'new-start'

type OmikujiTier = 'high' | 'positive' | 'moderate' | 'delayed' | 'cautious'

export interface OmikujiAspect {
  key: OmikujiAspectKey
  label: string
  text: string
}

export interface OmikujiFortune {
  number: number
  rank: string
  rankCode: OmikujiRankCode
  title: string
  poem: string
  summary: string
  action: string
  luckyDirection: string
  symbolColor: string
  aspects: OmikujiAspect[]
}

export interface OmikujiCalcResult {
  lotType: {
    id: 'general-omikuji'
    name: string
    count: number
  }
  fortune: OmikujiFortune
  question: string
}

const RANKS: Record<OmikujiRankCode, { label: LocalizedText; tier: OmikujiTier }> = {
  daikichi: {
    label: { 'zh-CN': '大吉', 'zh-TW': '大吉', en: 'Great Blessing', ja: '大吉' },
    tier: 'high',
  },
  kichi: {
    label: { 'zh-CN': '吉', 'zh-TW': '吉', en: 'Blessing', ja: '吉' },
    tier: 'positive',
  },
  chukichi: {
    label: { 'zh-CN': '中吉', 'zh-TW': '中吉', en: 'Middle Blessing', ja: '中吉' },
    tier: 'positive',
  },
  shokichi: {
    label: { 'zh-CN': '小吉', 'zh-TW': '小吉', en: 'Small Blessing', ja: '小吉' },
    tier: 'moderate',
  },
  hankichi: {
    label: { 'zh-CN': '半吉', 'zh-TW': '半吉', en: 'Half Blessing', ja: '半吉' },
    tier: 'moderate',
  },
  suekichi: {
    label: { 'zh-CN': '末吉', 'zh-TW': '末吉', en: 'Future Blessing', ja: '末吉' },
    tier: 'delayed',
  },
  'sue-shokichi': {
    label: { 'zh-CN': '末小吉', 'zh-TW': '末小吉', en: 'Future Small Blessing', ja: '末小吉' },
    tier: 'delayed',
  },
  kyo: {
    label: { 'zh-CN': '凶', 'zh-TW': '凶', en: 'Caution', ja: '凶' },
    tier: 'cautious',
  },
  daikyo: {
    label: { 'zh-CN': '大凶', 'zh-TW': '大凶', en: 'Great Caution', ja: '大凶' },
    tier: 'cautious',
  },
}

const RANK_WEIGHTS: Array<[OmikujiRankCode, number]> = [
  ['daikichi', 8],
  ['kichi', 15],
  ['chukichi', 14],
  ['shokichi', 12],
  ['hankichi', 7],
  ['suekichi', 13],
  ['sue-shokichi', 6],
  ['kyo', 18],
  ['daikyo', 7],
]

function buildRankByNumber(): OmikujiRankCode[] {
  const result: OmikujiRankCode[] = []
  for (const [rank, count] of RANK_WEIGHTS) {
    for (let i = 0; i < count; i += 1) result.push(rank)
  }
  if (result.length !== 100) throw new Error(`Omikuji rank table must contain 100 entries: ${result.length}`)
  return result
}

const RANK_BY_NUMBER = buildRankByNumber()

const ASPECT_LABELS: Record<OmikujiAspectKey, LocalizedText> = {
  wish: { 'zh-CN': '愿望', 'zh-TW': '願望', en: 'Wish', ja: '願い' },
  love: { 'zh-CN': '恋爱', 'zh-TW': '戀愛', en: 'Love', ja: '恋愛' },
  'awaited-person': { 'zh-CN': '待人', 'zh-TW': '待人', en: 'Awaited person', ja: '待ち人' },
  parting: { 'zh-CN': '走人', 'zh-TW': '走人', en: 'Parting', ja: '走り人' },
  marriage: { 'zh-CN': '婚事', 'zh-TW': '婚事', en: 'Marriage', ja: '縁談' },
  business: { 'zh-CN': '生意', 'zh-TW': '生意', en: 'Business', ja: '商売' },
  work: { 'zh-CN': '工作', 'zh-TW': '工作', en: 'Work', ja: '仕事' },
  money: { 'zh-CN': '财运', 'zh-TW': '財運', en: 'Money', ja: '金運' },
  'lost-item': { 'zh-CN': '失物', 'zh-TW': '失物', en: 'Lost item', ja: '失物' },
  residence: { 'zh-CN': '住居', 'zh-TW': '住居', en: 'Residence', ja: '住居' },
  travel: { 'zh-CN': '旅行', 'zh-TW': '旅行', en: 'Travel', ja: '旅立ち' },
  health: { 'zh-CN': '健康', 'zh-TW': '健康', en: 'Health', ja: '健康' },
  study: { 'zh-CN': '学问', 'zh-TW': '學問', en: 'Study', ja: '学問' },
  dispute: { 'zh-CN': '争事', 'zh-TW': '爭事', en: 'Dispute', ja: '争い事' },
  employment: { 'zh-CN': '雇员', 'zh-TW': '僱員', en: 'Employees', ja: '抱え人' },
  pregnancy: { 'zh-CN': '出产', 'zh-TW': '出產', en: 'Childbirth', ja: '出産' },
  family: { 'zh-CN': '家运', 'zh-TW': '家運', en: 'Family', ja: '家運' },
  'new-start': { 'zh-CN': '新开始', 'zh-TW': '新開始', en: 'New start', ja: '新たな始まり' },
}

const ASPECT_TEXT: Record<OmikujiTier, LocalizedText> = {
  high: {
    'zh-CN': '主动推进最容易成事，计划清晰后可加快节奏。',
    'zh-TW': '主動推進最容易成事，計畫清晰後可加快節奏。',
    en: 'Move forward actively; a clear plan lets you increase the pace.',
    ja: '主体的に進めば流れに乗りやすく、計画が固まれば歩調を上げられます。',
  },
  positive: {
    'zh-CN': '方向不错，稳步推进就能积累成果。',
    'zh-TW': '方向不錯，穩步推進就能累積成果。',
    en: 'The direction is good; steady effort will build results.',
    ja: '方向性は良く、着実に進めば成果が積み上がります。',
  },
  moderate: {
    'zh-CN': '时机未定，先完成可控的小步骤更有利。',
    'zh-TW': '時機未定，先完成可控的小步驟更有利。',
    en: 'Timing is unsettled; finish small controllable steps first.',
    ja: '機はまだ定まらず、自分で整えられる小さな一歩から進めると良いです。',
  },
  delayed: {
    'zh-CN': '宜稍作等待，先补足条件再决定。',
    'zh-TW': '宜稍作等待，先補足條件再決定。',
    en: 'Wait a little and complete the missing conditions before deciding.',
    ja: '少し待ち、足りない条件を整えてから決めるのが得策です。',
  },
  cautious: {
    'zh-CN': '宜谨慎收敛，避免扩大承诺和风险。',
    'zh-TW': '宜謹慎收斂，避免擴大承諾和風險。',
    en: 'Stay prudent and contained; avoid widening commitments or risks.',
    ja: '慎重に範囲を絞り、約束やリスクを広げないことが大切です。',
  },
}

const DIRECTIONS: LocalizedText[] = [
  { 'zh-CN': '东', 'zh-TW': '東', en: 'East', ja: '東' },
  { 'zh-CN': '东南', 'zh-TW': '東南', en: 'Southeast', ja: '南東' },
  { 'zh-CN': '南', 'zh-TW': '南', en: 'South', ja: '南' },
  { 'zh-CN': '西南', 'zh-TW': '西南', en: 'Southwest', ja: '南西' },
  { 'zh-CN': '西', 'zh-TW': '西', en: 'West', ja: '西' },
  { 'zh-CN': '西北', 'zh-TW': '西北', en: 'Northwest', ja: '北西' },
  { 'zh-CN': '北', 'zh-TW': '北', en: 'North', ja: '北' },
  { 'zh-CN': '东北', 'zh-TW': '東北', en: 'Northeast', ja: '北東' },
]

const COLORS: LocalizedText[] = [
  { 'zh-CN': '朱色', 'zh-TW': '朱色', en: 'Vermilion', ja: '朱色' },
  { 'zh-CN': '金色', 'zh-TW': '金色', en: 'Gold', ja: '金色' },
  { 'zh-CN': '青色', 'zh-TW': '青色', en: 'Blue', ja: '青色' },
  { 'zh-CN': '白色', 'zh-TW': '白色', en: 'White', ja: '白色' },
  { 'zh-CN': '紫色', 'zh-TW': '紫色', en: 'Purple', ja: '紫色' },
  { 'zh-CN': '绿色', 'zh-TW': '綠色', en: 'Green', ja: '緑色' },
  { 'zh-CN': '黑色', 'zh-TW': '黑色', en: 'Black', ja: '黒色' },
  { 'zh-CN': '黄色', 'zh-TW': '黃色', en: 'Yellow', ja: '黄色' },
]

interface OmikujiMessage {
  title: LocalizedText
  poem: LocalizedText
  summary: LocalizedText
  action: LocalizedText
}

const MESSAGES: OmikujiMessage[] = [
  {
    title: { 'zh-CN': '青云有路', 'zh-TW': '青雲有路', en: 'A Path Opens Upward', ja: '青雲の道' },
    poem: { 'zh-CN': '云散千峰见，风轻一路平。\n心正行处稳，门前春自生。', 'zh-TW': '雲散千峰見，風輕一路平。\n心正行處穩，門前春自生。', en: 'Clouds part to reveal a thousand peaks; the road grows calm.\nAn upright heart steadies each step, and spring rises at the door.', ja: '雲は晴れ、千峰あらわる。\n心正しく歩めば、門前に春ぞ近づく。' },
    summary: { 'zh-CN': '阻碍正在让位给清晰的视野，行动的节奏可以适度加快。', 'zh-TW': '阻礙正在讓位給清晰的視野，行動的節奏可以適度加快。', en: 'Obstacles are giving way to clear sight; your pace may reasonably quicken.', ja: '雲が晴れて視界が開け、行動の歩調を上げるのにふさわしい時です。' },
    action: { 'zh-CN': '把最重要的一件事排在前位，其余决定围绕它简化。', 'zh-TW': '把最重要的一件事排在前位，其餘決定圍繞它簡化。', en: 'Put the one essential task first and simplify other choices around it.', ja: '最も大切なことを先に置き、他の選択はそれに沿って簡潔に。' },
  },
  {
    title: { 'zh-CN': '静水照月', 'zh-TW': '靜水照月', en: 'Still Water Reflects the Moon', ja: '静水照月' },
    poem: { 'zh-CN': '水面无波夜，清光自照人。\n不须争远近，静处得天真。', 'zh-TW': '水面無波夜，清光自照人。\n不須爭遠近，靜處得天真。', en: 'On a waveless night, clear light finds you.\nDo not race near or far; stillness restores what is true.', ja: '波静かな水面に、月の光ぞ映る。\n遠近を争はず、静けさに本心を見る。' },
    summary: { 'zh-CN': '外界声音很多，但答案更适合在冷静观察中成形。', 'zh-TW': '外界聲音很多，但答案更適合在冷靜觀察中成形。', en: 'Voices abound, yet the answer forms better in calm observation.', ja: '外の声は多くても、答えは静かな観察の中で形を成します。' },
    action: { 'zh-CN': '先记录事实与感受，隔一段整理时间再做选择。', 'zh-TW': '先記錄事實與感受，隔一段整理時間再做選擇。', en: 'Record facts and feelings first, then choose after a pause to sort them.', ja: '事実と気持ちを書き留め、一拍おいてから選びましょう。' },
  },
  {
    title: { 'zh-CN': '春枝初花', 'zh-TW': '春枝初花', en: 'First Blossom on a Spring Branch', ja: '春枝の初花' },
    poem: { 'zh-CN': '旧枝承新露，初花未满开。\n护根莫惊动，次第有香来。', 'zh-TW': '舊枝承新露，初花未滿開。\n護根莫驚動，次第有香來。', en: 'An old branch holds new dew; the first bloom is not yet full.\nGuard the roots, avoid disruption, and fragrance will arrive in time.', ja: '古き枝に新しき露。初花はまだ満ちず。\n根を守りて騒がねば、香りは次第に来たる。' },
    summary: { 'zh-CN': '机会已经发芽，但还不到用力扩张的时候。', 'zh-TW': '機會已經發芽，但還不到用力擴張的時候。', en: 'An opportunity has sprouted, though it is not yet time to expand forcefully.', ja: '機会は芽を出しましたが、まだ広げる時ではありません。' },
    action: { 'zh-CN': '以小规模试做确认条件，再逐步增加投入。', 'zh-TW': '以小規模試做確認條件，再逐步增加投入。', en: 'Run a small trial to confirm conditions, then add investment step by step.', ja: '小さく試して条件を確かめ、少しずつ掛ける力を増やしましょう。' },
  },
  {
    title: { 'zh-CN': '航路待风', 'zh-TW': '航路待風', en: 'The Route Awaits Wind', ja: '航路は風を待つ' },
    poem: { 'zh-CN': '帆已张而静，潮回未有声。\n看云知变处，稳舵待风行。', 'zh-TW': '帆已張而靜，潮回未有聲。\n看雲知變處，穩舵待風行。', en: 'The sail is set yet quiet; the tide turns without sound.\nRead the clouds, hold the helm, and move when the wind comes.', ja: '帆は張れど静かに、潮は音なく巡る。\n雲を見て舵を保ち、風の来る時を行く。' },
    summary: { 'zh-CN': '准备已足，外部时机还在变化，需要留出观察窗口。', 'zh-TW': '準備已足，外部時機還在變化，需要留出觀察窗口。', en: 'Your preparation is enough, but external timing is shifting; leave room to observe.', ja: '準備は整っても、外の機は動いています。見極める時間を残しましょう。' },
    action: { 'zh-CN': '设定复查点，期间只做不会增加负担的准备。', 'zh-TW': '設定複查點，期間只做不會增加負擔的準備。', en: 'Set a review point and, meanwhile, only prepare in ways that add no burden.', ja: '見直しの日を決め、それまでは負担を増やさぬ準備に留めましょう。' },
  },
  {
    title: { 'zh-CN': '山径得光', 'zh-TW': '山徑得光', en: 'Light on the Mountain Path', ja: '山径に光る' },
    poem: { 'zh-CN': '石滑休催步，林开见日边。\n一程一程去，高处自宽然。', 'zh-TW': '石滑休催步，林開見日邊。\n一程一程去，高處自寬然。', en: 'The stones are slick, so do not hurry; the forest opens toward sun.\nGo stretch by stretch, and the height itself becomes spacious.', ja: '石滑りても急かず、林開けて日辺を見る。\n一里また一里、高みはおのずと広し。' },
    summary: { 'zh-CN': '路径明确但不易快行，稳定比速度更重要。', 'zh-TW': '路徑明確但不易快行，穩定比速度更重要。', en: 'The path is clear but not easy to rush; steadiness matters more than speed.', ja: '道は見えても急げぬ時。速度より安定が要ります。' },
    action: { 'zh-CN': '把长路分段，每段只设一个可核对的完成标准。', 'zh-TW': '把長路分段，每段只設一個可核對的完成標準。', en: 'Divide the long route, giving each section one checkable completion mark.', ja: '道を区切り、各区間に確かめられる完了の基準を一つ置きましょう。' },
  },
  {
    title: { 'zh-CN': '冬种有信', 'zh-TW': '冬種有信', en: 'Winter Sowing Keeps Faith', ja: '冬の種' },
    poem: { 'zh-CN': '雪覆非无物，寒中气自藏。\n深耕冬夜后，青色破土光。', 'zh-TW': '雪覆非無物，寒中氣自藏。\n深耕冬夜後，青色破土光。', en: 'Snow covers, but nothing is absent; life hides within the cold.\nAfter deep winter tilling, green light breaks through the soil.', ja: '雪に覆へど、無きにあらず。寒の中に気は潜む。\n冬の夜を耕せば、青さは土を破る。' },
    summary: { 'zh-CN': '现在看不到成果，不代表积累失效。', 'zh-TW': '現在看不到成果，不代表積累失效。', en: 'Not seeing results now does not mean accumulation has failed.', ja: '今成果が見えなくても、積み重ねが無駄なわけではありません。' },
    action: { 'zh-CN': '记录小进展，重点维持在正确方向上的日常练习。', 'zh-TW': '記錄小進展，重點維持在正確方向上的日常練習。', en: 'Record small gains and keep the daily practice aimed in the right direction.', ja: '小さな進みを記録し、正しい方向の日常を続けましょう。' },
  },
  {
    title: { 'zh-CN': '桥成半渡', 'zh-TW': '橋成半渡', en: 'Halfway Across the Bridge', ja: '橋のかかり' },
    poem: { 'zh-CN': '桥板连而未固，行人心欲急行。\n且扶旧索添新木，一度一履始安宁。', 'zh-TW': '橋板連而未固，行人心欲急行。\n且扶舊索添新木，一度一履始安寧。', en: 'The planks join but are not firm; the traveler wants to hurry.\nSupport the old rope, add new wood, and cross one measured step at a time.', ja: '橋板は続けど固からず。渡る心は急く。\n旧縄を支え新木を加え、一歩ずつ渡れば安し。' },
    summary: { 'zh-CN': '事情已进入转换期，安全取决于补齐细节。', 'zh-TW': '事情已進入轉換期，安全取決於補齊細節。', en: 'You are in transition; safety depends on completing the details.', ja: '事は移り変わりの時にあり、細部を整えることが安心をもたらします。' },
    action: { 'zh-CN': '先补最薄弱的一环，再安排正式推进日期。', 'zh-TW': '先補最薄弱的一環，再安排正式推進日期。', en: 'Repair the weakest link first, then schedule the formal advance.', ja: '最も弱い部分を補い、それから本格的に進める日を決めましょう。' },
  },
  {
    title: { 'zh-CN': '灯下守心', 'zh-TW': '燈下守心', en: 'Keeping the Heart by Lamplight', ja: '灯下の守り' },
    poem: { 'zh-CN': '风急灯微颤，添油勿使喧。\n一光照近处，暗夜亦成垣。', 'zh-TW': '風急燈微顫，添油勿使喧。\n一光照近處，暗夜亦成垣。', en: 'Wind shakes the small lamp; refill it quietly.\nOne light reveals the near ground and becomes a wall against night.', ja: '風に灯は揺れど、静かに油を注ぐ。\n一灯は近きを照らし、夜を守る垣となる。' },
    summary: { 'zh-CN': '与其回应远处纷扰，不如先稳住当前的小范围。', 'zh-TW': '與其回應遠處紛擾，不如先穩住當前的小範圍。', en: 'Rather than answering distant noise, steady the small area before you.', ja: '遠くの騒ぎよりも、まず目の前の小さな範囲を整えましょう。' },
    action: { 'zh-CN': '减少无关信息，只处理今天能收束的事项。', 'zh-TW': '減少無關信息，只處理今天能收束的事項。', en: 'Reduce unrelated input and close only what can be settled today.', ja: '余計な情報を減らし、今日収められる事だけに取り組みます。' },
  },
  {
    title: { 'zh-CN': '随风辨路', 'zh-TW': '隨風辨路', en: 'Reading the Road by Wind', ja: '風に道を問ふ' },
    poem: { 'zh-CN': '草低非弱志，风过见地形。\n顺势不逐势，回环亦可行。', 'zh-TW': '草低非弱志，風過見地形。\n順勢不逐勢，回環亦可行。', en: 'Grass bends not from weakness; passing wind shows the land.\nFollow the flow without chasing it; even a winding way leads on.', ja: '草の伏すは弱さにあらず。風の過ぎて地形を見る。\n勢いに従へど追はず、巡る道もまた良し。' },
    summary: { 'zh-CN': '外部变化可以提供信息，但不必让它牵引所有决定。', 'zh-TW': '外部變化可以提供信息，但不必讓它牽引所有決定。', en: 'Outer change offers information, but need not pull every decision.', ja: '外の変化は知らせですが、すべての決定を引き回す必要はありません。' },
    action: { 'zh-CN': '区分临时波动与长期趋势，只对后者调整结构。', 'zh-TW': '區分臨時波動與長期趨勢，只對後者調整結構。', en: 'Tell short fluctuation from long trend, and adjust structure only for the latter.', ja: '一時の揺れと長い流れを分け、後者だけ構えを改めます。' },
  },
  {
    title: { 'zh-CN': '泉脉回环', 'zh-TW': '泉脈回環', en: 'The Spring Circles Back', ja: '泉のめぐり' },
    poem: { 'zh-CN': '水出石间细，回流行未穷。\n清源常在处，不必叹流东。', 'zh-TW': '水出石間細，回流行未窮。\n清源常在處，不必歎流東。', en: 'Water threads thinly through stone, yet its return is not exhausted.\nThe clear source remains; do not lament the eastward flow.', ja: '石間を細く流れても、巡る水は尽きず。\n清き源はありて、東ゆくを嘆かず。' },
    summary: { 'zh-CN': '看似中断的循环中，仍有一处可以重新接引的源头。', 'zh-TW': '看似中斷的循環中，仍有一處可以重新接引的源頭。', en: 'Within an interrupted cycle, one source can still be reopened.', ja: '途切れて見える巡りにも、再び結べる源が残っています。' },
    action: { 'zh-CN': '回头检视最初的资源与关系，修补可继续的一段。', 'zh-TW': '回頭檢視最初的資源與關係，修補可繼續的一段。', en: 'Review the original resources and relationships; repair the segment that can continue.', ja: '最初の資源と縁を見直し、続けられる部分を修めましょう。' },
  },
  {
    title: { 'zh-CN': '门扉轻启', 'zh-TW': '門扉輕啟', en: 'The Door Opens Lightly', ja: '門ひらく' },
    poem: { 'zh-CN': '门轴久无声，今朝转见明。\n非为争阔路，请客入堂行。', 'zh-TW': '門軸久無聲，今朝轉見明。\n非為爭闊路，請客入堂行。', en: 'The hinge has long been silent; this morning it turns to light.\nNot to seize a broad road, but to welcome another into the hall.', ja: '長く音せぬ扉、今朝は明けて光る。\n広路を争ふためならず、人を堂に迎ふる。' },
    summary: { 'zh-CN': '新的相遇需要降低防备，但边界仍要保留。', 'zh-TW': '新的相遇需要降低防備，但邊界仍要保留。', en: 'New meeting calls for less guardedness, though boundaries remain.', ja: '新しい出会いには心を開くことを。けれど線は保ちます。' },
    action: { 'zh-CN': '先表达可合作的部分，再说明不能让渡的底线。', 'zh-TW': '先表達可合作的部分，再說明不能讓渡的底線。', en: 'State what can be shared first, then name the line that cannot be yielded.', ja: '先に協力できる所を示し、譲れぬ線もはっきり伝えます。' },
  },
  {
    title: { 'zh-CN': '雨霁尘净', 'zh-TW': '雨霽塵淨', en: 'Rain Clears the Dust', ja: '雨あがり' },
    poem: { 'zh-CN': '骤雨洗阶石，云开有天心。\n浊流归壑后，草木各成阴。', 'zh-TW': '驟雨洗階石，雲開有天心。\n濁流歸壑後，草木各成陰。', en: 'A sudden rain washes the steps; cloud opens to sky.\nWhen muddy water returns to ravines, each plant finds its shade.', ja: '急雨は石を洗ひ、雲は天心を開く。\n濁流が谷へ帰れば、草木はおのずと陰を作る。' },
    summary: { 'zh-CN': '纷乱正在退去，清理之后可看清各自的位置。', 'zh-TW': '紛亂正在退去，清理之後可看清各自的位置。', en: 'Confusion is receding; after clearing, each place becomes visible.', ja: '乱れが退きつつあります。整へれば、それぞれの居所が見えます。' },
    action: { 'zh-CN': '先归档旧事，再列出接下来三天要保住的成果。', 'zh-TW': '先歸檔舊事，再列出接下來三天要保住的成果。', en: 'Archive the old first, then list what the next three days must preserve.', ja: 'まず旧事を整理し、この三日で守る成果を書き出しましょう。' },
  },
  {
    title: { 'zh-CN': '松根耐雪', 'zh-TW': '松根耐雪', en: 'Pine Roots Bear the Snow', ja: '松の根' },
    poem: { 'zh-CN': '叶上霜虽重，根深不见摇。\n待得春风到，青盖更高标。', 'zh-TW': '葉上霜雖重，根深不見搖。\n待得春風到，青蓋更高標。', en: 'Frost lies heavy on leaves, but deep roots do not sway.\nWhen spring wind arrives, the green canopy stands higher.', ja: '葉の霜は重けれど、根深くして揺がず。\n春風至れば、青蓋さらに高し。' },
    summary: { 'zh-CN': '压力集中在外层，基础还有支撑力。', 'zh-TW': '壓力集中在外層，基礎還有支撐力。', en: 'Pressure gathers at the surface, while the foundation still holds.', ja: '圧は外に寄っても、土台はまだ支へています。' },
    action: { 'zh-CN': '保护睡眠与核心关系，再处理外部的请求。', 'zh-TW': '保護睡眠與核心關係，再處理外部的請求。', en: 'Protect sleep and core relationships before handling outside requests.', ja: 'まず眠りと大切な縁を守り、その後に外の頼みを扱ひます。' },
  },
  {
    title: { 'zh-CN': '整帆待发', 'zh-TW': '整帆待發', en: 'Rigging Before Departure', ja: '船出の支度' },
    poem: { 'zh-CN': '索结各有处，货轻船自安。\n潮信非人促，时至水自宽。', 'zh-TW': '索結各有處，貨輕船自安。\n潮信非人促，時至水自寬。', en: 'Each rope has its place; a light boat rests well.\nThe tide is not hurried by anyone; when its hour comes, water widens.', ja: '綱は各所に結ばれ、荷軽ければ船安し。\n潮は人に促されず、時至れば水広し。' },
    summary: { 'zh-CN': '出发可行，削减负重会显著改善稳定性。', 'zh-TW': '出發可行，削減負重會顯著改善穩定性。', en: 'Departure is possible; reducing load will markedly improve stability.', ja: '出発は可能ですが、荷を減らすほど安定します。' },
    action: { 'zh-CN': '为出行或启动列两份清单：必须带与暂缓带。', 'zh-TW': '為出行或啟動列兩份清單：必須帶與暫緩帶。', en: 'Make two lists for departure: must bring, and leave for later.', ja: '出発の為に二つの列表を作り、必須と後回しを分けます。' },
  },
  {
    title: { 'zh-CN': '霜后见草', 'zh-TW': '霜後見草', en: 'Grass Seen After Frost', ja: '霜のあと' },
    poem: { 'zh-CN': '白气消晨雾，青痕辨浅深。\n霜严非绝地，养力待新阴。', 'zh-TW': '白氣消晨霧，青痕辨淺深。\n霜嚴非絕地，養力待新陰。', en: 'White vapor lifts from morning fog; green traces show shallow and deep.\nHarsh frost is not barren ground; build strength and await new shade.', ja: '白き気は朝霧を消し、青き痕は浅深を分つ。\n霜の烈しさも絶地にあらず。力を養ひ新陰を待つ。' },
    summary: { 'zh-CN': '严苛环境暴露了强弱位置，也给出修正方向。', 'zh-TW': '嚴苛環境暴露了強弱位置，也給出修正方向。', en: 'A severe environment exposes strength and weakness, and points to repair.', ja: '厳しい環境は強弱を表はし、直す所をも示します。' },
    action: { 'zh-CN': '承认当前受限处，优先恢复一项基础能力。', 'zh-TW': '承認當前受限處，優先恢復一項基礎能力。', en: 'Acknowledge the current limit and restore one basic capability first.', ja: '今の限界を認め、基礎の力を一つ先に戻しましょう。' },
  },
  {
    title: { 'zh-CN': '育苗待青', 'zh-TW': '育苗待青', en: 'Raising Seedlings Toward Green', ja: '苗を育てる' },
    poem: { 'zh-CN': '浅土生嫩色，细水养长根。\n莫问何时大，勤看今日痕。', 'zh-TW': '淺土生嫩色，細水養長根。\n莫問何時大，勤看今日痕。', en: 'Shallow soil shows tender color; thin water feeds long roots.\nDo not ask when it grows great; tend today’s small mark.', ja: '浅き土に嫩色生へ、細水は長根を養ふ。\n何時大きならんかと問はず、今日の痕を勤く見る。' },
    summary: { 'zh-CN': '成长方向正确，但需要以日常照料代替急切要求。', 'zh-TW': '成長方向正確，但需要以日常照料代替急切要求。', en: 'Growth is rightly aimed, but daily care must replace urgent demands.', ja: '成長の方向は正しい。急かすより日常の世話が要ります。' },
    action: { 'zh-CN': '设定最低可维持的投入量，避免间歇耗尽。', 'zh-TW': '設定最低可維持的投入量，避免間歇耗盡。', en: 'Set the lowest sustainable input to avoid bursts that exhaust you.', ja: '続けられる最低の量を決め、疲れ切る波を避けましょう。' },
  },
  {
    title: { 'zh-CN': '星桥可问', 'zh-TW': '星橋可問', en: 'A Star Bridge for Inquiry', ja: '星のかけ橋' },
    poem: { 'zh-CN': '远光非咫尺，微明亦有桥。\n以诚为引路，不惧夜迢迢。', 'zh-TW': '遠光非咫尺，微明亦有橋。\n以誠為引路，不懼夜迢迢。', en: 'Far light is not a hand’s span, yet faint brightness makes a bridge.\nLet sincerity guide the way, and the long night holds no fear.', ja: '遠き光は咫尺にあらずとも、微明にも橋あり。\n誠を導きとすれば、夜の長きを怖れず。' },
    summary: { 'zh-CN': '目标虽远，但可以建立小的、诚实的连接。', 'zh-TW': '目標雖遠，但可以建立小的、誠實的連接。', en: 'The aim is distant, yet small honest connections can be built.', ja: '目指す所は遠くても、小さく誠実な縁を作れます。' },
    action: { 'zh-CN': '向关键的人或资料发出一次清楚询问。', 'zh-TW': '向關鍵的人或資料發出一次清楚詢問。', en: 'Send one clear inquiry to the key person or source.', ja: '鍵となる人や資料へ、一度はっきり問ひましょう。' },
  },
  {
    title: { 'zh-CN': '古井新绳', 'zh-TW': '古井新繩', en: 'A New Rope at the Old Well', ja: '古井の水' },
    poem: { 'zh-CN': '井旧而水清，绳新而手稳。\n不贪深浅量，一汲一饮足。', 'zh-TW': '井舊而水清，繩新而手穩。\n不貪深淺量，一汲一飲足。', en: 'The well is old, its water clear; the rope new, the hand steady.\nDo not covet depth or measure; one draw and one drink suffice.', ja: '井は古く水は清し。綱は新しく手は穏やか。\n深浅を貪らず、一汲み一飲みに足る。' },
    summary: { 'zh-CN': '旧经验仍可取用，只需换上更合适的方法。', 'zh-TW': '舊經驗仍可取用，只需換上更合適的方法。', en: 'Old experience still serves, if fitted with a better method.', ja: '古い経験も活きます。より合ふ方法に替へれば。' },
    action: { 'zh-CN': '保留原有核心，只替换一个已经失效的流程。', 'zh-TW': '保留原有核心，只替換一個已經失效的流程。', en: 'Keep the original core and replace only one failed process.', ja: '中核は残し、動かぬ手順を一つだけ替へましょう。' },
  },
  {
    title: { 'zh-CN': '厚土承物', 'zh-TW': '厚土承物', en: 'Deep Earth Bears All', ja: '土の記憶' },
    poem: { 'zh-CN': '落叶归土后，来春有其名。\n厚载非速成，静里见平生。', 'zh-TW': '落葉歸土後，來春有其名。\n厚載非速成，靜裏見平生。', en: 'After fallen leaves return to earth, spring gives them a name.\nDeep bearing is not quick-made; in stillness one sees a life.', ja: '落葉土に帰りて、来る春その名ある。\n厚き載せは速成ならず。静の中に生涯を見る。' },
    summary: { 'zh-CN': '回望与整理比新增更利于当前阶段。', 'zh-TW': '回望與整理比新增更有利於當前階段。', en: 'Review and organization serve this phase better than addition.', ja: '今の段階では、付け加へるより見直しと整理が役立ちます。' },
    action: { 'zh-CN': '写下来龙去脉，标出仍值得保留的经验。', 'zh-TW': '寫下來龍去脈，標出仍值得保留的經驗。', en: 'Write the whole course of events and mark the experience worth keeping.', ja: '経緯を書き留め、残すべき経験に印を付けましょう。' },
  },
  {
    title: { 'zh-CN': '峠上有风', 'zh-TW': '峠上有風', en: 'Wind Above the Pass', ja: '峠の風' },
    poem: { 'zh-CN': '登高非尽处，风来自八方。\n歇足再问路，前程有月光。', 'zh-TW': '登高非盡處，風來自八方。\n歇足再問路，前程有月光。', en: 'Climbing high is not the end; wind arrives from eight sides.\nRest your feet, ask the road again, and moonlight waits ahead.', ja: '高きに登るも尽きるところにあらず。風は八方より来たる。\n足を休めて道を問へば、先に月の光。' },
    summary: { 'zh-CN': '阶段转折已经出现，宜先恢复判断力再定新路线。', 'zh-TW': '階段轉折已經出現，宜先恢復判斷力再定新路線。', en: 'A phase shift has appeared; restore judgment before setting a new route.', ja: '節目が来ています。判断を取り戻してから新道を決めましょう。' },
    action: { 'zh-CN': '短休之后，重新写下未来三个月的优先级。', 'zh-TW': '短休之後，重新寫下未來三個月的優先級。', en: 'After a short rest, rewrite your priorities for the next three months.', ja: '短い休の後、三ヶ月の優先を書き直しましょう。' },
  },
]

export function normalizeOmikujiLocale(locale?: string): OmikujiLocale {
  if (locale === 'zh-TW') return 'zh-TW'
  if (locale === 'en') return 'en'
  if (locale === 'ja') return 'ja'
  return 'zh-CN'
}

function pickLocalized(value: LocalizedText, locale: OmikujiLocale): string {
  return value[locale]
}

export function getOmikujiByNumber(number: number, locale: string): {
  lotType: { id: 'general-omikuji'; name: string; count: number }
  fortune: OmikujiFortune
  locale: OmikujiLocale
} {
  const loc = normalizeOmikujiLocale(locale)
  if (!Number.isInteger(number) || number < 1 || number > 100) {
    throw createError({ statusCode: 404, statusMessage: `Omikuji not found: ${number}` })
  }

  const index = number - 1
  const rankCode = RANK_BY_NUMBER[index]!
  const rank = RANKS[rankCode]!
  const message = MESSAGES[index % MESSAGES.length]!

  const fortune: OmikujiFortune = {
    number,
    rank: pickLocalized(rank.label, loc),
    rankCode,
    title: pickLocalized(message.title, loc),
    poem: pickLocalized(message.poem, loc),
    summary: pickLocalized(message.summary, loc),
    action: pickLocalized(message.action, loc),
    luckyDirection: pickLocalized(DIRECTIONS[index % DIRECTIONS.length]!, loc),
    symbolColor: pickLocalized(COLORS[Math.floor(index / DIRECTIONS.length) % COLORS.length]!, loc),
    aspects: (Object.keys(ASPECT_LABELS) as OmikujiAspectKey[]).map(key => ({
      key,
      label: pickLocalized(ASPECT_LABELS[key]!, loc),
      text: pickLocalized(ASPECT_TEXT[rank.tier]!, loc),
    })),
  }

  return {
    lotType: {
      id: 'general-omikuji',
      name: pickLocalized({ 'zh-CN': '日本御神签', 'zh-TW': '日本御神籤', en: 'Japanese Omikuji', ja: 'おみくじ' }, loc),
      count: 100,
    },
    fortune,
    locale: loc,
  }
}

export function drawOmikuji(locale: string): {
  lotType: { id: 'general-omikuji'; name: string; count: number }
  fortune: OmikujiFortune
  locale: OmikujiLocale
} {
  return getOmikujiByNumber(Math.floor(Math.random() * 100) + 1, locale)
}

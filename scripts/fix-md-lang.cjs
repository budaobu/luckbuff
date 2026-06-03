const { readFileSync, writeFileSync, readdirSync } = require('fs')
const { join } = require('path')

const DIR = join(process.cwd(), 'content', 'worldcup-predictions')

// 英文队名 → 中文队名（简体/繁体相同，除了德国→德國已在i18n中处理）
const teamMap = {
  'Mexico': '墨西哥',
  'South Africa': '南非',
  'South Korea': '韩国',
  'Czech Republic': '捷克',
  'Canada': '加拿大',
  'Bosnia and Herzegovina': '波黑',
  'Qatar': '卡塔尔',
  'Switzerland': '瑞士',
  'Brazil': '巴西',
  'Morocco': '摩洛哥',
  'Haiti': '海地',
  'Scotland': '苏格兰',
  'USA': '美国',
  'Paraguay': '巴拉圭',
  'Australia': '澳大利亚',
  'Turkey': '土耳其',
  'Turkiye': '土耳其',
  'Germany': '德国',
  'Curaçao': '库拉索',
  'Curacao': '库拉索',
  'Ivory Coast': '科特迪瓦',
  'Ecuador': '厄瓜多尔',
  'Netherlands': '荷兰',
  'Japan': '日本',
  'Sweden': '瑞典',
  'Tunisia': '突尼斯',
  'Belgium': '比利时',
  'Egypt': '埃及',
  'Iran': '伊朗',
  'New Zealand': '新西兰',
  'Spain': '西班牙',
  'Cape Verde': '佛得角',
  'Saudi Arabia': '沙特阿拉伯',
  'Uruguay': '乌拉圭',
  'France': '法国',
  'Senegal': '塞内加尔',
  'Norway': '挪威',
  'Iraq': '伊拉克',
  'Argentina': '阿根廷',
  'Algeria': '阿尔及利亚',
  'Austria': '奥地利',
  'Jordan': '约旦',
  'Portugal': '葡萄牙',
  'DR Congo': '刚果（金）',
  'Uzbekistan': '乌兹别克斯坦',
  "Cote d'Ivoire": '科特迪瓦',
  "Côte d'Ivoire": '科特迪瓦',
  'Colombia': '哥伦比亚',
  'England': '英格兰',
  'Croatia': '克罗地亚',
  'Ghana': '加纳',
  'Panama': '巴拿马',
}

// 英文 venue → 中文 venue
const venueMap = {
  'Estadio Azteca · Mexico City': '阿兹特克体育场 · 墨西哥城',
  'Estadio Akron · Guadalajara': '阿克伦体育场 · 瓜达拉哈拉',
  'BMO Field · Toronto': 'BMO球场 · 多伦多',
  'SoFi Stadium · Los Angeles': '索菲体育场 · 洛杉矶',
  "Levi's Stadium · San Francisco": '李维斯体育场 · 旧金山',
  'MetLife Stadium · New York': '大都会人寿体育场 · 纽约',
  'Gillette Stadium · Boston': '吉列体育场 · 波士顿',
  'BC Place · Vancouver': 'BC体育馆 · 温哥华',
  'NRG Stadium · Houston': 'NRG体育场 · 休斯顿',
  "AT&T Stadium · Dallas": 'AT&T体育场 · 达拉斯',
  'Lincoln Financial Field · Philadelphia': '林肯金融球场 · 费城',
  'BBVA Stadium · Monterrey': 'BBVA体育场 · 蒙特雷',
  'Mercedes-Benz Stadium · Atlanta': '梅赛德斯-奔驰体育场 · 亚特兰大',
  'Lumen Field · Seattle': '卢米恩球场 · 西雅图',
  'Hard Rock Stadium · Miami': '硬石体育场 · 迈阿密',
  'Arrowhead Stadium · Kansas City': '箭头体育场 · 堪萨斯城',
}

// 按名称长度降序排列，避免短名称先替换导致长名称无法匹配
const sortedTeamEntries = Object.entries(teamMap).sort((a, b) => b[0].length - a[0].length)

function fixFile(filePath, isZhTw) {
  let content = readFileSync(filePath, 'utf-8')

  // 替换英文 venue（frontmatter 和正文）
  for (const [en, cn] of Object.entries(venueMap)) {
    // 转义特殊字符用于正则
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'g')
    content = content.replace(regex, cn)
  }

  // 替换英文队名（frontmatter 和正文）
  for (const [en, cn] of sortedTeamEntries) {
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'g')
    content = content.replace(regex, cn)
  }

  writeFileSync(filePath, content, 'utf-8')
}

const files = readdirSync(DIR)
let fixed = 0

for (const file of files) {
  if (!file.endsWith('.md')) continue
  // 跳过英文文件
  if (file.endsWith('.en.md')) continue

  const isZhTw = file.endsWith('.zh-tw.md')
  fixFile(join(DIR, file), isZhTw)
  fixed++
}

console.log(`Fixed ${fixed} zh-CN/zh-TW md files.`)

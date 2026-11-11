export const BAZI_ROOM_TOPICS = [
  {
    id: 'wealth',
    icon: 'i-lucide-coins',
    accent: '#d4a541',
    link: '/tools/bazi-wealth',
  },
  {
    id: 'marriage',
    icon: 'i-lucide-heart',
    accent: '#d97070',
    link: '/tools/bazi-zhengyuan',
  },
  {
    id: 'career',
    icon: 'i-lucide-briefcase-business',
    accent: '#5d9bd8',
    link: '/tools/bazi-zhichang-hepan',
  },
  {
    id: 'fate',
    icon: 'i-lucide-compass',
    accent: '#a377d8',
    link: '/tools/jinri-huangli',
  },
  {
    id: 'noble',
    icon: 'i-lucide-users',
    accent: '#59b99a',
    link: '/tools/jishi',
  },
  {
    id: 'study',
    icon: 'i-lucide-book-open',
    accent: '#dfb06a',
    link: '/tools/jinri-huangli',
  },
] as const

export type BaziRoomTopicId = typeof BAZI_ROOM_TOPICS[number]['id']

export const BAZI_ROOM_TOPIC_IDS = BAZI_ROOM_TOPICS.map(topic => topic.id)

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'application/json')

  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || 'https://www.ososn.com'

  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: 'liu-yao-divination',
        type: 'skill-md',
        description: 'Perform I Ching divination using the six-yao (六爻) method with three coin tosses. Generates hexagrams and provides AI-powered interpretation.',
        url: `${baseUrl}/skills/liu-yao.md`,
        digest: 'sha256:04b9bca4c7e8bce8c6c965dd4d43f6f7c1e9a7bd278e36b6242ae4ae0fb1992d',
      },
      {
        name: 'bazi-analysis',
        type: 'skill-md',
        description: 'Analyze destiny using Chinese Four Pillars of Destiny (四柱八字) astrology. Calculates birth charts and provides AI interpretation of personality, career, wealth, and life trends.',
        url: `${baseUrl}/skills/bazi.md`,
        digest: 'sha256:54268093b234ba5a6b571f5e5bf94ec292ab005487e7b1a1a2e8c9852ed6d6b8',
      },
      {
        name: 'qimen-dunjia',
        type: 'skill-md',
        description: 'Calculate and interpret Qi Men Dun Jia (奇门遁甲) charts for strategic decision-making. Analyzes spatial-temporal energy patterns for auspicious directions and strategies.',
        url: `${baseUrl}/skills/qimen.md`,
        digest: 'sha256:3559614b93eef15ac6434c88025a4a2c30dc45801f70a718ebea36c1b4461164',
      },
    ],
  }
})

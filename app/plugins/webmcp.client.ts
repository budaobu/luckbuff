export default defineNuxtPlugin(() => {
  if (!('modelContext' in navigator)) return

  const controller = new AbortController()

  const tools = [
    {
      name: 'navigate_to_tool',
      description: 'Navigate to a specific divination or astrology tool page on LuckBuff',
      inputSchema: {
        type: 'object',
        properties: {
          tool: {
            type: 'string',
            enum: ['bazi', 'liu-yao', 'zhouyi', 'zwds', 'qimen', 'vedic-astro'],
            description: 'The tool to navigate to: bazi (Four Pillars), liu-yao (Six Yao divination), zhouyi (I Ching / Plum Blossom), zwds (Zi Wei Dou Shu), qimen (Qi Men Dun Jia), vedic-astro (Vedic astrology)',
          },
        },
        required: ['tool'],
      },
      execute: async ({ tool }: { tool: string }) => {
        await navigateTo(`/tools/${tool}`)
        return { success: true, navigatedTo: `/tools/${tool}` }
      },
    },
    {
      name: 'get_available_tools',
      description: 'List all available divination and astrology tools on LuckBuff',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        return {
          tools: [
            { id: 'bazi', name: 'Four Pillars (Bazi)', path: '/tools/bazi', description: 'Chinese astrology based on birth year, month, day, and hour' },
            { id: 'liu-yao', name: 'Six Yao Divination', path: '/tools/liu-yao', description: 'I Ching divination using coin tosses' },
            { id: 'zhouyi', name: 'Plum Blossom (Zhouyi)', path: '/tools/zhouyi', description: 'I Ching divination based on time and numbers' },
            { id: 'zwds', name: 'Zi Wei Dou Shu', path: '/tools/zwds', description: 'Chinese purple star astrology' },
            { id: 'qimen', name: 'Qi Men Dun Jia', path: '/tools/qimen', description: 'Ancient Chinese metaphysical strategy art' },
            { id: 'vedic-astro', name: 'Vedic Astrology', path: '/tools/vedic-astro', description: 'Indian astrology using sidereal zodiac' },
          ],
        }
      },
    },
  ]

  for (const tool of tools) {
    try {
      ;(navigator as any).modelContext.registerTool(tool, { signal: controller.signal })
    } catch {
      // Ignore registration errors
    }
  }

  return {
    provide: {
      webmcpCleanup: () => controller.abort(),
    },
  }
})

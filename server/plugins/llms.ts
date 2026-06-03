export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('llms:generate', (event, options) => {
    const config = useRuntimeConfig()
    const routes = (config.autoRoutes as string[]) || []

    const routeDescriptions: Record<string, { title: string; description: string; category: string }> = {
      '/': { title: 'Home', description: 'Platform landing page showcasing all available divination and metaphysics tools', category: 'other' },
      '/tools': { title: 'Tools Directory', description: 'Comprehensive listing of all available tools on the platform', category: 'other' },
      '/tools/bazi': { title: 'Bazi (Four Pillars)', description: 'Calculate the Four Pillars of Destiny based on birth date and time. Displays the natal chart, Ten Gods, Five Elements analysis, major luck cycles, and supports in-depth fate interpretation', category: 'tools' },
      '/tools/zhouyi': { title: 'Plum Blossom Divination', description: 'Generate hexagrams by time, number, or character input. Displays hexagram texts, line texts, changing hexagrams, and detailed interpretations', category: 'tools' },
      '/tools/liuyao-divination': { title: 'Liu Yao Divination', description: 'One matter one divination. Input your question, cast six coins, and receive a full reading including hexagram overview, self-response analysis, moving-line interpretation, and spirit-line analysis', category: 'tools' },
      '/tools/qimen': { title: 'Qimen Dunjia', description: 'Generate a Qimen Dunjia chart based on time and location. Displays the nine-palace board, eight gates, nine stars, three wonders and six stems, with interpretations of auspicious directions and action advice', category: 'tools' },
      '/tools/liu-yao': { title: 'Liu Yao World Cup', description: 'Cast hexagrams via three coin tosses for Liu Yao analysis. Supports FIFA World Cup match prediction mode', category: 'tools' },
      '/tools/zwds': { title: 'Zi Wei Dou Shu', description: 'Generate a Zi Wei astrological chart based on birth information. Displays twelve palaces, major star distribution, four transformation flying stars, and major limit cycles', category: 'tools' },
      '/tools/vedic-astro': { title: 'Vedic Astrology', description: 'Calculate Indian astrological charts using Swiss Ephemeris data. Displays houses, planets, and Dasha periods', category: 'tools' },
      '/tools/huangdao': { title: 'Auspicious Day Selector', description: 'Select a date range to query daily auspicious/inauspicious activities, favorable and unfavorable deities, and hourly luck to assist in date selection decisions', category: 'tools' },
      '/prophet': { title: 'Prophet Center', description: 'Match prediction hub featuring Qimen Dunjia and Liu Ren prediction modules', category: 'prophet' },
      '/prophet/qimen-worldcup': { title: 'Qimen World Cup', description: 'FIFA World Cup match predictions based on Qimen Dunjia. Supports automatic match selection from the fixture list with chart generation and win probability analysis', category: 'prophet' },
      '/prophet/liuren-worldcup': { title: 'Liu Ren World Cup', description: 'FIFA World Cup match predictions based on Da Liu Ren (Six Ren). Supports fixture selection and divination class interpretation', category: 'prophet' },
      '/prophet/worldcup-champion-odds-2026': { title: 'World Cup 2026 Champion Odds', description: 'Dual-track champion odds prediction combining Opta Supercomputer data with Liu Yao divination for all 48 World Cup teams', category: 'prophet' },
      '/tools/liuren': { title: 'Da Liu Ren', description: 'Detailed divination for specific matters using the Four Classes and Three Transmissions method to analyze the process and final outcome', category: 'tools' },
      '/settings': { title: 'Settings', description: 'Birth profile management, language switching, theme settings, and more', category: 'other' },
      '/terms': { title: 'Terms of Service', description: 'Platform terms of service', category: 'other' },
      '/privacy': { title: 'Privacy Policy', description: 'Platform privacy policy', category: 'other' },
    }

    const categories: Record<string, Array<{ title: string; description: string; route: string }>> = {}
    for (const route of routes) {
      // Skip dynamic parameter routes (e.g. /prophet/match/[slug])
      if (route.includes('[')) continue
      const desc = routeDescriptions[route]
      if (desc) {
        const cat = desc.category
        if (!categories[cat]) categories[cat] = []
        categories[cat].push({ ...desc, route })
      } else {
        const cat = 'other'
        if (!categories[cat]) categories[cat] = []
        categories[cat].push({
          title: route,
          description: '(description pending)',
          route,
        })
      }
    }

    const domain = options.domain || 'https://www.ososn.com'
    const categoryNames: Record<string, string> = {
      tools: 'Core Tools',
      prophet: 'Match Predictions',
      other: 'Other Pages',
    }

    for (const [cat, items] of Object.entries(categories)) {
      if (!items.length) continue
      options.sections.push({
        title: categoryNames[cat] || cat,
        links: items.map(item => ({
          title: item.title,
          description: item.description,
          href: `${domain}${item.route}`,
        })),
      })
    }

    // Add content markdown files (worldcup predictions) — base slugs only (zh-CN default)
    const contentItems = (config.contentItems as Array<{ slug: string; summary: string }>) || []
    if (contentItems.length) {
      options.sections.push({
        title: 'Match Prediction Details',
        links: contentItems.map(item => ({
          title: item.summary || item.slug,
          description: `Qimen Dunjia prediction analysis for World Cup match: ${item.summary || item.slug}`,
          href: `${domain}/prophet/match/${item.slug}`,
        })),
      })
    }
  })
})

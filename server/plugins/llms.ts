export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('llms:generate', (event, options) => {
    const config = useRuntimeConfig()
    const routes = (config.autoRoutes as string[]) || []

    const routeDescriptions: Record<string, { title: string; description: string; category: string }> = {
      '/': { title: 'Home', description: 'Platform landing page showcasing all available divination and metaphysics tools', category: 'other' },
      '/tools': { title: 'Tools Directory', description: 'Comprehensive listing of all available tools on the platform', category: 'other' },
      '/tools/bazi': { title: 'Bazi (Four Pillars)', description: 'Calculate the Four Pillars of Destiny based on birth date and time. Displays the natal chart, Ten Gods, Five Elements analysis, major luck cycles, and supports in-depth fate interpretation', category: 'tools' },
      '/tools/bazi-hunpan': { title: 'Bazi Compatibility', description: 'Enter two people\'s birth information for AI-powered compatibility analysis. Analyzes day pillar harmony, Five Elements complementarity, Ten Gods dynamics, and major luck cycle synchronization for relationship insights', category: 'tools' },
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
      '/tools/xiao-liuren': { title: 'Xiao Liu Ren', description: 'Traditional finger-counting divination. Cast by time, numbers, or Chinese characters and receive AI interpretation of the six palaces', category: 'tools' },
      '/tools/jinkoujue': { title: 'Jin Kou Jue', description: 'Da Liu Ren Golden Formula divination. Enter time and Earth division to generate the four-layer chart (Human Element, Noble Spirit, General Spirit, Earth Division) with AI interpretation', category: 'tools' },
      '/tools/cezi-zhouyi': { title: 'Zhouyi Character Divination', description: 'Enter one Chinese character and your question for Zhouyi character divination. AI interprets through character analysis, stroke count, five elements, and derived I Ching hexagram', category: 'tools' },
      '/tools/cezi-yishu': { title: 'Plum Blossom Character Divination', description: 'Enter Chinese characters, your question, and external omens for Meihua Yishu (Plum Blossom) character divination. AI derives a hexagram from先天八卦 numbers and interprets the reading', category: 'tools' },
      '/tools/liuyao-cezi': { title: 'Liu Yao Character Divination', description: 'Enter one Chinese character and your question for Liu Yao (Six Lines) character divination. AI derives a hexagram from traditional stroke count and hour number, assigns stems, branches, six relations, and six spirits, then interprets strength, void, and broken states', category: 'tools' },
      '/tools/cezi-battle': { title: 'Name Battle Top', description: 'Turn Chinese characters from two names into physics-based spinning tops and battle them. Supports single-character duel and multi-round name battle with AI commentary', category: 'tools' },
      '/tools/zhuge-cezi': { title: 'Zhuge Shenshu Character Divination', description: 'Enter three Chinese characters for Zhuge Shenshu divination. AI derives an oracle number from traditional stroke counts, selects one of 384 oracles, and interprets the poem and meaning for your question', category: 'tools' },
      '/tools/guanyin-lots': { title: 'Guanyin Oracle', description: 'Traditional Chinese Guanyin oracle stick divination. Enter one Chinese character and your question, draw a numbered oracle stick, and receive an AI interpretation', category: 'tools' },
      '/tools/5-god-of-wealth-lot': { title: 'Five Gods of Wealth Lot', description: 'Traditional Five Gods of Wealth oracle stick divination for wealth, business, and investment questions. Draw a numbered stick and receive an AI interpretation', category: 'tools' },
      '/draw-a-lot': { title: 'Guanyin Oracle Hub', description: 'Hub page for Guanyin oracle stick divination. Enter one Chinese character and your question to draw a numbered stick and receive an AI interpretation', category: 'tools' },
      '/tools/xiao-liuren-seeking': { title: 'Xiao Liu Ren Lost Item Divination', description: 'Traditional finger-counting divination optimized for finding lost items. Cast by time and receive AI interpretation of direction and recovery probability', category: 'tools' },
      '/tools/numerology': { title: 'Name Number', description: 'Numerology name number and life path number calculator with AI symbolic personality interpretation', category: 'tools' },
      '/tools/wuge': { title: 'Five Grid Name Analysis', description: 'Chinese name fortune analysis using the Five Grid method. Calculates Heaven, Personality, Earth, External, and Total grids with 81-number fortune interpretation', category: 'tools' },
      '/tools/bazi-naming': { title: 'Bazi Naming', description: 'Generate auspicious Chinese names based on Four Pillars birth chart analysis. AI recommends names whose character elements complement the user\'s Five Elements balance and favorable elements', category: 'tools' },
      '/tools/fengshui': { title: 'Feng Shui Analysis', description: 'Enter property direction, build year, move-in year and birth info for AI-powered feng shui analysis using Xuan Kong Flying Stars and Eight Mansions methods', category: 'tools' },
      '/tools/tarot': { title: 'Tarot Reading', description: 'One matter one divination. Input your question, choose a spread, and receive AI-powered tarot card readings with full interpretation', category: 'tools' },
      '/tools/lenormand': { title: 'Lenormand Divination', description: 'Input your question, choose a spread, and receive AI-powered Lenormand card readings. Full 36-card deck with combination-based interpretation', category: 'tools' },
      '/tools/fbti': { title: 'World Cup Fan Personality Test', description: 'Interactive 24-question personality quiz that classifies football fans into one of 16 archetypes, with a shareable result card', category: 'prophet' },
      '/cezi': { title: 'Character Divination', description: 'Chinese character divination hub. Write a character and receive AI interpretations via Plum Blossom character casting, Liu Yao, Qimen Dunjia, Da Liu Ren, Xiao Liu Ren, and Jin Kou Jue', category: 'tools' },
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

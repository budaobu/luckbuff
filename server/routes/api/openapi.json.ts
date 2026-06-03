export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'application/json')

  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || 'https://www.ososn.com'

  return {
    openapi: '3.1.0',
    info: {
      title: 'LuckBuff API',
      version: '1.0.0',
      description: 'Divination and astrology tools API for Bazi, Liu Yao, Zhouyi, Zi Wei Dou Shu, Qi Men Dun Jia, and Vedic Astrology.',
    },
    servers: [{ url: `${baseUrl}/api` }],
    paths: {
      '/ping': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'Server is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/ai/stream': {
        post: {
          summary: 'AI streaming interpretation',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    systemPrompt: { type: 'string' },
                    messages: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          role: { type: 'string' },
                          content: { type: 'string' },
                        },
                      },
                    },
                    toolType: { type: 'string' },
                    locale: { type: 'string' },
                  },
                  required: ['systemPrompt', 'messages'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'Server-Sent Events stream' },
          },
        },
      },
      '/bazi/interpret': {
        post: {
          summary: 'Bazi (Four Pillars) interpretation',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    baziData: { type: 'object' },
                    year: { type: 'number' },
                    gender: { type: 'string' },
                    mode: { type: 'string' },
                    locale: { type: 'string' },
                  },
                  required: ['baziData'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'Server-Sent Events stream' },
          },
        },
      },
      '/liu-yao/predict': {
        post: {
          summary: 'Liu Yao divination prediction',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    hexagram: { type: 'object' },
                    question: { type: 'string' },
                    method: { type: 'string' },
                    subject: { type: 'string' },
                    locale: { type: 'string' },
                  },
                  required: ['hexagram'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'Server-Sent Events stream' },
          },
        },
      },
      '/qimen/chart': {
        post: {
          summary: 'Qi Men Dun Jia chart calculation',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    year: { type: 'number' },
                    month: { type: 'number' },
                    day: { type: 'number' },
                    hour: { type: 'number' },
                    minute: { type: 'number' },
                    location: { type: 'string' },
                    timezone: { type: 'string' },
                    juType: { type: 'string' },
                    paiPanType: { type: 'string' },
                    layout: { type: 'string' },
                    locale: { type: 'string' },
                  },
                  required: ['year', 'month', 'day', 'hour', 'location'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'Chart data' },
          },
        },
      },
      '/vedic/chart': {
        post: {
          summary: 'Vedic astrology chart calculation',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    year: { type: 'number' },
                    month: { type: 'number' },
                    day: { type: 'number' },
                    hour: { type: 'number' },
                    minute: { type: 'number' },
                    timezone: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    locale: { type: 'string' },
                  },
                  required: ['year', 'month', 'day', 'hour', 'minute', 'timezone', 'latitude', 'longitude'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'Chart data' },
          },
        },
      },
    },
  }
})

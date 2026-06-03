export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'application/json')
  return {
    serverInfo: {
      name: 'luckbuff',
      version: '1.0.0',
    },
    endpoint: '/mcp',
    capabilities: [],
  }
})

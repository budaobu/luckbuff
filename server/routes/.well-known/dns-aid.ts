export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'application/json')

  const config = useRuntimeConfig()
  const domain = new URL(config.public.siteUrl || 'https://www.ososn.com').hostname.replace(/^www\./, '')

  return {
    $schema: 'https://schemas.agentskills.io/dns-aid/1.0/schema.json',
    domain,
    records: [
      {
        name: `_index._agents.${domain}`,
        ttl: 3600,
        type: 'SVCB',
        priority: 1,
        target: domain,
        params: {
          alpn: 'h2,h3',
          port: 443,
          mandatory: 'alpn,port',
        },
      },
      {
        name: `_a2a._agents.${domain}`,
        ttl: 3600,
        type: 'SVCB',
        priority: 1,
        target: domain,
        params: {
          alpn: 'h2,h3',
          port: 443,
          mandatory: 'alpn,port',
        },
      },
    ],
    dnssec: {
      enabled: true,
      description: 'Zone must be signed with DNSSEC for authenticated discovery',
    },
  }
})

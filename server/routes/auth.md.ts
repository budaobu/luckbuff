export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')

  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || 'https://www.ososn.com'

  return `# LuckBuff auth.md

## Agent Audience

This service welcomes autonomous agents. All public divination and astrology APIs are accessible without authentication. Agent registration is available for higher-rate-limit access and future protected features.

## Registration Endpoint

Agents may register for an API key at:

\`\`\`
POST ${baseUrl}/agent/register
\`\`\`

## Supported Methods

- **Anonymous**: Agents register with an ephemeral key pair
- **Verified email**: Agents register with a verified email credential

## Credential Use

After registration, agents receive a bearer token for API authentication. Include the token in the \`Authorization: Bearer <token>\` header.

## OAuth Metadata

- Protected Resource Metadata: \`${baseUrl}/.well-known/oauth-protected-resource\`
- Authorization Server Metadata: \`${baseUrl}/.well-known/oauth-authorization-server\`

## API Documentation

- OpenAPI Spec: \`${baseUrl}/api/openapi.json\`
- API Catalog: \`${baseUrl}/.well-known/api-catalog\`
`
})

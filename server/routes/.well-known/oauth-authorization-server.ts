export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'application/json')

  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl || 'https://www.ososn.com'

  return {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/oauth/authorize`,
    token_endpoint: `${baseUrl}/oauth/token`,
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
    grant_types_supported: ['authorization_code', 'client_credentials'],
    response_types_supported: ['code', 'token'],
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
    scopes_supported: ['read', 'write'],
    agent_auth: {
      skill: `${baseUrl}/.well-known/agent-skills/index.json`,
      register_uri: `${baseUrl}/agent/register`,
      identity_types_supported: ['identity_assertion', 'anonymous'],
      identity_assertion: {
        assertion_types_supported: ['urn:ietf:params:oauth:token-type:id-jag', 'verified_email'],
        credential_types_supported: ['urn:ietf:params:oauth:jwk-thumbprint', 'email-verified'],
      },
      anonymous: {
        credential_types_supported: ['ephemeral-key'],
        claim_uri: `${baseUrl}/agent/claim`,
      },
      claim_uri: `${baseUrl}/agent/claim`,
      revocation_uri: `${baseUrl}/agent/revoke`,
      events_supported: [`${baseUrl}/events/agent-revocation`],
    },
  }
})

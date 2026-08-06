import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { genericOAuth } from 'better-auth/plugins'
import { db, schema } from './db'

// Telegram does not expose a standard OIDC userinfo payload shape, so we map
// the OIDC claims explicitly. The discovery URL points at Telegram's official
// OIDC discovery document.
const telegramDiscoveryUrl =
  process.env.TELEGRAM_OIDC_DISCOVERY_URL ||
  'https://oauth.telegram.org/.well-known/openid-configuration'

// Decode the payload of a JWT without verifying the signature. The id_token
// here comes straight from Telegram's token endpoint over TLS, and better-auth
// has already completed the code exchange, so a plain decode is sufficient to
// read the claims for user mapping.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(b64, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NUXT_PUBLIC_SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  // Trust both loopback hosts for local dev; Telegram OIDC only accepts
  // 127.0.0.1 (not localhost) as a registered redirect URL.
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.NUXT_PUBLIC_SITE_URL || 'https://www.ososn.com',
  ],

  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'telegram',
          clientId: process.env.TELEGRAM_CLIENT_ID as string,
          clientSecret: process.env.TELEGRAM_CLIENT_SECRET as string,
          discoveryUrl: telegramDiscoveryUrl,
          scopes: ['openid', 'profile'],
          // Must match the Redirect URL registered in BotFather. Default to the
          // deployed site URL (127.0.0.1 is only for local dev and is what
          // Telegram accepts instead of localhost); override via env if needed.
          redirectURI:
            process.env.TELEGRAM_REDIRECT_URI ||
            `${process.env.NUXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000'}/api/auth/oauth2/callback/telegram`,
          // Telegram has no userinfo endpoint and its id_token carries no
          // email, but better-auth requires an email per user. Map the OIDC
          // claims from the id_token and synthesize a stable placeholder email
          // from the immutable `sub` (Telegram user id).
          getUserInfo: async (tokens) => {
            const claims = tokens.idToken ? decodeJwtPayload(tokens.idToken) : null
            if (!claims || !claims.sub) return null
            const sub = String(claims.sub)
            const username = (claims.preferred_username as string) || ''
            const name =
              (claims.name as string) || username || `Telegram #${sub}`
            return {
              id: sub,
              name,
              email: `${username || sub}@telegram.ososn.local`,
              image: (claims.picture as string) || undefined,
              emailVerified: false,
            }
          },
        },
      ],
    }),
  ],
})

export type Auth = typeof auth

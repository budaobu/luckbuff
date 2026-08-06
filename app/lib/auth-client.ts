import { createAuthClient } from 'better-auth/vue'
import { genericOAuthClient } from 'better-auth/client/plugins'

// Client for the self-hosted Better Auth instance mounted at /api/auth/*.
// genericOAuthClient is required to initiate the Telegram OIDC flow, which is
// registered server-side via the genericOAuth plugin (not a built-in provider).
export const authClient = createAuthClient({
  plugins: [genericOAuthClient()],
})

export const { signIn, signOut, useSession } = authClient

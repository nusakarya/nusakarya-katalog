import { createRemoteJWKSet, jwtVerify } from 'jose'

// Google's public keys for verifying Firebase ID token signatures (RS256).
// jose caches the fetched JWKS in memory for the lifetime of the module/isolate.
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
const jwks = createRemoteJWKSet(new URL(JWKS_URL))

export type FirebaseIdentity = {
  uid: string
  email?: string
}

// Cloudflare Workers can't run the firebase-admin SDK (it needs Node.js APIs
// unavailable at the edge), so ID tokens are verified directly against
// Google's JWKS instead of going through Firebase's server SDK.
export const verifyFirebaseIdToken = async (
  idToken: string,
  projectId: string,
): Promise<FirebaseIdentity | null> => {
  if (!idToken || !projectId) return null
  try {
    const { payload } = await jwtVerify(idToken, jwks, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    })
    if (typeof payload.sub !== 'string') return null
    return {
      uid: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    }
  } catch {
    return null
  }
}

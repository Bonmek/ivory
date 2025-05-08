import { generateRandomness } from '@mysten/sui/zklogin'
import { SuiClient } from '@mysten/sui/client'
import { createEphemeralKey, generateNonceAndStore } from './SuiZkLoginService'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI

/**
 * Start the Google login flow using zkLogin:
 * - Generate ephemeral key
 * - Generate randomness and nonce
 * - Store all zkLogin-related values
 * - Redirect to Google OAuth with generated nonce
 */
export const loginWithGoogle = async (suiClient: SuiClient) => {
  const ephemeralKeypair = createEphemeralKey()
  const randomness = generateRandomness()

  const { epoch } = await suiClient.getLatestSuiSystemState()
  const maxEpoch = Number(epoch) + 2

  const nonce = generateNonceAndStore(ephemeralKeypair, maxEpoch, randomness)

  const authUrl = generateGoogleLoginUrl(nonce, CLIENT_ID, REDIRECT_URI)
  window.location.href = authUrl
}

/**
 * Generate Google OAuth2 login URL with proper scopes and nonce
 */
export const generateGoogleLoginUrl = (
  nonce: string,
  clientId: string,
  redirectUri: string,
): string => {
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=id_token&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=openid%20email&nonce=${nonce}`
}


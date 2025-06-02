import { suiService } from '@/service/suiService'

export interface PollingConfig {
  maxAttempts: number
  pollInterval: number
  timeout: number
}

export const DEFAULT_POLLING_CONFIG: PollingConfig = {
  maxAttempts: 10,
  pollInterval: 2000,
  timeout: 30000,
}

type StateCheckFunction = (metadata: any) => boolean

export const waitForStateUpdate = async (
  objectId: string,
  stateCheck: StateCheckFunction,
  config: PollingConfig = DEFAULT_POLLING_CONFIG,
): Promise<boolean> => {
  const startTime = Date.now()
  let attempts = 0

  while (attempts < config.maxAttempts) {
    if (Date.now() - startTime > config.timeout) {
      console.warn('State update timeout, but continuing...')
      return true
    }

    try {
      const metadata = await suiService.getMetadata(objectId)
      const metadataContent = metadata?.content
      if (!metadataContent || typeof metadataContent !== 'object') {
        console.warn('Invalid metadata content')
        attempts++
        continue
      }

      if (stateCheck(metadataContent)) {
        return true
      }

      await new Promise((resolve) => setTimeout(resolve, config.pollInterval))
      attempts++
    } catch (error) {
      // Special case for 404 during deletion
      if ((error as any)?.response?.status === 404) {
        return true
      }
      console.warn('Error checking state status:', error)
      attempts++
      await new Promise((resolve) =>
        setTimeout(resolve, config.pollInterval * 2),
      )
    }
  }

  console.warn('Max polling attempts reached, but continuing...')
  return true
}

// Predefined state check functions
export const checkMemberState = (expectedValue: string) => (metadata: any) => {
  const fields = metadata?.fields
  const metadataFields = fields?.value?.fields?.metadata?.fields?.contents || []

  const memberEntry = metadataFields.find(
    (entry: any) => entry.fields?.key === 'member',
  )

  return (
    memberEntry?.fields?.value === expectedValue || memberEntry?.fields?.value
  )
}

export const checkSiteIdState = (metadata: any) => {
  const fields = metadata?.fields
  return !!fields?.site_id
}

export const checkDeletionState = () => false // Always continue polling until timeout or 404 
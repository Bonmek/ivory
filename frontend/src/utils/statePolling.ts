import { suiService } from '@/service/suiService'
import { POLLING_CONFIG, type PollingConfig } from '@/constants/polling'

type StateCheckFunction = (metadata: any) => boolean

export const waitForStateUpdate = async (
  objectId: string,
  stateCheck: StateCheckFunction,
  config: PollingConfig = POLLING_CONFIG,
): Promise<boolean> => {
  const startTime = Date.now()
  let attempts = 0

  while (attempts < config.maxAttempts) {
    if (Date.now() - startTime > config.timeout) {
      return false
    }

    try {
      const metadata = await suiService.getMetadata(objectId)
      if (stateCheck(metadata)) {
        return true
      }
      attempts++
      await new Promise((resolve) =>
        setTimeout(resolve, config.pollInterval),
      )
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return false
      }
      attempts++
      await new Promise((resolve) =>
        setTimeout(resolve, config.pollInterval),
      )
    }
  }

  return false
}

// Predefined state check functions
export const checkMemberState = (expectedValue: string) => (metadata: any) => {
  return true
}

export const checkSiteIdState = (metadata: any) => {
  return true
}

export const checkDeletionState = () => false

export const checkSuinsState = (expectedSuins: string) => (metadata: any) => {
  const suiNs = metadata?.data?.content?.fields?.sui_ns
  return suiNs === expectedSuins
}

// Common function for handling member state updates
export const handleMemberStateUpdate = async (
  objectId: string, 
  memberString: string,
  config: PollingConfig = POLLING_CONFIG
): Promise<boolean> => {
  return await waitForStateUpdate(
    objectId,
    checkMemberState(memberString),
    config
  )
}

// Common function for handling site state updates
export const handleSiteStateUpdate = async (
  objectId: string,
  config: PollingConfig = POLLING_CONFIG
): Promise<boolean> => {
  return await waitForStateUpdate(
    objectId,
    checkSiteIdState,
    config
  )
}

// Common function for handling deletion state updates
export const handleDeletionStateUpdate = async (
  objectId: string,
  config: PollingConfig = POLLING_CONFIG
): Promise<boolean> => {
  return await waitForStateUpdate(
    objectId,
    checkDeletionState,
    config
  )
}

// Common function for handling SUINS state updates
export const handleSuinsStateUpdate = async (
  objectId: string,
  suinsName: string,
  config: PollingConfig = POLLING_CONFIG
): Promise<boolean> => {
  return await waitForStateUpdate(
    objectId,
    checkSuinsState(suinsName),
    config
  )
} 
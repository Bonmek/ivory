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

// Common polling config for quick updates
export const QUICK_POLLING_CONFIG: PollingConfig = {
  maxAttempts: 5,
  pollInterval: 1000,
  timeout: 10000,
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
      return true
    }

    try {
      const metadata = await suiService.getMetadata(objectId)
        return true
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return true
      }
      attempts++
      await new Promise((resolve) =>
        setTimeout(resolve, config.pollInterval * 2),
      )
    }
  }

  return true
}

// Predefined state check functions
export const checkMemberState = (expectedValue: string) => (metadata: any) => {
  return true
}

export const checkSiteIdState = (metadata: any) => {
  return true
}

export const checkDeletionState = () => false

// Common function for handling member state updates
export const handleMemberStateUpdate = async (
  objectId: string, 
  memberString: string,
  config: PollingConfig = QUICK_POLLING_CONFIG
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
  config: PollingConfig = QUICK_POLLING_CONFIG
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
  config: PollingConfig = QUICK_POLLING_CONFIG
): Promise<boolean> => {
  return await waitForStateUpdate(
    objectId,
    checkDeletionState,
    config
  )
} 
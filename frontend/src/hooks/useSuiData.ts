import { useQuery } from '@tanstack/react-query'
import { suiService } from '@/service/suiService'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  CACHE_TIME,
  STALE_TIME,
  MAX_RETRIES_RATE_LIMIT,
  MAX_RETRIES_OTHER_ERRORS,
  RETRY_BASE_DELAY_MS,
  MAX_RETRY_DELAY_MS,
} from '@/constants/time'

/**
 * Handles retry logic for API requests
 * @param failureCount Current number of retry attempts
 * @param error Error object from the failed request
 * @returns Boolean indicating whether to retry the request
 */
const handleRetryLogic = (failureCount: number, error: any): boolean => {
  if (error?.message?.includes('too many requests')) {
    return failureCount < MAX_RETRIES_RATE_LIMIT // Retry for rate limiting errors
  }
  return failureCount < MAX_RETRIES_OTHER_ERRORS // Retry for other errors
}

/**
 * Calculates exponential backoff delay for retries
 * @param attemptIndex Current retry attempt index
 * @returns Delay in milliseconds before next retry
 */
const calculateRetryDelay = (attemptIndex: number): number => {
  return Math.min(RETRY_BASE_DELAY_MS * 2 ** attemptIndex, MAX_RETRY_DELAY_MS) // Exponential backoff
}

/**
 * Custom hook for fetching and managing Sui blockchain data
 * Implements caching, retry logic, and error handling to prevent CORS and rate limiting issues
 */
export const useSuiData = (userAddress: string) => {
  const queryClient = useQueryClient()
  const [isManualRefetching, setIsManualRefetching] = useState(false)

  // Fetch blobs using website owner's address
  const {
    data: blobs = [],
    isLoading: isLoadingBlobs,
    error: blobsError,
  } = useQuery({
    queryKey: ['blobs', process.env.REACT_APP_OWNER_ADDRESS || ''],
    queryFn: () =>
      suiService.getBlobs(process.env.REACT_APP_OWNER_ADDRESS || '', {
        StructType: process.env.REACT_APP_BLOB_TYPE as string,
      }),
    enabled: !!userAddress, // Only fetch if user is logged in
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    // Use the shared retry logic function
    retry: handleRetryLogic,
    // Use the shared retry delay function
    retryDelay: calculateRetryDelay,
  })

  // Fetch SUINS data
  const {
    data: suins = [],
    isLoading: isLoadingSuins,
    error: suinsError,
  } = useQuery({
    queryKey: ['suins', userAddress || ''],
    queryFn: () =>
      suiService.getBlobs(userAddress || '', {
        StructType: process.env.REACT_APP_SUINS_TYPE as string,
      }),
    enabled: !!userAddress, // Only fetch if user is logged in
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: handleRetryLogic,
    retryDelay: calculateRetryDelay,
  })

  // Fetch dynamic fields for each blob
  const {
    data: dynamicFields = [],
    isLoading: isLoadingFields,
    error: fieldsError,
  } = useQuery({
    queryKey: [
      'dynamicFields',
      blobs.map((blob) => blob.data?.objectId).filter(Boolean),
    ],
    queryFn: async () => {
      const fieldsPromises = blobs
        .filter((blob) => blob.data?.objectId)
        .map((blob) => suiService.getDynamicFields(blob.data!.objectId))
      return Promise.all(fieldsPromises)
    },
    enabled: blobs.length > 0,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: handleRetryLogic,
    retryDelay: calculateRetryDelay,
  })

  // Fetch metadata for each dynamic field
  const {
    data: metadata = [],
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = useQuery({
    queryKey: [
      'metadata',
      dynamicFields.flatMap((fields) => fields.map((field) => field.objectId)),
    ],
    queryFn: async () => {
      const metadataPromises = dynamicFields.flatMap((fields) =>
        fields.map((field) => {
          // Use parentId from dynamic field
          const fieldWithParent = field as any
          return suiService.getMetadata(
            field.objectId,
            fieldWithParent.parentId,
          )
        }),
      )
      const result = await Promise.all(metadataPromises)
      return result
    },
    enabled: dynamicFields.length > 0,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: handleRetryLogic,
    retryDelay: calculateRetryDelay,
  })

  // Filter metadata by owner address
  const filteredMetadata = metadata.filter((meta) => {
    if (!meta?.content || meta.content.dataType !== 'moveObject') {
      return false
    }
    const fields = meta.content.fields as any
    const metadataFields =
      fields?.value?.fields?.metadata?.fields?.contents || []
    const ownerEntry = metadataFields.find(
      (entry: any) => entry.fields?.key === 'owner',
    )
    const owner = ownerEntry?.fields?.value
    // Check for delete-attribute field
    const deleteAttributeEntry = metadataFields.find(
      (entry: any) => entry.fields?.key === 'delete-attribute',
    )
    if (deleteAttributeEntry) {
      return false // Skip if delete-attribute exists
    }

    return owner === userAddress
  })

  // Error handling and detection
  const hasError = blobsError || suinsError || fieldsError || metadataError
  const errorMessage = hasError
    ? (blobsError || suinsError || fieldsError || metadataError)?.message
    : null
  // Specifically detect rate limiting errors for better UI feedback
  const isTooManyRequestsError = errorMessage?.includes('too many requests')

  /**
   * Manual refetch function with state management to prevent multiple simultaneous refreshes
   * This helps avoid rate limiting by preventing rapid consecutive API calls
   */
  const handleRefetch = async () => {
    if (isManualRefetching) return // Prevent multiple simultaneous refreshes

    try {
      setIsManualRefetching(true) // Set loading state
      // Invalidate all relevant queries to trigger fresh data fetching
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['blobs', process.env.REACT_APP_OWNER_ADDRESS || ''],
        }),
        queryClient.invalidateQueries({ queryKey: ['dynamicFields'] }),
        queryClient.invalidateQueries({ queryKey: ['metadata'] }),
      ])
    } catch (error) {
      console.error('Error refetching data:', error)
    } finally {
      setIsManualRefetching(false) // Reset loading state
    }
  }

  /**
   * Specific function to refresh only SUINS data
   * Allows targeted refreshing without loading all data
   */
  const handleRefetchSuiNS = async () => {
    if (isManualRefetching) return // Prevent multiple refreshes

    try {
      setIsManualRefetching(true)
      await queryClient.invalidateQueries({
        queryKey: ['suins', userAddress || ''],
      })
    } catch (error) {
      console.error('Error refetching SUINS data:', error)
    } finally {
      setIsManualRefetching(false)
    }
  }

  // Return all necessary data, loading states, errors, and refresh functions
  return {
    // Data
    blobs,
    suins,
    dynamicFields,
    metadata: filteredMetadata,
    // Loading states
    isLoadingBlobs,
    isLoadingSuins,
    isLoadingFields,
    isLoadingMetadata,
    isLoading:
      isLoadingBlobs ||
      isLoadingFields ||
      isLoadingMetadata ||
      isManualRefetching,
    isRefetching: isManualRefetching,
    // Error states
    hasError,
    errorMessage,
    isTooManyRequestsError,
    // Refresh functions
    refetch: handleRefetch,
    refetchSuiNS: handleRefetchSuiNS,
  }
}

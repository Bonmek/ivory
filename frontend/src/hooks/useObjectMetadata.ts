import { useQuery, useQueryClient } from '@tanstack/react-query'
import { suiService } from '@/service/suiService'
import { CACHE_TIME, STALE_TIME } from '@/constants/time'
import { useState, useEffect } from 'react'

type MetadataResponse = {
  content?: {
    dataType: string
    fields?: Record<string, any>
  } | null
}

export const useObjectMetadata = (objectId: string, parentId?: string) => {
  const queryClient = useQueryClient()
  const [previousMetadata, setPreviousMetadata] = useState<MetadataResponse | null>(null)
  const [hasChanged, setHasChanged] = useState(false)

  const {
    data: metadata,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['single-metadata', objectId],
    queryFn: async () => {
      try {
        const result = await suiService.getMetadata(objectId, parentId)
        return result as MetadataResponse
      } catch (error) {
        console.error('Error fetching metadata:', error)
        throw error
      }
    },
    enabled: !!objectId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  })

  useEffect(() => {
    if (metadata) {
      if (previousMetadata) {
        const hasMetadataChanged = JSON.stringify(metadata) !== JSON.stringify(previousMetadata)
        setHasChanged(hasMetadataChanged)
      }
      setPreviousMetadata(metadata)
    }
  }, [metadata])

  const refreshMetadata = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['single-metadata', objectId] })
      const newData = await refetch()
      return newData.data
    } catch (error) {
      console.error('Error refreshing metadata:', error)
      throw error
    }
  }

  const getFieldValue = (key: string): any => {
    const contents = metadata?.content?.fields as any
    return contents?.[key] || null
  }

  return {
    metadata,
    isLoading,
    error,
    refreshMetadata,
    hasChanged,
    previousMetadata,
    getFieldValue
  }
} 
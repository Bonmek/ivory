import { useQuery } from '@tanstack/react-query'
import { suiService } from '@/service/suiService'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export const useSuiData = (userAddress: string) => {
  const queryClient = useQueryClient()

  // Fetch blobs using website owner's address
  const { data: blobs = [], isLoading: isLoadingBlobs } = useQuery({
    queryKey: ['blobs', process.env.REACT_APP_OWNER_ADDRESS || ''],
    queryFn: () =>
      suiService.getBlobs(process.env.REACT_APP_OWNER_ADDRESS || '', {
        StructType: process.env.REACT_APP_BLOB_TYPE as string,
      }),
    enabled: !!userAddress, // Only fetch if user is logged in
  })

  // Fetch SUINS data
  const { data: suins = [], isLoading: isLoadingSuins } = useQuery({
    queryKey: ['suins', userAddress || ''],
    queryFn: () =>
      suiService.getBlobs(userAddress || '', {
        StructType: process.env.REACT_APP_SUINS_TYPE as string,
      }),
    enabled: !!userAddress, // Only fetch if user is logged in
  })

  // Fetch dynamic fields for each blob
  const { data: dynamicFields = [], isLoading: isLoadingFields } = useQuery({
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
  })

  // Fetch metadata for each dynamic field
  const { data: metadata = [], isLoading: isLoadingMetadata } = useQuery({
    queryKey: [
      'metadata',
      dynamicFields.flatMap((fields) => fields.map((field) => field.objectId)),
    ],
    queryFn: async () => {
      console.log('Dynamic fields for metadata:', dynamicFields)
      const metadataPromises = dynamicFields.flatMap((fields) =>
        fields.map((field) => {
          // Use parentId from dynamic field
          const fieldWithParent = field as any
          console.log('Field with parent:', fieldWithParent)
          return suiService.getMetadata(field.objectId, fieldWithParent.parentId)
        }),
      )
      const result = await Promise.all(metadataPromises)
      console.log('Raw metadata result:', result)
      return result
    },
    enabled: dynamicFields.length > 0,
  })

  // Filter metadata by owner address
  const filteredMetadata = metadata.filter((meta) => {
    if (!meta?.content || meta.content.dataType !== 'moveObject') {
      console.log('Invalid metadata:', meta)
      return false
    }
    const fields = meta.content.fields as any
    const metadataFields =
      fields?.value?.fields?.metadata?.fields?.contents || []
    const ownerEntry = metadataFields.find(
      (entry: any) => entry.fields?.key === 'owner',
    )
    const owner = ownerEntry?.fields?.value

    return owner === userAddress
  })
  console.log('Filtered metadata:', filteredMetadata)

  return {
    blobs,
    suins,
    dynamicFields,
    metadata: filteredMetadata,
    isLoadingBlobs,
    isLoadingSuins,
    isLoadingFields,
    isLoadingMetadata,
    isLoading: isLoadingBlobs || isLoadingFields || isLoadingMetadata,
    refetch: () => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['blobs', process.env.REACT_APP_OWNER_ADDRESS || ''],
        }),
        queryClient.invalidateQueries({ queryKey: ['dynamicFields'] }),
        queryClient.invalidateQueries({ queryKey: ['metadata'] }),
      ])
    },
    refetchSuiNS: () => {
      return queryClient.invalidateQueries({
        queryKey: ['suins', userAddress || ''],
      })
    },
  }
}

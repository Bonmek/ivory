import { useQuery } from '@tanstack/react-query'
import { suiService } from '@/services/suiService'

export const useSuiData = (address: string) => {
  // Fetch blobs
  const { data: blobs = [], isLoading: isLoadingBlobs } = useQuery({
    queryKey: ['blobs', address],
    queryFn: () => suiService.getBlobs(address),
    enabled: !!address,
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
      const metadataPromises = dynamicFields.flatMap((fields) =>
        fields.map((field) => suiService.getMetadata(field.objectId)),
      )
      return Promise.all(metadataPromises)
    },
    enabled: dynamicFields.length > 0,
  })

  return {
    blobs,
    dynamicFields,
    metadata,
    isLoading: isLoadingBlobs || isLoadingFields || isLoadingMetadata,
  }
}

import { DynamicFieldInfo, SuiClient } from '@mysten/sui/client'

const BLOB_TYPE = import.meta.env.VITE_BLOB_TYPE
const SUI_API_PROXY = import.meta.env.VITE_SUI_API_PROXY || '/api/sui'

const getApiUrl = () => {
  return SUI_API_PROXY
}

class SuiService {
  private client: SuiClient

  constructor() {
    this.client = new SuiClient({
      url: getApiUrl(),
    })
  }

  async getBlobs(address: string, filter?: { StructType: string }) {
    try {
      let allData: any[] = []
      let cursor: string | null = null
      let hasNextPage = true

      while (hasNextPage) {
        const {
          data,
          hasNextPage: nextPage,
          nextCursor,
        } = await this.client.getOwnedObjects({
          owner: address,
          filter: filter || { StructType: BLOB_TYPE as string },
          options: { showContent: true },
          cursor: cursor,
        })
        const blobsWithParent = data.map((blob) => ({
          ...blob,
          parentId: blob.data?.objectId || '',
        }))
        allData = [...allData, ...blobsWithParent]
        hasNextPage = nextPage
        cursor = nextCursor || null
      }

      return allData
    } catch (error) {
      console.error('Error fetching blobs:', error)
      throw error
    }
  }

  async getDynamicFields(blobId: string) {
    try {
      let allData: DynamicFieldInfo[] = []
      let cursor: string | null = null
      let hasNextPage = true

      while (hasNextPage) {
        const {
          data,
          hasNextPage: nextPage,
          nextCursor,
        } = await this.client.getDynamicFields({
          parentId: blobId,
          cursor: cursor,
        })

        const fieldsWithParent = data.map((field) => ({
          ...field,
          parentId: blobId,
        }))
        allData = [...allData, ...fieldsWithParent]
        hasNextPage = nextPage
        cursor = nextCursor || null
      }

      return allData
    } catch (error) {
      console.error('Error fetching dynamic fields:', error)
      throw error
    }
  }

  async getMetadata(objectId: string, parentId?: string) {
    try {
      const { data } = await this.client.getObject({
        id: objectId,
        options: { showContent: true },
      })
      return {
        ...data,
        parentId: parentId || '',
      }
    } catch (error) {
      console.error('Error fetching metadata:', error)
      throw error
    }
  }
}

export const suiService = new SuiService()

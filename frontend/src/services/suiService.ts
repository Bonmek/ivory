import { DynamicFieldInfo, getFullnodeUrl, SuiClient } from '@mysten/sui/client'

const SUI_NETWORK = process.env.REACT_APP_SUI_NETWORK
const BLOB_TYPE = process.env.REACT_APP_BLOB_TYPE

class SuiService {
  private client: SuiClient

  constructor() {
    this.client = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet') })
  }

  async getBlobs(address: string) {
    try {
      console.log('Fetching blobs for address:', address)
      let allData: any[] = []
      let cursor: string | null = null
      let hasNextPage = true

      while (hasNextPage) {
        const { data, hasNextPage: nextPage, nextCursor } = await this.client.getOwnedObjects({
          owner: address,
          filter: { StructType: BLOB_TYPE as string },
          options: { showContent: true },
          cursor: cursor
        })
        allData = [...allData, ...data]
        hasNextPage = nextPage
        cursor = nextCursor || null
      }

      console.log('Fetched all blobs:', allData)
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
        const { data, hasNextPage: nextPage, nextCursor } = await this.client.getDynamicFields({ 
          parentId: blobId,
          cursor: cursor
        })
        
        allData = [...allData, ...data]
        hasNextPage = nextPage
        cursor = nextCursor || null
      }

      return allData
    } catch (error) {
      console.error('Error fetching dynamic fields:', error)
      throw error
    }
  }

  async getMetadata(objectId: string) {
    try {
      const { data } = await this.client.getObject({
        id: objectId,
        options: { showContent: true },
      })
      return data
    } catch (error) {
      console.error('Error fetching metadata:', error)
      throw error
    }
  }
}

export const suiService = new SuiService() 
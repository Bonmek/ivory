import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { suiService } from '@/service/suiService'
import apiClient from '@/lib/axiosConfig'
import { linkSuinsToSite as linkSuinsToSiteBlockchain } from '@/utils/suinsUtils'

const MAX_RETRIES = 10
const POLLING_INTERVAL = 2000

const waitForSuinsUpdate = async (objectId: string, suinsName: string) => {
  let retries = 0
  
  while (retries < MAX_RETRIES) {
    try {
      const metadata = await suiService.getMetadata(objectId)
      // Type assertion for the nested structure
      const suiNs = (metadata as any)?.data?.content?.fields?.sui_ns
      if (suiNs === suinsName) {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL))
      retries++
    } catch (error) {
      console.error('Error polling SUINS state:', error)
      throw error
    }
  }
  
  throw new Error('Timeout waiting for SUINS update')
}

export const useSuinsManagement = (userAddress: string) => {
  const queryClient = useQueryClient()
  const [isLinking, setIsLinking] = useState(false)

  const linkSuinsToSite = async (
    suinsData: { objectId: string; name: string },
    parentId: string,
    walletAddress: string,
    signAndExecuteTransactionBlock: any,
    network: 'mainnet' | 'testnet',
  ) => {
    try {
      setIsLinking(true)

      // 1. Call blockchain transaction with objectId
      const txResult = await linkSuinsToSiteBlockchain(
        suinsData.objectId, // Use objectId for blockchain
        parentId,
        walletAddress,
        signAndExecuteTransactionBlock,
        network
      )

      // 2. If blockchain transaction successful, update our API with name
      if (txResult.status === 'success') {
        const response = await apiClient.put(
          `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_SET_ATTRIBUTES!}?object_id=${parentId}&sui_ns=${suinsData.name}`, // Use name for server
        )

        if (!response.data || response.data.statusCode !== 1) {
          throw new Error(response.data?.error || 'Failed to link SUINS')
        }

        // 3. Poll for state update with name
        await waitForSuinsUpdate(parentId, suinsData.name)

        // 4. Refetch metadata to update UI
        await queryClient.refetchQueries({ queryKey: ['metadata'] })
        toast.success('SUINS linked successfully')

        return { status: 'success' }
      }

      throw new Error('Blockchain transaction failed')
    } catch (error: any) {
      console.error('Error linking SUINS:', error)
      toast.error(error.message || 'Failed to link SUINS')
      throw error
    } finally {
      setIsLinking(false)
    }
  }

  return {
    linkSuinsToSite,
    isLinking,
    setIsLinking
  }
} 
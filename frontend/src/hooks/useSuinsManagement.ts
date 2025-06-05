import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/lib/axiosConfig'
import { Transaction } from '@mysten/sui/transactions'

import { linkSuinsToSite as linkSuinsToSiteBlockchain } from '../utils/suinsUtils'

export const useSuinsManagement = (userAddress: string) => {
  const queryClient = useQueryClient()
  const [isLinking, setIsLinking] = useState(false)

  const linkSuinsToSite = async (
    suinsObjectId: string,
    siteId: string,
    walletAddress: string,
    signAndExecuteTransactionBlock: (input: { transactionBlock: Transaction }) => Promise<any>,
    network: 'mainnet' | 'testnet',
  ) => {
    try {
      setIsLinking(true)

      // 1. Call blockchain transaction
      const txResult = await linkSuinsToSiteBlockchain(
        suinsObjectId,
        siteId,
        walletAddress,
        signAndExecuteTransactionBlock,
        network
      )

      // 2. If blockchain transaction successful, update our API
      if (txResult.status === 'success') {
        const response = await apiClient.put(
          `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_SET_ATTRIBUTES!}?object_id=${siteId}&sui_ns=${suinsObjectId}`,
        )

        if (!response.data || response.data.statusCode !== 1) {
          throw new Error(response.data?.error || 'Failed to link SUINS')
        }

        // Refetch metadata to update UI
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
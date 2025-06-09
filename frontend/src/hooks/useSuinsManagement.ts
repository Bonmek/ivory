import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/lib/axiosConfig'
import { linkSuinsToSite as linkSuinsToSiteBlockchain } from '@/utils/suinsUtils'
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client'
import { SuinsClient, SuinsTransaction, ALLOWED_METADATA } from '@mysten/suins'
import { Transaction } from '@mysten/sui/transactions'
import { handleSuinsStateUpdate } from '@/utils/statePolling'

export const useSuinsManagement = (userAddress: string) => {
  const queryClient = useQueryClient()
  const [isLinking, setIsLinking] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState<{
    gasFee: string;
    linkFee: string;
    total: string;
  } | null>(null)

  const estimateTransactionFee = async (
    suinsData: { objectId: string; name: string },
    parentId: string,
    network: 'mainnet' | 'testnet' = 'mainnet'
  ) => {
    try {
      // Create Sui client
      const client = new SuiClient({ url: getFullnodeUrl(network) })
      
      // Create SUINS client
      const suinsClient = new SuinsClient({
        client,
        network,
      })

      // Create transaction for estimation
      const tx = new Transaction()
      const suinsTx = new SuinsTransaction(suinsClient, tx)

      // Set data same as actual transaction
      suinsTx.setUserData({
        nft: suinsData.objectId,
        key: ALLOWED_METADATA.walrusSiteId,
        value: parentId,
        isSubname: false,
      })

      // Set sender
      tx.setSender(userAddress)

      // Build transaction
      const txBytes = await tx.build({ client: suinsClient.client })

      // Get gas estimate
      const gasEstimate = await client.dryRunTransactionBlock({
        transactionBlock: txBytes,
      })

      // Convert gas units to SUI (1 SUI = 1,000,000,000 units)
      const gasFee = Number(gasEstimate.effects?.gasUsed?.computationCost || 0) / 1000000000
      
      setEstimatedFee({
        gasFee: gasFee.toFixed(5),
        linkFee: '0.00',
        total: gasFee.toFixed(5)
      })

      return true
    } catch (error) {
      console.error('Error estimating fee:', error)
      return false
    }
  }

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
        suinsData.objectId,
        parentId,
        walletAddress,
        signAndExecuteTransactionBlock,
        network
      )

      // 2. If blockchain transaction successful, update our API
      if (txResult.status === 'success') {
        const response = await apiClient.put(
          `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_SET_ATTRIBUTES!}?object_id=${parentId}&sui_ns=${suinsData.name}`,
        )

        if (!response.data || response.data.statusCode !== 1) {
          throw new Error(response.data?.error || 'Failed to link SUINS')
        }

        // 3. Poll for state update using common handler
        await handleSuinsStateUpdate(parentId, suinsData.name)

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
    estimatedFee,
    estimateTransactionFee
  }
} 
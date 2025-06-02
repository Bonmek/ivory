import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/lib/axiosConfig'
import { waitForStateUpdate, checkMemberState } from '@/utils/statePolling'
import { useSuiData } from './useSuiData'

export const useOwnershipTransfer = (userAddress: string) => {
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const { refetch } = useSuiData(userAddress)

  const transferOwnership = async (objectId: string, newOwnerAddress: string) => {
    try {
      setIsProcessing(true)
      const response = await apiClient.put(
        `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_TRANSFER_OWNER!}?object_id=${objectId}&new_owner_address=${newOwnerAddress}`,
      )

      if (!response.data || response.data.statusCode !== 1) {
        throw new Error(response.data?.error || 'Failed to transfer ownership')
      }

      await waitForStateUpdate(objectId, checkMemberState(newOwnerAddress))
      queryClient.invalidateQueries({ queryKey: ['project', objectId] })
      await refetch()

      toast.success('Ownership transferred successfully')
    } catch (error: any) {
      console.error('Error transferring ownership:', error)
      toast.error(error.message || 'Failed to transfer ownership')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    transferOwnership,
    isProcessing
  }
} 
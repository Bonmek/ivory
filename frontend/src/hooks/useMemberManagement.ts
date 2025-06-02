import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { suiService } from '@/service/suiService'
import apiClient from '@/lib/axiosConfig'
import { SuiObjectResponse } from '@mysten/sui.js/client'
import { MemberPermissions } from '@/types/project'
import { createMemberStrings } from '@/utils/memberUtils'
import { waitForStateUpdate, checkMemberState } from '@/utils/statePolling'

export const useMemberManagement = () => {
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isRemovingMember, setIsRemovingMember] = useState(false)
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false)

  const addMember = async (
    objectId: string,
    address: string,
    permissions: MemberPermissions,
    currentMembers: Array<{ address: string; permissions: MemberPermissions }>,
  ) => {
    try {
      setIsAddingMember(true)
      const allMembers = [...currentMembers, { address, permissions }]
      const memberString = createMemberStrings(allMembers)

      const response = await apiClient.put(
        `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_GRANT_ACCESS!}?object_id=${objectId}&member_address_n_access=${memberString}`,
      )

      if (!response.data || response.data.statusCode !== 1) {
        throw new Error(response.data?.error || 'Failed to add member')
      }

      await waitForStateUpdate(objectId, checkMemberState(memberString))
      queryClient.invalidateQueries({ queryKey: ['project', objectId] })
      queryClient.invalidateQueries({ queryKey: ['members', objectId] })

      toast.success('Member added successfully')
    } catch (error: any) {
      console.error('Error adding member:', error)
      toast.error(error.message || 'Failed to add member')
      throw error
    } finally {
      setIsAddingMember(false)
    }
  }

  const removeMember = async (
    objectId: string,
    addressToRemove: string,
    currentMembers: Array<{ address: string; permissions: MemberPermissions }>,
  ) => {
    try {
      setIsRemovingMember(true)
      const remainingMembers = currentMembers.filter(
        (member) => member.address !== addressToRemove,
      )
      const memberString = createMemberStrings(remainingMembers)

      const response = await apiClient.put(
        `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_GRANT_ACCESS!}?object_id=${objectId}&member_address_n_access=${memberString}`,
      )

      if (!response.data || response.data.statusCode !== 1) {
        throw new Error(response.data?.error || 'Failed to remove member')
      }

      await waitForStateUpdate(objectId, checkMemberState(memberString))
      queryClient.invalidateQueries({ queryKey: ['project', objectId] })
      queryClient.invalidateQueries({ queryKey: ['members', objectId] })

      toast.success('Member removed successfully')
    } catch (error: any) {
      console.error('Error removing member:', error)
      toast.error(error.message || 'Failed to remove member')
      throw error
    } finally {
      setIsRemovingMember(false)
    }
  }

  const updateMemberPermissions = async (
    objectId: string,
    memberString: string,
    onSuccess?: () => void,
  ) => {
    let previousData

    try {
      setIsUpdatingPermissions(true)
      previousData = queryClient.getQueryData(['project', objectId])

      const response = await apiClient.put(
        `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_GRANT_ACCESS!}?object_id=${objectId}&member_address_n_access=${memberString}`,
      )

      if (!response.data || response.data.statusCode !== 1) {
        throw new Error(response.data?.error || 'Failed to update permissions')
      }

      await waitForStateUpdate(objectId, checkMemberState(memberString))
      queryClient.invalidateQueries({ queryKey: ['project', objectId] })
      queryClient.invalidateQueries({ queryKey: ['members', objectId] })

      toast.success('Permissions updated successfully')
      onSuccess?.()
    } catch (error: any) {
      console.error('Error updating permissions:', error)
      if (previousData) {
        queryClient.setQueryData(['project', objectId], previousData)
      }
      toast.error(error.message || 'Failed to update permissions')
      throw error
    } finally {
      setIsUpdatingPermissions(false)
    }
  }

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
    addMember,
    removeMember,
    updateMemberPermissions,
    transferOwnership,
    isAddingMember,
    isRemovingMember,
    isUpdatingPermissions,
    isProcessing,
  }
} 
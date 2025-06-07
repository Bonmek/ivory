import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { suiService } from '@/service/suiService'
import apiClient from '@/lib/axiosConfig'
import { MemberPermissions } from '@/types/project'
import { createMemberStrings } from '@/utils/memberUtils'
import { handleMemberStateUpdate } from '@/utils/statePolling'

export const useMemberManagement = () => {
  const queryClient = useQueryClient()
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

      await handleMemberStateUpdate(objectId, memberString)
      await queryClient.refetchQueries({ queryKey: ['metadata'] })
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

      // Handle case when removing last member
      const memberString = remainingMembers.length === 0 ? "" : createMemberStrings(remainingMembers)

      const response = await apiClient.put(
        `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_GRANT_ACCESS!}?object_id=${objectId}&member_address_n_access=${memberString}`,
      )

      if (!response.data || response.data.statusCode !== 1) {
        throw new Error(response.data?.error || 'Failed to remove member')
      }

      await handleMemberStateUpdate(objectId, memberString)
      await queryClient.refetchQueries({ queryKey: ['metadata'] })
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

      await handleMemberStateUpdate(objectId, memberString)
      await queryClient.refetchQueries({ queryKey: ['metadata'] })
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

  return {
    addMember,
    removeMember,
    updateMemberPermissions,
    isAddingMember,
    isRemovingMember,
    isUpdatingPermissions,
  }
} 
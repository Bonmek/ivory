import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/lib/axiosConfig'
import { waitForStateUpdate, checkSiteIdState, checkDeletionState } from '@/utils/statePolling'

export const useSiteManagement = () => {
  const queryClient = useQueryClient()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const generateSiteId = async (objectId: string): Promise<void> => {
    try {
      setIsGenerating(true)
      await apiClient.put(
        `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_ADD_SITE_ID!}?object_id=${objectId}`,
      )

      await waitForStateUpdate(objectId, checkSiteIdState)
      queryClient.invalidateQueries({ queryKey: ['project', objectId] })

      toast.success('Site ID generated successfully')
    } catch (error: any) {
      console.error('Error generating site ID:', error)
      toast.error(error.message || 'Failed to generate Site ID')
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteSite = async (objectId: string): Promise<void> => {
    try {
      setIsDeleting(true)
      await apiClient.delete(
        `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_DELETE_WEBSITE!}?object_id=${objectId}`,
      )

      await waitForStateUpdate(objectId, checkDeletionState)
      queryClient.invalidateQueries({ queryKey: ['project', objectId] })

      toast.success('Site deleted successfully')
    } catch (error: any) {
      console.error('Error deleting site:', error)
      toast.error(error.message || 'Failed to delete site')
      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    generateSiteId,
    deleteSite,
    isGenerating,
    isDeleting
  }
} 
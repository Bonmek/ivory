import { Project } from '@/types/project'

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatShortDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export const calculateTimeBetween = (date1: Date, date2: Date) => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
  
  return { days, hours, minutes, totalMs: diffTime }
}

export const formatBuildTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

export const getStatusColor = (status?: number) => {
  switch (status) {
    case 1:
      return {
        card: 'bg-primary-900/90 hover:bg-primary-900 border-secondary-500/10 hover:border-secondary-500/30',
        indicator: 'bg-secondary-400',
        text: 'text-secondary-400',
        badge: 'bg-secondary-500/20 text-secondary-300',
        link: 'text-secondary-300 hover:text-secondary-400',
        date: 'text-secondary-300',
        dropdown:
          'text-secondary-300 hover:text-white hover:bg-secondary-500/20',
        avatar: 'border-secondary-500/50',
        shadow: 'shadow-secondary-500/5',
      }
    case 0:
      return {
        card: 'bg-primary-900/90 hover:bg-primary-900 border-yellow-500/10 hover:border-yellow-500/30',
        text: 'text-yellow-400',
        badge: 'bg-yellow-500/20 text-yellow-300',
        link: 'text-yellow-300 hover:text-yellow-400',
        date: 'text-yellow-300',
        dropdown: 'text-yellow-300 hover:text-white hover:bg-yellow-500/20',
        avatar: 'border-yellow-500/50',
        shadow: 'shadow-yellow-500/5',
      }
    case 2:
      return {
        card: 'bg-primary-900/90 hover:bg-primary-900 border-red-500/10 hover:border-red-500/30',
        text: 'text-red-400',
        badge: 'bg-red-500/20 text-red-300',
        link: 'text-red-300 hover:text-red-400',
        date: 'text-red-300',
        dropdown: 'text-red-300 hover:text-white hover:bg-red-500/20',
        avatar: 'border-red-500/50',
        shadow: 'shadow-red-500/5',
      }
    case 3:
      return {
        card: 'bg-primary-900/90 hover:bg-primary-900 border-gray-500/10 hover:border-gray-500/30',
        text: 'text-gray-400',
        badge: 'bg-gray-500/20 text-gray-300',
        link: 'text-gray-300 hover:text-gray-400',
        date: 'text-gray-300',
        dropdown: 'text-gray-300 hover:text-white hover:bg-gray-500/20',
        avatar: 'border-gray-500/50',
        shadow: 'shadow-gray-500/5',
      }
    default:
      return {
        card: 'bg-primary-900/90 hover:bg-primary-900 border-secondary-500/10 hover:border-secondary-500/30',
        indicator: 'bg-secondary-400',
        text: 'text-secondary-400',
        badge: 'bg-secondary-500/20 text-secondary-300',
        link: 'text-secondary-300 hover:text-secondary-400',
        date: 'text-secondary-300',
        dropdown:
          'text-secondary-300 hover:text-white hover:bg-secondary-500/20',
        avatar: 'border-secondary-500/50',
        shadow: 'shadow-secondary-500/5',
      }
  }
}

export const getUserPermissions = (userAddress: string | undefined, project: Project) => {
  if (!userAddress) return null
  
  // Check if user is the owner
  if (project.owner === userAddress) {
    return {
      update: true,
      delete: true,
      generateSite: true,
      setSuins: true
    }
  }
  
  // If not owner, check member permissions
  return project.members?.find(member => member.address === userAddress)?.permissions || null
} 
import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { address, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  // if (!address) {
  //   // Redirect to home page but save the attempted url
  //   return <Navigate to="/" state={{ from: location }} replace />
  // }

  return <>{children}</>
} 
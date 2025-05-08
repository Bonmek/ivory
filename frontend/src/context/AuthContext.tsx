import { createContext, useContext, ReactNode } from 'react'
import { useWalletKit } from '@mysten/wallet-kit'

interface AuthContextType {
  isAuthenticated: boolean
  address: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { currentAccount } = useWalletKit()

  const value = {
    isAuthenticated: !!currentAccount?.address,
    address: currentAccount?.address || null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
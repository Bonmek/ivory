import { loginWithFacebook } from '@/service/FacebookOAuthService'
import { loginWithGoogle } from '@/service/GoogleAuthService'
import { getZkloginAddress, logoutZklogin } from '@/service/SuiZkLoginService'
import { useSuiClient } from '@mysten/dapp-kit'
<<<<<<< Updated upstream
=======
import { useWalletKit } from '@mysten/wallet-kit'
>>>>>>> Stashed changes
import React, { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  zkloginAddress: string | null
<<<<<<< Updated upstream
=======
  currentAccount: { address: string } | null
  address: string | null
  isLoading: boolean
>>>>>>> Stashed changes
  login: ({ authType }: AuthProps) => Promise<void>
  logout: () => void
}

interface AuthProps {
  authType: 'google' | 'facebook'
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [zkloginAddress, setZkloginAddress] = useState<string | null>(null)
<<<<<<< Updated upstream
  const suiClient = useSuiClient()
=======
  const [isLoading, setIsLoading] = useState(true)
  const { currentAccount } = useWalletKit()
  const suiClient = useSuiClient()
 
  const address = currentAccount?.address || zkloginAddress
>>>>>>> Stashed changes

  const login = async ({ authType }: AuthProps) => {
    switch (authType) {
      case 'google':
        await loginWithGoogle(suiClient)
        break
      case 'facebook':
        await loginWithFacebook(suiClient)
        break
      default:
        throw new Error('Invalid Parameter')
    }
  }

  const logout = () => {
    logoutZklogin()
    setZkloginAddress(null)
  }

  useEffect(() => {
    const interval = setInterval(() => {
<<<<<<< Updated upstream
      setZkloginAddress(getZkloginAddress())
=======
      const address = getZkloginAddress()
      setZkloginAddress(address)
      setIsLoading(false)
>>>>>>> Stashed changes
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
<<<<<<< Updated upstream
    <AuthContext.Provider value={{ zkloginAddress, login, logout }}>
=======
    <AuthContext.Provider value={{ zkloginAddress, currentAccount, address, isLoading, login, logout }}>
>>>>>>> Stashed changes
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

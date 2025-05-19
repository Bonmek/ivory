import { WalletKitProvider } from '@mysten/wallet-kit'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from '@wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { RouterProvider } from 'react-router'
import router from './router'
import '@mysten/dapp-kit/dist/index.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { IntlProvider } from '@/i18n/IntlProvider'

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'

const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
})

const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
}

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <IntlProvider>
          <SuiClientProvider networks={networks} defaultNetwork="testnet">
            <WalletProvider>
              <WagmiProvider config={wagmiConfig}>
                <AuthProvider>{children}</AuthProvider>
              </WagmiProvider>
            </WalletProvider>
          </SuiClientProvider>
        </IntlProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

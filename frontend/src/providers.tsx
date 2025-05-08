import { WalletKitProvider } from '@mysten/wallet-kit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected } from '@wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { RouterProvider } from 'react-router';
import router from './router';

const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletKitProvider>
        <WagmiProvider config={wagmiConfig}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </WagmiProvider>
      </WalletKitProvider>
    </QueryClientProvider>
  );
}
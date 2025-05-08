import React from 'react'
import ReactDOM from 'react-dom/client'
import './global.css'

import App from './App'
import { Providers } from './providers'
import { ThemeProvider } from './context/ThemeContext'
import { WalletKitProvider } from '@mysten/wallet-kit'
import { BrowserRouter } from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root')!)

// Setup MSW mock server in development
if (process.env.NODE_ENV === 'development') {
  import('../mocks/browser')
    .then(async ({ worker }) => {
      return worker.start()
    })
    .then(() => {
      root.render(
        <WalletKitProvider>
          <ThemeProvider>
            <React.StrictMode>
                <Providers>
                  <App />
                </Providers>
            </React.StrictMode>
          </ThemeProvider>
        </WalletKitProvider>,
      )
    })
} else if (process.env.NODE_ENV === 'production') {
  root.render(
    <WalletKitProvider>
      <ThemeProvider>
        <React.StrictMode>
            <Providers>
              <App />
            </Providers>
        </React.StrictMode>
      </ThemeProvider>
    </WalletKitProvider>,
  )
}

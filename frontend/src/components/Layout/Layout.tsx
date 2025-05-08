import type { PropsWithChildren } from 'react'
import React from 'react'
import { useLocation } from 'react-router'

import styles from './Layout.module.css'
import Footer from '../Footer'
import { ThemeProvider } from '@/context/ThemeContext'
import Navbar from '../Navbar'
import clsx from 'clsx'
import ThreeJSBackground from '../ThreeJsBackground'

const Layout: React.FC<PropsWithChildren> = ({ children, ...rest }) => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <main className={styles.layout} {...rest}>
      <div className="bg-gradient-to-b from-black via-primary-900/20 to-black relative overflow-hidden">
        <ThreeJSBackground />
        <div
          className={clsx(
            'relative flex h-full min-h-[calc(100vh-8rem)] w-full flex-1 flex-col p-0 max-w-7xl mx-auto',
            !isHomePage && 'mt-20 md:mt-28 px-8 md:px-0'
          )}
        >
          <Navbar />
          <div className={styles.container}>{children}</div>
        </div>
      </div>
    </main>
  )
}

export default Layout

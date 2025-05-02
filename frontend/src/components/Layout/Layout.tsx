import type { PropsWithChildren } from 'react'
import React from 'react'

import styles from './Layout.module.css'
import { Navbar } from '../Navbar'
import Footer from '../Footer'
import { ThemeProvider } from '@/context/ThemeContext'

const Layout: React.FC<PropsWithChildren> = ({ children, ...rest }) => {
  return (
    <main className={styles.layout} {...rest}>
      <Navbar/>
      <div className={styles.container}>{children}</div>
    </main>
  )
}

export default Layout

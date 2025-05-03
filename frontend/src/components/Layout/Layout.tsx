import type { PropsWithChildren } from 'react'
import React from 'react'

import styles from './Layout.module.css'
import Footer from '../Footer'
import { ThemeProvider } from '@/context/ThemeContext'
import Navbar from '../Navbar'

const Layout: React.FC<PropsWithChildren> = ({ children, ...rest }) => {
  return (
    <main className={styles.layout} {...rest}>
      <Navbar/>
      <div className={styles.container}>{children}</div>
    </main>
  )
}

export default Layout

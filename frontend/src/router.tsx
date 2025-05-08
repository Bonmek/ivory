import { createBrowserRouter } from 'react-router'

import Layout from './components/Layout/Layout'
import Index from './pages/Index'
import Notfound from './pages/Notfound'
import HomePage from './pages/Home'
import CreateWebsitePage from './pages/CreateWebsite'
import HowToUsePage from './pages/Howtouse'
import DashboardPage from './pages/Dashboard'
import Callback from './pages/Callback'

import EditWebsitePage from './pages/EditWebsite'
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },
  {
    path: '/create-website',
    element: (
      <Layout>
        <CreateWebsitePage />
      </Layout>
    ),
  },
  {
    path: '/how-to-use',
    element: (
      <Layout>
        <HowToUsePage />
      </Layout>
    ),
  },
  {
    path: '/edit-website',
    element: (
      <Layout>
        <EditWebsitePage />
      </Layout>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <Layout>
        <DashboardPage />
      </Layout>
    ),
  },
  {
    path: '/create-website',
    element: (
      <Layout>
        <CreateWebsitePage />
      </Layout>
    ),
  },
  {
    path: '*',
    element: (
      <Layout>
        <Notfound />
      </Layout>
    ),
  },
  {
    path: '*',
    element: (
      <Layout>
        <Notfound />
      </Layout>
    ),
  },
  {
    path: '/callback',
    element: (
      <Layout>
        <Callback />
      </Layout>
    ),
  },
])

export default router

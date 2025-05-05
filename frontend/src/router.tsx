import { createBrowserRouter } from 'react-router'

import Layout from './components/Layout/Layout'
import Index from './pages/Index'
import Notfound from './pages/Notfound'
import HomePage from './pages/Home'
import CreateWebsitePage from './pages/CreateWebsite'
import GuidePage from './pages/Guide'
import DashboardPage from './pages/Dashboard'
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
    path: '/guide',
    element: (
      <Layout>
        <GuidePage />
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
])

export default router

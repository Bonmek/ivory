import { createBrowserRouter } from 'react-router'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Dashboard from '@/pages/Dashboard'

import Layout from './components/Layout/Layout'
import Index from './pages/Index'
import Notfound from './pages/Notfound'
import HomePage from './pages/Home'
import CreateWebsitePage from './pages/CreateWebsite'
import HowToUsePage from './pages/Howtouse'
import DashboardPage from './pages/Dashboard'
import Callback from './pages/Callback'
import EditWebsitePage from './pages/EditWebsite'
import UploadZipPage from './pages/UploadZip'
// import EditWebsitePage from './pages/EditWebsite'
import AboutUs from './pages/AboutUs'


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
        <ProtectedRoute>
          <CreateWebsitePage />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/upload-zip',
    element: (
      <Layout>
        <ProtectedRoute>
          <UploadZipPage />
        </ProtectedRoute>
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
  // {
  //   path: '/edit-website',
  //   element: (
  //     <Layout>
  //       <EditWebsitePage />
  //     </Layout>
  //   ),
  // },
  // {
  //   path: '/edit-website/:id',
  //   element: (
  //     <Layout>
  //       <EditWebsitePage />
  //     </Layout>
  //   ),
  // },
  {
    path: '/dashboard',
    element: (
      <Layout>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/about',
    element: (
      <Layout>
        <AboutUs />
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

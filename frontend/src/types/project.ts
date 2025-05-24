export interface Project {
  id: number
  name: string
  url: string
  startDate: Date
  expiredDate: Date
  color: string
  urlImg: string
  description?: string
  status: number
  siteId?: string
  suins?: string
  blobId?: string
  installCommand?: string
  buildCommand?: string
  defaultRoute?: string
  isBuild?: boolean
  epochs?: number
  ownership?: number
  client_error_description?: string
  parentId?: string
  showcase_url?: string
  site_status?: number
}

export interface ProjectCardProps {
  project: Project
  index: number
  onHoverStart: (id: number) => void
  onHoverEnd: () => void
  userAddress: string
  onRefetch: () => Promise<void>
}

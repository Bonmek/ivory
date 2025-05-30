export interface MemberPermissions {
  update: boolean
  delete: boolean
  generateSite: boolean
  setSuins: boolean
}

export interface ProjectMember {
  address: string
  permissions: MemberPermissions
}

export enum ProjectStatus {
  BUILDING = 0,
  ACTIVE = 1,
  FAILED = 2,
  DELETING = 3
}

export interface Project {
  id: number
  name: string
  url: string
  startDate: Date
  expiredDate: Date
  color: string
  urlImg: string
  description?: string
  status: ProjectStatus
  siteId?: string
  suins?: string
  blobId?: string
  installCommand?: string
  buildCommand?: string
  defaultRoute?: string
  isBuild?: boolean
  epochs?: number
  ownership?: number
  parentId?: string
  client_error_description?: string
  showcase_url?: string
  site_status?: number
  memberString?: string
  members?: ProjectMember[]
  owner: string
}

export interface ProjectCardProps {
  project: Project
  index: number
  onHoverStart: (id: number) => void
  onHoverEnd: () => void
  userAddress?: string
  onRefetch: () => Promise<void>
}

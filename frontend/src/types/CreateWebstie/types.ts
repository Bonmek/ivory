import { CacheControl } from './enums'

export interface buildOutputSettingsType {
  rootDirectory: string
  buildCommand: string
  outputDirectory: string
}

export interface advancedOptionsType {
  cacheControl: CacheControl
  route: {
    name: string
    path: string
  }[]
  defaultPath: string
}

export interface Repository {
  id: number
  name: string
  complete_name: string
  default_branch: string
  description: string | null
  html_url: string
  language: string
  owner: string
  private: boolean
  updated_at: string
  visibility: string
}

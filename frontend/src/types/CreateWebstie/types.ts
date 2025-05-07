import { CacheControl } from './enums'

export interface buildOutputSettingsType {
  buildCommand: string
  outputDirectory: string
  installCommand: string
}

export interface advancedOptionsType {
  rootDirectory: string
  cacheControl: CacheControl
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

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  response?: {
    status: number;
  };
}

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

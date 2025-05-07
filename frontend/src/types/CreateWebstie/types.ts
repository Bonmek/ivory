import { CacheControl } from './enums'

export interface buildOutputSettingsType {
  rootDirectory: string
  buildCommand: string
  outputDirectory: string
  installCommand: string
}

export interface advancedOptionsType {
  cacheControl: CacheControl
  defaultPath: string
}

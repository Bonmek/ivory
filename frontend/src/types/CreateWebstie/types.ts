import { CacheControl } from './enums'

export interface buildOutputSettingsType {
  rootDirectory: string
  buildCommand: string
  outputDirectory: string
}

export interface advancedOptionsType {
  cacheControl: CacheControl
  defaultPath: string
}

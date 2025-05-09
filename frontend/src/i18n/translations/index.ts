import enUS from './en-US'
import zhCN from './zh-CN'

export const messages = {
  'en-US': enUS,
  'zh-CN': zhCN,
} as const

// Type for message IDs
export type MessageId = keyof typeof enUS

// Type guard for available locales
export type AvailableLocale = keyof typeof messages 
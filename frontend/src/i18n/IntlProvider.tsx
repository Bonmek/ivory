import { IntlProvider as ReactIntlProvider } from 'react-intl'
import { useLanguage } from '@/context/LanguageContext'
import { messages } from './translations'

export const IntlProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage()
  
  return (
    <ReactIntlProvider messages={messages[language as keyof typeof messages]} locale={language}>
      {children}
    </ReactIntlProvider>
  )
} 
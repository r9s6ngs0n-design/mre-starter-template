import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { NavigationProvider } from '@/contexts/navigation-context'
import { getDocumentsForPlacement } from '@/lib/queries-server'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const footerDocuments = await getDocumentsForPlacement('footer')

  return (
    <NavigationProvider>
      <SiteNav />
      {children}
      <SiteFooter documents={footerDocuments} />
    </NavigationProvider>
  )
}

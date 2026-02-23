import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'
import 'nextra-theme-docs/style.css'
import './docs.css'

export const metadata = {
  metadataBase: new URL('https://www.parsedocu.com'),
  title: {
    default: 'ParseDocu Documentation',
    template: '%s - ParseDocu Docs'
  },
  description: 'Complete API documentation, guides, and code examples for ParseDocu PDF to Markdown API. Learn about conversion, formatting, and integrations.',
  openGraph: {
    title: 'ParseDocu Documentation',
    description: 'Complete API documentation, guides, and code examples for ParseDocu PDF to Markdown API. Learn about conversion, formatting, and integrations.',
    siteName: 'ParseDocu',
    type: 'website',
  },
  twitter: {
    title: 'ParseDocu Documentation',
    description: 'Complete API documentation, guides, and code examples for ParseDocu PDF to Markdown API. Learn about conversion, formatting, and integrations.',
    card: 'summary_large_image' as const,
  },
}

const navbar = (
  <Navbar
    logo={
      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
        ParseDocu
      </span>
    }
    logoLink="https://www.parsedocu.com"
  />
)

const footer = <Footer>© {new Date().getFullYear()} ParseDocu. All rights reserved.</Footer>

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap('/docs')

  return (
    <Layout
      navbar={navbar}
      pageMap={pageMap}
      footer={footer}
      sidebar={{
        defaultMenuCollapseLevel: 1,
        toggleButton: true
      }}
      toc={{
        float: true,
        title: 'On this page'
      }}
      editLink={null}
      feedback={{ content: null }}
    >
      {children}
    </Layout>
  )
}

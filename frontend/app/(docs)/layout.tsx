import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import type { ReactNode } from 'react'
import 'nextra-theme-docs/style.css'
import './docs.css'

export const metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'YourApp Documentation',
    template: '%s - YourApp Docs'
  },
  description: 'Complete API documentation, guides, and code examples for YourApp PDF generation API. Learn about templates, data binding, and integrations.',
  openGraph: {
    title: 'YourApp Documentation',
    description: 'Complete API documentation, guides, and code examples for YourApp PDF generation API. Learn about templates, data binding, and integrations.',
    siteName: 'YourApp',
    type: 'website',
  },
  twitter: {
    title: 'YourApp Documentation',
    description: 'Complete API documentation, guides, and code examples for YourApp PDF generation API. Learn about templates, data binding, and integrations.',
    card: 'summary_large_image' as const,
  },
}

const navbar = (
  <Navbar
    logo={
      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
        YourApp
      </span>
    }
    logoLink="https://example.com"
  />
)

const footer = <Footer>© {new Date().getFullYear()} YourApp. All rights reserved.</Footer>

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

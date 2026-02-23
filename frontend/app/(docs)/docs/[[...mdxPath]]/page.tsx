import { generateStaticParamsFor, importPage } from 'nextra/pages'
// eslint-disable-next-line react-hooks/rules-of-hooks
import { useMDXComponents } from 'nextra-theme-docs'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

// This is not a React hook despite the name - it's a Nextra utility function
// eslint-disable-next-line react-hooks/rules-of-hooks
const components = useMDXComponents()
const Wrapper = components.wrapper

export async function generateMetadata(props: { params: Promise<{ mdxPath?: string[] }> }) {
  const params = await props.params
  const mdxPath = params.mdxPath ?? []
  const { metadata } = await importPage(mdxPath)

  // Build canonical URL from path
  const canonicalPath = mdxPath.length > 0 ? `/docs/${mdxPath.join('/')}` : '/docs'

  // Generate dynamic OG image URL from page title
  const ogTitle = metadata?.title || 'YourApp Documentation'
  const ogImageUrl = `https://example.com/og?title=${encodeURIComponent(ogTitle)}`

  return {
    ...metadata,
    alternates: {
      ...metadata?.alternates,
      canonical: canonicalPath,
    },
    openGraph: {
      title: ogTitle,
      description: metadata?.description || 'Complete API documentation for YourApp PDF generation API.',
      url: `https://example.com${canonicalPath}`,
      siteName: 'YourApp',
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: ogTitle,
      }],
      type: 'article',
    },
    twitter: {
      title: ogTitle,
      description: metadata?.description || 'Complete API documentation for YourApp PDF generation API.',
      card: 'summary_large_image',
      images: [ogImageUrl],
    },
  }
}

export default async function Page(props: { params: Promise<{ mdxPath?: string[] }> }) {
  const params = await props.params
  const mdxPath = params.mdxPath ?? []
  const { default: MDXContent, ...rest } = await importPage(mdxPath)

  if (Wrapper) {
    return (
      <Wrapper {...rest}>
        <MDXContent />
      </Wrapper>
    )
  }

  return <MDXContent />
}

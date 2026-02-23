import type { Metadata } from "next";
import config from "@/config";

// These are all the SEO tags you can add to your pages.
// It prefills data with default title/description/OG, etc.. and you can cusotmize it for each page.
// It's already added in the root layout.js so you don't have to add it to every pages
// But I recommend to set the canonical URL for each page (export const metadata = getSEOTags({canonicalUrlRelative: "/"});)
// See https://shipfa.st/docs/features/seo
export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
  extraTags,
}: Metadata & {
  canonicalUrlRelative?: string;
  extraTags?: Record<string, any>;
} = {}) => {
  const defaultTitle = `${config.appName} - Your App Tagline`;
  const baseUrl = `https://${config.domainName}`;
  const suffix = ` | ${config.appName}`;

  // Strip "| AppName" suffix if title exceeds 60 characters
  const truncateTitle = (t: string) =>
    t.length > 60 && t.endsWith(suffix) ? t.slice(0, -suffix.length) : t;

  // Auto-generate OG image URL using page title
  const ogTitle = truncateTitle(String(openGraph?.title || title || defaultTitle));
  const ogImageUrl = `${baseUrl}/og?title=${encodeURIComponent(ogTitle)}`;

  return {
    // up to 50 characters (what does your app do for the user?) > your main should be here
    title: truncateTitle(String(title || defaultTitle)),
    // up to 160 characters (how does your app help the user?)
    description: description || config.appDescription,
    // some keywords separated by commas. by default it will be your app name
    keywords: keywords || [config.appName],
    applicationName: config.appName,
    // set a base URL prefix for other fields that require a fully qualified URL (.e.g og:image: og:image: 'https://yourdomain.com/share.png' => '/share.png')
    metadataBase: new URL(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : `https://${config.domainName}/`
    ),

    openGraph: {
      title: truncateTitle(String(openGraph?.title || defaultTitle)),
      description: openGraph?.description || config.appDescription,
      url: openGraph?.url || (canonicalUrlRelative ? `${baseUrl}${canonicalUrlRelative}` : `${baseUrl}/`),
      siteName: config.appName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: String(openGraph?.title || defaultTitle),
        },
      ],
      locale: "en_US",
      type: "website",
    },

    twitter: {
      title: truncateTitle(String(openGraph?.title || defaultTitle)),
      description: openGraph?.description || config.appDescription,
      card: "summary_large_image",
      creator: "@your_twitter_handle",
      images: [ogImageUrl],
    },

    // If a canonical URL is given, we add it. The metadataBase will turn the relative URL into a fully qualified URL
    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),

    // If you want to add extra tags, you can pass them here
    ...extraTags,
  };
};

// Strctured Data for Rich Results on Google. Learn more: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
// Find your type here (SoftwareApp, Book...): https://developers.google.com/search/docs/appearance/structured-data/search-gallery
// Use this tool to check data is well structure: https://search.google.com/test/rich-results
// You don't have to use this component, but it increase your chances of having a rich snippet on Google.
// I recommend this one below to your /page.js for software apps: It tells Google your AppName is a Software.
// You can add aggregateRating once you have real reviews.
// See https://shipfa.st/docs/features/seo
// Renders FAQPage JSON-LD structured data for rich results
// items: array of { question: string, answer: string }
export const renderFAQSchema = (
  items: { question: string; answer: string }[]
) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }),
      }}
    />
  );
};

// Renders BreadcrumbList JSON-LD structured data
// items: array of { name: string, url: string }
export const renderBreadcrumbSchema = (
  items: { name: string; url: string }[]
) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        }),
      }}
    />
  );
};

// WebSite structured data — helps Google show sitelinks and understand the site entity.
// Add this to the homepage.
export const renderWebSiteSchema = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: config.appName,
          url: `https://${config.domainName}`,
          publisher: {
            "@type": "Organization",
            name: config.appName,
            legalName: "Your Company Name",
            url: `https://${config.domainName}`,
            logo: `https://${config.domainName}/icon.png`,
          },
        }),
      }}
    />
  );
};

// Organization structured data — helps Google recognize and trust the company entity.
// Add this to the root layout or homepage for site-wide entity recognition.
export const renderOrganizationSchema = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: config.appName,
          legalName: "Your Company Name",
          url: `https://${config.domainName}`,
          logo: `https://${config.domainName}/icon.png`,
          description: config.appDescription,
          foundingDate: "2024",
          // Update these with your company details:
          // taxID: "YOUR_TAX_ID",
          // vatID: "YOUR_VAT_ID",
          // address: {
          //   "@type": "PostalAddress",
          //   streetAddress: "Your Street Address",
          //   addressLocality: "City",
          //   postalCode: "12345",
          //   addressCountry: "US",
          // },
          contactPoint: {
            "@type": "ContactPoint",
            email: config.resend.supportEmail,
            contactType: "customer support",
            availableLanguage: ["English"],
          },
          // founder: {
          //   "@type": "Person",
          //   name: "Your Name",
          //   jobTitle: "Founder",
          //   sameAs: [
          //     "https://x.com/your_handle",
          //     "https://www.linkedin.com/in/your-profile/",
          //   ],
          // },
          // sameAs: [
          //   "https://x.com/your_handle",
          //   "https://www.linkedin.com/in/your-profile/",
          // ],
        }),
      }}
    />
  );
};

// Renders ItemList JSON-LD structured data for hub/directory pages
// items: array of { name: string, url: string, description?: string, position?: number }
export const renderItemListSchema = (
  items: { name: string; url: string; description?: string }[]
) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: item.url,
            ...(item.description && { description: item.description }),
          })),
        }),
      }}
    />
  );
};

export const renderSchemaTags = () => {
  // Generate offers from config - Free tier + paid plans
  const offers = [
    {
      "@type": "Offer",
      name: config.stripe.freeTier.name,
      price: "0",
      priceCurrency: "USD",
    },
    ...config.stripe.plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.price.toFixed(2),
      priceCurrency: "USD",
    })),
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: config.appName,
          description: config.appDescription,
          image: `https://${config.domainName}/icon.png`,
          url: `https://${config.domainName}/`,
          author: {
            "@type": "Organization",
            name: config.appName,
            legalName: "Your Company Name",
            url: `https://${config.domainName}`,
          },
          datePublished: "2024-01-01",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          offers,
        }),
      }}
    ></script>
  );
};

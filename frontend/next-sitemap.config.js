const { getLastModDate, initializeCaches } = require("./lib/sitemap-dates");

// Initialize caches once before sitemap generation starts
let initialized = false;

module.exports = {
  // REQUIRED: add your own domain name here (e.g. https://example.com),
  siteUrl: process.env.SITE_URL || "https://example.com",
  generateRobotsTxt: true,
  // use this to exclude routes from the sitemap (i.e. a user dashboard). By default, NextJS app router metadata files are excluded (https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
  exclude: [
    // Metadata image files (with extensions)
    "/twitter-image.*",
    "/opengraph-image.*",
    "/icon.*",
    "/**/twitter-image.*",
    "/**/opengraph-image.*",
    "/**/icon.*",
    // Metadata image routes (without extensions) - Next.js generates these as routes
    "/opengraph-image",
    "/twitter-image",
    "/icon",
    "**/opengraph-image",
    "**/twitter-image",
    "**/icon",
    // App pages to exclude
    "/sentry-example-page",
    "/signin",
    "/dashboard",
    "/dashboard/**",
    "/onboarding",
    "/onboarding/**",
    // Public editor pages (demo mode - not for indexing)
    "/templates/*/*/editor",
  ],
  transform: async (config, path) => {
    // Initialize caches on first transform call
    if (!initialized) {
      await initializeCaches();
      initialized = true;
    }

    // Get accurate lastmod from git or DB, fallback to build date
    const lastmod = (await getLastModDate(path)) || new Date().toISOString();

    // Homepage
    if (path === "/") {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 1.0,
        lastmod,
      };
    }

    // Core pages - content may change with new templates/integrations
    if (["/pricing", "/templates", "/integrations"].includes(path) || path === "/docs") {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.8,
        lastmod,
      };
    }

    // Tools, generators, individual integrations
    if (
      path.startsWith("/tools/") ||
      path.startsWith("/generators/") ||
      path.startsWith("/integrations/")
    ) {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.7,
        lastmod,
      };
    }

    // Individual templates - dynamic content from DB
    if (path.startsWith("/templates/")) {
      return {
        loc: path,
        changefreq: "monthly",
        priority: 0.6,
        lastmod,
      };
    }

    // Docs sub-pages
    if (path.startsWith("/docs/")) {
      return {
        loc: path,
        changefreq: "monthly",
        priority: 0.6,
        lastmod,
      };
    }

    // Legal pages
    if (["/tos", "/privacy-policy", "/security"].includes(path)) {
      return {
        loc: path,
        changefreq: "yearly",
        priority: 0.3,
        lastmod,
      };
    }

    // Hub pages (tools, generators without trailing path)
    if (["/tools", "/generators"].includes(path)) {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.8,
        lastmod,
      };
    }

    // Default
    return {
      loc: path,
      changefreq: "monthly",
      priority: 0.5,
      lastmod,
    };
  },
};

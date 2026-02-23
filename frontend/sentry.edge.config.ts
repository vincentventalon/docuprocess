// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only enable Sentry in production (not in local development)
const isProduction = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: "https://55522128c1779017ef8624a575caf458@o4510652231188480.ingest.de.sentry.io/4510652232630352",

  // Disable Sentry in local development
  enabled: isProduction,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

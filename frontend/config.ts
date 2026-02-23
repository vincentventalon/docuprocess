import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "Starterkit",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "API-first SaaS starter kit with FastAPI, Next.js, and Supabase. Ship your API product faster.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "example.com",
  // crisp: {
  //   // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
  //   id: "",
  //   // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
  //   onlyShowOnRoutes: ["/"],
  // },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    // Free tier configuration - all new users start here
    freeTier: {
      name: "Free",
      credits: 1000,
      apiKeys: 1,
      rateLimit: "60 requests/min",
      features: [
        "1,000 API requests/month",
        "1 API key",
        "Community support",
      ],
    },
    // Credits given to new users on signup (matches freeTier.credits)
    freeCreditsOnSignup: 1000,
    plans: [
      {
        name: "Starter",
        description: "Perfect for small projects",
        // Monthly pricing
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_dev_starter_monthly"
            : "price_prod_starter_monthly",
        price: 18,
        priceAnchor: 29,
        // Yearly pricing (10 months = ~17% discount)
        yearlyPriceId:
          process.env.NODE_ENV === "development"
            ? "price_dev_starter_yearly"
            : "price_prod_starter_yearly",
        yearlyPrice: 180,
        yearlyPriceAnchor: 348,
        // Plan limits
        credits: 10000,
        apiKeys: 5,
        features: [
          { name: "10,000 API requests" },
          { name: "5 API keys" },
          { name: "30 requests per minute" },
          { name: "Team collaboration" },
          { name: "Zapier, Make, n8n integrations" },
          { name: "Email support" },
          { name: "REST API access" },
        ],
      },
      {
        name: "Advanced",
        description: "You need more power",
        isFeatured: true,
        // Monthly pricing
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_dev_advanced_monthly"
            : "price_prod_advanced_monthly",
        price: 39,
        priceAnchor: 49,
        // Yearly pricing (10 months = ~17% discount)
        yearlyPriceId:
          process.env.NODE_ENV === "development"
            ? "price_dev_advanced_yearly"
            : "price_prod_advanced_yearly",
        yearlyPrice: 390,
        yearlyPriceAnchor: 588,
        // Plan limits
        credits: 100000,
        apiKeys: 20,
        features: [
          { name: "100,000 API requests" },
          { name: "20 API keys" },
          { name: "100 requests per minute" },
          { name: "Team collaboration" },
          { name: "Zapier, Make, n8n integrations" },
          { name: "Priority support" },
          { name: "REST API access" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `MyApp <noreply@email.example.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Support <support@example.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@example.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: "#570df8",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;

export type Theme =
  | "light"
  | "dark"
  | "cupcake"
  | "bumblebee"
  | "emerald"
  | "corporate"
  | "synthwave"
  | "retro"
  | "cyberpunk"
  | "valentine"
  | "halloween"
  | "garden"
  | "forest"
  | "aqua"
  | "lofi"
  | "pastel"
  | "fantasy"
  | "wireframe"
  | "black"
  | "luxury"
  | "dracula"
  | "";

export interface FreeTier {
  name: string;
  credits: number;
  templates: number;
  rateLimit: string;
  features: string[];
}

export interface ConfigProps {
  appName: string;
  appDescription: string;
  domainName: string;
  crisp?: {
    id?: string;
    onlyShowOnRoutes?: string[];
  };
  stripe: {
    freeTier: FreeTier;
    freeCreditsOnSignup: number;
    plans: {
      isFeatured?: boolean;
      isFree?: boolean;
      name: string;
      description?: string;
      // Monthly pricing
      priceId?: string;
      price: number;
      priceAnchor?: number;
      // Yearly pricing
      yearlyPriceId?: string;
      yearlyPrice?: number;
      yearlyPriceAnchor?: number;
      // Plan limits
      credits?: number;
      templates?: number;
      features: {
        name: string;
      }[];
    }[];
  };
  aws?: {
    bucket?: string;
    bucketUrl?: string;
    cdn?: string;
  };
  resend: {
    fromNoReply: string;
    fromAdmin: string;
    supportEmail?: string;
  };
  colors: {
    theme: Theme;
    main: string;
  };
  auth: {
    loginUrl: string;
    callbackUrl: string;
  };
}

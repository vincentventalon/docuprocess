import Link from "next/link";
import Image from "next/image";
import { Check, ArrowRight, Code, Table, Package, Zap, Send } from "lucide-react";

interface RecommendationItem {
  text: string;
}

interface Alternative {
  platform: string;
  href: string;
  reasons: string[];
  logo?: string | null;
  logoScale?: string;
  logoIcon?: "code" | "table" | "package" | "zap" | "send";
}

interface PlatformComparisonProps {
  currentPlatform: string;
  currentLogo?: string | null;
  currentLogoIcon?: "code" | "table" | "package" | "zap" | "send";
  currentLogoBg?: string;
  currentLogoScale?: string;
  recommendations: RecommendationItem[];
  alternatives: Alternative[];
}

const iconMap = {
  code: Code,
  table: Table,
  package: Package,
  zap: Zap,
  send: Send,
};

export function PlatformComparison({
  currentPlatform,
  currentLogo,
  currentLogoIcon,
  currentLogoBg,
  currentLogoScale,
  recommendations,
  alternatives,
}: PlatformComparisonProps) {
  const CurrentIcon = currentLogoIcon ? iconMap[currentLogoIcon] : null;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* When to use current platform */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-sm">
        {/* Recommended badge */}
        <div className="absolute -top-3 left-6">
          <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            Recommended
          </span>
        </div>

        {/* Logo + Title */}
        <div className="flex items-center gap-3 mb-5 mt-2">
          {currentLogo && (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-2">
              <Image
                src={currentLogo}
                alt={currentPlatform}
                width={56}
                height={56}
                className={`w-full h-full object-contain ${currentLogoScale || ""}`}
              />
            </div>
          )}
          {!currentLogo && CurrentIcon && (
            <div
              className="w-16 h-16 rounded-xl shadow-sm flex items-center justify-center"
              style={{ backgroundColor: currentLogoBg || "#1e293b" }}
            >
              <CurrentIcon className="w-8 h-8 text-white" />
            </div>
          )}
          <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-200">
            Use {currentPlatform} if you need:
          </h3>
        </div>

        <ul className="space-y-3">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-emerald-900 dark:text-emerald-100 font-medium">{rec.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link
            href="/signin"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors shadow-sm"
          >
            Start Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Alternatives */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h3 className="font-semibold text-muted-foreground mb-5">
          Or consider:
        </h3>
        <div className="space-y-5">
          {alternatives.map((alt, index) => {
            const AltIcon = alt.logoIcon ? iconMap[alt.logoIcon] : null;
            return (
              <div key={index} className="group">
                <Link
                  href={alt.href}
                  className="flex items-center gap-3 mb-2"
                >
                  {alt.logo && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center p-2">
                      <Image
                        src={alt.logo}
                        alt={alt.platform}
                        width={48}
                        height={48}
                        className={`w-full h-full object-contain ${alt.logoScale || ""}`}
                      />
                    </div>
                  )}
                  {!alt.logo && AltIcon && (
                    <div className="w-14 h-14 rounded-xl bg-slate-700 dark:bg-slate-600 shadow-sm flex items-center justify-center">
                      <AltIcon className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {alt.platform}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
                <ul className={`space-y-1 ${alt.logo || AltIcon ? "ml-[68px]" : "ml-0"}`}>
                  {alt.reasons.map((reason, reasonIndex) => (
                    <li
                      key={reasonIndex}
                      className="text-sm text-muted-foreground"
                    >
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

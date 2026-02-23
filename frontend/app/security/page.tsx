import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import {
  Shield,
  Server,
  Lock,
  FileText,
  KeyRound,
  AppWindow,
  CreditCard,
  Users,
  DatabaseBackup,
  Scale,
  Bug,
  AlertTriangle,
} from "lucide-react";

export const metadata = getSEOTags({
  title: `Data Protection & Security | ${config.appName}`,
  description: `Learn how ${config.appName} protects your data with enterprise-grade security. HTTPS encryption, stateless PDF processing, auto-deletion, and SOC 2 compliant infrastructure.`,
  keywords: [
    "PDF API security",
    "data protection",
    "GDPR",
    "encryption",
    "secure PDF generation",
    config.appName,
  ],
  canonicalUrlRelative: "/security",
  openGraph: {
    title: `Data Protection & Security | ${config.appName}`,
    description: `Learn how ${config.appName} protects your data with enterprise-grade security. HTTPS encryption, stateless PDF processing, auto-deletion, and SOC 2 compliant infrastructure.`,
    url: `https://${config.domainName}/security`,
  },
});

const sections = [
  {
    icon: Server,
    title: "Infrastructure Security",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    items: [
      "PDF generation runs on **Google Cloud Run**, which is SOC 2 Type II and ISO 27001 certified.",
      "Frontend hosted on **Vercel**, with automatic HTTPS, DDoS protection, and edge network distribution.",
      "Database and authentication powered by **Supabase** (built on AWS), with SOC 2 Type II compliance.",
      "All infrastructure providers maintain rigorous third-party security audits and certifications.",
    ],
  },
  {
    icon: Lock,
    title: "Data Encryption",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    items: [
      "All data in transit is encrypted using **HTTPS/TLS 1.2+** — no unencrypted connections are accepted.",
      "Data at rest is encrypted with **AES-256** across Supabase (database & storage) and Google Cloud.",
      "SSL certificates are automatically managed and renewed.",
    ],
  },
  {
    icon: FileText,
    title: "PDF Processing & Data Handling",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    items: [
      "PDF generation is **fully stateless** — each request is processed in an isolated container that is destroyed after completion.",
      "Template data and variables are processed **in memory only** and are never written to disk or logged.",
      "Generated PDF files are **automatically deleted after 30 minutes** from storage.",
      "We do not inspect, analyze, or retain the content of your generated documents.",
    ],
  },
  {
    icon: KeyRound,
    title: "Authentication & Access Control",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    items: [
      "User authentication is handled by **Supabase Auth** with secure JWT tokens.",
      "API access is protected with **unique API keys** scoped to each user account.",
      "Database access enforces **Row-Level Security (RLS)** — users can only access their own data.",
      "Internal systems follow the **principle of least privilege** for all access permissions.",
    ],
  },
  {
    icon: AppWindow,
    title: "Application Security",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    items: [
      "Generated PDF download URLs use **pre-signed URLs with expiration** — they cannot be guessed or accessed after expiry.",
      "API endpoints are protected with **rate limiting** to prevent abuse.",
      "All user inputs are **validated and sanitized** to prevent injection attacks.",
      "The frontend implements **XSS and CSRF protections** following OWASP best practices.",
    ],
  },
  {
    icon: CreditCard,
    title: "Payment Security",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    items: [
      "All payments are processed by **Stripe**, a PCI DSS Level 1 certified payment processor.",
      "We **never store, process, or have access to** your credit card numbers or payment details.",
      "Billing data is managed entirely within Stripe's secure infrastructure.",
    ],
  },
  {
    icon: Users,
    title: "Employee Security",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    items: [
      "Access to production systems is **strictly limited** to authorized personnel.",
      "All team accounts require **strong passwords and two-factor authentication (2FA)**.",
      "Access is reviewed regularly and revoked immediately when no longer needed.",
    ],
  },
  {
    icon: DatabaseBackup,
    title: "Backups & Recovery",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    items: [
      "Database backups are performed **automatically by Supabase** on a daily basis.",
      "Backup data is **encrypted at rest** and stored in a separate, secure location.",
      "Disaster recovery procedures are in place to restore services in the event of an outage.",
    ],
  },
  {
    icon: Scale,
    title: "Compliance",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    items: [
      "We follow **GDPR principles** including data minimization, purpose limitation, and the right to erasure.",
      "Our architecture is designed with **privacy by design** — we collect only the minimum data necessary to provide the service.",
      "Users can request data export or account deletion at any time by contacting support.",
    ],
  },
  {
    icon: Bug,
    title: "Vulnerability Management",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    items: [
      "Dependencies are **regularly updated and patched** to address known vulnerabilities.",
      "We use automated tools to monitor for security advisories in our dependency chain.",
      "Infrastructure and application logs are monitored for anomalous activity.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Incident Response",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    items: [
      "In the event of a confirmed data breach, affected users will be **notified within 72 hours** in accordance with GDPR requirements.",
      "We maintain an incident response process covering identification, containment, eradication, and recovery.",
      "Post-incident reviews are conducted to prevent recurrence.",
    ],
  },
];

export default function SecurityPage() {
  return (
    <>
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>

      {/* Hero Section */}
      <section className="bg-slate-50 dark:bg-slate-900 w-full">
        <div className="max-w-4xl mx-auto px-8 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-extrabold text-4xl lg:text-5xl tracking-tight mb-4">
            Data Protection & Security
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            At {config.appName}, security is built into every layer of our
            platform. Here&apos;s how we protect your data and keep your
            documents safe.
          </p>
        </div>
      </section>

      {/* Security Sections */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex flex-col gap-12">
            {sections.map((section) => (
              <div
                key={section.title}
                className="border rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`${section.iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <section.icon
                      className={`w-6 h-6 ${section.iconColor}`}
                    />
                  </div>
                  <h2 className="font-bold text-2xl tracking-tight pt-1.5">
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-3 ml-1">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span
                        className="text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: item
                            .replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-foreground">$1</strong>'
                            ),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-bold text-2xl tracking-tight mb-4">
            Have a security question?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            If you have questions about our security practices or want to report
            a vulnerability, please contact us at{" "}
            <a
              href={`mailto:${config.resend.supportEmail}`}
              className="text-primary hover:underline"
            >
              {config.resend.supportEmail}
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}

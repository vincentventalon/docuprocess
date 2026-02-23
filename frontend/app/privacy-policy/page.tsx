import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { Button } from "@/components/ui/button";

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: [DATE]

Privacy Policy – ${config.appName}

${config.appName} ("we," "our," "us") operates the website https://${config.domainName} (the "Site"). This Privacy Policy explains how we collect, use, and protect your information.

1. Information We Collect

Personal Data: When you use our Site, we may collect your name, email address, and payment information.
Non-Personal Data: We also collect information through web cookies to improve the functionality and performance of our Site.

2. How We Use Your Information

We use the information we collect solely for the purpose of providing our services and improving user experience.

3. Data Retention

We retain your data only as long as necessary to provide our services and comply with legal obligations.

4. Third-Party Service Providers

We use trusted third-party services to operate our platform, including:

- Database and authentication providers
- Payment processors
- Email service providers
- Cloud hosting providers

These providers only receive the minimum data necessary to perform their functions. We do not sell, rent, or trade your personal information.

5. Children's Privacy

We do not knowingly collect or solicit any personal information from children. If we become aware that we have unknowingly collected such data, we will take immediate steps to delete it.

6. Security

We take reasonable measures to protect your information from unauthorized access, alteration, disclosure, or destruction. All data transmission is encrypted via HTTPS/TLS.

7. Your Rights

You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at the email below.

8. Updates to This Privacy Policy

We may update this Privacy Policy from time to time. Any significant changes will be communicated to you by email.

9. Contact Us

For any questions or concerns regarding this Privacy Policy, you may contact us at:
${config.resend.supportEmail}

By using https://${config.domainName}, you agree to the collection and use of information as outlined in this Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;

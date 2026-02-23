import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { Button } from "@/components/ui/button";

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: [DATE]

Welcome to ${config.appName} ("we," "our," "us"). These Terms & Services ("Terms") govern your use of https://${config.domainName} (the "Site") and our services. By accessing or using our Site, you agree to these Terms.

1. Use of the Site

${config.appName} provides tools and services as described on our website. You agree to use the Site only for lawful purposes and in accordance with these Terms.

2. Purchases & Ownership

When purchasing a service or package, the following applies:

- You may use the service according to your subscription plan.
- You may not resell, redistribute, or sublicense access to our services.
- You may request a full refund within 7 days of purchase by contacting us.

3. User Data

We collect personal information such as your name, email address, and payment information when you use our services. We also collect non-personal data through web cookies. For details on how we handle your data, please review our Privacy Policy:
https://${config.domainName}/privacy-policy

4. Refund Policy

You may request a full refund within 7 days of your purchase. Refund requests must be sent to ${config.resend.supportEmail}.

5. Limitation of Liability

We provide the Site and services on an "as-is" basis. We are not responsible for any damages arising from your use of the Site, including data loss, service interruptions, or incorrect outputs.

6. Changes to the Terms

We may update these Terms from time to time. Any significant changes will be communicated by email.

7. Governing Law

These Terms are governed by the laws of [YOUR JURISDICTION].

8. Contact

If you have any questions regarding these Terms, please contact us at:
${config.resend.supportEmail}

By using https://${config.domainName}, you agree to these Terms & Services.`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;

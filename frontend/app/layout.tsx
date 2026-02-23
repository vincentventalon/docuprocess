import { ReactNode } from "react";
import { Viewport } from "next";
import Script from "next/script";
import { getSEOTags, renderOrganizationSchema } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";
import { inter } from "./fonts";

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
// Note: Don't set canonicalUrlRelative here - each page should set its own canonical URL
export const metadata = getSEOTags({});

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			data-theme={config.colors.theme}
			className={inter.variable}
			style={{ fontFamily: "var(--font-inter)" }}
			suppressHydrationWarning
		>
			<head>
				{renderOrganizationSchema()}
				{/* DataFast queue script - captures identify calls before main script loads */}
				<script
					id="datafast-queue"
					dangerouslySetInnerHTML={{
						__html: `window.datafast = window.datafast || function() {
							window.datafast.q = window.datafast.q || [];
							window.datafast.q.push(arguments);
						};`,
					}}
				/>
			</head>
			<body suppressHydrationWarning>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>{children}</ClientLayout>
				<Script
					defer
					data-website-id="dfid_J3Ru5h78NPRlDpxMxYQ6x"
					data-domain="example.com"
					src="https://datafa.st/js/script.js"
					strategy="afterInteractive"
				/>
			</body>
		</html>
	);
}

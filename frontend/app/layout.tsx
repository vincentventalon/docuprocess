import { ReactNode } from "react";
import { Viewport } from "next";
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
			</head>
			<body suppressHydrationWarning>
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReadMeForge — AI-Powered README Generator",
  description:
    "Generate professional README files for any GitHub repository in seconds. Analyzes your codebase and creates structured, badge-rich documentation automatically.",
  keywords: ["readme generator", "github", "documentation", "open source", "developer tools"],
  metadataBase: new URL("https://readmeforge.veridux.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ReadMeForge — AI-Powered README Generator",
    description: "Generate professional README files for any GitHub repository in seconds. Analyzes your codebase and creates structured, badge-rich documentation automatically.",
    url: "https://readmeforge.veridux.ai",
    siteName: "ReadMeForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReadMeForge — AI-Powered README Generator",
    description: "Generate professional README files for any GitHub repository in seconds. Analyzes your codebase and creates structured, badge-rich documentation automatically.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

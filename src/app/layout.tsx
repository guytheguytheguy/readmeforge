import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReadMeForge — AI-Powered README Generator",
  description:
    "Generate professional README files for any GitHub repository in seconds. Analyzes your codebase and creates structured, badge-rich documentation automatically.",
  keywords: ["readme generator", "github", "documentation", "open source", "developer tools"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100">{children}</body>
    </html>
  );
}

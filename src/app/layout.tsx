import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "CostPilot - AI Budget Forecaster",
  description: "Fast, accurate budget forecasts for AI projects with intelligent cost optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=khand@400&f[]=array@400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

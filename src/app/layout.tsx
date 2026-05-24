import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "DataPulse — AI-Powered Sales Analytics",
    template: "%s | DataPulse",
  },
  description:
    "Upload your sales data and instantly get AI-powered KPI dashboards, trend analysis, forecasting, and executive reports — powered by Gemini AI.",
  keywords: [
    "sales analytics",
    "revenue dashboard",
    "AI business intelligence",
    "KPI tracker",
    "sales forecasting",
  ],
  authors: [{ name: "DataPulse" }],
  openGraph: {
    title: "DataPulse — AI-Powered Sales Analytics",
    description: "Turn raw sales data into revenue intelligence in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-dp-bg text-dp-text-primary min-h-screen">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#0D0D1F",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#F1F5F9",
            },
          }}
        />
      </body>
    </html>
  );
}

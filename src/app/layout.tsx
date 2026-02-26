import type { Metadata } from "next";
import { ConfigProvider } from "antd";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthenticationProvider } from "@/provider";
import "antd/dist/reset.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SalesFlow CRM",
  description: "SalesFlow CRM - Streamlining Your Sales Process with AI-Powered Insights and Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#1677ff",
              colorInfo: "#1677ff",
              colorBgLayout: "#f4f8ff",
              colorBgContainer: "#ffffff",
              borderRadius: 10,
            },
          }}
        >
          <AuthenticationProvider>{children}</AuthenticationProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}

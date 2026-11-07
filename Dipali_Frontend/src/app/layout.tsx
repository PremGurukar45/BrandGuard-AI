import "./global.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BrandGuard AI",
  description: "AI-powered brand governance platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
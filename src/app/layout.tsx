import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "BrandGuard AI",
  description:
    "A clearer and efficient way to protect brand consistency and governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
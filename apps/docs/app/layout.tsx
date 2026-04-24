import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UstaTop Docs",
  description: "UstaTop component documentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UstaTop.uz",
  description: "O'zbekistondagi eng yaxshi ustalar platformasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

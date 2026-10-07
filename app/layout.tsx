import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccraLife — live your Accra story",
  description: "Create a Sim, find your way around Accra, work, make friends and build a life in a shared city.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

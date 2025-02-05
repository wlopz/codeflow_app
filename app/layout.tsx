import type { Metadata } from "next";
import localFont from "next/font/local";
import React from "react";

import "./globals.css";
import { ThemeProvider } from "next-themes";

const inter = localFont({
  src: "./fonts/InterVF.ttf",
  variable: "--font-inter",
  weight: "100 200 300 400 500 600 700 800 900",
});

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGroteskVF.ttf",
  variable: "--font-space-grotesk",
  weight: "300 400 500 600 700 800 900",
});

export const metadata: Metadata = {
  title: "CodeFlow",
  description: "Your go-to developer Q&A platform for instant coding help. Ask programming questions, share expert advice, and collaborate on solutions. Explore topics in web dev, mobile apps, AI, and more.",
  icons: {
    icon: "/images/site-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem 
        disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

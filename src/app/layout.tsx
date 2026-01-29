import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderServer from "@/components/Header/HeaderServer";
import { Toaster } from "react-hot-toast";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import HeaderClient from "@/components/Header/HeaderClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChorePay",
  description: "Empower kids to do chores and earn allowance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <HeaderServer />
          {children}
          <Toaster position="top-right" />
        </UserProvider>
      </body>
    </html>
  );
}

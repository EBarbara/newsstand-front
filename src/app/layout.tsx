import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import React from "react";

import "./globals.css";
import styles from "./layout.module.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Magazine List PRO",
  description: "Mag Issue Reader and Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <div className={styles.app}>
          <header className={styles.header}>
            <Link href="/public" className={styles.logo}>Magazine List</Link>

            <nav className={styles.nav}>
              <Link href="/magazines" className={styles.navLink}>Magazines</Link>
              <Link href="/people" className={styles.navlink}>People</Link>
              <Link href="/sections" className={styles.navlink}>Sections</Link>
            </nav>
          </header>

          <main className={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}

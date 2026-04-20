import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import styles from "./layout.module.css";

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
      <div className={styles.app}>
        <header className={styles.header}>
          <Link href="/" className={styles.logo}>Magazine List</Link>

          <nav className={styles.nav}>
            <Link href="/magazines" className={styles.navLink}>Magazines</Link>
            <Link href="/people" className={styles.navlink}>People</Link>
            <Link href="/sections" className={styles.navlink}>Sections</Link>
          </nav>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
  );
}

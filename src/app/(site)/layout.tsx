import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Magazine List PRO",
  description: "Leitor e Gerenciador de Revistas",
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
              <Link href="/magazines" className={styles.navLink}>Revistas</Link>
              <Link href="/people" className={styles.navLink}>Pessoas</Link>
              <Link href="/sections" className={styles.navLink}>Seções</Link>
              <Link href="/tags" className={styles.navLink}>Tags</Link>
            </nav>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
  );
}

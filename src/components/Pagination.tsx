"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Pagination.module.css';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
    baseUrl?: string; // e.g., "/magazines/slug"
}

export default function Pagination({ currentPage, totalPages, onPageChange, baseUrl }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [inputValue, setInputValue] = useState(currentPage.toString());

    useEffect(() => {
        setInputValue(currentPage.toString());
    }, [currentPage]);

    const navigateToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;

        if (onPageChange) {
            onPageChange(page);
        } else if (baseUrl) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', page.toString());
            router.push(`${baseUrl}?${params.toString()}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const page = parseInt(inputValue);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                navigateToPage(page);
            } else {
                setInputValue(currentPage.toString());
            }
            (e.target as HTMLInputElement).blur();
        }
    };

    const renderButton = (label: string, page: number, icon?: string, isIconAfter: boolean = false) => {
        const isDisabled = page < 1 || page > totalPages || (label !== "Primeira" && label !== "Última" && page === currentPage);
        // Special case: if we are at page 1, Primera and Anterior are disabled.
        const isActuallyDisabled = (label === "Primeira" || label === "Anterior") ? currentPage === 1 : 
                                   (label === "Próxima" || label === "Última") ? currentPage === totalPages : false;

        const content = (
            <>
                {icon && !isIconAfter && <span style={{ marginRight: '4px' }}>{icon}</span>}
                {label}
                {icon && isIconAfter && <span style={{ marginLeft: '4px' }}>{icon}</span>}
            </>
        );

        if (isActuallyDisabled) {
            return (
                <span className={`${styles.button} ${styles.disabled}`}>
                    {content}
                </span>
            );
        }

        if (baseUrl) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', page.toString());
            return (
                <Link href={`${baseUrl}?${params.toString()}`} className={styles.button}>
                    {content}
                </Link>
            );
        }

        return (
            <button onClick={() => navigateToPage(page)} className={styles.button}>
                {content}
            </button>
        );
    };

    if (totalPages <= 1) return null;

    return (
        <nav className={styles.pagination} aria-label="Navegação de páginas">
            {renderButton("Primeira", 1)}
            {renderButton("Anterior", currentPage - 1, "←")}

            <div className={styles.info}>
                <span>Página</span>
                <div className={styles.pageInputWrapper}>
                    <input
                        type="number"
                        className={styles.input}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        min={1}
                        max={totalPages}
                        title="Digite a página e aperte Enter"
                    />
                </div>
                <span className={styles.total}>de {totalPages}</span>
            </div>

            {renderButton("Próxima", currentPage + 1, "→", true)}
            {renderButton("Última", totalPages)}
        </nav>
    );
}

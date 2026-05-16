"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import Link from "next/link";
import { useSearchParams, usePathname } from 'next/navigation';
import { getTags } from '@/lib/tags';
import { Tag } from '@/@types/tag';
import { PaginatedResponse } from '@/@types/api';
import Pagination from '@/components/Pagination';

export default function TagsPage() {
    return (
        <React.Suspense fallback={<div className={styles.empty}><p>Carregando...</p></div>}>
            <TagsPageContent />
        </React.Suspense>
    );
}

function TagsPageContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Derive current page from URL
    const currentPage = parseInt(searchParams.get('page') || '1');
    
    const [data, setData] = useState<PaginatedResponse<Tag> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchTags = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const response = await getTags(page);
            setData(response);
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTags(currentPage);
    }, [currentPage, fetchTags]);

    const totalPages = data ? Math.ceil(data.count / 20) : 0;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Tags</h1>
                    <p className={styles.subtitle}>Categorias e marcações para organizar o acervo.</p>
                </div>
            </header>

            {loading ? (
                <div className={styles.empty}>
                    <p>Carregando tags...</p>
                </div>
            ) : !data || data.results.length === 0 ? (
                <div className={styles.empty}>
                    <p>Nenhuma tag encontrada.</p>
                </div>
            ) : (
                <>
                    <div className={styles.grid}>
                        {data.results.map(tag => (
                            <Link key={tag.id} href={`/tags/${tag.slug}`} className={styles.tagCard}>
                                <span className={styles.tagName}>{tag.name}</span>
                                <span className={styles.tagSlug}>#{tag.slug}</span>
                                <span className={styles.tagDecoration}>#</span>
                            </Link>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            baseUrl={pathname}
                        />
                    )}
                </>
            )}
        </div>
    );
}

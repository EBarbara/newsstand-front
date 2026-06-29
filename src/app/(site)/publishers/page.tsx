"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from '../people/page.module.css'; // Reusing standard directory styles for visual consistency
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getPublishers } from '@/lib/publishers';
import { Publisher } from '@/@types/publisher';
import { PaginatedResponse } from '@/@types/api';
import PublisherCard from '@/components/PublisherCard';
import Pagination from '@/components/Pagination';
import PageSearch from '@/components/PageSearch';
import PublisherModal from '@/components/PublisherModal';

export default function PublishersPage() {
    return (
        <React.Suspense fallback={<div className={styles.empty}><p>Carregando...</p></div>}>
            <PublishersPageContent />
        </React.Suspense>
    );
}

function PublishersPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Derive current page from URL
    const currentPage = parseInt(searchParams.get('page') || '1');
    
    // Derive search query from URL
    const searchQuery = searchParams.get('search') || '';

    const [data, setData] = useState<PaginatedResponse<Publisher> | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchPublishersList = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const response = await getPublishers(page, 20, search);
            setData(response);
        } catch (error) {
            console.error("Error fetching publishers:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPublishersList(currentPage, searchQuery);
    }, [currentPage, searchQuery, fetchPublishersList]);

    const handlePublisherSaved = () => {
        fetchPublishersList(currentPage, searchQuery);
    };

    const totalPages = data ? Math.ceil(data.count / 20) : 0;

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <header className="page-header !flex-row !justify-between !items-center !gap-4">
                <div className="flex flex-col">
                    <h1 className="page-title">Editoras</h1>
                    <p className="page-subtitle">Diretório de empresas editoras e marcas de publicação.</p>
                </div>
                <div className={styles.actions}>
                    <PageSearch placeholder="Buscar editoras..." className="w-64" />
                    <button 
                        className={styles.addButton}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <span>+</span> Nova Editora
                    </button>
                </div>
            </header>

            {/* LIST / GRID */}
            {loading ? (
                <div className={styles.empty}>
                    <p>Carregando diretório de editoras...</p>
                </div>
            ) : !data || data.results.length === 0 ? (
                <div className={styles.empty}>
                    <p>Nenhuma editora encontrada.</p>
                    <button 
                        className={styles.addButton}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Cadastre a primeira editora
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                        {data.results.map(publisher => (
                            <PublisherCard key={publisher.id} publisher={publisher} />
                        ))}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            baseUrl={pathname}
                        />
                    )}
                </>
            )}

            {/* CREATE MODAL */}
            <PublisherModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                publisher={null}
                onSave={handlePublisherSaved}
            />
        </div>
    );
}

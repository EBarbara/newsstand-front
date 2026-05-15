"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './page.module.css';
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getPeople, createPerson } from '@/lib/people';
import { Person, PaginatedResponse } from '@/@types/person';
import PersonCard from '@/components/PersonCard';
import Pagination from '@/components/Pagination';
import { getTags } from '@/lib/tags';
import { Tag } from '@/@types/tag';
import PeopleFiltersModal from '@/components/PeopleFiltersModal';

export default function PeoplePage() {
    return (
        <React.Suspense fallback={<div className={styles.empty}><p>Carregando...</p></div>}>
            <PeoplePageContent />
        </React.Suspense>
    );
}

function PeoplePageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Derive current page from URL
    const currentPage = parseInt(searchParams.get('page') || '1');
    
    // Derive active filters from URL (all params except 'page')
    const activeFilters = useMemo(() => {
        const filters: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            if (key !== 'page') filters[key] = value;
        });
        return filters;
    }, [searchParams]);

    const [data, setData] = useState<PaginatedResponse<Person> | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPersonName, setNewPersonName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const fetchPeople = useCallback(async (page: number, filters: Record<string, string>) => {
        setLoading(true);
        try {
            const response = await getPeople(page, 20, filters);
            setData(response);
        } catch (error) {
            console.error("Error fetching people:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadTags = async () => {
            try {
                const res = await getTags();
                setTags(res.results);
            } catch (e) {
                console.error("Error loading tags", e);
            }
        };
        loadTags();
    }, []);

    useEffect(() => {
        fetchPeople(currentPage, activeFilters);
    }, [currentPage, activeFilters, fetchPeople]);

    const updateUrl = (page: number, filters: Record<string, string>) => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page.toString());
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleAddPerson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPersonName.trim()) return;

        setIsSaving(true);
        try {
            await createPerson(newPersonName);
            setNewPersonName("");
            setIsModalOpen(false);
            // Refresh current page or go to last page. For now, refresh current.
            fetchPeople(currentPage, activeFilters);
        } catch (error) {
            console.error("Error creating person:", error);
            alert("Falha ao criar pessoa. O nome pode já existir.");
        } finally {
            setIsSaving(false);
        }
    };

    const totalPages = data ? Math.ceil(data.count / 20) : 0;

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <header className="page-header !flex-row !justify-between !items-center !gap-4">
                <div className="flex flex-col">
                    <h1 className="page-title">Pessoas</h1>
                    <p className="page-subtitle">Diretório de colaboradores e créditos.</p>
                </div>
                <div className={styles.actions}>
                    <button 
                        className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-all font-bold text-sm"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <span>🔍</span> Filtros {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}
                    </button>
                    <button 
                        className={styles.addButton}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>+</span> Nova Pessoa
                    </button>
                </div>
            </header>

            {/* QUICK FILTERS REMOVED IN FAVOR OF MODAL BUT COULD BE RESTORED IF NEEDED */}

            {/* LIST / GRID */}
            {loading ? (
                <div className={styles.empty}>
                    <p>Carregando diretório...</p>
                </div>
            ) : !data || data.results.length === 0 ? (
                <div className={styles.empty}>
                    <p>Ninguém encontrado no diretório.</p>
                    <button 
                        className={styles.addButton}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Crie sua primeira entrada
                    </button>
                </div>
            ) : (
                <>
                    <div className={styles.grid}>
                        {data.results.map(person => (
                            <PersonCard key={person.id} person={person} />
                        ))}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={Math.ceil((data?.count || 0) / 20)}
                            baseUrl={pathname}
                        />
                    )}
                </>
            )}

            {/* FILTER MODAL */}
            <PeopleFiltersModal 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={(filters) => {
                    updateUrl(1, filters);
                }}
                currentFilters={activeFilters}
                availableTags={tags}
            />

            {/* NEW PERSON MODAL */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Adicionar Nova Pessoa</h2>
                            <p className={styles.subtitle}>Crie uma nova entrada no diretório de créditos.</p>
                        </div>
                        
                        <form onSubmit={handleAddPerson} className={styles.modalBody}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="personName">Nome Completo</label>
                                <input 
                                    id="personName"
                                    type="text" 
                                    className={styles.input}
                                    placeholder="ex: João Silva"
                                    value={newPersonName}
                                    onChange={e => setNewPersonName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className={styles.modalFooter}>
                                <button 
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Salvando..." : "Criar Pessoa"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

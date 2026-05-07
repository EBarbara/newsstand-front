"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import Link from "next/link";
import { getPeople, createPerson } from '@/lib/people';
import { Person, PaginatedResponse } from '@/@types/person';
import PersonCard from '@/components/PersonCard';
import Pagination from '@/components/Pagination';

export default function PeoplePage() {
    const [data, setData] = useState<PaginatedResponse<Person> | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPersonName, setNewPersonName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchPeople = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const response = await getPeople(page);
            setData(response);
        } catch (error) {
            console.error("Error fetching people:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPeople(currentPage);
    }, [currentPage, fetchPeople]);

    const handleAddPerson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPersonName.trim()) return;

        setIsSaving(true);
        try {
            await createPerson(newPersonName);
            setNewPersonName("");
            setIsModalOpen(false);
            // Refresh current page or go to last page. For now, refresh current.
            fetchPeople(currentPage);
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
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Pessoas</h1>
                    <p className={styles.subtitle}>Diretório de colaboradores e créditos.</p>
                </div>
                <div className={styles.actions}>
                    <button 
                        className={styles.addButton}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>+</span> Nova Pessoa
                    </button>
                </div>
            </header>

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
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </>
            )}

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

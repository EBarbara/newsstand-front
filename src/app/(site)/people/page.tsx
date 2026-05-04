"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import Link from "next/link";
import { getPeople, createPerson } from '@/lib/people';
import { getMediaUrl } from "@/lib/issues";
import { Person, PaginatedResponse } from '@/@types/person';

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
            alert("Failed to create person. Name might already exist.");
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
                    <h1 className={styles.title}>People</h1>
                    <p className={styles.subtitle}>Directory of contributors and credits.</p>
                </div>
                <div className={styles.actions}>
                    <button 
                        className={styles.addButton}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>+</span> New Person
                    </button>
                </div>
            </header>

            {/* LIST / GRID */}
            {loading ? (
                <div className={styles.empty}>
                    <p>Loading directory...</p>
                </div>
            ) : !data || data.results.length === 0 ? (
                <div className={styles.empty}>
                    <p>No people found in the directory.</p>
                    <button 
                        className={styles.addButton}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create your first entry
                    </button>
                </div>
            ) : (
                <>
                    <div className={styles.grid}>
                        {data.results.map(person => (
                            <Link href={`/people/${person.id}`} key={person.id} className={styles.card}>
                                {person.photo ? (
                                    <img 
                                        src={getMediaUrl(person.photo)} 
                                        alt={person.name} 
                                        className="w-12 h-12 rounded-full object-cover mb-2 border border-blue-500/30"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 mb-2 border border-gray-700">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                                <h3 className={styles.personName}>{person.name}</h3>
                                <div className={styles.personMeta}>
                                    ID: #{person.id}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button 
                                className={styles.pageButton}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button 
                                    key={page}
                                    className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button 
                                className={styles.pageButton}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* NEW PERSON MODAL */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Add New Person</h2>
                            <p className={styles.subtitle}>Create a new entry in the credits directory.</p>
                        </div>
                        
                        <form onSubmit={handleAddPerson} className={styles.modalBody}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="personName">Full Name</label>
                                <input 
                                    id="personName"
                                    type="text" 
                                    className={styles.input}
                                    placeholder="e.g. John Doe"
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
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Saving..." : "Create Person"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

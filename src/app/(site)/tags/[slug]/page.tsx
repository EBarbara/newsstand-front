"use client";

import React, { useState, useEffect, use } from "react";
import { getTag } from "@/lib/tags";
import { getPeople } from "@/lib/people";
import { getIssues } from "@/lib/issues";
import { Tag } from "@/@types/tag";
import { Person } from "@/@types/person";
import { Issue } from "@/@types/issue";
import { PaginatedResponse } from "@/@types/api";
import PersonCard from "@/components/PersonCard";
import IssueCard from "@/components/issueCard/IssueCard";
import Pagination from "@/components/Pagination";
import styles from "../page.module.css";
import detailStyles from "./detail.module.css";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

export default function TagDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    return (
        <React.Suspense fallback={<div className={styles.empty}><p>Carregando...</p></div>}>
            <TagDetailContent slug={slug} />
        </React.Suspense>
    );
}

function TagDetailContent({ slug }: { slug: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [tag, setTag] = useState<Tag | null>(null);
    const [peopleData, setPeopleData] = useState<PaginatedResponse<Person> | null>(null);
    const [issuesData, setIssuesData] = useState<PaginatedResponse<Issue> | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"people" | "issues">("people");

    const currentPage = parseInt(searchParams.get('page') || '1');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const tagRes = await getTag(slug);
                setTag(tagRes);

                // Fetch first pages of both for counts, or just based on active tab
                const [pRes, iRes] = await Promise.all([
                    getPeople(activeTab === "people" ? currentPage : 1, 20, { tag: slug }),
                    getIssues(activeTab === "issues" ? currentPage : 1, { tag: slug })
                ]);
                setPeopleData(pRes);
                setIssuesData(iRes);
            } catch (error) {
                console.error("Error loading tag data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug, activeTab, currentPage]);

    if (loading && !tag) {
        return <div className={styles.empty}><p>Carregando detalhes da tag...</p></div>;
    }

    if (!tag) {
        return <div className={styles.empty}><p>Tag não encontrada.</p></div>;
    }

    const totalPages = activeTab === "people" 
        ? (peopleData ? Math.ceil(peopleData.count / 20) : 0)
        : (issuesData ? Math.ceil(issuesData.count / 20) : 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <Link href="/tags" className={detailStyles.backLink}>← Todas as Tags</Link>
                    <h1 className={styles.title}>#{tag.name}</h1>
                    <p className={styles.subtitle}>
                        Explorando tudo relacionado a esta categoria.
                    </p>
                </div>
            </header>

            {/* TABS */}
            <div className={detailStyles.tabs}>
                <button 
                    className={`${detailStyles.tab} ${activeTab === "people" ? detailStyles.activeTab : ""}`}
                    onClick={() => setActiveTab("people")}
                >
                    Pessoas <span className={detailStyles.count}>{peopleData?.count || 0}</span>
                </button>
                <button 
                    className={`${detailStyles.tab} ${activeTab === "issues" ? detailStyles.activeTab : ""}`}
                    onClick={() => setActiveTab("issues")}
                >
                    Edições <span className={detailStyles.count}>{issuesData?.count || 0}</span>
                </button>
            </div>

            {/* CONTENT */}
            <div className={detailStyles.tabContent}>
                {activeTab === "people" ? (
                    peopleData?.results.length === 0 ? (
                        <div className={styles.empty}><p>Nenhuma pessoa encontrada com esta tag.</p></div>
                    ) : (
                        <div className={styles.grid}>
                            {peopleData?.results.map(p => (
                                <PersonCard key={p.id} person={p} />
                            ))}
                        </div>
                    )
                ) : (
                    issuesData?.results.length === 0 ? (
                        <div className={styles.empty}><p>Nenhuma edição encontrada com esta tag.</p></div>
                    ) : (
                        <div className={styles.grid}>
                            {issuesData?.results.map(i => (
                                <IssueCard key={i.id} issue={i} />
                            ))}
                        </div>
                    )
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl={pathname}
                    />
                )}
            </div>
        </div>
    );
}

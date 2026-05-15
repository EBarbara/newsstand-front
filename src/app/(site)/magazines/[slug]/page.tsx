"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from "next/link";
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';

import { getIssuesByMagazine } from "@/lib/issues";
import IssueCard from "@/components/issueCard/IssueCard";
import ImportCbzButton from "@/components/ImportCbzButton";
import CreateEmptyIssueButton from "@/components/CreateEmptyIssueButton";
import Pagination from "@/components/Pagination";
import { getTags } from '@/lib/tags';
import { Tag } from '@/@types/tag';
import IssueFiltersModal from '@/components/IssueFiltersModal';
import { Issue } from '@/@types/issue';
import { PaginatedResponse } from '@/@types/api';

export default function MagazineIssuesPage() {
    return (
        <React.Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-gray-500"><p>Carregando...</p></div>}>
            <MagazineIssuesContent />
        </React.Suspense>
    );
}

function MagazineIssuesContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const params = useParams();
    const slug = params.slug as string;

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

    const [data, setData] = useState<PaginatedResponse<Issue> | null>(null);
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const fetchIssues = useCallback(async (page: number, filters: Record<string, string>) => {
        setLoading(true);
        try {
            const response = await getIssuesByMagazine(slug, page, filters);
            setData(response);
        } catch (error) {
            console.error("Error fetching issues:", error);
        } finally {
            setLoading(false);
        }
    }, [slug]);

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
        fetchIssues(currentPage, activeFilters);
    }, [currentPage, activeFilters, fetchIssues]);

    const updateUrl = (page: number, filters: Record<string, string>) => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page.toString());
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    const magazineName = data?.results.length && data.results.length > 0 ? data.results[0].magazine.name : slug;
    const totalPages = data ? Math.ceil(data.count / 20) : 0;

    const isSpecial = activeFilters.is_special;

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* BREADCRUMB */}
            <nav className="text-sm text-gray-500">
                <Link href="/">Home</Link> /{" "}
                <span className="capitalize">{magazineName}</span>
            </nav>

            {/* HEADER */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        {magazineName}
                    </h1>
                    <p className="text-gray-500">
                        Todas as edições desta revista.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-all font-bold text-sm"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <span>🔍</span> Filtros {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}
                    </button>
                    <CreateEmptyIssueButton magazineSlug={slug} />
                    <ImportCbzButton magazineSlug={slug} />
                </div>
            </header>

            {/* QUICK FILTERS */}
            <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mostrar:</span>
                <div className="flex p-1 bg-gray-900/50 rounded-lg border border-white/5">
                    <button 
                        onClick={() => {
                            const newFilters = { ...activeFilters };
                            delete newFilters.is_special;
                            updateUrl(1, newFilters);
                        }}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            !isSpecial 
                            ? "bg-blue-600 text-white shadow-lg" 
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        Todas
                    </button>
                    <button 
                        onClick={() => updateUrl(1, { ...activeFilters, is_special: 'false' })}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            isSpecial === 'false' 
                            ? "bg-blue-600 text-white shadow-lg" 
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        Mensais
                    </button>
                    <button 
                        onClick={() => updateUrl(1, { ...activeFilters, is_special: 'true' })}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            isSpecial === 'true' 
                            ? "bg-amber-600 text-white shadow-lg" 
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        Especiais ⭐
                    </button>
                </div>
            </div>

            {/* EMPTY STATE */}
            {loading ? (
                <div className="text-center p-20 text-gray-500">
                    Carregando edições...
                </div>
            ) : !data || data.results.length === 0 ? (
                <div className="text-center p-20 border border-white/5 rounded-2xl bg-white/5 text-gray-500">
                    <p className="text-lg font-medium">Nenhuma edição encontrada.</p>
                    <p className="text-sm mt-1">Tente ajustar seus filtros para encontrar o que procura.</p>
                    {Object.keys(activeFilters).length > 0 && (
                        <button 
                            onClick={() => updateUrl(1, {})}
                            className="mt-4 text-blue-400 hover:text-blue-300 font-bold text-sm"
                        >
                            Limpar todos os filtros
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                        {data.results.map(issue => (
                            <IssueCard key={issue.id} issue={issue} />
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

            {/* FILTER MODAL */}
            <IssueFiltersModal 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={(filters) => {
                    updateUrl(1, filters);
                }}
                currentFilters={activeFilters}
                availableTags={tags}
            />
        </div>
    );
}
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

// Premium profile additions
import { getMagazineBySlug } from "@/lib/magazines";
import { Magazine } from "@/@types/magazine";
import EditMagazineModal from "@/components/EditMagazineModal";



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
        const filters: Record<string, string | string[]> = {};
        searchParams.forEach((value, key) => {
            if (key === 'page') return;
            
            if (filters[key]) {
                if (Array.isArray(filters[key])) {
                    (filters[key] as string[]).push(value);
                } else {
                    filters[key] = [filters[key] as string, value];
                }
            } else {
                filters[key] = value;
            }
        });
        return filters;
    }, [searchParams]);

    const [magazine, setMagazine] = useState<Magazine | null>(null);
    const [magazineNotFound, setMagazineNotFound] = useState(false);
    const [data, setData] = useState<PaginatedResponse<Issue> | null>(null);
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch dynamic magazine details
    const fetchMagazineDetail = useCallback(async () => {
        setMagazineNotFound(false);
        try {
            const mag = await getMagazineBySlug(slug);
            setMagazine(mag);
        } catch (error: any) {
            if (error.status === 404 || (error.message && error.message.includes('No Magazine matches'))) {
                setMagazineNotFound(true);
            } else {
                console.error("Error loading magazine details:", error);
            }
        }
    }, [slug]);

    const fetchIssues = useCallback(async (page: number, filters: Record<string, string | string[]>) => {
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

    const handleIssueChange = useCallback(() => {
        fetchIssues(currentPage, activeFilters);
        fetchMagazineDetail();
    }, [currentPage, activeFilters, fetchIssues, fetchMagazineDetail]);

    useEffect(() => {
        const loadTags = async () => {
            try {
                const res = await getTags(1, 1000);
                setTags(res.results);
            } catch (e) {
                console.error("Error loading tags", e);
            }
        };
        loadTags();
        fetchMagazineDetail();
    }, [fetchMagazineDetail]);

    useEffect(() => {
        fetchIssues(currentPage, activeFilters);
    }, [currentPage, activeFilters, fetchIssues]);

    useEffect(() => {
        if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

        const channel = new BroadcastChannel('newsstand-issue-updates');
        
        const handleMessage = (event: MessageEvent) => {
            const { type, id } = event.data;
            if (type === 'ISSUE_UPDATED' || type === 'ISSUE_DELETED') {
                console.log(`Received tab update broadcast: ${type} for issue ${id}. Refreshing...`);
                handleIssueChange();
            }
        };

        channel.addEventListener('message', handleMessage);

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, [handleIssueChange]);

    const updateUrl = (page: number, filters: Record<string, string | string[]>) => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page.toString());
        Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    if (v) params.append(key, v);
                });
            } else if (value) {
                params.set(key, value);
            }
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    const magazineName = magazine?.name || (data?.results.length && data.results.length > 0 ? data.results[0].magazine.name : slug);
    const totalPages = data ? Math.ceil(data.count / 20) : 0;

    // Elegant fallback gradient and initials for the magazine banner
    const getGradientClass = (slug: string) => {
        const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const gradients = [
            "from-blue-600 to-indigo-700 dark:from-blue-500/20 dark:to-indigo-500/20",
            "from-purple-600 to-pink-700 dark:from-purple-500/20 dark:to-pink-500/20",
            "from-emerald-600 to-teal-700 dark:from-emerald-500/20 dark:to-teal-500/20",
            "from-amber-500 to-orange-600 dark:from-amber-500/20 dark:to-orange-500/20",
            "from-rose-500 to-red-600 dark:from-rose-500/20 dark:to-red-500/20",
        ];
        return gradients[hash % gradients.length];
    };

    const gradient = getGradientClass(slug);
    const initials = magazineName.substring(0, 2).toUpperCase();

    const flagUrl = magazine?.country_code ? `https://flagcdn.com/w40/${magazine.country_code.toLowerCase()}.png` : null;

    // Standardize language tag to uppercase for cleaner badge representation (e.g. PT-BR, EN-US)
    const formatLanguage = (lang?: string) => {
        if (!lang) return "";
        return lang.trim().toUpperCase();
    };

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* BREADCRUMB */}
            <nav className="text-sm text-gray-500">
                <Link href="/">Home</Link> /{" "}
                <Link href="/magazines" className="hover:text-blue-500 transition-colors">Revistas</Link> /{" "}
                <span className="capitalize text-zinc-800 dark:text-zinc-300 font-medium">
                    {magazineName}
                    {magazine?.volume && ` (Vol. ${magazine.volume})`}
                </span>
            </nav>

            {magazineNotFound ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 shadow-xl dark:shadow-none relative overflow-hidden transition-all">
                    {/* Glowing aesthetic decorations */}
                    <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-red-500/5 blur-3xl opacity-60 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl opacity-60 pointer-events-none" />

                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 dark:from-red-500/20 dark:to-rose-500/20 text-white dark:text-red-400 font-black text-4xl shadow-lg dark:shadow-none mb-6 animate-float">
                        ⚠️
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
                        A revista não existe
                    </h1>
                    
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-md mb-8 leading-relaxed">
                        A revista com o slug <span className="font-semibold text-zinc-900 dark:text-zinc-250">"{slug}"</span> não existe ou foi removida de nossa coleção.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/magazines"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md dark:shadow-none text-sm"
                        >
                            <span>📚</span> Ver todas as revistas
                        </Link>
                        
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 font-bold px-6 py-3 rounded-xl transition-all text-sm"
                        >
                            <span>⬅️</span> Voltar
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* PREMIUM MAGAZINE PROFILE HERO HEADER */}
                    {magazine && (
                        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 p-6 md:p-8 shadow-xl dark:shadow-none transition-all">
                            {/* Glowing aesthetic decorations */}
                            <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl opacity-60 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 -z-10 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl opacity-60 pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                                {/* Logo / Initials */}
                                {magazine.logo ? (
                                    <div className="relative h-28 w-28 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 shadow-md flex items-center justify-center">
                                        <img
                                            src={magazine.logo}
                                            alt={magazine.name}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className={`flex h-28 w-28 md:h-32 md:w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white dark:text-blue-350 font-black text-4xl shadow-lg dark:shadow-none ${gradient}`}>
                                        {initials}
                                    </div>
                                )}

                                {/* Title, details and description */}
                                <div className="flex-1 min-w-0 flex flex-col gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-baseline flex-wrap gap-2">
                                            <span>{magazine.name}</span>
                                            {magazine.volume && (
                                                <span className="text-lg md:text-xl font-medium text-zinc-500 dark:text-zinc-400">
                                                    (Vol. {magazine.volume})
                                                </span>
                                            )}
                                        </h1>
                                        {magazine.publisher && (
                                            <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                                                🏢 Editora: <span className="text-zinc-850 dark:text-zinc-300 font-semibold">{magazine.publisher}</span>
                                            </span>
                                        )}
                                    </div>

                                    {magazine.description ? (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                                            {magazine.description}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">
                                            Nenhuma descrição disponível. Clique em "Editar Revista" para adicionar informações sobre esta coleção.
                                        </p>
                                    )}

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 items-center mt-1">
                                        {(flagUrl || magazine.language || magazine.country) && (
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-150 dark:bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-700 dark:text-zinc-350 border border-zinc-200/50 dark:border-zinc-700/50 uppercase">
                                                {flagUrl ? (
                                                    <img 
                                                        src={flagUrl} 
                                                        alt={magazine.country || "Bandeira"} 
                                                        className="w-4 h-auto rounded-[2px] shadow-sm border border-white/10"
                                                        title={magazine.country}
                                                    />
                                                ) : (
                                                    <span>{magazine.language ? "🌐" : "📍"}</span>
                                                )}
                                                {formatLanguage(magazine.language) || magazine.country}
                                            </span>
                                        )}
                                        {magazine.tags?.map(tag => (
                                            <span
                                                key={tag.id}
                                                className="inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                                            >
                                                #{tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Counts Segment Dashboard */}
                                <div className="flex md:flex-col gap-6 p-4 md:px-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50 w-full md:w-44 justify-around">
                                    <div className="flex flex-col md:items-center">
                                        <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">
                                            {magazine.issues_count || 0}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 mt-1">
                                            Edições
                                        </span>
                                    </div>
                                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
                                    <div className="flex md:flex-col gap-6 md:gap-3 justify-around md:justify-start w-full md:w-auto">
                                        <div className="flex flex-col md:items-center">
                                            <span className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                                                {magazine.periodic_issues_count || 0}
                                            </span>
                                            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                                                Periódicas
                                            </span>
                                        </div>
                                        <div className="flex flex-col md:items-center">
                                            <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                                                {magazine.special_issues_count || 0}
                                            </span>
                                            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                                                Especiais
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACTION ROW */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-5">
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Edições Cadastradas
                            </h3>
                            <p className="text-xs text-zinc-500">
                                Navegue ou filtre pelas edições desta revista.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            <button
                                className="flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-xl transition-all font-bold text-sm"
                                onClick={() => setIsFilterModalOpen(true)}
                            >
                                <span>🔍</span> Filtros {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}
                            </button>

                            {/* Edit Magazine Trigger */}
                            {magazine && (
                                <button
                                    className="flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-xl transition-all font-bold text-sm"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <span>✏️</span> Editar Revista
                                </button>
                            )}

                            <CreateEmptyIssueButton magazineSlug={slug} onSuccess={handleIssueChange} />
                            <ImportCbzButton magazineSlug={slug} onSuccess={handleIssueChange} />
                        </div>
                    </div>

                    {/* EMPTY STATE OR LIST */}
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
                                    <IssueCard 
                                        key={issue.id} 
                                        issue={issue} 
                                        onUpdate={handleIssueChange}
                                        onDelete={handleIssueChange}
                                    />
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

                    {/* EDIT MAGAZINE MODAL */}
                    {magazine && (
                        <EditMagazineModal
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            magazine={magazine}
                            onSave={(updatedMag) => {
                                setMagazine(updatedMag);
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}
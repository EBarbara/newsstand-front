"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { notFound, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getPublisherBySlug, deletePublisher } from "@/lib/publishers";
import { Publisher } from "@/@types/publisher";
import { getMediaUrl } from "@/lib/issues";
import PublisherModal from "@/components/PublisherModal";

export default function PublisherDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    return (
        <React.Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-gray-500">Carregando perfil...</div>}>
            <PublisherDetailContent slug={slug} />
        </React.Suspense>
    );
}

function PublisherDetailContent({ slug }: { slug: string }) {
    const router = useRouter();
    const [publisher, setPublisher] = useState<Publisher | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const loadPublisherData = useCallback(async () => {
        try {
            const data = await getPublisherBySlug(slug);
            setPublisher(data);
        } catch (err) {
            console.error("Failed to load publisher", err);
            setPublisher(null);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        loadPublisherData();
    }, [loadPublisherData]);

    const handleDelete = async () => {
        if (!publisher) return;
        if (!confirm(`Deseja realmente excluir permanentemente a editora ${publisher.name}? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            await deletePublisher(publisher.slug);
            router.push("/publishers");
            router.refresh();
        } catch (err) {
            console.error("Failed to delete publisher", err);
            alert("Erro ao excluir editora. Certifique-se de que não há revistas associadas a ela.");
        }
    };

    if (loading) return <div className="p-10 text-white text-center">Carregando editora...</div>;
    if (!publisher) return notFound();

    // Dynamic background gradient based on the slug if logo is missing
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

    const gradient = getGradientClass(publisher.slug);
    const initials = publisher.name.substring(0, 2).toUpperCase();
    const flagUrl = publisher.country_code ? `https://flagcdn.com/w40/${publisher.country_code.toLowerCase()}.png` : null;

    // @ts-ignore - magazines list populated in retrieve view
    const magazinesList = publisher.magazines || [];

    return (
        <div className="flex flex-col gap-8 pb-12 text-white">
            {/* BREADCRUMB */}
            <nav className="text-sm text-gray-500">
                <Link href="/">Home</Link> /{" "}
                <Link href="/publishers" className="hover:text-blue-500 transition-colors">Editoras</Link> /{" "}
                <span className="capitalize text-zinc-800 dark:text-zinc-300 font-medium">
                    {publisher.name}
                </span>
            </nav>

            {/* HERO BANNER SECTION */}
            <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 p-6 md:p-8 shadow-xl dark:shadow-none transition-all">
                {/* Glowing decorations */}
                <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 -z-10 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl opacity-60 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                    {/* Logo */}
                    {publisher.logo ? (
                        <div className="relative h-28 w-28 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-2 shadow-md flex items-center justify-center bg-white">
                            <img
                                src={getMediaUrl(publisher.logo)}
                                alt={publisher.name}
                                className="h-full w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className={`flex h-28 w-28 md:h-32 md:w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white dark:text-blue-350 font-black text-4xl shadow-lg dark:shadow-none ${gradient}`}>
                            {initials}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-baseline flex-wrap gap-2">
                                <span>{publisher.name}</span>
                                {publisher.translated_name && (
                                    <span className="text-lg md:text-xl font-medium text-zinc-500 dark:text-zinc-400">
                                        ({publisher.translated_name})
                                    </span>
                                )}
                            </h1>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 items-center mt-1">
                            {(flagUrl || publisher.country) && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-150 dark:bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-700 dark:text-zinc-350 border border-zinc-200/50 dark:border-zinc-700/50 uppercase">
                                    {flagUrl ? (
                                        <img 
                                            src={flagUrl} 
                                            alt={publisher.country || "Bandeira"} 
                                            className="w-4 h-auto rounded-[2px] shadow-sm border border-white/10"
                                            title={publisher.country || ""}
                                        />
                                    ) : (
                                        <span>📍</span>
                                    )}
                                    {publisher.country}
                                </span>
                            )}

                            {publisher.website && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-150 dark:bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-700 dark:text-zinc-350 border border-zinc-200/50 dark:border-zinc-700/50">
                                    <a href={publisher.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        🔗 Website Oficial
                                    </a>
                                </span>
                            )}
                        </div>

                        {/* Aliases */}
                        {publisher.aliases && publisher.aliases.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 items-center mt-1">
                                <span className="text-xs text-zinc-500 dark:text-zinc-450 font-bold uppercase tracking-wider">Aliases:</span>
                                {publisher.aliases.map((alias, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-blue-500/10 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                        {alias}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stats Dashboard */}
                    <div className="flex md:flex-col gap-6 p-4 md:px-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50 w-full md:w-44 justify-around">
                        <div className="flex flex-col md:items-center">
                            <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">
                                {magazinesList.length}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 mt-1">
                                Revistas
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION ROW */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-5">
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Revistas Publicadas
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Catálogo de títulos vinculados a esta editora.
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <button
                        className="flex items-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-xl transition-all font-bold text-sm"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        <span>✏️</span> Editar Editora
                    </button>
                    <button
                        className="flex items-center gap-2 bg-red-600/10 hover:bg-red-650 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent px-4 py-2 rounded-xl transition-all font-bold text-sm"
                        onClick={handleDelete}
                    >
                        <span>🗑️</span> Excluir Editora
                    </button>
                </div>
            </div>

            {/* MAGAZINES LIST */}
            {magazinesList.length === 0 ? (
                <div className="text-center p-20 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900/30 text-gray-500">
                    <p className="text-lg font-medium">Nenhuma revista cadastrada para esta editora.</p>
                    <p className="text-sm mt-1">Associe esta editora em uma revista usando a edição de revistas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                    {magazinesList.map((pubMag: any, index: number) => {
                        const magInitials = pubMag.magazine_name.substring(0, 2).toUpperCase();
                        const dateRange = (pubMag.start_date || pubMag.end_date)
                            ? `${pubMag.start_date ? new Date(pubMag.start_date).getFullYear() : '?'} - ${pubMag.end_date ? new Date(pubMag.end_date).getFullYear() : 'Atualmente'}`
                            : 'Período não informado';

                        return (
                            <Link
                                key={index}
                                href={`/magazines/${pubMag.magazine_slug}`}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30"
                            >
                                <div className="flex items-center gap-4">
                                    {pubMag.magazine_logo ? (
                                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center p-1.5 shadow-inner">
                                            <img
                                                src={getMediaUrl(pubMag.magazine_logo)}
                                                alt={pubMag.magazine_name}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500/20 dark:to-indigo-500/20 text-white dark:text-blue-300 font-extrabold text-xl shadow-md">
                                            {magInitials}
                                        </div>
                                    )}

                                    <div className="flex flex-col min-w-0">
                                        <h4 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate">
                                            {pubMag.magazine_name}
                                        </h4>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold truncate">
                                            📅 {dateRange}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* EDIT MODAL */}
            <PublisherModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                publisher={publisher}
                onSave={loadPublisherData}
            />
        </div>
    );
}

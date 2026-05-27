"use client";

import React, { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import SearchBar from "./SearchBar";

interface SectionType {
    id: number;
    name: string;
}

interface Magazine {
    slug: string;
    name: string;
}

interface SectionsFilterBarProps {
    sections: SectionType[];
    magazines: Magazine[];
}

function SectionsFilterBarContent({ sections, magazines }: SectionsFilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Read current state from URL
    const search = searchParams.get("search") || "";
    const sectionId = searchParams.get("section") || "";
    const magazineSlug = searchParams.get("magazine") || "";
    const year = searchParams.get("year") || "";

    const hasActiveFilters = !!(search || sectionId || magazineSlug || year);

    // Update URL when filters change
    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        // Always reset to page 1 when filters change
        params.delete("page");

        router.push(`${pathname}?${params.toString()}`);
    };

    const handleClearFilters = () => {
        router.push(pathname);
    };

    // Generate years range (1970 to 2026)
    const years = Array.from({ length: 2026 - 1970 + 1 }, (_, i) => 2026 - i);

    return (
        <div className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* SEARCH INPUT */}
                <div className="md:col-span-1">
                    <SearchBar
                        value={search}
                        onChange={(val) => updateFilters({ search: val })}
                        placeholder="Buscar por título ou conteúdo..."
                        className="w-full"
                    />
                </div>

                {/* SECTION TYPE DROPDOWN */}
                <div>
                    <select
                        value={sectionId}
                        onChange={(e) => updateFilters({ section: e.target.value })}
                        className="w-full h-[38px] bg-[#161a20] border border-white/10 hover:border-white/20 focus:border-blue-500/50 hover:bg-white/5 text-white px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium cursor-pointer"
                    >
                        <option value="" className="bg-[#0b0e14]">Tipo de Seção (Todos)</option>
                        {sections.map((s) => (
                            <option key={s.id} value={s.id.toString()} className="bg-[#0b0e14]">
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* MAGAZINE DROPDOWN */}
                <div>
                    <select
                        value={magazineSlug}
                        onChange={(e) => updateFilters({ magazine: e.target.value })}
                        className="w-full h-[38px] bg-[#161a20] border border-white/10 hover:border-white/20 focus:border-blue-500/50 hover:bg-white/5 text-white px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium cursor-pointer"
                    >
                        <option value="" className="bg-[#0b0e14]">Revista (Todas)</option>
                        {magazines.map((m) => (
                            <option key={m.slug} value={m.slug} className="bg-[#0b0e14]">
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* YEAR DROPDOWN */}
                <div>
                    <select
                        value={year}
                        onChange={(e) => updateFilters({ year: e.target.value })}
                        className="w-full h-[38px] bg-[#161a20] border border-white/10 hover:border-white/20 focus:border-blue-500/50 hover:bg-white/5 text-white px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium cursor-pointer"
                    >
                        <option value="" className="bg-[#0b0e14]">Ano (Todos)</option>
                        {years.map((y) => (
                            <option key={y} value={y.toString()} className="bg-[#0b0e14]">
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ACTIVE FILTERS CHIPS & CLEAR BUTTON */}
            {hasActiveFilters && (
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mr-1">Filtros Ativos:</span>
                        {search && (
                            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                <span>Busca: "{search}"</span>
                                <button onClick={() => updateFilters({ search: null })} className="hover:text-white transition-colors">✕</button>
                            </div>
                        )}
                        {sectionId && (
                            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                <span>Tipo: {sections.find(s => s.id.toString() === sectionId)?.name || sectionId}</span>
                                <button onClick={() => updateFilters({ section: null })} className="hover:text-white transition-colors">✕</button>
                            </div>
                        )}
                        {magazineSlug && (
                            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                <span>Revista: {magazines.find(m => m.slug === magazineSlug)?.name || magazineSlug}</span>
                                <button onClick={() => updateFilters({ magazine: null })} className="hover:text-white transition-colors">✕</button>
                            </div>
                        )}
                        {year && (
                            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                <span>Ano: {year}</span>
                                <button onClick={() => updateFilters({ year: null })} className="hover:text-white transition-colors">✕</button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleClearFilters}
                        className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1 rounded-xl transition-all"
                    >
                        Limpar Filtros
                    </button>
                </div>
            )}
        </div>
    );
}

export default function SectionsFilterBar(props: SectionsFilterBarProps) {
    return (
        <Suspense fallback={
            <div className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl opacity-50 cursor-not-allowed">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input type="text" disabled placeholder="Buscar..." className="bg-white/5 border border-white/10 text-white pl-10 pr-9 py-2 rounded-xl text-sm" />
                    <select disabled className="bg-white/5 border border-white/10 text-white rounded-xl text-sm"><option>Tipo de Seção</option></select>
                    <select disabled className="bg-white/5 border border-white/10 text-white rounded-xl text-sm"><option>Revista</option></select>
                    <select disabled className="bg-white/5 border border-white/10 text-white rounded-xl text-sm"><option>Ano</option></select>
                </div>
            </div>
        }>
            <SectionsFilterBarContent {...props} />
        </Suspense>
    );
}

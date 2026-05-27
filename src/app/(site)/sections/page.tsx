import { getSections, getGlobalIssueSections } from "@/lib/issues";
import { getMagazines } from "@/lib/magazines";
import GlobalSectionCard from "@/components/GlobalSectionCard";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import SectionsFilterBar from "@/components/SectionsFilterBar";

export default async function SectionsPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ 
        page?: string; 
        search?: string; 
        section?: string; 
        magazine?: string; 
        year?: string; 
    }> 
}) {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || "1", 10) || 1;
    const searchQuery = resolvedSearchParams.search || "";
    const filterSection = resolvedSearchParams.section ? parseInt(resolvedSearchParams.section, 10) : undefined;
    const filterMagazine = resolvedSearchParams.magazine || "";
    const filterYear = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year, 10) : undefined;

    const isSearchMode = !!(searchQuery || filterSection || filterMagazine || filterYear);

    // 1. Fetch metadata required for the filter bar (magazines and section types list)
    const [allSectionsRes, allMagazinesRes] = await Promise.all([
        getSections(1, 100),
        getMagazines(1, 100)
    ]);

    const activeSectionsDropdown = allSectionsRes.results;
    const activeMagazinesDropdown = allMagazinesRes.results;

    let totalPages = 0;
    let groupedData: { type: any, sections: any }[] = [];
    let searchResults: any[] = [];
    let searchCount = 0;

    if (!isSearchMode) {
        // --- GROUPED BROWSE MODE ---
        // Fetch paginated section types
        const sectionTypesResponse = await getSections(currentPage, 10);
        const sectionTypes = sectionTypesResponse.results;
        totalPages = Math.ceil(sectionTypesResponse.count / 10);

        // Fetch previews (6) for each section type
        groupedData = await Promise.all(
            sectionTypes.map(async (type) => {
                const sections = await getGlobalIssueSections({ section: type.id, pageSize: 6 });
                return { type, sections };
            })
        );
        // Only display sections that have actual contents
        groupedData = groupedData.filter(r => r.sections.count > 0);
    } else {
        // --- UNIFIED SEARCH/FILTER MODE ---
        // Fetch paginated issue sections matching the filter parameters
        const searchResponse = await getGlobalIssueSections({
            page: currentPage,
            pageSize: 20,
            search: searchQuery,
            section: filterSection,
            magazine: filterMagazine,
            year: filterYear
        });
        searchResults = searchResponse.results;
        searchCount = searchResponse.count;
        totalPages = Math.ceil(searchResponse.count / 20);
    }

    return (
        <div className="flex flex-col gap-10 pb-20">
            {/* HEADER */}
            <header className="page-header !flex-col md:!flex-row md:!justify-between md:!items-center !gap-6">
                <div className="flex flex-col">
                    <h1 className="page-title">Seções</h1>
                    <p className="page-subtitle">Navegue pelas matérias e seções contidas nas revistas.</p>
                </div>
            </header>

            {/* COMBINED FILTER BAR */}
            <SectionsFilterBar 
                sections={activeSectionsDropdown} 
                magazines={activeMagazinesDropdown} 
            />

            {/* RESULTS CONTENT */}
            {!isSearchMode ? (
                // GROUPED BROWSE VIEW
                groupedData.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-gray-500 text-lg">Nenhuma seção encontrada.</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {groupedData.map(({ type, sections }) => (
                            <section key={type.id} className="space-y-6">
                                <div className="flex items-baseline justify-between border-b border-white/5 pb-4">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                        <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                                        {type.name}
                                        <span className="text-sm font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded ml-2">
                                            {sections.count}
                                        </span>
                                    </h2>
                                    
                                    {sections.count > 6 && (
                                        <Link 
                                            href={`/sections?section=${type.id}`} 
                                            className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2 group"
                                        >
                                            Ver Tudo 
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </Link>
                                    )}
                                </div>

                                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                                    {sections.results.map((item: any) => (
                                        <GlobalSectionCard key={`${item.issue_id}-${item.id}`} section={item} />
                                    ))}
                                </div>
                                
                                {sections.count > 6 && (
                                    <div className="flex justify-center pt-4">
                                        <Link 
                                            href={`/sections?section=${type.id}`}
                                            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                                        >
                                            Explorar todas as {sections.count} entradas de {type.name}
                                        </Link>
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )
            ) : (
                // UNIFIED SEARCH RESULTS VIEW
                <div className="space-y-8">
                    <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Resultados da Busca
                            <span className="text-xs font-bold text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">
                                {searchCount} {searchCount === 1 ? "entrada encontrada" : "entradas encontradas"}
                            </span>
                        </h2>
                    </div>

                    {searchResults.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                            <p className="text-gray-500 text-lg">Nenhuma matéria ou seção encontrada para os filtros selecionados.</p>
                            <Link href="/sections" className="text-blue-400 hover:underline inline-block font-bold">
                                Limpar filtros e ver todas as seções
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                            {searchResults.map((item) => (
                                <GlobalSectionCard key={`${item.issue_id}-${item.id}`} section={item} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="pt-10 border-t border-white/5">
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        baseUrl="/sections" 
                    />
                </div>
            )}
        </div>
    );
}

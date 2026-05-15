import { getSections, getGlobalIssueSections } from "@/lib/issues";
import GlobalSectionCard from "@/components/GlobalSectionCard";
import Link from "next/link";
import Pagination from "@/components/Pagination";

export default async function SectionsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page } = await searchParams;
    const currentPage = parseInt(page || "1");
    
    // Fetch section types paginated
    const sectionTypesResponse = await getSections(currentPage, 10);
    const sectionTypes = sectionTypesResponse.results;
    const totalPages = Math.ceil(sectionTypesResponse.count / 10);

    // Fetch previews for each section type
    const results = await Promise.all(
        sectionTypes.map(async (type) => {
            const sections = await getGlobalIssueSections({ section: type.id, pageSize: 6 });
            return { type, sections };
        })
    );

    const activeSections = results.filter(r => r.sections.count > 0);

    return (
        <div className="flex flex-col gap-12 pb-20">
            {/* HEADER */}
            <header className="page-header">
                <h1 className="page-title">Seções</h1>
                <p className="page-subtitle">Navegue pelo conteúdo das revistas categorizado por tipo.</p>
            </header>

            {activeSections.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                    <p className="text-gray-500 text-lg">Nenhuma seção encontrada nesta página.</p>
                    {currentPage > 1 && (
                        <Link href="/sections" className="text-blue-400 hover:underline mt-4 inline-block font-bold">
                            Voltar para a primeira página
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-16">
                    {activeSections.map(({ type, sections }) => (
                        <section key={type.id} className="space-y-6">
                            <div className="flex items-baseline justify-between border-b border-white/5 pb-4">
                                <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                    <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                                    {type.name}
                                    <span className="text-sm font-bold text-gray-600 bg-gray-900 px-2 py-0.5 rounded ml-2">
                                        {sections.count}
                                    </span>
                                </h2>
                                
                                {sections.count > 6 && (
                                    <Link 
                                        href={`/sections/${type.id}`} 
                                        className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2 group"
                                    >
                                        Ver Tudo 
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                )}
                            </div>

                            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                                {sections.results.map((item) => (
                                    <GlobalSectionCard key={`${item.issue_id}-${item.id}`} section={item} />
                                ))}
                            </div>
                            
                            {sections.count > 6 && (
                                <div className="flex justify-center pt-4">
                                    <Link 
                                        href={`/sections/${type.id}`}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                                    >
                                        Explorar todas as {sections.count} entradas de {type.name}
                                    </Link>
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            )}

            {/* PAGINATION OF TYPES */}
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

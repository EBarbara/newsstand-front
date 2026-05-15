import { getGlobalIssueSections, getSections } from "@/lib/issues";
import GlobalSectionCard from "@/components/GlobalSectionCard";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SectionTypePage({ params, searchParams }: { 
    params: Promise<{ id: string }>, 
    searchParams: Promise<{ page?: string }> 
}) {
    const { id } = await params;
    const { page } = await searchParams;
    const currentPage = parseInt(page || "1");
    const sectionId = parseInt(id);

    // Get section type name
    // We can't fetch a single section type easily by ID without a dedicated endpoint,
    // so we fetch all or just use the first page of types and find it.
    // Better: let's hope the backend allows /sections/{id}/
    let typeName = "Seção";
    try {
        const typeResponse = await getGlobalIssueSections({ section: sectionId, pageSize: 1 });
        if (typeResponse.count > 0) {
            typeName = typeResponse.results[0].section_name;
        } else {
            // If empty, maybe it doesn't exist or just has no items
            // We can try to get the type name from the sections list
            const allTypes = await getSections(1, 100);
            const type = allTypes.results.find(t => t.id === sectionId);
            if (type) typeName = type.name;
            else return notFound();
        }
    } catch (e) {
        return notFound();
    }

    const response = await getGlobalIssueSections({ section: sectionId, page: currentPage, pageSize: 24 });
    const totalPages = Math.ceil(response.count / 24);

    return (
        <div className="flex flex-col gap-10 pb-20">
            {/* HEADER */}
            <header className="page-header">
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/sections" className="text-blue-500 hover:text-blue-400 font-bold text-sm uppercase tracking-widest flex items-center gap-1">
                        ← Voltar
                    </Link>
                </div>
                <h1 className="page-title">{typeName}</h1>
                <p className="page-subtitle">Explorando todas as edições e matérias categorizadas como {typeName}.</p>
            </header>

            {response.results.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                    <p className="text-gray-500">Nenhuma entrada encontrada para esta seção.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                        {response.results.map((item) => (
                            <GlobalSectionCard key={`${item.issue_id}-${item.id}`} section={item} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pt-10 border-t border-white/5">
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                baseUrl={`/sections/${id}`} 
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

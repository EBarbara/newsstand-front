import { getMagazines } from "@/lib/magazines";
import MagazineCard from "@/components/MagazineCard";
import Pagination from "@/components/Pagination";
import CreateMagazineButton from "@/components/CreateMagazineButton";
import PageSearch from "@/components/PageSearch";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10) || 1;
    const searchQuery = resolvedSearchParams.search || "";
    const response = await getMagazines(currentPage, 20, searchQuery);
    const magazines = response.results;
    const totalPages = Math.ceil(response.count / 20);

    return (
        <div className="flex flex-col gap-8 pb-12">

            {/* HEADER */}
            <header className="page-header !flex-row !justify-between !items-center !gap-4">
                <div className="flex flex-col">
                    <h1 className="page-title">
                        Revistas
                    </h1>
                    <p className="page-subtitle">
                        Navegue pela sua coleção de revistas.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <PageSearch placeholder="Buscar revistas..." className="w-64" />
                    <CreateMagazineButton />
                </div>
            </header>

            {/* EMPTY */}
            {magazines.length === 0 ? (
                <div className="text-center p-10 border rounded-lg text-gray-500">
                    Nenhuma revista encontrada.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
                        {magazines.map((mag) => (
                            <MagazineCard key={mag.slug} mag={mag} />
                        ))}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            baseUrl="/magazines" 
                        />
                    )}
                </>
            )}
        </div>
    );
}
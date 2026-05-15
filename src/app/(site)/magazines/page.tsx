import { getMagazines } from "@/lib/magazines";
import MagazineCard from "@/components/MagazineCard";

export default async function Page() {
    const response = await getMagazines();
    const magazines = response.results;

    return (
        <div className="flex flex-col gap-8">

            {/* HEADER */}
            <header className="page-header">
                <h1 className="page-title">
                    Revistas
                </h1>
                <p className="page-subtitle">
                    Navegue pela sua coleção de revistas.
                </p>
            </header>

            {/* EMPTY */}
            {magazines.length === 0 ? (
                <div className="text-center p-10 border rounded-lg text-gray-500">
                    Nenhuma revista encontrada.
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
                    {magazines.map((mag) => (
                        <MagazineCard key={mag.slug} mag={mag} />
                    ))}
                </div>
            )}
        </div>
    );
}
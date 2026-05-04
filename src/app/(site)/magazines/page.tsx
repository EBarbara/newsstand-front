import { getMagazines } from "@/lib/magazines";
import MagazineCard from "@/components/MagazineCard";

export default async function Page() {
    const response = await getMagazines();
    const magazines = response.results;

    return (
        <div className="flex flex-col gap-8">

            {/* HEADER */}
            <header>
                <h1 className="text-3xl font-bold">
                    Revistas
                </h1>
                <p className="text-gray-500">
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
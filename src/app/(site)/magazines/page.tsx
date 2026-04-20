import { getMagazines } from "@/lib/magazines";
import MagazineCard from "@/components/MagazineCard";

export default async function Page() {
    const magazines = await getMagazines();

    return (
        <div className="flex flex-col gap-8">

            {/* HEADER */}
            <header>
                <h1 className="text-3xl font-bold">
                    Magazines
                </h1>
                <p className="text-gray-500">
                    Browse your magazine collection.
                </p>
            </header>

            {/* EMPTY */}
            {magazines.length === 0 ? (
                <div className="text-center p-10 border rounded-lg text-gray-500">
                    No magazines found.
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
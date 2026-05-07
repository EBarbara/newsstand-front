import Link from "next/link";

import { getIssuesByMagazine } from "@/lib/issues";
import IssueCard from "@/components/issueCard/IssueCard";
import ImportCbzButton from "@/components/ImportCbzButton";
import CreateEmptyIssueButton from "@/components/CreateEmptyIssueButton";
import Pagination from "@/components/Pagination";

type Props = {
    params: Promise<{ slug: string; }>;
    searchParams: Promise<{ page?: string; is_special?: string; }>;
}

export default async function Page({ params, searchParams }: Props) {
    const { slug } = await params;
    const { page, is_special } = await searchParams;
    const currentPage = parseInt(page || "1");

    const response = await getIssuesByMagazine(slug, currentPage, { is_special });
    const issues = response.results;
    const magazineName = issues.length > 0 ? issues[0].magazine.name : slug;

    const totalPages = Math.ceil(response.count / 20);

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* BREADCRUMB */}
            <nav className="text-sm text-gray-500">
                <Link href="/">Home</Link> /{" "}
                <span className="capitalize">{magazineName}</span>
            </nav>

            {/* HEADER */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">
                        {magazineName}
                    </h1>
                    <p className="text-gray-500">
                        Todas as edições desta revista.
                    </p>
                </div>
                <div className="flex gap-3">
                    <CreateEmptyIssueButton magazineSlug={slug} />
                    <ImportCbzButton magazineSlug={slug} />
                </div>
            </header>

            {/* FILTERS */}
            <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mostrar:</span>
                <div className="flex p-1 bg-gray-900/50 rounded-lg border border-white/5">
                    <Link 
                        href={{ pathname: `/magazines/${slug}`, query: {} }}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            !is_special 
                            ? "bg-blue-600 text-white shadow-lg" 
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        Todas
                    </Link>
                    <Link 
                        href={{ pathname: `/magazines/${slug}`, query: { is_special: 'false' } }}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            is_special === 'false' 
                            ? "bg-blue-600 text-white shadow-lg" 
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        Mensais
                    </Link>
                    <Link 
                        href={{ pathname: `/magazines/${slug}`, query: { is_special: 'true' } }}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            is_special === 'true' 
                            ? "bg-amber-600 text-white shadow-lg" 
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        Especiais ⭐
                    </Link>
                </div>
            </div>

            {/* EMPTY STATE */}
            {issues.length === 0 ? (
                <div className="text-center p-10 border rounded-lg text-gray-500">
                    Nenhuma edição encontrada para esta revista.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                        {issues.map(issue => (
                            <IssueCard key={issue.id} issue={issue} />
                        ))}
                    </div>

                    {/* PAGINATION */}
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            baseUrl={`/magazines/${slug}`}
                        />
                </>
            )}
        </div>
    );
}
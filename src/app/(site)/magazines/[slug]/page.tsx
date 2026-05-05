import Link from "next/link";

import { getIssuesByMagazine } from "@/lib/issues";
import IssueCard from "@/components/issueCard/IssueCard";
import ImportCbzButton from "@/components/ImportCbzButton";
import CreateEmptyIssueButton from "@/components/CreateEmptyIssueButton";

type Props = {
    params: Promise<{ slug: string; }>;
    searchParams: Promise<{ page?: string; }>;
}

export default async function Page({ params, searchParams }: Props) {
    const { slug } = await params;
    const { page } = await searchParams;
    const currentPage = parseInt(page || "1");

    const response = await getIssuesByMagazine(slug, currentPage);
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
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-6 mt-12 pt-8 border-t border-gray-800">
                            {response.previous ? (
                                <Link 
                                    href={`?page=${currentPage - 1}`}
                                    className="px-6 py-2 bg-[#1a1d23] border border-gray-700 rounded-full text-sm font-medium hover:bg-gray-800 hover:border-gray-500 transition-all"
                                >
                                    ← Anterior
                                </Link>
                            ) : (
                                <span className="px-6 py-2 bg-transparent border border-gray-800 text-gray-600 rounded-full text-sm font-medium cursor-not-allowed">
                                    ← Anterior
                                </span>
                            )}
                            
                            <span className="text-gray-400 text-sm font-mono">
                                {currentPage} <span className="opacity-30">/</span> {totalPages}
                            </span>

                            {response.next ? (
                                <Link 
                                    href={`?page=${currentPage + 1}`}
                                    className="px-6 py-2 bg-[#1a1d23] border border-gray-700 rounded-full text-sm font-medium hover:bg-gray-800 hover:border-gray-500 transition-all"
                                >
                                    Próximo →
                                </Link>
                            ) : (
                                <span className="px-6 py-2 bg-transparent border border-gray-800 text-gray-600 rounded-full text-sm font-medium cursor-not-allowed">
                                    Próximo →
                                </span>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
import Link from "next/link";

import { getIssuesByMagazine } from "@/lib/issues";
import IssueCard from "@/components/issueCard/IssueCard";
import ImportCbzButton from "@/components/ImportCbzButton";

type Props = {
    params: Promise<{ slug: string; }>
}

export default async function Page({ params }: Props) {
    const { slug } = await params;
    const issues = await getIssuesByMagazine(slug)
    const magazineName = issues.length > 0 ? issues[0].magazine.name : slug;

    return (
        <div className="flex flex-col gap-8">
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
                        All issues from this magazine.
                    </p>
                </div>
                <div>
                    <ImportCbzButton magazineSlug={slug} />
                </div>
            </header>

            {/* EMPTY STATE */}
            {issues.length === 0 ? (
                <div className="text-center p-10 border rounded-lg text-gray-500">
                    No issues found for this magazine.
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                    {issues.map(issue => (
                        <IssueCard key={issue.id} issue={issue} />
                    ))}
                </div>
            )}
        </div>
    );
}
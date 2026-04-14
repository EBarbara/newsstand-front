import Link from "next/link";

import SectionCard from "@/components/SectionCard";
import { getIssueDetail } from "@/lib/issues";

type Props = {
    params: Promise<{
        slug: string;
        edition: string;
    }>;
};

export default async function Page({ params }: Props) {
    const { slug, edition } = await params;

    if (!slug || !edition) {
        throw new Error("Invalid params");
    }

    const issueData = await getIssueDetail(slug, edition);

    return (
        <div className="flex flex-col gap-8">

            {/* BREADCRUMB */}
            <nav className="text-sm text-gray-500">
                <Link href="/public">Home</Link> /{" "}
                <Link href="/magazines">Magazines</Link> /{" "}
                <Link href={`/magazines/${slug}`}>
                    {issueData.magazine.name}
                </Link> /{" "}
                <span>Issue #{issueData.edition ?? issueData.id}</span>
            </nav>

            {/* HEADER */}
            <header className="flex gap-6 items-start">

                {/* COVER */}
                {issueData.covers?.[0] && (
                    <img
                        src={issueData.covers[0].image}
                        alt="Cover"
                        className="w-40 rounded shadow"
                    />
                )}

                {/* INFO */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">
                        {issueData.magazine.name}
                    </h1>

                    <p className="text-gray-500">
                        {issueData.publishing_date}
                        {issueData.edition && ` • Issue #${issueData.edition}`}
                    </p>

                    <div className="text-sm">
                        {issueData.is_digital ? "Digital" : "Physical"}
                    </div>
                </div>
            </header>

            {/* ACTIONS */}
            <div>
                <Link
                    href={`/magazines/${slug}/${edition}/read`}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Read Issue
                </Link>
            </div>

            {/* SECTIONS */}
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Contents</h2>

                {issueData.sections.length === 0 ? (
                    <p className="text-gray-500">
                        No sections available.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {issueData.sections.map((section) => (
                            <SectionCard
                                key={section.id}
                                section={section}
                                slug={slug}
                                edition={edition}
                                issueId={issueData.id}
                            />
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
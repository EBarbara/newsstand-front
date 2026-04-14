import Link from "next/link";

import { IssueSection } from "@/types/api";
import {getPageImageUrl} from "@/lib/issues";

type Props = {
    section: IssueSection;
    slug: string;
    edition: string;
    issueId: number;
};

export default function SectionCard({ section, slug, edition, issueId, }: Props) {
    const firstIndex = section.page_indexes?.[0];

    return (
        <Link
            href={`/magazines/${slug}/${edition}/read?section=${section.id}`}
            className="flex items-center gap-4 border p-4 rounded hover:bg-gray-900 transition"
        >
            <div className="flex flex-col flex-1 min-w-0">
                <div className="font-medium">
                    {section.section.name}
                </div>

                {section.page && (
                    <div className="text-sm text-gray-500">
                        Page {section.page}
                    </div>
                )}
            </div>

            {/* THUMBNAIL */}
            {firstIndex !== undefined && (
                <img
                    src={getPageImageUrl(issueId, firstIndex)}
                    className="h-40 w-auto shrink-0 object-contain bg-gray-950 rounded shadow p-1"
                    alt={section.section.name}
                    loading="lazy"
                />
            )}
        </Link>
    );
}
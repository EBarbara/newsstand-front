import Link from "next/link";

import { getMediaUrl } from "@/lib/issues";
import { IssueSection } from "@/@types/issueSection";
import { Render } from "@/@types/render";

type Props = {
    section: IssueSection;
    slug: string;
    edition: string;
    issueId: number;
    renders: Render[];
};

export default function SectionCard({ section, slug, edition, issueId, renders }: Props) {
    const firstIndex = section.segments[0]?.start_page;
    const render = renders?.find((r) => r.order === firstIndex);
    const imageUrl = render ? getMediaUrl(render.image) : null;

    return (
        <Link
            href={`/reader/${issueId}?page=${firstIndex}`}
            className="flex items-center gap-4 border p-4 rounded hover:bg-gray-900 transition"
        >
            <div className="flex flex-col flex-1 min-w-0">
                <div className="font-medium">
                    {section.title || section.section.name}
                </div>
                {section.credits && section.credits.length > 0 && (
                    <div className="text-sm text-gray-500 mt-1 truncate">
                        {/* Major Credits */}
                        {section.credits.filter(c => c.importance === 1).map((c, i, arr) => (
                            <span key={`major-${i}`} className="font-bold text-gray-300">
                                {c.person?.name}{c.age_at_issue && ` ${c.age_at_issue}`}{c.role ? ` (${c.role})` : ""}
                                {(i < arr.length - 1 || section.credits.some(c => c.importance > 1)) && ", "}
                            </span>
                        ))}
                        {/* Regular Credits */}
                        {section.credits.filter(c => (c.importance === 2 || !c.importance)).map((c, i, arr) => (
                            <span key={`reg-${i}`}>
                                {c.person?.name}{c.age_at_issue && ` ${c.age_at_issue}`}{c.role ? ` (${c.role})` : ""}
                                {(i < arr.length - 1 || section.credits.some(c => c.importance === 3)) && ", "}
                            </span>
                        ))}
                        {/* Minor Credits (Mentions) */}
                        {section.credits.some(c => c.importance === 3) && (
                             <span className="text-xs text-gray-600 italic">
                                {` e mais ${section.credits.filter(c => c.importance === 3).length} menções`}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* THUMBNAIL */}
            {imageUrl && (
                <img
                    src={imageUrl}
                    className="h-40 w-auto shrink-0 object-contain bg-gray-950 rounded shadow p-1"
                    alt={section.section.name}
                    loading="lazy"
                />
            )}
        </Link>
    );
}
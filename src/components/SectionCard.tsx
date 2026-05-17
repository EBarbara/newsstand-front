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

    const sortedCredits = section.credits ? [...section.credits].sort((a, b) => (a.importance || 2) - (b.importance || 2)) : [];

    return (
        <div className="flex items-start gap-4 border border-gray-800 p-4 rounded bg-gray-900/20">
            <div className="flex flex-col flex-1 min-w-0">
                <div className="font-medium text-lg">
                    {firstIndex !== undefined ? (
                        <Link href={`/reader/${issueId}?page=${firstIndex}`} className="hover:underline hover:text-blue-400 transition-colors">
                            {section.title || section.section.name}
                        </Link>
                    ) : (
                        <span>{section.title || section.section.name}</span>
                    )}
                </div>
                {sortedCredits.length > 0 && (
                    <div className="text-sm text-gray-400 mt-1 flex flex-wrap gap-x-1 gap-y-0.5">
                        {sortedCredits.map((c, i, arr) => {
                            const isMajor = c.importance === 1;
                            const isMinor = c.importance === 3;
                            
                            return (
                                <span key={`credit-${i}`} className={isMajor ? "font-bold text-gray-200" : isMinor ? "text-xs text-gray-500 italic mt-0.5" : "text-gray-400"}>
                                    <Link href={`/people/${c.person_id}`} className="hover:underline hover:text-blue-400 transition-colors">
                                        {c.person?.name}
                                    </Link>
                                    {c.age_at_issue && ` ${c.age_at_issue}`}
                                    {c.role && ` (${c.role})`}
                                    {i < arr.length - 1 && ","}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* THUMBNAIL */}
            {imageUrl && (
                firstIndex !== undefined ? (
                    <Link href={`/reader/${issueId}?page=${firstIndex}`} className="shrink-0 block">
                        <img
                            src={imageUrl}
                            className="h-40 w-auto shrink-0 object-contain bg-gray-950 rounded shadow p-1 hover:ring-2 hover:ring-blue-500 transition-all"
                            alt={section.section.name}
                            loading="lazy"
                        />
                    </Link>
                ) : (
                    <img
                        src={imageUrl}
                        className="h-40 w-auto shrink-0 object-contain bg-gray-950 rounded shadow p-1"
                        alt={section.section.name}
                        loading="lazy"
                    />
                )
            )}
        </div>
    );
}
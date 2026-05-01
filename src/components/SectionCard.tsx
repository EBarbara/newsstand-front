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
    console.log("imageUrl:", imageUrl);

    return (
        <Link
            href={`/reader/${issueId}?section=${section.id}`}
            className="flex items-center gap-4 border p-4 rounded hover:bg-gray-900 transition"
        >
            <div className="flex flex-col flex-1 min-w-0">
                <div className="font-medium">
                    {section.title || section.section.name}
                </div>
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
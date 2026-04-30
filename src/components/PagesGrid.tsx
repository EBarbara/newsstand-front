import PageThumbnail from "@/components/PageThumbnail";
import { IssueEditorState } from "@/hooks/useIssueEditor";
import { Render } from "@/@types/render";

type Props = Pick<
    IssueEditorState,
    "issue" | "pageMap" | "assignPage"
>

export default function PagesGrid({ issue, pageMap, assignPage }: Props) {
    if (!issue) return null;

    return (
        <div className="flex-1 overflow-y-auto grid grid-cols-[repeat(auto-fill,120px)] gap-2.5 p-2.5">
            {issue.renders.map((r: Render) => (
                <PageThumbnail
                    key={r.order}
                    page={r.order}
                    image={r.image}
                    sectionId={pageMap[r.order]}
                    onClick={() => assignPage(r.order)}
                />
            ))}
        </div>
    )
}
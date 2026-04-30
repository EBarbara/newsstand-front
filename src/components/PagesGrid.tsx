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
        <div
            style={{
            flex: 1,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 120px)",
            gap: 10,
            padding: 10
        }}>
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
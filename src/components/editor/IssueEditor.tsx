"use client"

import SectionsPanel from "@/components/SectionsPanel";
import PagesGrid from "@/components/PagesGrid";
import { useIssueEditor } from "@/hooks/useIssueEditor";

type Props = {
    slug: string,
    edition: string,
}

export default function IssueEditor({ slug, edition }: Props) {
    const editor = useIssueEditor(slug, edition);

    if (!editor.issue) return <div>Loading...</div>

    return (
        <div
            onClick={() => editor.setSelectedSectionId(null)}
            style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <SectionsPanel {...editor} />
            <PagesGrid {...editor} />
        </div>
    );
}
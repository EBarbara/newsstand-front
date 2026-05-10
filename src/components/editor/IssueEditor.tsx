"use client"

import SectionsPanel from "@/components/SectionsPanel";
import PagesGrid from "@/components/PagesGrid";
import { useIssueEditor } from "@/hooks/useIssueEditor";
import ImportStatusModal from "@/components/ImportStatusModal";

type Props = {
    slug: string,
    edition: string,
}

export default function IssueEditor({ slug, edition }: Props) {
    const editor = useIssueEditor(slug, edition);

    if (editor.error) return <div className="p-10 text-red-500 font-bold">{editor.error}</div>
    if (!editor.issue) return <div>Loading...</div>

    return (
        <div
            onClick={() => editor.setSelectedSectionId(null)}
            style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <SectionsPanel {...editor} />
            <PagesGrid {...editor} />

            <ImportStatusModal 
                status={editor.importStatus}
                pagesCount={editor.importedPagesCount}
                error={editor.importError}
                onClose={() => editor.setImportStatus('idle')}
            />
        </div>
    );
}
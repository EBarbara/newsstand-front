import { useRef } from "react";
import PageThumbnail from "@/components/PageThumbnail";
import { IssueEditorState } from "@/hooks/useIssueEditor";
import { Render } from "@/@types/render";

type Props = Pick<
    IssueEditorState,
    "issue" | "pageMap" | "assignPage" | "selectedSectionId" | "handleUploadPage" | "handleReplacePage" | "handleDeletePage"
>

export default function PagesGrid({ issue, pageMap, assignPage, selectedSectionId, handleUploadPage, handleReplacePage, handleDeletePage }: Props) {
    const uploadInputRef = useRef<HTMLInputElement>(null);

    if (!issue) return null;

    return (
        <div className="flex-1 overflow-y-auto grid grid-cols-[repeat(auto-fill,180px)] gap-6 p-6 bg-[#0b0e14] items-start content-start">
            {issue.renders.map((r: Render) => (
                <PageThumbnail
                    key={r.order}
                    id={r.id}
                    page={r.order}
                    image={r.image}
                    sectionId={pageMap[r.order]}
                    isSelectedSection={selectedSectionId !== null && pageMap[r.order] === selectedSectionId}
                    onClick={() => assignPage(r.order)}
                    onReplace={(file) => handleReplacePage(r.id, file)}
                    onDelete={() => handleDeletePage(r.id)}
                />
            ))}

            {/* ADD PAGE BUTTON */}
            <div 
                onClick={() => uploadInputRef.current?.click()}
                className="w-full aspect-[2/3] border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all text-gray-500 hover:text-blue-400 group"
            >
                <span className="text-3xl mb-2 group-hover:scale-125 transition-transform">+</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Add Page</span>
                <input 
                    type="file" 
                    ref={uploadInputRef} 
                    className="hidden" 
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleUploadPage(file));
                    }}
                />
            </div>
        </div>
    )
}
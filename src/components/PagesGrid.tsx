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

    const handleUrlUpload = async () => {
        const url = window.prompt("Cole a URL da imagem:");
        if (!url) return;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Falha ao baixar imagem");
            const blob = await response.blob();
            
            // Generate a filename from URL or timestamp
            const filename = url.split('/').pop()?.split('?')[0] || `imported_page_${Date.now()}.jpg`;
            const file = new File([blob], filename, { type: blob.type });
            
            await handleUploadPage(file);
        } catch (error) {
            console.error("URL Import failed", error);
            alert("Falha ao importar por URL. Verifique se o link está correto e se o site permite acesso (CORS).");
        }
    };

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
                    onInsert={async (files) => {
                        for (let i = 0; i < files.length; i++) {
                            await handleUploadPage(files[i], r.order + i);
                        }
                    }}
                />
            ))}

            {/* ADD PAGE CARD */}
            <div className="w-full aspect-[2/3] border-2 border-dashed border-gray-800 rounded-lg flex flex-col items-stretch overflow-hidden bg-white/[0.02]">
                {/* UPLOAD ZONE */}
                <div 
                    onClick={() => uploadInputRef.current?.click()}
                    className="flex-[2] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-500/10 transition-all text-gray-500 hover:text-blue-400 group border-b border-gray-800/50"
                >
                    <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">+</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                    <input 
                        type="file" 
                        ref={uploadInputRef} 
                        className="hidden" 
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            for (const file of files) {
                                await handleUploadPage(file);
                            }
                        }}
                    />
                </div>
                
                {/* URL ZONE */}
                <button 
                    onClick={handleUrlUpload}
                    className="flex-1 flex flex-col items-center justify-center bg-white/[0.03] hover:bg-blue-500/20 transition-all text-gray-600 hover:text-blue-400 group"
                >
                    <span className="text-xl mb-0 group-hover:scale-110 transition-transform">🔗</span>
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Import from URL</span>
                </button>
            </div>
        </div>
    )
}
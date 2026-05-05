import { useRef } from "react";
import { getMediaUrl } from "@/lib/issues";

type Props = {
    id: number
    page: number
    image: string
    sectionId: number | null
    isSelectedSection: boolean
    onClick: () => void
    onReplace: (file: File) => void
    onDelete: () => void
    onInsert: (files: File[]) => void
}

export default function PageThumbnail({ id, page, image, sectionId, isSelectedSection, onClick, onReplace, onDelete, onInsert }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const insertInputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
            className={`
                relative cursor-pointer group transition-all duration-200 border-2 rounded
                ${isSelectedSection 
                    ? "border-blue-400 ring-4 ring-blue-500/30 z-10 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-[1.03]" 
                    : sectionId 
                        ? "border-blue-600/50" 
                        : "border-gray-800 hover:border-gray-700"}
            `}
        >
            {/* INSERT BEFORE BUTTONS */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-40">
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        insertInputRef.current?.click();
                    }}
                    className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:scale-125 shadow-lg cursor-pointer border border-white/20"
                    title="Insert page before"
                >
                    <span className="text-white text-lg font-bold leading-none">+</span>
                </div>
                <div 
                    onClick={async (e) => {
                        e.stopPropagation();
                        const url = window.prompt("URL da imagem para inserir antes:");
                        if (!url) return;
                        try {
                            const res = await fetch(url);
                            const blob = await res.blob();
                            const filename = url.split('/').pop()?.split('?')[0] || "inserted.jpg";
                            onInsert([new File([blob], filename, { type: blob.type })]);
                        } catch (err) { alert("Erro ao importar."); }
                    }}
                    className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center hover:scale-125 shadow-lg cursor-pointer border border-white/20"
                    title="Insert by URL before"
                >
                    <span className="text-white text-[10px] font-bold">URL</span>
                </div>
            </div>

            {/* HOVER OVERLAY */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex flex-col items-center justify-center gap-2 p-2">
                <div className="flex w-full gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                        }}
                        className="flex-1 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-500 transition-colors"
                    >
                        REPLACE
                    </button>
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            const url = window.prompt("Cole a URL da nova imagem:");
                            if (!url) return;
                            try {
                                const res = await fetch(url);
                                const blob = await res.blob();
                                const filename = url.split('/').pop()?.split('?')[0] || "replaced.jpg";
                                onReplace(new File([blob], filename, { type: blob.type }));
                            } catch (err) { alert("Erro ao importar."); }
                        }}
                        className="px-2 py-1 bg-blue-900 text-white text-[10px] font-bold rounded hover:bg-blue-800 transition-colors"
                        title="Replace by URL"
                    >
                        LINK
                    </button>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="w-full py-1 bg-red-600/80 text-white text-[10px] font-bold rounded hover:bg-red-500 transition-colors"
                >
                    DELETE
                </button>
            </div>

            <input
                type="file"
                ref={insertInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) onInsert(files);
                }}
            />

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onReplace(file);
                }}
            />

            <div className={`
                absolute top-0 right-0 px-1.5 py-0.5 text-[10px] font-bold z-20 rounded-bl shadow-sm
                ${isSelectedSection 
                    ? "bg-blue-500 text-white" 
                    : sectionId 
                        ? "bg-blue-900 text-blue-100" 
                        : "bg-gray-900 text-gray-400"}
            `}>
                {page}
            </div>

            <img 
                src={getMediaUrl(image, true)} 
                className={`w-full block rounded-sm transition-opacity ${!sectionId && !isSelectedSection ? "opacity-60 grayscale-[0.3]" : "opacity-100"}`} 
                alt={`Page ${page}`} 
            />

            {isSelectedSection && (
                <div className="absolute inset-0 border-2 border-blue-400 rounded-sm pointer-events-none animate-pulse-subtle bg-blue-500/10" />
            )}
        </div>
    )
}
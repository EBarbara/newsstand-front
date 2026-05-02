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
}

export default function PageThumbnail({ id, page, image, sectionId, isSelectedSection, onClick, onReplace, onDelete }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            {/* HOVER OVERLAY */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex flex-col items-center justify-center gap-2 p-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                    }}
                    className="w-full py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-500 transition-colors"
                >
                    REPLACE
                </button>
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
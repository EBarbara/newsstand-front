import { useRef, useState } from "react";
import { getMediaUrl } from "@/lib/issues";
import { Render } from "@/@types/render";
import FocusModal from "./editor/FocusModal";

type Props = {
    id: number
    page: number
    image: string
    isCover: boolean
    pageType: Render['page_type']
    focusX: number
    focusY: number
    sectionId: number | null
    isSelectedSection: boolean
    onClick: () => void
    onReplace: (file: File) => void
    onDelete: () => void
    onUpdate: (data: Partial<Render>) => void
    onInsert: (files: File[]) => void
    onMove: (direction: 'up' | 'down') => void
}

export default function PageThumbnail({ 
    id, page, image, isCover, pageType, focusX, focusY,
    sectionId, isSelectedSection, onClick, onReplace, onDelete, onUpdate, onInsert, onMove
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const insertInputRef = useRef<HTMLInputElement>(null);
    const [isAdjustingFocus, setIsAdjustingFocus] = useState(false);

    const handleImageClick = (e: React.MouseEvent) => {
        onClick();
    };

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`
                relative cursor-pointer group transition-all duration-200 border-2 rounded flex flex-col bg-[#1a1f26]
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
            </div>

            {/* PAGE NUMBER & COVER BADGE */}
            <div className="absolute top-0 left-0 right-0 p-1 flex justify-between items-start z-50 pointer-events-none">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({ is_cover: !isCover });
                    }}
                    className={`
                        p-1 rounded shadow-sm pointer-events-auto transition-colors
                        ${isCover ? "bg-yellow-500 text-white" : "bg-black/50 text-white/30 hover:text-white/70"}
                    `}
                    title={isCover ? "Remover Capa" : "Marcar como Capa"}
                >
                    <StarIcon size={12} fill={isCover ? "currentColor" : "none"} />
                </button>

                <div className="flex gap-1 items-center pointer-events-auto">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onMove('up');
                        }}
                        className="p-1 bg-black/50 text-white/50 hover:text-white hover:bg-blue-600 rounded transition-colors"
                        title="Mover para esquerda"
                    >
                        <ChevronLeft size={10} />
                    </button>
                    
                    <div className={`
                        px-1.5 py-0.5 text-[10px] font-bold rounded shadow-sm
                        ${isSelectedSection 
                            ? "bg-blue-500 text-white" 
                            : sectionId 
                                ? "bg-blue-900 text-blue-100" 
                                : "bg-gray-900 text-gray-400"}
                    `}>
                        {page}
                    </div>

                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onMove('down');
                        }}
                        className="p-1 bg-black/50 text-white/50 hover:text-white hover:bg-blue-600 rounded transition-colors"
                        title="Mover para direita"
                    >
                        <ChevronRight size={10} />
                    </button>
                </div>
            </div>

            {/* IMAGE AREA */}
            <div className="relative w-full overflow-hidden" onClick={handleImageClick}>
                <img 
                    src={getMediaUrl(image, true)} 
                    className={`
                        w-full h-auto block transition-opacity 
                        ${!sectionId && !isSelectedSection ? "opacity-60 grayscale-[0.3]" : "opacity-100"}
                    `} 
                    alt={`Page ${page}`} 
                />
                
                {/* FOCUS POINT VISUALIZER (ONLY IF COVER) */}
                {isCover && (
                    <div 
                        className="absolute w-4 h-4 border-2 border-orange-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                        style={{ left: `${focusX}%`, top: `${focusY}%` }}
                    />
                )}

                {/* HOVER OVERLAY */}
                <div className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex flex-col items-center justify-center gap-2 p-2`}>
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
                        {isCover && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAdjustingFocus(true);
                                }}
                                className="flex-1 py-1 bg-orange-600 text-white text-[10px] font-bold rounded hover:bg-orange-500 transition-colors"
                            >
                                FOCUS
                            </button>
                        )}
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
            </div>

            {/* CONTROLS FOOTER (ONLY IF COVER) */}
            {isCover && (
                <div className="p-1.5 flex flex-col gap-1.5 border-t border-gray-800">
                    <select
                        value={pageType}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdate({ page_type: e.target.value as any })}
                        className="w-full bg-[#2a303c] text-[10px] text-gray-300 font-bold p-1 rounded border border-gray-700 focus:border-blue-500 outline-none"
                    >
                        <option value="NORMAL">Normal</option>
                        <option value="SPREAD">Página Dupla</option>
                        <option value="GATEFOLD">Desdobrável</option>
                    </select>
                </div>
            )}

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

            {isSelectedSection && (
                <div className="absolute inset-0 border-2 border-blue-400 rounded-sm pointer-events-none animate-pulse-subtle bg-blue-500/10 z-10" />
            )}

            {/* FOCUS MODAL */}
            {isAdjustingFocus && (
                <FocusModal 
                    imageUrl={image}
                    initialX={focusX}
                    initialY={focusY}
                    onSave={(x, y) => {
                        onUpdate({ focus_x: x, focus_y: y });
                        setIsAdjustingFocus(false);
                    }}
                    onClose={() => setIsAdjustingFocus(false)}
                />
            )}
        </div>
    )
}

function StarIcon({ size = 16, fill = "none" }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill={fill} 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    );
}

function ChevronLeft({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
        </svg>
    );
}

function ChevronRight({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
        </svg>
    );
}
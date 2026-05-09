"use client";

import { useState } from "react";
import { Render } from "@/@types/render";
import { getMediaUrl } from "@/lib/issues";

interface Props {
    renders: Render[];
    defaultCover?: string;
}

export default function CoverGallery({ renders, defaultCover }: Props) {
    const covers = renders.filter(r => r.is_cover).sort((a, b) => a.order - b.order);
    
    // If no renders are explicitly marked as cover, use the default cover or the first render
    const displayCovers = covers.length > 0 
        ? covers 
        : renders.filter(r => r.order === 0 || r.id === renders[0]?.id).slice(0, 1);

    const [selectedIdx, setSelectedIdx] = useState(0);
    const selectedCover = displayCovers[selectedIdx];

    if (!selectedCover && !defaultCover) return null;

    return (
        <div className="flex flex-col gap-4 shrink-0 max-w-full">
            {/* MAIN COVER DISPLAY */}
            <div className="relative bg-gray-900 shadow-2xl group h-[220px] md:h-[360px] w-fit mx-auto md:mx-0">
                <img
                    src={selectedCover ? getMediaUrl(selectedCover.image) : defaultCover}
                    alt="Cover"
                    className="h-full w-auto block transition-transform duration-500 group-hover:scale-[1.01]"
                />

                {/* NAVIGATION ARROWS (ONLY IF MULTIPLE) */}
                {displayCovers.length > 1 && (
                    <>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIdx(prev => (prev > 0 ? prev - 1 : displayCovers.length - 1));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 backdrop-blur-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIdx(prev => (prev < displayCovers.length - 1 ? prev + 1 : 0));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 backdrop-blur-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
                
                {/* GATEFOLD BADGE */}
                {selectedCover?.page_type === 'GATEFOLD' && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-600/90 text-[10px] font-bold text-white rounded backdrop-blur-sm shadow-lg">
                        DESDOBRÁVEL
                    </div>
                )}
                
                {/* SPREAD BADGE */}
                {selectedCover?.page_type === 'SPREAD' && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-purple-600/90 text-[10px] font-bold text-white rounded backdrop-blur-sm shadow-lg">
                        DUPLA
                    </div>
                )}
            </div>

            {/* THUMBNAILS (ONLY IF MULTIPLE) */}
            {displayCovers.length > 1 && (
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">
                        {displayCovers.length} Capas Disponíveis
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {displayCovers.map((cover, idx) => (
                            <button
                                key={cover.id}
                                onClick={() => setSelectedIdx(idx)}
                                className={`relative w-16 md:w-20 aspect-[3/4] shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                                    selectedIdx === idx ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                                }`}
                            >
                                <img
                                    src={getMediaUrl(cover.image)}
                                    alt={`Variant ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    style={{
                                        objectPosition: `${cover.focus_x}% ${cover.focus_y}%`
                                    }}
                                />
                                {selectedIdx === idx && (
                                    <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
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

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
        <div className="flex flex-col gap-4 w-40 md:w-64 shrink-0">
            {/* MAIN COVER DISPLAY */}
            <div className="relative aspect-[3/4] bg-gray-900 rounded-lg shadow-xl overflow-hidden group">
                <img
                    src={selectedCover ? getMediaUrl(selectedCover.image) : defaultCover}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{
                        objectPosition: selectedCover ? `${selectedCover.focus_x}% ${selectedCover.focus_y}%` : '0% 50%'
                    }}
                />
                
                {/* GATEFOLD BADGE */}
                {selectedCover?.page_type === 'GATEFOLD' && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-600/90 text-[10px] font-bold text-white rounded backdrop-blur-sm">
                        DESDOBRÁVEL
                    </div>
                )}
                
                {/* SPREAD BADGE */}
                {selectedCover?.page_type === 'SPREAD' && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-purple-600/90 text-[10px] font-bold text-white rounded backdrop-blur-sm">
                        DUPLA
                    </div>
                )}
            </div>

            {/* THUMBNAILS (ONLY IF MULTIPLE) */}
            {displayCovers.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {displayCovers.map((cover, idx) => (
                        <button
                            key={cover.id}
                            onClick={() => setSelectedIdx(idx)}
                            className={`relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all ${
                                selectedIdx === idx ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent opacity-60 hover:opacity-100'
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
                        </button>
                    ))}
                </div>
            )}
            
            {displayCovers.length > 1 && (
                <p className="text-[10px] text-center text-gray-500 uppercase font-bold tracking-widest">
                    {displayCovers.length} Capas Disponíveis
                </p>
            )}
        </div>
    );
}

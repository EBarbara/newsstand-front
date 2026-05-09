import React, { useState, useRef, useEffect } from 'react';
import { getMediaUrl } from '@/lib/issues';

interface FocusModalProps {
    imageUrl: string;
    initialX: number;
    initialY: number;
    onSave: (x: number, y: number) => void;
    onClose: () => void;
}

export default function FocusModal({ imageUrl, initialX, initialY, onSave, onClose }: FocusModalProps) {
    const [focus, setFocus] = useState({ x: initialX, y: initialY });
    const containerRef = useRef<HTMLDivElement>(null);
    const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setImgSize({
            width: e.currentTarget.clientWidth,
            height: e.currentTarget.clientHeight
        });
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate relative to image, not container (if image is smaller)
        const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
        const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
        
        setFocus({ x, y });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm">
            <div className="bg-[#1a1f26] rounded-2xl border border-white/10 w-full max-w-5xl flex flex-col md:flex-row overflow-hidden shadow-2xl">
                
                {/* PREVIEW SIDEBAR */}
                <div className="w-full md:w-72 bg-black/30 p-6 border-b md:border-b-0 md:border-r border-white/10 flex flex-col gap-6">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">Ajustar Foco</h3>
                        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Miniatura 3:4</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="aspect-[3/4] w-full bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500/50 shadow-inner">
                            <img 
                                src={getMediaUrl(imageUrl, true)} 
                                className="w-full h-full object-cover"
                                style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
                                alt="Preview"
                            />
                        </div>
                        
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">X (%)</label>
                                <input 
                                    type="number" 
                                    min="0" max="100"
                                    value={focus.x} 
                                    onChange={(e) => setFocus(prev => ({ ...prev, x: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) }))}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-sm text-blue-400 font-mono outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Y (%)</label>
                                <input 
                                    type="number" 
                                    min="0" max="100"
                                    value={focus.y} 
                                    onChange={(e) => setFocus(prev => ({ ...prev, y: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) }))}
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-sm text-blue-400 font-mono outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-500 text-center italic">
                            Este é o recorte que aparecerá na lista de revistas e créditos.
                        </p>
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                        <button 
                            onClick={() => onSave(focus.x, focus.y)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                        >
                            Salvar Foco
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>

                {/* INTERACTIVE AREA */}
                <div className="flex-1 p-6 flex flex-col gap-4 min-h-[400px]">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-medium">Clique na imagem para definir o centro do recorte</span>
                        <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">X: {focus.x}% Y: {focus.y}%</span>
                    </div>

                    <div 
                        ref={containerRef}
                        onClick={handleContainerClick}
                        className="relative flex-1 bg-black/20 rounded-xl overflow-hidden cursor-crosshair group flex items-center justify-center border border-white/5"
                    >
                        <img 
                            src={getMediaUrl(imageUrl, true)} 
                            onLoad={handleImageLoad}
                            className="max-w-full max-h-full object-contain pointer-events-none select-none"
                            alt="Full image"
                        />
                        
                        {/* THE FOCUS TARGET */}
                        <div 
                            className="absolute pointer-events-none transition-all duration-200 ease-out"
                            style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
                        >
                            {/* Crosshair */}
                            <div className="relative">
                                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                                <div className="absolute -translate-x-1/2 top-0 w-[2px] h-12 bg-blue-500/50 -translate-y-1/2"></div>
                                <div className="absolute left-0 -translate-y-1/2 w-12 h-[2px] bg-blue-500/50 -translate-x-1/2"></div>
                                
                                {/* Visual Area Indicator (3:4 box at scale) */}
                                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[150px] aspect-[3/4] border border-blue-400/30 bg-blue-500/5 rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

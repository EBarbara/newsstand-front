"use client";

import React, { useState, useEffect } from "react";
import { Magazine } from "@/@types/magazine";
import { Tag } from "@/@types/tag";
import { updateMagazine } from "@/lib/magazines";
import TagEditor from "./TagEditor";
import { getMediaUrl } from "@/lib/issues";

interface EditMagazineModalProps {
    isOpen: boolean;
    onClose: () => void;
    magazine: Magazine;
    onSave: (updatedMagazine: Magazine) => void;
}

export default function EditMagazineModal({ isOpen, onClose, magazine, onSave }: EditMagazineModalProps) {
    const [name, setName] = useState("");
    const [volume, setVolume] = useState("");
    const [publisher, setPublisher] = useState("");
    const [language, setLanguage] = useState("");
    const [country, setCountry] = useState("");
    const [description, setDescription] = useState("");
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    
    // Logo state
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [keepExistingLogo, setKeepExistingLogo] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync values when the modal opens or magazine changes
    useEffect(() => {
        if (isOpen && magazine) {
            setName(magazine.name || "");
            setVolume(magazine.volume || "");
            setPublisher(magazine.publisher || "");
            setLanguage(magazine.language || "");
            setCountry(magazine.country || "");
            setDescription(magazine.description || "");
            setSelectedTags(magazine.tags || []);
            setLogoPreview(magazine.logo ? getMediaUrl(magazine.logo) : null);
            setLogoFile(null);
            setKeepExistingLogo(true);
            setError(null);
        }
    }, [isOpen, magazine]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setKeepExistingLogo(false);
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setKeepExistingLogo(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            setError("O nome da revista é obrigatório.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("volume", volume.trim());
            formData.append("publisher", publisher.trim());
            
            // i18n standardized lowercased or trimmed tag
            formData.append("language", language.trim());
            formData.append("country", country.trim());
            formData.append("description", description.trim());

            // Handle logo update
            if (logoFile) {
                formData.append("logo", logoFile);
            } else if (!keepExistingLogo && !logoPreview) {
                // User removed the logo completely
                formData.append("logo", "");
            }

            // Append each tag_id for DRF PrimaryKeyRelatedField lookup
            selectedTags.forEach((tag) => {
                formData.append("tag_ids", String(tag.id));
            });

            const updated = await updateMagazine(magazine.slug, formData);
            onSave(updated);
            onClose();
        } catch (err: any) {
            setError(err.message || "Erro ao atualizar revista.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative border border-zinc-200 dark:border-zinc-800/80 my-8">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-2xl leading-none transition-colors"
                >
                    &times;
                </button>
                
                <h2 className="text-2xl font-bold mb-5 text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>✏️</span> Editar Revista
                </h2>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                Nome*
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Pato Donald"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        {/* Volume */}
                        <div>
                            <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                Volume / Ano da Série
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: 1983, 2012, 1"
                                value={volume}
                                onChange={(e) => setVolume(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Logo Image Upload with Preview */}
                    <div>
                        <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Logotipo da Revista
                        </label>
                        <div className="flex items-center gap-4 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                            {logoPreview ? (
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-850 p-1 flex items-center justify-center">
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="h-full w-full object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="absolute -top-1 -right-1 h-5 w-5 bg-red-650 hover:bg-red-700 text-white rounded-full text-xs font-black flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                                        title="Remover logotipo"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="h-16 w-16 flex-shrink-0 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-2xl text-zinc-400">
                                    🖼️
                                </div>
                            )}

                            <div className="flex-1">
                                <label className="inline-flex justify-center items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm text-xs font-bold text-zinc-750 dark:text-zinc-300 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                                    <span>📤 Enviar Imagem</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                                    PNG, JPG ou WebP recomendados. Proporção retangular ou quadrada.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Publisher */}
                        <div>
                            <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                Editora
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Editora Abril, Panini"
                                value={publisher}
                                onChange={(e) => setPublisher(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                País de Origem
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Brasil, Japão"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Language (i18n formatted format!) */}
                    <div>
                        <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 flex justify-between">
                            <span>Idioma</span>
                            <span className="text-[10px] font-medium lowercase text-zinc-400 dark:text-zinc-550">Formato i18n (ex: pt-BR, en-US, ja)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="pt-BR, en-US, ja, es-ES..."
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                            Descrição
                        </label>
                        <textarea
                            placeholder="Descreva a história, frequência ou curiosidades sobre esta revista..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Tags Seletor */}
                    <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-4">
                        <TagEditor
                            selectedTags={selectedTags}
                            onChange={setSelectedTags}
                            label="Tags Associadas"
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-xl mt-2 font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-4 border-t border-zinc-100 dark:border-zinc-900/60 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-bold transition-colors text-zinc-700 dark:text-zinc-300"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Salvar"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { Publisher } from "@/@types/publisher";
import { createPublisher, updatePublisher } from "@/lib/publishers";
import { getMediaUrl } from "@/lib/issues";

interface PublisherModalProps {
    isOpen: boolean;
    onClose: () => void;
    publisher?: Publisher | null; // If provided, we edit, else we create
    onSave: (saved: Publisher) => void;
}

export default function PublisherModal({ isOpen, onClose, publisher, onSave }: PublisherModalProps) {
    const [name, setName] = useState("");
    const [translatedName, setTranslatedName] = useState("");
    const [country, setCountry] = useState("");
    const [website, setWebsite] = useState("");
    const [aliases, setAliases] = useState<string[]>([]);
    const [aliasInput, setAliasInput] = useState("");

    // Logo image state
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [keepExistingLogo, setKeepExistingLogo] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (publisher) {
                setName(publisher.name || "");
                setTranslatedName(publisher.translated_name || "");
                setCountry(publisher.country || "");
                setWebsite(publisher.website || "");
                setAliases(publisher.aliases || []);
                setLogoPreview(publisher.logo ? getMediaUrl(publisher.logo) : null);
                setKeepExistingLogo(true);
            } else {
                setName("");
                setTranslatedName("");
                setCountry("");
                setWebsite("");
                setAliases([]);
                setLogoPreview(null);
                setKeepExistingLogo(false);
            }
            setLogoFile(null);
            setAliasInput("");
            setError(null);
        }
    }, [isOpen, publisher]);

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

    const handleAddAlias = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = aliasInput.trim();
            if (val && !aliases.includes(val)) {
                setAliases([...aliases, val]);
                setAliasInput("");
            }
        }
    };

    const handleRemoveAlias = (index: number) => {
        setAliases(aliases.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("O nome da editora é obrigatório.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("translated_name", translatedName.trim());
            formData.append("country", country.trim());
            formData.append("website", website.trim());
            formData.append("aliases", JSON.stringify(aliases));

            // Handle logo update
            if (logoFile) {
                formData.append("logo", logoFile);
            } else if (!keepExistingLogo && !logoPreview) {
                formData.append("logo", "");
            }

            let saved: Publisher;
            if (publisher) {
                saved = await updatePublisher(publisher.slug, formData);
            } else {
                saved = await createPublisher(formData);
            }

            onSave(saved);
            onClose();
        } catch (err: any) {
            setError(err.message || "Erro ao salvar editora.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative border border-zinc-200 dark:border-zinc-800/80 my-8">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-2xl leading-none transition-colors"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-5 text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>🏢</span> {publisher ? "Editar Editora" : "Nova Editora"}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
                    {/* Logo Image Upload with Preview */}
                    <div>
                        <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Logotipo da Editora
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
                                    🏢
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

                    {/* Name */}
                    <div>
                        <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                            Nome da Editora*
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Editora Abril"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Translated Name */}
                    <div>
                        <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                            Nome Traduzido (Opcional)
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Shueisha (Tradução/Romanização)"
                            value={translatedName}
                            onChange={(e) => setTranslatedName(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Country */}
                        <div>
                            <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                País de Origem
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Japão, Brasil"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Website */}
                        <div>
                            <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                                Website Oficial
                            </label>
                            <input
                                type="url"
                                placeholder="Ex: https://abril.com.br"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Aliases (Tags inside Input) */}
                    <div>
                        <label className="block text-xs uppercase font-extrabold tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                            Outros Nomes / Aliases (Pressione Enter para adicionar)
                        </label>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-1.5">
                                {aliases.map((alias, index) => (
                                    <span
                                        key={index}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-650/10 border border-blue-500/25 rounded-md text-xs text-blue-600 dark:text-blue-400 font-semibold"
                                    >
                                        {alias}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAlias(index)}
                                            className="hover:text-red-500 font-bold ml-1"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Adicionar outro nome..."
                                value={aliasInput}
                                onChange={(e) => setAliasInput(e.target.value)}
                                onKeyDown={handleAddAlias}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-650 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-xl mt-2 font-medium">
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

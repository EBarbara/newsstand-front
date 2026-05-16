"use client";

import { useState, useEffect, useRef } from "react";
import { Tag } from "@/@types/tag";
import { getTags, createTag } from "@/lib/tags";

interface TagEditorProps {
    selectedTags: Tag[];
    onChange: (tags: Tag[]) => void;
    label?: string;
}

export default function TagEditor({ selectedTags, onChange, label = "Tags" }: TagEditorProps) {
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [search, setSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadTags = async () => {
            try {
                const res = await getTags();
                setAllTags(res.results);
            } catch (err) {
                console.error("Failed to load tags", err);
            }
        };
        loadTags();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredTags = allTags.filter(
        (tag) =>
            tag.name.toLowerCase().includes(search.toLowerCase()) &&
            !selectedTags.some((t) => t.id === tag.id)
    );

    const handleAddTag = (tag: Tag) => {
        onChange([...selectedTags, tag]);
        setSearch("");
        setIsDropdownOpen(false);
    };

    const handleRemoveTag = (tagId: number) => {
        onChange(selectedTags.filter((t) => t.id !== tagId));
    };

    const handleCreateTag = async () => {
        if (!search.trim()) return;
        setIsLoading(true);
        try {
            const newTag = await createTag(search.trim());
            setAllTags((prev) => [...prev, newTag]);
            handleAddTag(newTag);
        } catch (err) {
            console.error("Failed to create tag", err);
            alert("Erro ao criar tag. Talvez ela já exista?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2" ref={containerRef}>
            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">{label}</label>
            
            <div className="flex flex-wrap gap-2 mb-1">
                {selectedTags.map((tag) => (
                    <span
                        key={tag.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs text-blue-300 group"
                    >
                        {tag.name}
                        <button
                            type="button"
                            onClick={() => handleRemoveTag(tag.id)}
                            className="hover:text-red-400 font-bold transition-colors"
                        >
                            ✕
                        </button>
                    </span>
                ))}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Buscar ou criar tag..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-blue-500 outline-none transition-colors"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && search.trim()) {
                            e.preventDefault();
                            const existing = allTags.find(t => t.name.toLowerCase() === search.trim().toLowerCase());
                            if (existing) {
                                if (!selectedTags.some(t => t.id === existing.id)) {
                                    handleAddTag(existing);
                                } else {
                                    setSearch("");
                                }
                            } else {
                                handleCreateTag();
                            }
                        }
                    }}
                />

                {isDropdownOpen && (search.trim() || filteredTags.length > 0) && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-48 overflow-y-auto backdrop-blur-xl">
                        {filteredTags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => handleAddTag(tag)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600/20 transition-colors border-b border-white/5 last:border-0"
                            >
                                {tag.name}
                            </button>
                        ))}
                        {search.trim() && !allTags.some(t => t.name.toLowerCase() === search.trim().toLowerCase()) && (
                            <button
                                onClick={handleCreateTag}
                                disabled={isLoading}
                                className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-blue-600/10 transition-colors italic"
                            >
                                {isLoading ? "Criando..." : `+ Criar tag "${search}"`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMagazine } from "@/lib/magazines";

export default function CreateMagazineButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const openModal = () => setIsOpen(true);
    
    const closeModal = () => {
        setIsOpen(false);
        setName("");
        setSlug("");
        setError(null);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        // Auto generate slug if the user hasn't manually modified it too much
        // But for simplicity, we just auto-update it if the user is typing the name
        setSlug(newName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !slug) {
            setError("Todos os campos são obrigatórios.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await createMagazine({ name: name.trim(), slug: slug.trim() });
            
            // Reload the page to show the new magazine
            router.refresh();
            closeModal();
        } catch (err: any) {
            setError(err.message || "Erro ao criar revista.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={openModal}
                className="bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-medium py-2 px-4 rounded-md transition-colors border border-zinc-200 dark:border-zinc-700"
            >
                Cadastrar Revista
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-md relative border dark:border-zinc-800">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
                        >
                            &times;
                        </button>
                        
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Nova Revista</h2>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                    Nome*
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Pato Donald"
                                    value={name}
                                    onChange={handleNameChange}
                                    className="w-full border rounded-md px-3 py-2 bg-transparent dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                    Slug (URL)*
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: pato-donald"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 bg-transparent dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors dark:text-gray-300"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Criar"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

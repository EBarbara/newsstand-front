"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmptyIssue } from "@/lib/issues";

type Props = {
    magazineSlug: string;
    onSuccess?: () => void;
};

export default function CreateEmptyIssueButton({ magazineSlug, onSuccess }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [edition, setEdition] = useState("");
    const [date, setDate] = useState("");
    const [hasPhysicalCopy, setHasPhysicalCopy] = useState(false);
    const [isDigitalComplete, setIsDigitalComplete] = useState(false);
    const [isSpecial, setIsSpecial] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const openModal = () => setIsOpen(true);
    
    const closeModal = () => {
        setIsOpen(false);
        setEdition("");
        setDate("");
        setHasPhysicalCopy(false);
        setIsDigitalComplete(false);
        setIsSpecial(false);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!edition || !date) {
            setError("Todos os campos são obrigatórios.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await createEmptyIssue(
                magazineSlug, 
                edition.trim(), 
                date.trim(),
                {
                    hasPhysicalCopy,
                    isDigitalComplete,
                    isSpecial
                }
            );
            
            if (onSuccess) {
                onSuccess();
            } else {
                // Fallback
                router.refresh();
            }
            closeModal();
        } catch (err: any) {
            setError(err.message || "Erro ao criar edição.");
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
                Criar Edição
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
                        
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Nova Edição</h2>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                    Edição*
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: 01"
                                    value={edition}
                                    onChange={(e) => setEdition(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 bg-transparent dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                    Data de Publicação*
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 bg-transparent dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                <label className="flex items-center gap-2 text-sm dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={hasPhysicalCopy}
                                        onChange={(e) => setHasPhysicalCopy(e.target.checked)}
                                        className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                                    />
                                    Tenho cópia física
                                </label>
                                <label className="flex items-center gap-2 text-sm dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={isDigitalComplete}
                                        onChange={(e) => setIsDigitalComplete(e.target.checked)}
                                        className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                                    />
                                    Digital completa
                                </label>
                                <label className="flex items-center gap-2 text-sm dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={isSpecial}
                                        onChange={(e) => setIsSpecial(e.target.checked)}
                                        className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
                                    />
                                    Edição especial
                                </label>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importCbz } from "@/lib/issues";
import ImportStatusModal from "@/components/ImportStatusModal";

type Props = {
    magazineSlug: string;
    onSuccess?: () => void;
};

export default function ImportCbzButton({ magazineSlug, onSuccess }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [edition, setEdition] = useState("");
    const [date, setDate] = useState("");
    const [hasPhysicalCopy, setHasPhysicalCopy] = useState(false);
    const [isDigitalComplete, setIsDigitalComplete] = useState(false);
    const [isSpecial, setIsSpecial] = useState(false);
    
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [pagesCount, setPagesCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();

    const openModal = () => setIsOpen(true);
    
    const closeModal = () => {
        if (status === 'loading') return;
        setIsOpen(false);
        setFile(null);
        setEdition("");
        setDate("");
        setHasPhysicalCopy(false);
        setIsDigitalComplete(false);
        setIsSpecial(false);
        setError(null);
        if (status === 'success') {
            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
        }
        setStatus('idle');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Por favor, selecione um arquivo .cbz");
            return;
        }

        setStatus('loading');
        setError(null);

        try {
            const data = await importCbz(
                file, 
                magazineSlug, 
                edition.trim() || undefined, 
                date.trim() || undefined,
                {
                    hasPhysicalCopy,
                    isDigitalComplete,
                    isSpecial
                }
            );
            
            setPagesCount(data.pages_count || 0);
            setStatus('success');
            setIsOpen(false); // Close the input modal
        } catch (err: any) {
            console.error("CBZ Import error:", err);
            setError(err.message || "Erro ao fazer upload da edição.");
            setStatus('error');
            setIsOpen(false); // Close the input modal so user sees the StatusModal error
        }
    };

    return (
        <>
            <button
                onClick={openModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
                Importar CBZ
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            &times;
                        </button>
                        
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Importar Edição</h2>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                    Arquivo (.cbz)*
                                </label>
                                <input
                                    type="file"
                                    accept=".cbz"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-800 dark:file:text-blue-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                    Edição (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: 01"
                                    value={edition}
                                    onChange={(e) => setEdition(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 bg-transparent dark:border-zinc-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                    Data de Publicação (Opcional)
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 bg-transparent dark:border-zinc-700 dark:text-white"
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

                            {error && status !== 'error' && (
                                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !file}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                                >
                                    Importar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ImportStatusModal 
                status={status}
                pagesCount={pagesCount}
                error={error}
                onClose={closeModal}
            />
        </>
    );
}

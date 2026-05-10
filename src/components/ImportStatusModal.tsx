"use client";

import { useEffect, useState } from "react";

type Props = {
    status: 'idle' | 'loading' | 'success' | 'error';
    pagesCount?: number;
    error?: string | null;
    onClose: () => void;
};

export default function ImportStatusModal({ status, pagesCount, error, onClose }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (status !== 'idle') {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [status]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
            <div className="bg-[#1a1d23] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 flex flex-col items-center text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                            <h3 className="text-xl font-bold text-white mb-2">Importando CBZ</h3>
                            <p className="text-gray-400 text-sm">
                                Processando as imagens e organizando as páginas. Isso pode levar alguns segundos...
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Concluído!</h3>
                            <p className="text-gray-400 text-sm mb-8">
                                <span className="text-green-400 font-bold">{pagesCount}</span> páginas foram importadas com sucesso para esta edição.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Fechar
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Erro na Importação</h3>
                            <p className="text-red-400 text-sm mb-8 bg-red-500/5 p-4 rounded-lg border border-red-500/10 w-full break-words">
                                {error || "Ocorreu um erro inesperado ao processar o arquivo."}
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Entendido
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

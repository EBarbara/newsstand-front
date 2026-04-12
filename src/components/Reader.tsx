"use client";

import { useEffect } from "react";
import { useReader } from "@/hooks/useReader";
import { getPageImageUrl } from "@/lib/issues";
import { Page } from "@/types/api";

type Props = {
    issueId: number;
    pages: Page[];
};

export default function Reader({ issueId, pages }: Props) {
    const initialIndexes = pages.map(p => p.index);

    const {
        pageIndexes,
        currentIndex,
        next,
        prev,
    } = useReader(issueId, initialIndexes);

    const currentPage = pageIndexes[currentIndex];

    // ⌨️ teclado
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [next, prev]);

    // ⚡ preload
    useEffect(() => {
        const neighbors = [
            currentIndex > 0 ? pageIndexes[currentIndex - 1] : null,
            currentIndex < pageIndexes.length - 1 ? pageIndexes[currentIndex + 1] : null,
        ];

        neighbors.forEach((index) => {
            if (index === null) return;

            const img = new Image();
            img.src = getPageImageUrl(issueId, index);
        });
    }, [currentIndex, pageIndexes, issueId]);

    if (currentPage === undefined) {
        return <div>No pages</div>;
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4">

            {/* IMAGE */}
            <img
                src={getPageImageUrl(issueId, currentPage)}
                className="max-h-[85vh] object-contain cursor-pointer"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;

                    if (x < rect.width / 2) prev();
                    else next();
                }}
            />

            {/* NAV */}
            <div className="flex gap-4 text-sm">
                <button onClick={prev} disabled={currentIndex === 0}>
                    ← Prev
                </button>

                <span>
                    {currentIndex + 1} / {pageIndexes.length}
                </span>

                <button
                    onClick={next}
                    disabled={currentIndex === pageIndexes.length - 1}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
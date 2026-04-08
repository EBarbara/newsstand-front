"use client";

import { useCallback, useEffect, useState } from "react";
import { Page } from "@/types/api"
import {getPageImageUrl} from "@/lib/issues";

type Props = {
    slug: string;
    issueId: number;
    pages: Page[];
}

export default function Reader({ slug, issueId, pages }: Props) {
    const [current, setCurrent] = useState(0);

    const prev = useCallback(() => {
        setCurrent((c) => Math.max(0, c - 1));
    }, []);

    const next = useCallback(() => {
        setCurrent((c) => Math.min(pages.length -1, c + 1));
    }, [pages.length]);

    const page = pages[current];

    // teclado
    useEffect(() => {
        function handleKey(e: KeyboardEvent){
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [prev, next]);

    // preload
    useEffect(() => {
        const neighbors = [pages[current - 1], pages[current + 1]];

        neighbors.forEach((page) => {
            if (!page) return;

            const img = new Image();
            img.src = getPageImageUrl(slug, issueId, page.index)
        })
    }, [current, pages, slug, issueId]);

    if (!page) {
        return <div>No pages</div>;
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4">

            {/* IMAGE */}
            <img
                src={getPageImageUrl(slug, issueId, page.index)}
                alt={`Page ${current}`}
                className="max-h-[85vh] object-contain cursor-pointer"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;

                    if (x < rect.width / 2) {
                        prev(); // esquerda
                    } else {
                        next(); // direita
                    }
                }}
            />

            {/* NAV */}
            <div className="flex gap-4 text-sm">
                <button onClick={prev}>← Prev</button>

                <span>
                    {current + 1} / {pages.length}
                </span>

                <button onClick={next}>Next →</button>
            </div>
        </div>
    );
}
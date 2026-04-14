"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useReader } from "@/hooks/useReader";
import { getPageImageUrl } from "@/lib/issues";
import { IssueSection, Page } from "@/types/api";

type Props = {
    issueId: number;
    pages: Page[];
    sections: IssueSection[];
    slug: string;
    edition: string;
};

export default function Reader({ issueId, pages, sections, slug, edition }: Props) {
    const [zoom, setZoom] = useState(1);

    const router = useRouter();

    const searchParams = useSearchParams();

    const sectionId = searchParams.get("section");
    const activeSectionId = sectionId ? Number(sectionId) : null;

    const initialIndexes = useMemo(
        () => pages.map(p => p.index),
        [pages]
    );

    const {
        pageIndexes,
        currentIndex,
        mode,
        openIssue,
        openSectionOnly,
        next,
        prev,
    } = useReader(issueId, initialIndexes);

    useEffect(() => {
        if(!sectionId) {
            void openIssue();
            return;
        }

        const id = Number(sectionId);
        if(!id) return;

        void openSectionOnly(id);
    }, [openIssue, openSectionOnly, sectionId]);

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
        <div className="flex h-full overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-64 border-r p-4 overflow-y-auto">
                <div className="font-bold mb-4">Contents</div>

                <button
                    onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("section");

                        router.replace(`?${params.toString()}`);
                    }}
                    className={`block w-full text-left mb-2 font-semibold ${
                        mode === "issue" ? "bg-blue-600 text-white" : ""
                    }`}
                >
                    Full Issue
                </button>

                {sections.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => {
                            const newParams = new URLSearchParams(searchParams.toString());
                            newParams.set("section", String(s.id));

                            router.replace(`?${newParams.toString()}`);
                        }}
                        className={`block w-full text-left text-sm mb-1 ${
                            activeSectionId === s.id ? "bg-blue-600 text-white font-semibold" : "hover:bg-gray-800"
                        }`}
                    >
                        {s.section.name}
                    </button>
                ))}
            </aside>

            <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* IMAGE */}
                <div
                    className={`flex-1 min-h-0 h-0 flex ${
                        zoom === 1 
                            ? "items-center justify-center overflow-hidden" 
                            : "items-start justify-center overflow-auto"
                    }`}
                >
                    <img
                        src={getPageImageUrl(issueId, currentPage)}
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: "top center"
                        }}
                        className="max-h-full max-w-full object-contain block"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;

                            if (x < rect.width / 2) prev();
                            else next();
                        }}
                    />
                </div>

                {/* ZOOM */}
                <div className="flex justify-center gap-2 mb-2 shrink-0">
                    <button onClick={() => setZoom(1)}>Fit</button>
                    <button onClick={() => setZoom(1.5)}>Zoom</button>
                    <button onClick={() => setZoom(2)}>100%</button>
                </div>

                {/* NAV */}
                <div className="flex flex-col items-center gap-2 text-sm shrink-0">
                    <div className="flex gap-4">
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
                    <Link
                        href={`/magazines/${slug}/${edition}`}
                        className="text-sm text-blue-600"
                    >
                        ← Back to issue
                    </Link>
                </div>
            </main>
        </div>
    );
}
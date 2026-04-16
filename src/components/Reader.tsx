"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import { useReader } from "@/hooks/useReader";
import { getPageImageUrl } from "@/lib/issues";
import { markdownComponents, markdownPlugins } from "@/lib/markdown";
import { IssueSection, Page } from "@/types/api";

type Props = {
    issueId: number;
    pages: Page[];
    sections: IssueSection[];
    slug: string;
    edition: string;
};

export default function Reader({ issueId, pages, sections, slug, edition }: Props) {
    const [readingMode, setReadingMode] = useState<"image" | "text">("image");
    const [zoom, setZoom] = useState<"fit" | number>("fit");
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    function changeZoom(value: "fit" | number) {
        setZoom(value);
        setOffset({ x: 0, y: 0 });
    }

    function clamp(value: number, min: number, max: number) {
        return Math.max(min, Math.min(value, max));
    }

    function handleMouseDown(e: React.MouseEvent) {
        if (zoom === "fit") return;

        setIsPanning(true);
        setPanStart({
            x: e.clientX - offset.x,
            y: e.clientY - offset.y,
        });
    }

    function handleMouseMove(e: React.MouseEvent) {
        if (!isPanning) return;

        setOffset({
            x: clamp(e.clientX - panStart.x, -500, 500),
            y: clamp(e.clientY - panStart.y, -500, 500),
        });
    }

    function handleMouseUp() {
        setIsPanning(false);
    }

    const searchParams = useSearchParams();
    const router = useRouter();

    const sectionId = searchParams.get("section");
    const activeSectionId = sectionId ? Number(sectionId) : null;

    const initialIndexes = pages.map(p => p.index);

    const {
        pageIndexes,
        currentIndex,
        openIssue,
        openSectionOnly,
        next,
        prev,
    } = useReader(issueId, initialIndexes);

    const currentPage = pageIndexes[currentIndex];

    const currentSection = sections.find(s => s.id === activeSectionId);
    const text = currentSection?.text_content ?? "";

    // 👉 troca de seção (centralizado)
    const handleSectionChange = (id: number | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (id === null) {
            params.delete("section");
            void openIssue();
        } else {
            params.set("section", String(id));
            void openSectionOnly(id);
        }

        setReadingMode("image");
        router.replace(`?${params.toString()}`);
    };

    // ⌨️ teclado (só no modo imagem)
    useEffect(() => {
        if (readingMode !== "image") return;

        function handleKey(e: KeyboardEvent) {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [next, prev, readingMode]);

    // ⚡ preload (só imagem)
    useEffect(() => {
        if (readingMode !== "image") return;

        const neighbors = [
            currentIndex > 0 ? pageIndexes[currentIndex - 1] : null,
            currentIndex < pageIndexes.length - 1 ? pageIndexes[currentIndex + 1] : null,
        ];

        neighbors.forEach((index) => {
            if (index === null) return;

            const img = new Image();
            img.src = getPageImageUrl(issueId, index);
        });
    }, [currentIndex, pageIndexes, issueId, readingMode]);

    if (currentPage === undefined) {
        return <div>No pages</div>;
    }

    return (
        <div className="flex h-full min-h-0">

            {/* SIDEBAR */}
            <aside className="w-64 border-r flex flex-col">
                <div className="font-bold mb-4">Contents</div>

                <button
                    onClick={() => handleSectionChange(null)}
                    className="block w-full text-left mb-2 font-semibold"
                >
                    Full Issue
                </button>

                {sections.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => handleSectionChange(s.id)}
                        className="block w-full text-left text-sm mb-1"
                    >
                        {s.section.name}
                    </button>
                ))}

                {/* FIXO */}
                <div className="p-4 border-t">
                    <Link
                        href={`/magazines/${slug}/${edition}`}
                        className="text-blue-600 text-sm"
                    >
                        ← Back to issue
                    </Link>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col min-h-0">

                {/* HEADER */}
                <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b">

                    {/* LEFT — MODE */}
                    <div className="flex gap-1 bg-gray-800 p-1 rounded">
                        <button
                            onClick={() => setReadingMode("image")}
                            className={`px-3 py-1 rounded text-sm ${
                                readingMode === "image"
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-700"
                            }`}
                        >
                            Image
                        </button>

                        <button
                            onClick={() => setReadingMode("text")}
                            disabled={!currentSection?.text_content}
                            className={`px-3 py-1 rounded text-sm ${
                                readingMode === "text"
                                    ? "bg-blue-600 text-white"
                                    : currentSection?.text_content
                                        ? "text-gray-300 hover:bg-gray-700"
                                        : "text-gray-600 opacity-50 cursor-not-allowed"
                            }`}
                        >
                            Text
                        </button>
                    </div>

                    {/* RIGHT — ZOOM */}
                    {readingMode === "image" && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => changeZoom("fit")}
                                className="px-2 py-1 text-xs bg-gray-800 rounded hover:bg-gray-700"
                            >
                                Fit
                            </button>

                            <button
                                onClick={() => changeZoom(1)}
                                className="px-2 py-1 text-xs bg-gray-800 rounded hover:bg-gray-700"
                            >
                                100%
                            </button>

                            <button
                                onClick={() => changeZoom(1.5)}
                                className="px-2 py-1 text-xs bg-gray-800 rounded hover:bg-gray-700"
                            >
                                150%
                            </button>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                <div
                    className={`flex-1 min-h-0 ${
                        readingMode === "image"
                            ? "flex items-center justify-center overflow-hidden"
                            : "overflow-auto"
                    }`}
                    onMouseMove={readingMode === "image" ? handleMouseMove : undefined}
                    onMouseUp={readingMode === "image" ? handleMouseUp : undefined}
                    onMouseLeave={readingMode === "image" ? handleMouseUp : undefined}
                >

                    {/* IMAGE MODE */}
                    {readingMode === "image" && (
                        <img
                            src={getPageImageUrl(issueId, currentPage)}
                            onMouseDown={handleMouseDown}
                            draggable={false}
                            style={
                                zoom === "fit"
                                    ? undefined
                                    : {
                                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                        transformOrigin: "top center",
                                        cursor: isPanning ? "grabbing" : "grab",
                                    }
                            }
                            className={`object-contain ${
                                zoom === "fit" ? "max-h-full max-w-full" : ""
                            }`}
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;

                                if (x < rect.width / 2) prev();
                                else next();
                            }}
                        />
                    )}

                    {/* TEXT MODE */}
                    {readingMode === "text" && text && currentSection?.text_content && (
                        <div className="flex-1 min-h-0 overflow-auto">
                            <div className="max-w-3xl mx-auto px-6 py-6">
                                <div className="prose prose-invert">
                                    <ReactMarkdown
                                        remarkPlugins={markdownPlugins}
                                        components={markdownComponents}
                                    >
                                        {currentSection.text_content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* NAV (só imagem) */}
                {readingMode === "image" && (
                    <div className="flex flex-col items-center gap-2 text-sm py-3">
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
                    </div>
                )}
            </main>
        </div>
    );
}
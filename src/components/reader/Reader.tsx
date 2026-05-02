"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Issue } from "@/@types/issue";
import Canvas from "./Canvas";
import Controls from "./Controls";
import Sidebar from "./Sidebar";
import TextView from "./TextView";
import styles from "./Reader.module.css"

type Props = {
    issue: Issue;
    initialIndex?: number;
};

export default function Reader({ issue, initialIndex = 0 }: Props) {
    const [index, setIndex] = useState(initialIndex);
    const [mode, setMode] = useState<"image" | "text">("image");
    const [showControls, setShowControls] = useState(true);

    const total = issue.renders.length;
    const current = issue.renders[index];
    const pageNumber = index + 1;

    const section = useMemo(() => {
        return issue.sections.find((s) =>
            s.segments.some(
                (seg) =>
                    pageNumber >= seg.start_page &&
                    pageNumber <= seg.end_page
            )
        );
    }, [issue, pageNumber]);

    // teclado
    useEffect(() => {
        if (mode !== "image") return;

        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                setShowControls(true);
                setIndex((i) => Math.min(i + 1, total - 1));
            }
            if (e.key === "ArrowLeft") {
                setShowControls(true);
                setIndex((i) => Math.max(i - 1, 0));
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [mode, total]);

    // auto-hide controls
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleMove = () => {
            setShowControls(true);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 2000);
        };

        window.addEventListener("mousemove", handleMove);

        return () => {
            window.removeEventListener("mousemove", handleMove)

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        setShowControls(true);
    }, [index]);

    if (!current) {
        return <div style={{ color: "white" }}>No pages</div>;
    }

    if (mode === "text" && section) {
        return (
            <TextView
                section={section}
                onBack={() => setMode("image")}
            />
        );
    }
    return (
        <div className={styles.reader}>
            <Canvas image={current.image} />

            <Controls
                page={pageNumber}
                total={total}
                onPrev={() => setIndex((i) => Math.max(i - 1, 0))}
                onNext={() =>
                    setIndex((i) => Math.min(i + 1, total - 1))
                }
                visible={showControls}
                canPrev={index > 0}
                canNext={index < total - 1}
            />

            <Sidebar
                issue={issue}
                section={section}
                onReadText={() => setMode("text")}
            />

            {section?.text_content && (
                <button
                    onClick={() => setMode("text")}
                    className={styles.textToggle}
                >
                    Read text
                </button>
            )}
        </div>
    );
}
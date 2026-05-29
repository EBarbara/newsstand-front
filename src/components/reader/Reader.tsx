"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Issue } from "@/@types/issue";
import { IssueSection } from "@/@types/issueSection";
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
    const [activeTextSection, setActiveTextSection] = useState<IssueSection | null>(null);

    const total = issue.renders.length;
    const current = issue.renders[index];
    const pageNumber = index + 1;

    const sections = useMemo(() => {
        return issue.sections.filter((s) =>
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

    if (mode === "text" && activeTextSection) {
        return (
            <TextView
                section={activeTextSection}
                onBack={() => {
                    setMode("image");
                    setActiveTextSection(null);
                }}
            />
        );
    }
    return (
        <div className={styles.reader}>
            <Canvas render={current} />

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
                sections={sections}
                currentPageId={current.id}
                onReadText={(sec) => {
                    setActiveTextSection(sec);
                    setMode("text");
                }}
            />

            {sections[0]?.text_content && (
                <button
                    onClick={() => {
                        setActiveTextSection(sections[0]);
                        setMode("text");
                    }}
                    className={styles.textToggle}
                >
                    Read text
                </button>
            )}
        </div>
    );
}
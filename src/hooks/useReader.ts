import { useCallback, useState } from "react";

import { IssueSection } from "@/types/api";
import { getIssuePages, getSectionPages } from "@/lib/issues";
import { normalizePages } from "@/lib/reader";

type ReaderMode = "issue" | "section";

export function useReader(issueId: number, initialIndexes: number[]){
    const [pageIndexes, setPageIndexes] = useState<number[]>(initialIndexes);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mode, setMode] = useState<ReaderMode>("issue");

    const openIssue = useCallback(async () => {
        setPageIndexes(initialIndexes);
        setCurrentIndex(0);
        setMode("issue");
    }, [initialIndexes]);

    async function openSection(section: IssueSection){
        const pages = await getIssuePages(issueId);
        const indexes = normalizePages(pages);

        const first = section.page_indexes?.[0];
        const startIndex = indexes[first];

        setPageIndexes(indexes);
        setCurrentIndex(startIndex >= 0 ? startIndex : 0);
        setMode("issue");
    }

    const openSectionOnly = useCallback(async (sectionId: number) => {
        const pages = await getSectionPages(issueId, sectionId);
        const indexes = normalizePages(pages);

        setPageIndexes(indexes);
        setCurrentIndex(0);
        setMode("section");
    }, [issueId]);

    function next() {
        setCurrentIndex(i => Math.min(i + 1, pageIndexes.length - 1));
    }

    function prev() {
        setCurrentIndex(i => Math.max(i - 1, 0));
    }

    return {
        pageIndexes,
        currentIndex,
        mode,
        openIssue,
        openSection,
        openSectionOnly,
        next,
        prev,
    }
}
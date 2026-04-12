import { useState } from "react";

import { IssueSection } from "@/types/api";
import { getIssuePages, getSectionPages } from "@/lib/issues";
import { normalizePages } from "@/lib/reader";

type ReaderMode = "issue" | "section";

export function useReader(issueId: number, initialPages: number[]){
    const [pageIndexes, setPageIndexes] = useState<number[]>(initialPages);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mode, setMode] = useState<ReaderMode>("issue");

    async function openIssue(){
        const pages = await getIssuePages(issueId);
        const indexes = normalizePages(pages);

        setPageIndexes(indexes);
        setCurrentIndex(0);
        setMode("issue");
    }

    async function openSection(section: IssueSection){
        const pages = await getIssuePages(issueId);
        const indexes = normalizePages(pages);

        const first = section.page_indexes?.[0];
        const startIndex = indexes[first];

        setPageIndexes(indexes);
        setCurrentIndex(startIndex >= 0 ? startIndex : 0);
        setMode("issue");
    }

    async function openSectionOnly(sectionId: number){
        const pages = await getSectionPages(issueId, sectionId);
        const indexes = normalizePages(pages);

        setPageIndexes(indexes);
        setCurrentIndex(0);
        setMode("section");
    }

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
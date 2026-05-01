"use client"

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import { pagesToSegments } from "@/lib/editor";
import { createIssueSection, getIssueDetail, getSections, updateIssueSection } from "@/lib/issues";
import { Issue } from "@/@types/issue";
import { IssueSection } from "@/@types/issueSection";
import { Section } from "@/@types/section";


export type PageMap = Record<number, number | null>;

export type IssueEditorState = {
    issue: Issue | null
    sections: IssueSection[]
    availableSections: Section[]
    selectedSectionId: number | null
    setSelectedSectionId: Dispatch<SetStateAction<number | null>>
    selectedTemplate: number | null
    setSelectedTemplate: Dispatch<SetStateAction<number | null>>
    pageMap: PageMap
    assignPage: (page: number) => void
    createSection: () => void
    updateSectionTitle: (sectionId: number, title: string) => void
    saveSection: (sectionId: number) => void
    savingSections: Record<number, boolean>
    savedSections: Record<number, boolean>
    error: string | null
}

export function useIssueEditor(slug: string, edition: string) {
    const [issue, setIssue] = useState<Issue | null>(null);
    const [sections, setSections] = useState<IssueSection[]>([]);
    const [availableSections, setAvailableSections] = useState<Section[]>([]);

    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

    const [savingSections, setSavingSections] = useState<Record<number, boolean>>({})
    const [savedSections, setSavedSections] = useState<Record<number, boolean>>({})

    const [pageMap, setPageMap] = useState<PageMap>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        async function load() {
            try {
                const data = await getIssueDetail(slug, edition);
                if (!isMounted) return;

                setIssue(data);
                setSections(data.sections);

                const map: PageMap = {}

                data.sections.forEach(section => {
                    section.segments.forEach(segment => {
                        for (let p = segment.start_page; p <= segment.end_page; p++) {
                            map[p] = section.id;
                        }
                    })
                })

                setPageMap(map);
            } catch (err) {
                console.error("Failed to load issue details", err);
                setError("Failed to load issue details. Make sure the API is reachable.");
            }
        }

        void load();
        return () => { isMounted = false };
    }, [slug, edition]);

    useEffect(() => {
        let isMounted = true;
        getSections()
            .then(data => { if (isMounted) setAvailableSections(data); })
            .catch(console.error);
        return () => { isMounted = false };
    }, []);

    async function createSection() {
        if (!issue || !selectedTemplate) return

        const template = availableSections.find(s => s.id === selectedTemplate);

        const newSection = await createIssueSection(issue.id, {
            section_id: selectedTemplate,
            title: template?.name ?? "Nova seção", // Temporário
            order: sections.length,
            text_content: "",
            segments: []
        })

        setSections(prev => [...prev, newSection])
        setSelectedSectionId(newSection.id)
    }

    function assignPage(page: number) {
        if (!selectedSectionId) return;

        setPageMap(prev => ({
            ...prev,
            [page]: prev[page] === selectedSectionId ? null : selectedSectionId,
        }));
    }

    function updateSectionTitle(sectionId: number, title: string) {
        setSections(prev =>
            prev.map(s =>
                s.id === sectionId ? { ...s, title } : s
            )
        )
    }

    async function saveSection(sectionId: number) {
        if (!issue) return

        const section = sections.find(s => s.id === sectionId)
        if (!section) return

        setSavingSections(prev => ({ ...prev, [sectionId]: true }))
        setSavedSections(prev => ({ ...prev, [sectionId]: false }))

        try {
            const pages = Object.entries(pageMap)
                .filter(([, sId]) => sId === sectionId)
                .map(([page]) => Number(page));

            const segments = pagesToSegments(pages);
            await updateIssueSection(issue.id, sectionId, {
                segments,
                title: section.title ?? ""
            });

            // Update local state to reflect the new segments
            setSections(prev => prev.map(s =>
                s.id === sectionId ? { ...s, segments } : s
            ));

            setSavedSections(prev => ({ ...prev, [sectionId]: true }))

            setTimeout(() => {
                setSavedSections(prev => ({ ...prev, [sectionId]: false }))
            }, 2000);
        } catch (error) {
            console.error("Failed to save section", error);
            alert("Failed to save section. Please try again.");
        } finally {
            setSavingSections(prev => ({ ...prev, [sectionId]: false }))
        }
    }

    const sortedSections = useMemo(() => {
        return [...sections].sort((a, b) => {
            const aMin = a.segments.length > 0 ? Math.min(...a.segments.map(s => s.start_page)) : Infinity;
            const bMin = b.segments.length > 0 ? Math.min(...b.segments.map(s => s.start_page)) : Infinity;
            return aMin - bMin;
        });
    }, [sections]);

    return {
        issue,
        sections: sortedSections,
        availableSections,

        selectedSectionId,
        setSelectedSectionId,

        selectedTemplate,
        setSelectedTemplate,

        pageMap,
        assignPage,

        createSection,
        updateSectionTitle,

        saveSection,
        savingSections,
        savedSections,
        error,
    }
}
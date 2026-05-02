"use client"

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import { pagesToSegments } from "@/lib/editor";
import { createIssueSection, createSectionType, deleteIssueSection, getIssueDetail, getSections, updateIssueSection } from "@/lib/issues";
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
    deleteSection: (sectionId: number) => void
    updateSectionTitle: (sectionId: number, title: string) => void
    updateSectionText: (sectionId: number, text: string) => void
    updateSectionType: (sectionId: number, typeId: number) => void
    createNewSectionType: (name: string) => Promise<void>
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

    async function deleteSection(sectionId: number) {
        if (!issue) return
        if (!confirm("Are you sure you want to delete this section?")) return

        try {
            await deleteIssueSection(issue.id, sectionId)
            setSections(prev => prev.filter(s => s.id !== sectionId))
            setPageMap(prev => {
                const newMap = { ...prev }
                Object.keys(newMap).forEach(page => {
                    if (newMap[Number(page)] === sectionId) {
                        newMap[Number(page)] = null
                    }
                })
                return newMap
            })
            if (selectedSectionId === sectionId) setSelectedSectionId(null)
        } catch (error) {
            console.error("Failed to delete section", error);
            alert("Failed to delete section.");
        }
    }

    async function createNewSectionType(name: string) {
        try {
            const newType = await createSectionType(name)
            setAvailableSections(prev => [...prev, newType])
            setSelectedTemplate(newType.id)
        } catch (error) {
            console.error("Failed to create section type", error);
            alert("Failed to create section type.");
        }
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

    function updateSectionText(sectionId: number, text: string) {
        setSections(prev =>
            prev.map(s =>
                s.id === sectionId ? { ...s, text_content: text } : s
            )
        )
    }

    function updateSectionType(sectionId: number, typeId: number) {
        const type = availableSections.find(t => t.id === typeId)
        if (!type) return

        setSections(prev =>
            prev.map(s =>
                s.id === sectionId ? { ...s, section: type } : s
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
                title: section.title ?? "",
                text_content: section.text_content ?? "",
                section_id: section.section.id,
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
        deleteSection,
        updateSectionTitle,
        updateSectionText,
        updateSectionType,
        createNewSectionType,

        saveSection,
        savingSections,
        savedSections,
        error,
    }
}
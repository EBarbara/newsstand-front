"use client"

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import { pagesToSegments } from "@/lib/editor";
import { createIssueSection, createSectionType, deleteIssue, deleteIssuePage, deleteIssueSection, getIssueDetail, getSections, importCbzToIssue, replaceIssuePage, updateIssueSection, uploadIssuePage } from "@/lib/issues";
import { Issue } from "@/@types/issue";
import { Render } from "@/@types/render";
import { IssueSection } from "@/@types/issueSection";
import { Section } from "@/@types/section";
import { Tag } from "@/@types/tag";
import { useRouter } from "next/navigation";

// Broadcast helper for tab synchronization (e.g. refreshes lists when adding pages in another tab)
const broadcastUpdate = (issueId: number, type: 'ISSUE_UPDATED' | 'ISSUE_DELETED' = 'ISSUE_UPDATED') => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
            const channel = new BroadcastChannel('newsstand-issue-updates');
            channel.postMessage({ type, id: issueId });
            channel.close();
        } catch (e) {
            console.error("Failed to broadcast issue change", e);
        }
    }
};


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
    updateSectionTranslatedTitle: (sectionId: number, translatedTitle: string) => void
    updateSectionText: (sectionId: number, text: string) => void
    updateSectionType: (sectionId: number, typeId: number) => void
    createNewSectionType: (name: string) => Promise<void>
    addCreditToSection: (sectionId: number, personId: number, role: string | null, importance?: number) => void
    removeCreditFromSection: (sectionId: number, creditIndex: number) => void
    updateCreditRole: (sectionId: number, creditIndex: number, role: string) => void
    updateCreditImportance: (sectionId: number, creditIndex: number, importance: number) => void
    updateCreditPage: (sectionId: number, creditIndex: number, renderIds: number[]) => void
    addRelationshipToSection: (sectionId: number, targetSectionId: number, label: string, inverseLabel: string | null) => void
    removeRelationshipFromSection: (sectionId: number, relIndex: number) => void
    updateRelationshipLabel: (sectionId: number, relIndex: number, label: string) => void
    updateRelationshipInverseLabel: (sectionId: number, relIndex: number, inverseLabel: string) => void
    saveSection: (sectionId: number) => void
    savingSections: Record<number, boolean>
    savedSections: Record<number, boolean>
    handleUploadPage: (file: File, order?: number) => Promise<void>
    handleReplacePage: (renderId: number, file: File) => Promise<void>
    handleDeletePage: (renderId: number) => Promise<void>
    handleUpdatePageMetadata: (renderId: number, data: Partial<Render>) => Promise<void>
    handleMovePage: (renderId: number, direction: 'up' | 'down') => Promise<void>
    handleImportCbz: (file: File) => Promise<void>
    importStatus: 'idle' | 'loading' | 'success' | 'error'
    importedPagesCount: number
    importError: string | null
    setImportStatus: Dispatch<SetStateAction<'idle' | 'loading' | 'success' | 'error'>>
    handleDeleteIssue: () => Promise<void>
    updateIssueMetadata: (data: Partial<Issue>) => Promise<void>
    updateIssueTags: (tags: Tag[]) => Promise<void>
    error: string | null
}

export function useIssueEditor(slug: string, edition: string, volume?: string) {
    const router = useRouter();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [sections, setSections] = useState<IssueSection[]>([]);
    const [availableSections, setAvailableSections] = useState<Section[]>([]);

    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

    const [savingSections, setSavingSections] = useState<Record<number, boolean>>({})
    const [savedSections, setSavedSections] = useState<Record<number, boolean>>({})

    const [pageMap, setPageMap] = useState<PageMap>({});
    const [error, setError] = useState<string | null>(null);

    const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [importedPagesCount, setImportedPagesCount] = useState<number>(0);
    const [importError, setImportError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        async function load() {
            try {
                const data = await getIssueDetail(slug, edition, volume);
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
    }, [slug, edition, volume]);

    useEffect(() => {
        let isMounted = true;
        getSections(1, 1000)
            .then(res => { if (isMounted) setAvailableSections(res.results); })
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

    function updateSectionTranslatedTitle(sectionId: number, translatedTitle: string) {
        setSections(prev =>
            prev.map(s =>
                s.id === sectionId ? { ...s, translated_title: translatedTitle } : s
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

    function addCreditToSection(sectionId: number, personId: number, role: string | null, importance?: number) {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                credits: [...(s.credits || []), { person_id: personId, role, importance: importance ?? 2 }]
            }
        }));
    }

    function removeCreditFromSection(sectionId: number, creditIndex: number) {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            const newCredits = [...(s.credits || [])];
            newCredits.splice(creditIndex, 1);
            return { ...s, credits: newCredits };
        }));
    }

    function updateCreditRole(sectionId: number, creditIndex: number, role: string) {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            const newCredits = [...(s.credits || [])];
            newCredits[creditIndex] = { ...newCredits[creditIndex], role };
            return { ...s, credits: newCredits };
        }));
    }

    function updateCreditImportance(sectionId: number, creditIndex: number, importance: number) {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            const newCredits = [...(s.credits || [])];
            newCredits[creditIndex] = { ...newCredits[creditIndex], importance };
            return { ...s, credits: newCredits };
        }));
    }

    function updateCreditPage(sectionId: number, creditIndex: number, renderIds: number[]) {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            const newCredits = [...(s.credits || [])];
            newCredits[creditIndex] = { ...newCredits[creditIndex], render_ids: renderIds };
            return { ...s, credits: newCredits };
        }));
    }

    function addRelationshipToSection(sectionId: number, targetSectionId: number, label: string, inverseLabel: string | null) {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                relationships: [...(s.relationships || []), {
                    issue_section_id: targetSectionId,
                    label,
                    inverse_label: inverseLabel,
                    order: (s.relationships || []).length
                } as any]
            }
        }));
    }

    function removeRelationshipFromSection(sectionId: number, relIndex: number) {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            const newRels = [...(s.relationships || [])];
            newRels.splice(relIndex, 1);
            return { ...s, relationships: newRels };
        }));
    }

    function updateRelationshipLabel(sectionId: number, relIndex: number, label: string) {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            const newRels = [...(s.relationships || [])];
            newRels[relIndex] = { ...newRels[relIndex], label };
            return { ...s, relationships: newRels };
        }));
    }

    function updateRelationshipInverseLabel(sectionId: number, relIndex: number, inverseLabel: string) {
        setSections(prev => prev.map(s => {
            if (s.id !== sectionId) return s;
            const newRels = [...(s.relationships || [])];
            newRels[relIndex] = { ...newRels[relIndex], inverse_label: inverseLabel };
            return { ...s, relationships: newRels };
        }));
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
            const updatedSection = await updateIssueSection(issue.id, sectionId, {
                segments,
                title: section.title ?? "",
                translated_title: section.translated_title ?? "",
                text_content: section.text_content ?? "",
                section_id: section.section.id,
                credits: (section.credits || [])
                    .filter(c => c.person_id || c.person?.id)
                    .map(c => ({
                        person_id: (c.person_id || c.person?.id)!,
                        role: c.role,
                        importance: c.importance || 1,
                        render_ids: c.render_ids || []
                    })),
                relationships: (section.relationships || [])
                    .filter(r => r.is_from !== false)
                    .map(r => ({
                        issue_section_id: r.issue_section_id,
                        label: r.label,
                        inverse_label: r.inverse_label || null,
                        order: r.order ?? 0
                    }))
            });

            // Update local state with the actual data from the server
            setSections(prev => prev.map(s =>
                s.id === sectionId ? updatedSection : s
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

    async function handleUploadPage(file: File, order?: number) {
        if (!issue) return
        try {
            const updatedIssue = await uploadIssuePage(issue.id, file, order)
            setIssue(updatedIssue)
            setSections(updatedIssue.sections)
            broadcastUpdate(issue.id);
            // Re-calculate page map
            const map: PageMap = {}
            updatedIssue.sections.forEach(section => {
                section.segments.forEach(segment => {
                    for (let p = segment.start_page; p <= segment.end_page; p++) {
                        map[p] = section.id;
                    }
                })
            })
            setPageMap(map)
        } catch (error) {
            console.error("Failed to upload page", error)
            alert("Failed to upload page.")
        }
    }

    async function handleImportCbz(file: File) {
        if (!issue) return
        setImportStatus('loading');
        setImportError(null);
        try {
            const updatedIssue = await importCbzToIssue(issue.id, file)
            setIssue(updatedIssue)
            setSections(updatedIssue.sections)
            setImportedPagesCount(updatedIssue.pages_count || 0);
            setImportStatus('success');
            broadcastUpdate(issue.id);

            // Re-calculate page map
            const map: PageMap = {}
            updatedIssue.sections.forEach(section => {
                section.segments.forEach(segment => {
                    for (let p = segment.start_page; p <= segment.end_page; p++) {
                        map[p] = section.id;
                    }
                })
            })
            setPageMap(map)
        } catch (error: any) {
            console.error("Failed to import CBZ", error)
            setImportError(error.message || "Falha ao importar CBZ.");
            setImportStatus('error');
        }
    }

    async function handleReplacePage(renderId: number, file: File) {
        if (!issue) return
        try {
            const updatedIssue = await replaceIssuePage(issue.id, renderId, file)
            setIssue(updatedIssue)
            broadcastUpdate(issue.id);
            // Note: Replace doesn't change segments, but it might change dimensions
        } catch (error) {
            console.error("Failed to replace page", error)
            alert("Failed to replace page.")
        }
    }

    async function handleDeletePage(renderId: number) {
        if (!issue) return
        if (!confirm("Are you sure you want to delete this page? This will shift subsequent pages and adjust sections.")) return

        try {
            const updatedIssue = await deleteIssuePage(issue.id, renderId)
            setIssue(updatedIssue)
            setSections(updatedIssue.sections)
            broadcastUpdate(issue.id);
            // Re-calculate page map
            const map: PageMap = {}
            updatedIssue.sections.forEach(section => {
                section.segments.forEach(segment => {
                    for (let p = segment.start_page; p <= segment.end_page; p++) {
                        map[p] = section.id;
                    }
                })
            })
            setPageMap(map)
        } catch (error) {
            console.error("Failed to delete page", error)
            alert("Failed to delete page.")
        }
    }

    async function handleUpdatePageMetadata(renderId: number, data: Partial<Render>) {
        if (!issue) return
        try {
            const { updateRender } = await import("@/lib/issues");
            const updatedRender = await updateRender(issue.id, renderId, data);
            setIssue(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    renders: prev.renders.map(r => r.id === renderId ? updatedRender : r)
                }
            });
        } catch (error) {
            console.error("Failed to update render metadata", error);
            alert("Failed to update page metadata.");
        }
    }

    async function updateIssueMetadata(data: Partial<Issue>) {
        if (!issue) return
        try {
            const { updateIssue } = await import("@/lib/issues");
            const updated = await updateIssue(issue.id, data);
            setIssue(updated);
            broadcastUpdate(issue.id);
        } catch (error) {
            console.error("Failed to update issue metadata", error);
            alert("Failed to update issue status.");
        }
    }

    async function updateIssueTags(tags: Tag[]) {
        if (!issue) return;
        try {
            const { updateIssue } = await import("@/lib/issues");
            const tag_ids = tags.map(t => t.id);
            const updated = await updateIssue(issue.id, { tag_ids } as any);
            setIssue(updated);
            broadcastUpdate(issue.id);
        } catch (error) {
            console.error("Failed to update issue tags", error);
            alert("Falha ao atualizar tags da edição.");
        }
    }

    const sortedSections = useMemo(() => {
        return [...sections].sort((a, b) => {
            const aMin = a.segments.length > 0 ? Math.min(...a.segments.map(s => s.start_page)) : Infinity;
            const bMin = b.segments.length > 0 ? Math.min(...b.segments.map(s => s.start_page)) : Infinity;
            return aMin - bMin;
        });
    }, [sections]);

    async function onMovePage(renderId: number, direction: 'up' | 'down') {
        if (!issue) return;
        const renders = [...issue.renders].sort((a, b) => a.order - b.order);
        const currentIndex = renders.findIndex(r => r.id === renderId);
        
        try {
            if (direction === 'up' && currentIndex > 0) {
                const newRenders = [...renders];
                [newRenders[currentIndex - 1], newRenders[currentIndex]] = [newRenders[currentIndex], newRenders[currentIndex - 1]];
                const { reorderPages } = await import("@/lib/issues");
                const updatedIssue = await reorderPages(issue.id, newRenders.map(r => r.id));
                setIssue(updatedIssue);
                broadcastUpdate(issue.id);
            } else if (direction === 'down' && currentIndex < renders.length - 1) {
                const newRenders = [...renders];
                [newRenders[currentIndex], newRenders[currentIndex + 1]] = [newRenders[currentIndex + 1], newRenders[currentIndex]];
                const { reorderPages } = await import("@/lib/issues");
                const updatedIssue = await reorderPages(issue.id, newRenders.map(r => r.id));
                setIssue(updatedIssue);
                broadcastUpdate(issue.id);
            }
        } catch (error) {
            console.error("Failed to reorder pages", error);
            alert("Failed to move page.");
        }
    }

    async function handleDeleteIssue() {
        if (!issue) return;
        if (!confirm(`TEM CERTEZA? Isso excluirá permanentemente a edição #${issue.edition} e TODAS as suas páginas e imagens do disco.`)) return;

        try {
            await deleteIssue(issue.id);
            broadcastUpdate(issue.id, 'ISSUE_DELETED');
            router.push(`/magazines/${slug}`);
        } catch (error) {
            console.error("Failed to delete issue", error);
            alert("Falha ao excluir edição.");
        }
    }

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
        updateSectionTranslatedTitle,
        updateSectionText,
        updateSectionType,
        createNewSectionType,

        addCreditToSection,
        removeCreditFromSection,
        updateCreditRole,
        updateCreditImportance,
        updateCreditPage,

        addRelationshipToSection,
        removeRelationshipFromSection,
        updateRelationshipLabel,
        updateRelationshipInverseLabel,

        saveSection,
        savingSections,
        savedSections,

        handleUploadPage,
        handleReplacePage,
        handleDeletePage,
        handleUpdatePageMetadata,
        handleMovePage: onMovePage,
        handleImportCbz,
        importStatus,
        importedPagesCount,
        importError,
        setImportStatus,
        handleDeleteIssue,
        updateIssueMetadata,
        updateIssueTags,
        error,
    }
}
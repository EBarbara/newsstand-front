import { useState, useEffect } from "react";
import Link from "next/link";
import { IssueEditorState } from "@/hooks/useIssueEditor";
import { getPeople } from "@/lib/people";
import { Person } from "@/@types/person";
import { getIssueUrl, getGlobalIssueSections } from "@/lib/issues";
import TagEditor from "./TagEditor";

type Props = Pick<
    IssueEditorState,
    | "issue"
    | "sections"
    | "availableSections"
    | "selectedSectionId"
    | "setSelectedSectionId"
    | "createSection"
    | "deleteSection"
    | "updateSectionTitle"
    | "updateSectionText"
    | "updateSectionType"
    | "createNewSectionType"
    | "saveSection"
    | "selectedTemplate"
    | "setSelectedTemplate"
    | "savingSections"
    | "savedSections"
    | "addCreditToSection"
    | "removeCreditFromSection"
    | "updateCreditRole"
    | "updateCreditImportance"
    | "updateCreditPage"
    | "addRelationshipToSection"
    | "removeRelationshipFromSection"
    | "updateRelationshipLabel"
    | "updateRelationshipInverseLabel"
    | "updateIssueMetadata"
    | "updateIssueTags"
    | "handleDeleteIssue"
>

export default function SectionsPanel({
    issue,
    sections,
    selectedSectionId,
    setSelectedSectionId,
    createSection,
    deleteSection,
    updateSectionTitle,
    updateSectionText,
    updateSectionType,
    createNewSectionType,
    saveSection,
    availableSections,
    selectedTemplate,
    setSelectedTemplate,
    savingSections,
    savedSections,
    addCreditToSection,
    removeCreditFromSection,
    updateCreditRole,
    updateCreditImportance,
    updateCreditPage,
    addRelationshipToSection,
    removeRelationshipFromSection,
    updateRelationshipLabel,
    updateRelationshipInverseLabel,
    updateIssueMetadata,
    updateIssueTags,
    handleDeleteIssue
}: Props) {
    const [newTypeName, setNewTypeName] = useState("");
    const [isCreatingType, setIsCreatingType] = useState(false);
    const [sectionSearch, setSectionSearch] = useState("");

    const [people, setPeople] = useState<Person[]>([]);
    const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
    const [newCreditRole, setNewCreditRole] = useState("");
    const [newCreditImportance, setNewCreditImportance] = useState<number>(2);
    const [peopleSearch, setPeopleSearch] = useState("");
    const [isLoadingPeople, setIsLoadingPeople] = useState(false);

    const [relatedSections, setRelatedSections] = useState<any[]>([]);
    const [selectedRelatedId, setSelectedRelatedId] = useState<number | null>(null);
    const [relSearch, setRelSearch] = useState("");
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);
    const [newRelLabel, setNewRelLabel] = useState("Tradução de");
    const [newRelInverseLabel, setNewRelInverseLabel] = useState("Traduzido como");

    useEffect(() => {
        if (!relSearch.trim()) {
            setRelatedSections([]);
            return;
        }
        setIsLoadingRelated(true);
        const timer = setTimeout(() => {
            getGlobalIssueSections({ search: relSearch, pageSize: 50 })
                .then(res => {
                    // Filter out the currently selected section to prevent self-linking
                    const filtered = res.results.filter(item => item.id !== selectedSectionId);
                    setRelatedSections(filtered);
                })
                .catch(console.error)
                .finally(() => setIsLoadingRelated(false));
        }, 500);
        return () => clearTimeout(timer);
    }, [relSearch, selectedSectionId]);

    const sortedAvailableSections = [...availableSections]
        .filter(s => s.name.toLowerCase().includes(sectionSearch.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        console.log("Searching people for:", peopleSearch);
        setIsLoadingPeople(true);
        const timer = setTimeout(() => {
            getPeople(1, 1000, { search: peopleSearch })
                .then(res => {
                    console.log("Found people:", res.results.length);
                    setPeople(res.results);
                })
                .catch(err => {
                    console.error("Search failed:", err);
                })
                .finally(() => setIsLoadingPeople(false));
        }, 500);
        return () => clearTimeout(timer);
    }, [peopleSearch]);

    const handleCreateType = async () => {
        if (!newTypeName.trim()) return;
        await createNewSectionType(newTypeName);
        setNewTypeName("");
        setIsCreatingType(false);
    };
    return (
        <div className="w-[300px] h-full overflow-y-auto p-2.5 border-r border-gray-800 bg-[#0b0e14] scrollbar-thin scrollbar-thumb-gray-700">
            {issue && (
                <>
                    <Link
                        href={getIssueUrl(issue)}
                        className="flex items-center gap-2 mb-4 p-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                    >
                        ← Voltar para Edição
                    </Link>

                    <div className="flex flex-col gap-3 mb-6 p-3 bg-white/[0.03] border border-white/5 rounded-xl shadow-inner">
                        <label className="text-[10px] uppercase font-bold text-blue-200 opacity-50 tracking-widest">Status da Coleção</label>
                        <div className="flex flex-col gap-2.5">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={issue.has_physical_copy}
                                        onChange={(e) => updateIssueMetadata({ has_physical_copy: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">Possuo Física 📚</span>
                                    <span className="text-[9px] text-gray-500 uppercase tracking-tighter">Edição em papel no acervo</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={issue.is_digital_complete}
                                        onChange={(e) => updateIssueMetadata({ is_digital_complete: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-green-600 focus:ring-green-500 focus:ring-offset-gray-900 transition-all cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">Digital Completa ✅</span>
                                    <span className="text-[9px] text-gray-500 uppercase tracking-tighter">Scan sem páginas faltando</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={issue.is_special}
                                        onChange={(e) => updateIssueMetadata({ is_special: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-amber-600 focus:ring-amber-500 focus:ring-offset-gray-900 transition-all cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">Edição Especial ⭐</span>
                                    <span className="text-[9px] text-gray-500 uppercase tracking-tighter">Marcar como fora da série mensal</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </>
            )}

            {/* SELECT & CREATE TYPE */}
            <div className="flex flex-col gap-2 mb-4">
                {isCreatingType ? (
                    <div className="flex gap-2">
                        <input
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            placeholder="Nome do novo tipo..."
                            className="flex-1 p-1.5 bg-[#1a1d23] border border-blue-500 rounded text-gray-200 text-sm focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleCreateType()}
                        />
                        <button
                            onClick={handleCreateType}
                            className="px-3 bg-blue-600 text-white rounded text-sm hover:bg-blue-500"
                        >
                            Adicionar
                        </button>
                        <button
                            onClick={() => setIsCreatingType(false)}
                            className="px-2 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5 w-full">
                        <input
                            type="text"
                            value={sectionSearch}
                            onChange={(e) => setSectionSearch(e.target.value)}
                            placeholder="Buscar tipo de seção..."
                            className="w-full p-1 bg-[#161a20] border border-gray-800 rounded text-[10px] text-blue-300 focus:border-blue-500 focus:outline-none"
                        />
                        <div className="flex gap-2 w-full">
                            <select
                                value={selectedTemplate ?? ""}
                                onChange={(e) => {
                                    e.stopPropagation()
                                    setSelectedTemplate(Number(e.target.value))
                                }}
                                className="flex-1 p-1.5 bg-[#1a1d23] border border-gray-700 rounded text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                            >
                                <option value="">Selecionar tipo de seção</option>
                                {sortedAvailableSections.length === 0 && sectionSearch && (
                                    <option disabled>Nenhum resultado encontrado</option>
                                )}
                                {sortedAvailableSections.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => setIsCreatingType(true)}
                                title="Criar novo tipo de seção"
                                className="px-3 bg-gray-800 text-gray-300 rounded border border-gray-700 hover:bg-gray-700 hover:text-white shrink-0"
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* BOTÃO */}
            <button
                onClick={createSection}
                disabled={!selectedTemplate}
                className={`w-full mb-4 p-2 text-white font-bold rounded transition-all ${!selectedTemplate
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 shadow-lg active:scale-95"
                    }`}
            >
                + Adicionar Seção
            </button>

            {/* LISTA */}
            {sections.map((s) => (
                <div
                    key={s.id}
                    onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSectionId(prev => (prev === s.id ? null : s.id))
                    }}
                    className={`p-2 mb-1.5 rounded-md cursor-pointer transition-all border ${selectedSectionId === s.id
                        ? "bg-blue-600 text-white border-blue-500 shadow-md"
                        : "bg-[#161a20] text-gray-300 border-gray-800 hover:bg-[#1e232b] hover:border-gray-700"
                        }`}
                >
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            {selectedSectionId === s.id ? (
                                <input
                                    value={s.title || ""}
                                    onChange={(e) => updateSectionTitle(s.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-2 py-1 border border-blue-400 rounded text-sm bg-white text-gray-900 font-bold"
                                    placeholder="Título da Seção"
                                    autoFocus
                                />
                            ) : (
                                <span className="text-sm font-semibold truncate block">
                                    {s.title || (s.section && s.section.name) || "Sem título"}
                                </span>
                            )}
                        </div>

                        {s.segments.length === 0 && (
                            <span
                                title="Incompleto (sem páginas atribuídas)"
                                className={`text-xs shrink-0 ${selectedSectionId === s.id ? "text-yellow-200" : "text-amber-500"}`}
                            >
                                ⚠️
                            </span>
                        )}
                    </div>

                    {selectedSectionId === s.id && (
                        <div className="mt-3 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-blue-200 opacity-70">Tipo</label>
                                <select
                                    value={s.section?.id || ""}
                                    onChange={(e) => updateSectionType(s.id, Number(e.target.value))}
                                    className="w-full p-1 bg-[#252a33] border border-blue-400/30 rounded text-xs text-white focus:outline-none"
                                >
                                    <option value="" disabled>Selecionar tipo...</option>
                                    {sortedAvailableSections.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-blue-200 opacity-70">Conteúdo de Texto</label>
                                <textarea
                                    value={s.text_content || ""}
                                    onChange={(e) => updateSectionText(s.id, e.target.value)}
                                    placeholder="Texto opcional..."
                                    className="w-full h-24 p-2 bg-[#252a33] border border-blue-400/30 rounded text-xs text-white focus:outline-none resize-none scrollbar-thin scrollbar-thumb-gray-600"
                                />
                            </div>

                            {/* CREDITS */}
                            <div className="flex flex-col gap-2 mt-1">
                                <label className="text-[10px] uppercase font-bold text-blue-200 opacity-70">Créditos</label>

                                <div className="flex flex-col gap-1.5">
                                    {(s.credits || []).map((credit, idx) => (
                                        <div key={idx} className="flex gap-2 items-center bg-[#1a1d23] p-1.5 rounded border border-gray-800">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] font-bold text-gray-400 truncate">
                                                    {credit.person?.name || people.find(p => p.id === credit.person_id)?.name || "Unknown"}
                                                </div>
                                                <input
                                                    value={credit.role || ""}
                                                    onChange={(e) => updateCreditRole(s.id, idx, e.target.value)}
                                                    placeholder="Papel (ex: Artista)"
                                                    className="w-full bg-transparent text-[11px] text-blue-300 focus:outline-none border-b border-transparent focus:border-blue-500"
                                                />

                                                {/* PAGE ANCHOR MULTI-SELECT */}
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <span className="text-[9px] text-gray-500 mr-1 uppercase font-bold opacity-50">Págs:</span>
                                                    {issue?.renders?.filter(r => s.segments.some(seg => r.order >= seg.start_page && r.order <= seg.end_page))
                                                        .map(r => {
                                                            const isSelected = (credit.render_ids || []).includes(r.id);
                                                            return (
                                                                <button
                                                                    key={r.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current = credit.render_ids || [];
                                                                        const next = isSelected ? current.filter(id => id !== r.id) : [...current, r.id];
                                                                        updateCreditPage(s.id, idx, next);
                                                                    }}
                                                                    className={`text-[9px] px-1.5 py-0.5 rounded transition-all ${isSelected
                                                                        ? "bg-blue-600 text-white font-bold"
                                                                        : "bg-[#252a33] text-gray-500 hover:bg-[#2c323c]"
                                                                        }`}
                                                                >
                                                                    {r.order}
                                                                </button>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 items-end">
                                                <select
                                                    value={credit.importance || 1}
                                                    onChange={(e) => updateCreditImportance(s.id, idx, Number(e.target.value))}
                                                    className={`text-[9px] font-bold uppercase rounded px-1 py-0.5 border-none focus:ring-0 cursor-pointer ${credit.importance === 1 ? "bg-amber-500/20 text-amber-400" :
                                                        credit.importance === 2 ? "bg-blue-500/20 text-blue-400" :
                                                            "bg-gray-500/20 text-gray-400"
                                                        }`}
                                                >
                                                    <option value={1} className="bg-[#1a1d23]">Major</option>
                                                    <option value={2} className="bg-[#1a1d23]">Regular</option>
                                                    <option value={3} className="bg-[#1a1d23]">Minor</option>
                                                </select>
                                                <button
                                                    onClick={() => removeCreditFromSection(s.id, idx)}
                                                    className="text-gray-500 hover:text-red-400 p-0.5"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ADD CREDIT */}
                                <div className="flex flex-col gap-1.5 mt-1 p-2 bg-[#1a1d23]/50 rounded border border-dashed border-gray-700">
                                    <div className="flex flex-col gap-1">
                                        <input
                                            type="text"
                                            value={peopleSearch}
                                            onChange={(e) => setPeopleSearch(e.target.value)}
                                            placeholder="Buscar pessoa..."
                                            className="w-full p-1 bg-[#161a20] border border-gray-800 rounded text-[10px] text-blue-300 focus:border-blue-500 focus:outline-none"
                                        />
                                        <select
                                            key={`select-${people.length}-${peopleSearch}`}
                                            value={selectedPersonId ?? ""}
                                            onChange={(e) => setSelectedPersonId(Number(e.target.value))}
                                            className="w-full p-1 bg-[#252a33] border border-gray-700 rounded text-[10px] text-white"
                                        >
                                            <option value="">{isLoadingPeople ? "Buscando..." : "Selecionar..."}</option>
                                            {people.length === 0 && !isLoadingPeople && peopleSearch && (
                                                <option disabled>Nenhum resultado encontrado</option>
                                            )}
                                            {people.map(p => {
                                                const matchingAlias = p.aliases?.find(a =>
                                                    a.toLowerCase().includes(peopleSearch.toLowerCase()) &&
                                                    !p.name.toLowerCase().includes(peopleSearch.toLowerCase())
                                                );
                                                return (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                        {p.disambiguation ? ` [${p.disambiguation}]` : ""}
                                                        {matchingAlias ? ` (aka ${matchingAlias})` : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="flex flex-wrap gap-1 items-center py-0.5">
                                        <span className="text-[9px] text-gray-500 uppercase font-bold mr-1">Importância:</span>
                                        <button
                                            type="button"
                                            onClick={() => setNewCreditImportance(1)}
                                            className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 border transition-all ${
                                                newCreditImportance === 1
                                                    ? "bg-amber-500 text-gray-950 border-amber-400 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                                                    : "bg-amber-500/10 text-amber-500/60 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-400"
                                            }`}
                                        >
                                            Major
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewCreditImportance(2)}
                                            className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 border transition-all ${
                                                newCreditImportance === 2
                                                    ? "bg-blue-500 text-gray-950 border-blue-400 font-extrabold shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                                    : "bg-blue-500/10 text-blue-500/60 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-400"
                                            }`}
                                        >
                                            Regular
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewCreditImportance(3)}
                                            className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 border transition-all ${
                                                newCreditImportance === 3
                                                    ? "bg-gray-400 text-gray-950 border-gray-300 font-extrabold shadow-[0_0_8px_rgba(156,163,175,0.3)]"
                                                    : "bg-gray-500/10 text-gray-500/60 border-gray-500/20 hover:bg-gray-500/20 hover:text-gray-400"
                                            }`}
                                        >
                                            Minor
                                        </button>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <input
                                            value={newCreditRole}
                                            onChange={(e) => setNewCreditRole(e.target.value)}
                                            placeholder="Papel..."
                                            className="flex-1 p-1 bg-[#252a33] border border-gray-700 rounded text-[10px] text-white"
                                        />
                                        <button
                                            onClick={() => {
                                                if (selectedPersonId) {
                                                    addCreditToSection(s.id, selectedPersonId, newCreditRole, newCreditImportance);
                                                    setSelectedPersonId(null);
                                                    setNewCreditRole("");
                                                    setNewCreditImportance(2);
                                                }
                                            }}
                                            disabled={!selectedPersonId}
                                            className="px-2 bg-blue-600 text-white rounded text-[10px] hover:bg-blue-500 disabled:opacity-50"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* RELATIONSHIPS */}
                            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-800">
                                <label className="text-[10px] uppercase font-bold text-blue-200 opacity-70">Vínculos (Traduções / Republicações)</label>

                                <div className="flex flex-col gap-1.5">
                                    {(s.relationships || []).map((rel, idx) => (
                                        <div key={idx} className="flex gap-2 items-center bg-[#1a1d23] p-1.5 rounded border border-gray-800">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] font-bold text-gray-300 truncate">
                                                    {rel.issue_section_title || rel.section_name || "Sem título"}
                                                </div>
                                                <div className="text-[9px] text-gray-500 truncate">
                                                    {rel.magazine_name} {rel.issue_volume ? `Vol. ${rel.issue_volume} ` : ""}{rel.issue_edition ? `Ed. ${rel.issue_edition}` : ""}
                                                </div>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[8px] text-gray-500 w-10 shrink-0 font-bold uppercase">Ida:</span>
                                                        <input
                                                            value={rel.label || ""}
                                                            onChange={(e) => updateRelationshipLabel(s.id, idx, e.target.value)}
                                                            placeholder="Rótulo (ex: Tradução de)"
                                                            className="flex-1 bg-transparent text-[10px] text-blue-300 focus:outline-none border-b border-transparent focus:border-blue-500 min-w-0"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[8px] text-gray-500 w-10 shrink-0 font-bold uppercase">Volta:</span>
                                                        <input
                                                            value={rel.inverse_label || ""}
                                                            onChange={(e) => updateRelationshipInverseLabel(s.id, idx, e.target.value)}
                                                            placeholder="Inverso (ex: Traduzido como)"
                                                            className="flex-1 bg-transparent text-[10px] text-gray-400 focus:outline-none border-b border-transparent focus:border-gray-500 min-w-0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeRelationshipFromSection(s.id, idx)}
                                                className="text-gray-500 hover:text-red-400 p-0.5"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* ADD RELATIONSHIP */}
                                <div className="flex flex-col gap-1.5 mt-1 p-2 bg-[#1a1d23]/50 rounded border border-dashed border-gray-700">
                                    <div className="flex flex-col gap-1">
                                        <input
                                            type="text"
                                            value={relSearch}
                                            onChange={(e) => setRelSearch(e.target.value)}
                                            placeholder="Buscar matéria..."
                                            className="w-full p-1 bg-[#161a20] border border-gray-800 rounded text-[10px] text-blue-300 focus:border-blue-500 focus:outline-none"
                                        />
                                        <select
                                            value={selectedRelatedId ?? ""}
                                            onChange={(e) => setSelectedRelatedId(Number(e.target.value))}
                                            className="w-full p-1 bg-[#252a33] border border-gray-700 rounded text-[10px] text-white"
                                        >
                                            <option value="">{isLoadingRelated ? "Buscando..." : "Selecionar matéria..."}</option>
                                            {relatedSections.length === 0 && !isLoadingRelated && relSearch && (
                                                <option disabled>Nenhuma matéria encontrada</option>
                                            )}
                                            {relatedSections.map(item => (
                                                <option key={item.id} value={item.id}>
                                                    {item.magazine_name} (Ed. {item.issue_edition?.replace("-", "/")}) - {item.title || item.section_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex gap-1.5">
                                            <input
                                                value={newRelLabel}
                                                onChange={(e) => setNewRelLabel(e.target.value)}
                                                placeholder="Rótulo (ex: Tradução de)"
                                                className="flex-1 p-1 bg-[#252a33] border border-gray-700 rounded text-[9px] text-white min-w-0"
                                            />
                                            <input
                                                value={newRelInverseLabel}
                                                onChange={(e) => setNewRelInverseLabel(e.target.value)}
                                                placeholder="Inverso (ex: Traduzido como)"
                                                className="flex-1 p-1 bg-[#252a33] border border-gray-700 rounded text-[9px] text-white min-w-0"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (selectedRelatedId) {
                                                    addRelationshipToSection(s.id, selectedRelatedId, newRelLabel, newRelInverseLabel || null);
                                                    setSelectedRelatedId(null);
                                                    setRelSearch("");
                                                    setNewRelLabel("Tradução de");
                                                    setNewRelInverseLabel("Traduzido como");
                                                }
                                            }}
                                            disabled={!selectedRelatedId}
                                            className="w-full py-1 bg-blue-600 text-white rounded text-[10px] hover:bg-blue-500 disabled:opacity-50 font-bold"
                                        >
                                            Adicionar Vínculo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => saveSection(s.id)}
                                    disabled={savingSections[s.id]}
                                    className={`flex-1 py-1.5 font-bold rounded text-sm transition-all shadow-sm ${savingSections[s.id]
                                        ? "bg-blue-400 text-white"
                                        : savedSections[s.id]
                                            ? "bg-green-500 text-white"
                                            : "bg-white text-blue-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {savingSections[s.id] ? "Salvando..." : savedSections[s.id] ? "Salvo ✓" : "Salvar"}
                                </button>
                                <button
                                    onClick={() => deleteSection(s.id)}
                                    title="Excluir seção"
                                    className="px-3 bg-red-900/50 text-red-200 border border-red-800/50 rounded hover:bg-red-800 hover:text-white transition-all"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* TAGS */}
            <div className="mt-6 pt-6 border-t border-white/5">
                <TagEditor
                    selectedTags={issue?.tags || []}
                    onChange={updateIssueTags}
                />
            </div>

            {/* DANGER ZONE */}
            <div className="mt-8 pt-6 border-t border-red-900/30">
                <label className="text-[10px] uppercase font-bold text-red-500 opacity-70 mb-3 block tracking-widest">Zona de Perigo</label>
                <button
                    onClick={handleDeleteIssue}
                    className="w-full p-2.5 bg-red-900/20 text-red-500 border border-red-900/50 rounded-lg text-xs font-bold hover:bg-red-900 hover:text-white transition-all active:scale-95"
                >
                    🗑️ Excluir Edição Permanente
                </button>
            </div>
        </div>
    );
}
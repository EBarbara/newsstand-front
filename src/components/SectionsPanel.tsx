import { useState, useEffect } from "react";
import Link from "next/link";
import { IssueEditorState } from "@/hooks/useIssueEditor";
import { getPeople } from "@/lib/people";
import { Person } from "@/@types/person";

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
                                          updateCreditRole
}: Props) {
    const [newTypeName, setNewTypeName] = useState("");
    const [isCreatingType, setIsCreatingType] = useState(false);

    const [people, setPeople] = useState<Person[]>([]);
    const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
    const [newCreditRole, setNewCreditRole] = useState("");

    useEffect(() => {
        getPeople(1, 100).then(res => setPeople(res.results)).catch(console.error);
    }, []);

    const handleCreateType = async () => {
        if (!newTypeName.trim()) return;
        await createNewSectionType(newTypeName);
        setNewTypeName("");
        setIsCreatingType(false);
    };
    return (
        <div className="w-[300px] h-full overflow-y-auto p-2.5 border-r border-gray-800 bg-[#0b0e14] scrollbar-thin scrollbar-thumb-gray-700">
            {issue && (
                <Link 
                    href={`/magazines/${issue.magazine.slug}/${issue.edition}`}
                    className="flex items-center gap-2 mb-4 p-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                >
                    ← Voltar para Edição
                </Link>
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
                    <div className="flex gap-2">
                        <select
                            value={selectedTemplate ?? ""}
                            onChange={(e) => {
                                e.stopPropagation()
                                setSelectedTemplate(Number(e.target.value))
                            }}
                            className="flex-1 p-1.5 bg-[#1a1d23] border border-gray-700 rounded text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Selecionar tipo de seção</option>
                            {availableSections.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsCreatingType(true)}
                            title="Criar novo tipo de seção"
                            className="px-3 bg-gray-800 text-gray-300 rounded border border-gray-700 hover:bg-gray-700 hover:text-white"
                        >
                            +
                        </button>
                    </div>
                )}
            </div>

            {/* BOTÃO */}
            <button
                onClick={createSection}
                disabled={!selectedTemplate}
                className={`w-full mb-4 p-2 text-white font-bold rounded transition-all ${
                    !selectedTemplate 
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
                    className={`p-2 mb-1.5 rounded-md cursor-pointer transition-all border ${
                        selectedSectionId === s.id 
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
                                    {availableSections.map((t) => (
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
                                            </div>
                                            <button 
                                                onClick={() => removeCreditFromSection(s.id, idx)}
                                                className="text-gray-500 hover:text-red-400 p-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* ADD CREDIT */}
                                <div className="flex flex-col gap-1.5 mt-1 p-2 bg-[#1a1d23]/50 rounded border border-dashed border-gray-700">
                                    <select 
                                        value={selectedPersonId ?? ""}
                                        onChange={(e) => setSelectedPersonId(Number(e.target.value))}
                                        className="w-full p-1 bg-[#252a33] border border-gray-700 rounded text-[10px] text-white"
                                    >
                                        <option value="">Selecionar pessoa...</option>
                                        {people.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
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
                                                    addCreditToSection(s.id, selectedPersonId, newCreditRole);
                                                    setSelectedPersonId(null);
                                                    setNewCreditRole("");
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

                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={() => saveSection(s.id)}
                                    disabled={savingSections[s.id]}
                                    className={`flex-1 py-1.5 font-bold rounded text-sm transition-all shadow-sm ${
                                        savingSections[s.id] 
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
        </div>
    );
}
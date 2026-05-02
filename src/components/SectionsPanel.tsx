import { useState } from "react";
import { IssueEditorState } from "@/hooks/useIssueEditor";

type Props = Pick<
    IssueEditorState,
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
>

export default function SectionsPanel({
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
                                          savedSections
}: Props) {
    const [newTypeName, setNewTypeName] = useState("");
    const [isCreatingType, setIsCreatingType] = useState(false);

    const handleCreateType = async () => {
        if (!newTypeName.trim()) return;
        await createNewSectionType(newTypeName);
        setNewTypeName("");
        setIsCreatingType(false);
    };
    return (
        <div className="w-[300px] h-full overflow-y-auto p-2.5 border-r border-gray-800 bg-[#0b0e14] scrollbar-thin scrollbar-thumb-gray-700">

            {/* SELECT & CREATE TYPE */}
            <div className="flex flex-col gap-2 mb-4">
                {isCreatingType ? (
                    <div className="flex gap-2">
                        <input
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            placeholder="New type name..."
                            className="flex-1 p-1.5 bg-[#1a1d23] border border-blue-500 rounded text-gray-200 text-sm focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleCreateType()}
                        />
                        <button
                            onClick={handleCreateType}
                            className="px-3 bg-blue-600 text-white rounded text-sm hover:bg-blue-500"
                        >
                            Add
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
                            <option value="">Select section type</option>
                            {availableSections.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsCreatingType(true)}
                            title="Create new section type"
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
                + Add Section
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
                                    placeholder="Section Title"
                                    autoFocus
                                />
                            ) : (
                                <span className="text-sm font-semibold truncate block">
                                    {s.title || s.section?.name || "Untitled"}
                                </span>
                            )}
                        </div>
                        
                        {s.segments.length === 0 && (
                            <span 
                                title="Incomplete (no pages assigned)" 
                                className={`text-xs shrink-0 ${selectedSectionId === s.id ? "text-yellow-200" : "text-amber-500"}`}
                            >
                                ⚠️
                            </span>
                        )}
                    </div>

                    {selectedSectionId === s.id && (
                        <div className="mt-3 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-blue-200 opacity-70">Type</label>
                                <select
                                    value={s.section?.id}
                                    onChange={(e) => updateSectionType(s.id, Number(e.target.value))}
                                    className="w-full p-1 bg-[#252a33] border border-blue-400/30 rounded text-xs text-white focus:outline-none"
                                >
                                    {availableSections.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-blue-200 opacity-70">Text Content</label>
                                <textarea
                                    value={s.text_content || ""}
                                    onChange={(e) => updateSectionText(s.id, e.target.value)}
                                    placeholder="Optional text..."
                                    className="w-full h-24 p-2 bg-[#252a33] border border-blue-400/30 rounded text-xs text-white focus:outline-none resize-none scrollbar-thin scrollbar-thumb-gray-600"
                                />
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
                                    {savingSections[s.id] ? "Saving..." : savedSections[s.id] ? "Saved ✓" : "Save"}
                                </button>
                                <button
                                    onClick={() => deleteSection(s.id)}
                                    title="Delete section"
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
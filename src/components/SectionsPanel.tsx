import { IssueEditorState } from "@/hooks/useIssueEditor";

type Props = Pick<
    IssueEditorState,
    | "sections"
    | "availableSections"
    | "selectedSectionId"
    | "setSelectedSectionId"
    | "createSection"
    | "updateSectionTitle"
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
                                          updateSectionTitle,
                                          saveSection,
                                          availableSections,
                                          selectedTemplate,
                                          setSelectedTemplate,
                                          savingSections,
                                          savedSections
}: Props) {
    return (
        <div className="w-[300px] h-full overflow-y-auto p-2.5 border-r border-gray-800 bg-[#0b0e14] scrollbar-thin scrollbar-thumb-gray-700">

            {/* SELECT */}
            <select
                value={selectedTemplate ?? ""}
                onChange={(e) => {
                    e.stopPropagation()
                    setSelectedTemplate(Number(e.target.value))
                }}
                className="w-full mb-2 p-1.5 bg-[#1a1d23] border border-gray-700 rounded text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="">Select section type</option>
                {availableSections.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                ))}
            </select>

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
                                    {s.title || s.section.name}
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
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                saveSection(s.id)
                            }}
                            disabled={savingSections[s.id]}
                            className={`w-full mt-2 px-2 py-1.5 font-bold border-none rounded cursor-pointer transition-all ${
                                savingSections[s.id] 
                                    ? "bg-blue-400 text-white" 
                                    : savedSections[s.id] 
                                        ? "bg-green-500 text-white" 
                                        : "bg-white text-blue-700 hover:bg-gray-100"
                            }`}
                        >
                            {savingSections[s.id]
                                ? "Saving..."
                                : savedSections[s.id]
                                    ? "Saved ✓"
                                    : "Save"}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
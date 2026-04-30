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
        <div className="w-[250px] p-2.5">

            {/* SELECT */}
            <select
                value={selectedTemplate ?? ""}
                onChange={(e) => {
                    e.stopPropagation()
                    setSelectedTemplate(Number(e.target.value))
                }}
                className="w-full mb-2 p-1 border rounded"
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
                className="w-full mb-3 p-2 border border-gray-300 bg-gray-100 rounded hover:bg-gray-200"
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
                    className={`p-2 rounded-md cursor-pointer ${selectedSectionId === s.id ? "bg-[#f0f0f0]" : "bg-transparent"}`}
                >
                    {selectedSectionId === s.id ? (
                        <>
                            <input
                                value={s.title || ""}
                                onChange={(e) => updateSectionTitle(s.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full mb-1.5 px-2 py-1 border rounded"
                            />

                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    saveSection(s.id)
                                }}
                                disabled={savingSections[s.id]}
                                className={`w-full mt-1.5 px-2 py-1.5 text-white border-none rounded cursor-pointer ${savingSections[s.id] ? "bg-[#999]" : savedSections[s.id] ? "bg-[#2e7d32]" : "bg-[#1976d2]"}`}
                            >
                                {savingSections[s.id]
                                    ? "Saving..."
                                    : savedSections[s.id]
                                        ? "Saved ✓"
                                        : "Save"}
                            </button>
                        </>
                    ) : (
                        s.title || s.section.name
                    )}
                </div>
            ))}
        </div>
    );
}
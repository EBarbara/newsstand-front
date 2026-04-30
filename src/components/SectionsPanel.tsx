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
        <div
            style={{ width: 250, padding: 10 }}
        >

            {/* SELECT */}
            <select
                value={selectedTemplate ?? ""}
                onChange={(e) => {
                    e.stopPropagation()
                    setSelectedTemplate(Number(e.target.value))
                }}
                style={{ width: "100%", marginBottom: 8 }}
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
                style={{ width: "100%", marginBottom: 12 }}
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
                    style={{
                        padding: 8,
                        borderRadius: 6,
                        cursor: "pointer",
                        backgroundColor: selectedSectionId === s.id ? "#f0f0f0" : "transparent"
                    }}
                >
                    {selectedSectionId === s.id ? (
                        <>
                            <input
                                value={s.title || ""}
                                onChange={(e) => updateSectionTitle(s.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{ width: "100%", marginBottom: 6 }}
                            />

                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    saveSection(s.id)
                                }}
                                disabled={savingSections[s.id]}
                                style={{
                                    width: "100%",
                                    marginTop: 6,
                                    padding: "6px 8px",
                                    background: savingSections[s.id]
                                        ? "#999"
                                        : savedSections[s.id]
                                            ? "#2e7d32"
                                            : "#1976d2",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                }}
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
import { IssueSection } from "@/@types/issueSection";
import { Issue } from "@/@types/issue";
import { getIssueUrl } from "@/lib/issues";
import { formatIssueDate } from "@/lib/date";
import styles from './Reader.module.css'

interface SidebarProps {
    issue: Issue,
    sections: IssueSection[],
    currentPageId: number | undefined,
    currentPageNumber: number,
    onReadText: (section: IssueSection) => void,
    onGoToPage: (page: number) => void
}

export default function Sidebar({ issue, sections, currentPageId, currentPageNumber, onReadText, onGoToPage }: SidebarProps) {
    const formattedDate = formatIssueDate(issue.publishing_date);

    return (
        <div className={styles.sidebar}>
            <div>
                <strong>{issue.magazine.name}</strong>
                <div>
                    Edition {issue.edition?.replace("-", "/")}
                    {formattedDate && ` (${formattedDate})`}
                </div>
            </div>

            {sections.map((section, idx) => {
                const filteredCredits = section.credits?.filter(c => {
                    if (c.render_ids && c.render_ids.length > 0) {
                        return currentPageId && c.render_ids.includes(currentPageId);
                    }
                    return true;
                }) || [];

                const sortedSegments = [...section.segments].sort((a, b) => a.start_page - b.start_page);
                const currentSegmentIdx = sortedSegments.findIndex(
                    (seg) => currentPageNumber >= seg.start_page && currentPageNumber <= seg.end_page
                );

                let prevPage: number | null = null;
                let nextPage: number | null = null;

                if (currentSegmentIdx !== -1) {
                    const currentSegment = sortedSegments[currentSegmentIdx];
                    if (currentPageNumber === currentSegment.start_page && currentSegmentIdx > 0) {
                        prevPage = sortedSegments[currentSegmentIdx - 1].end_page;
                    }
                    if (currentPageNumber === currentSegment.end_page && currentSegmentIdx < sortedSegments.length - 1) {
                        nextPage = sortedSegments[currentSegmentIdx + 1].start_page;
                    }
                }

                return (
                    <div key={section.id}>
                        {/* Section Divider (show before every section except first) */}
                        <hr className={idx === 0 ? styles.firstDivider : styles.sectionDivider} />

                        <div>
                            <strong>Section</strong>
                            <div>
                                {!section.title || section.title === section.section.name 
                                    ? section.section.name 
                                    : `${section.title} (${section.section.name})`}
                            </div>
                            
                            {(prevPage !== null || nextPage !== null) && (
                                <div className={styles.continuationContainer}>
                                    {prevPage !== null && (
                                        <button
                                            onClick={() => onGoToPage(prevPage!)}
                                            className={styles.continuationLink}
                                        >
                                            ← Continuação da pág. {prevPage}
                                        </button>
                                    )}
                                    {nextPage !== null && (
                                        <button
                                            onClick={() => onGoToPage(nextPage!)}
                                            className={styles.continuationLink}
                                        >
                                            Continua na pág. {nextPage} →
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {filteredCredits.length > 0 && (
                            <>
                                <hr className={styles.innerDivider} />
                                <div className={styles.credits}>
                                    <strong>Credits</strong>
                                    <ul className={styles.creditsList}>
                                        {/* Major & Regular Credits */}
                                        {filteredCredits.filter(c => c.importance !== 3).map((credit, i) => (
                                            <li key={i}>
                                                <a 
                                                    href={`/people/${credit.person?.id}`} 
                                                    className={`${styles.personLink} ${credit.importance === 1 ? styles.majorName : ""}`}
                                                >
                                                    {credit.person?.name}
                                                </a>
                                                {credit.age_at_issue && <span className={styles.age}> {credit.age_at_issue}</span>}
                                                {credit.role && ` (${credit.role})`}
                                            </li>
                                        ))}
                                        
                                        {/* Minor Credits (Mentions) */}
                                        {filteredCredits.some(c => c.importance === 3) && (
                                            <li className={styles.mentionsContainer}>
                                                <div className={styles.mentionsTitle}>Menções</div>
                                                <div className={styles.mentionsList}>
                                                    {filteredCredits.filter(c => c.importance === 3).map((c, i, arr) => (
                                                        <span key={i}>
                                                            <a href={`/people/${c.person?.id}`} className={styles.mentionLink}>
                                                                {c.person?.name}
                                                            </a>
                                                            {c.age_at_issue && <span className={styles.mentionAge}> {c.age_at_issue}</span>}
                                                            {i < arr.length - 1 ? ", " : ""}
                                                        </span>
                                                    ))}
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </>
                        )}

                        {section.relationships && section.relationships.length > 0 && (
                            <>
                                <hr className={styles.innerDivider} />
                                <div className={styles.relationships}>
                                    <strong>Vínculos</strong>
                                    <ul className={styles.relationshipsList}>
                                        {section.relationships.map((rel, i) => (
                                            <li key={i}>
                                                <span className={styles.relationshipLabel}>{rel.label}: </span>
                                                <a 
                                                    href={`/reader/${rel.issue_id}?page=${rel.start_page || 1}`}
                                                    className={styles.relationshipLink}
                                                >
                                                    {rel.issue_section_title || rel.section_name} ({rel.magazine_name} Ed. {rel.issue_edition?.replace("-", "/")})
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}

                        {section.text_content && (
                            <button 
                                onClick={() => onReadText(section)}
                                className={styles.readTextButton}
                            >
                                Read text
                            </button>
                        )}
                    </div>
                );
            })}

            <hr className={styles.sectionDivider} />

            <a href={getIssueUrl(issue)} className={styles.backLink}>
                Back to issue
            </a>
        </div>
    );
}
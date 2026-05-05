import { IssueSection } from "@/@types/issueSection";
import { Issue } from "@/@types/issue";
import styles from './Reader.module.css'

interface SidebarProps {
    issue: Issue,
    section: IssueSection | undefined,
    currentPageId: number | undefined,
    onReadText: () => void
}

export default function Sidebar({ issue, section, onReadText }: SidebarProps) {
    return (
        <div className={styles.sidebar}>
            <div>
                <strong>{issue.magazine.name}</strong>
                <div>Edition {issue.edition}</div>
            </div>

            <hr />

            {section && (
                <div>
                    <strong>Section</strong>
                    <div>
                        {!section.title || section.title === section.section.name 
                            ? section.section.name 
                            : `${section.title} (${section.section.name})`}
                    </div>
                </div>
            )}

            {section && (
                <>
                    {(() => {
                        const filteredCredits = section.credits?.filter(c => {
                            if (c.render_ids && c.render_ids.length > 0) {
                                return currentPageId && c.render_ids.includes(currentPageId);
                            }
                            return true;
                        }) || [];

                        if (filteredCredits.length === 0) return null;

                        return (
                            <>
                                <hr />
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
                                                            {i < arr.length - 1 ? ", " : ""}
                                                        </span>
                                                    ))}
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </>
                        );
                    })()}
                </>
            )}

            <hr />

            {section?.text_content && (
                <button onClick={onReadText}>
                    Read text
                </button>
            )}

            <hr />

            <a href={`/magazines/${issue.magazine.slug}/${issue.edition}`}>
                Back to issue
            </a>
        </div>
    );
}
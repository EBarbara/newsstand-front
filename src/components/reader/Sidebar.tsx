import { IssueSection } from "@/@types/issueSection";
import { Issue } from "@/@types/issue";
import styles from './Reader.module.css'

interface SidebarProps {
    issue: Issue,
    section: IssueSection | undefined,
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
                    <div>{section.section.name}</div>
                </div>
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
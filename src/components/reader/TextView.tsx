import { IssueSection } from "@/@types/issueSection";
import styles from './Reader.module.css'

interface TextViewProps {
    section: IssueSection,
    onBack: () => void
}

export default function TextView({ section, onBack }: TextViewProps) {
    return (
        <div className={styles.container}>
            <button onClick={onBack} className={styles.back}>
                ← Back
            </button>

            <h2>{section.section.name}</h2>

            <div className={styles.content}>
                {section.text_content || "No text available"}
            </div>
        </div>
    );
}
import styles from "./page.module.css";
import { IssueList } from "@/types/api";
import { getRecentIssues } from "@/lib/issues";
import IssueCard from "@/components/IssueCard";

export default async function Home() {
    let issues: IssueList[] = [];

    try {
        issues = await getRecentIssues();
    } catch (error) {
        console.error(error);
    }

    return (
        <div className="flex flex-col gap-8">
            {/* HEADER */}
            <header className={styles.header}>
                <h1 className={styles.title}>Recent Issues</h1>
                <p className={styles.subtitle}>
                    Manage and read your magazine collection.
                </p>
            </header>

            {/* EMPTY STATE */}
            {issues.length === 0 ? (
                <div className={styles.empty}>
                    <p>No issues found or API is offline.</p>
                </div>
            ) : (
                /* GRID */
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                    {issues.map(issue => (
                        <IssueCard key={issue.id} issue={issue} />
                    ))}
                </div>
            )}
        </div>
    );
}
import styles from "./page.module.css";
import { getRecentIssues } from "@/lib/issues";
import IssueCard from "@/components/issueCard/IssueCard";
import { Issue } from "@/@types/issue";

export default async function Home() {
    let issues: Issue[] = [];

    try {
        issues = await getRecentIssues();
    } catch (error) {
        console.error("Error fetching recent issues:", error);
    }

    return (
        <div className="flex flex-col gap-8">
            {/* HEADER */}
            <header className={styles.header}>
                <h1 className={styles.title}>Edições Recentes</h1>
                <p className={styles.subtitle}>
                    Gerencie e leia sua coleção de revistas.
                </p>
            </header>

            {/* EMPTY STATE */}
            {issues.length === 0 ? (
                <div className={styles.empty}>
                    <p>Nenhuma edição encontrada ou API está offline.</p>
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
import styles from './page.module.css';
import IssueCard from "@/components/IssueCard";
import { Issue } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getIssues(): Promise<Issue[]> {
    try {
        const response = await fetch(`${API_URL}/issues`, { cache: "no-store" });
        if (!response.ok) {
            console.error("Failed to fetch issues");
            return [];
        }
        return response.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

export default async function Home() {
    const issues = await getIssues();

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
                    {issues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                    ))}
                </div>
            )}
        </div>
    );
}
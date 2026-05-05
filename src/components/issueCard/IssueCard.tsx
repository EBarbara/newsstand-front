import Link from "next/link";

import styles from "./IssueCard.module.css";
import IssueCover from "@/components/issueCover/IssueCover";
import { formatIssueDate } from "@/lib/date";
import { Issue } from "@/@types/issue";
import { getMediaUrl } from "@/lib/issues";

export default function IssueCard({ issue }: { issue: Issue }) {
    return (
        <div className={styles.card}>
            {/* COVER */}
            <Link
                href={`/magazines/${issue.magazine.slug}/${issue.edition}`}
                className={styles.coverWrapper}
            >
                <IssueCover
                    imageUrl={getMediaUrl(issue.cover)}
                    altText={`Capa da edição ${issue.id}`}
                    defaultWidth={240}
                />

                {/* STATUS BADGES */}
                <div className={styles.badgesOverlay}>
                    {issue.has_physical_copy && (
                        <div className={styles.statusBadge} title="Possuo a edição física (Papel)">
                            📚
                        </div>
                    )}
                    {issue.is_digital_complete && (
                        <div className={styles.statusBadge} title="Coleção digital completa">
                            ✅
                        </div>
                    )}
                </div>
            </Link>

            {/* INFO */}
            <div className={styles.info}>
                <Link
                    href={`/magazines/${issue.magazine.slug}`}
                    className={styles.magazineLink}
                >
                    {issue.magazine.name}
                </Link>

                <p className={styles.subtitle}>
                    {formatIssueDate(issue.publishing_date)}
                    {issue.edition && ` - #${issue.edition}`}
                </p>
            </div>
        </div>
    );
}
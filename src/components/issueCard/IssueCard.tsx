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
                    altText={`Cover for issue ${issue.id}`}
                    defaultWidth={240}
                />
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
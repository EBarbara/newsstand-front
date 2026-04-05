import Link from "next/link";

import styles from "./IssueCard.module.css";
import IssueCover from "@/components/IssueCover";
import { Issue } from "@/types/api";
import { formatIssueDate } from "@/utils/date";
import clsx from "clsx";

interface props {
    issue: Issue;
}

export default function IssueCard({ issue }: props) {
    const hasCover = issue.covers?.length > 0;

    return (
        <Link href={`issues/${issue.id}`} className={styles.card}>
            {/* COVER */}
            <div className={styles.coverWrapper}>
                {hasCover ? (
                    <IssueCover
                        imageUrl={issue.covers[0].image}
                        altText={`Cover for issue ${issue.id}`}
                        defaultWidth={160}
                    />
                    ) : (
                    <div className={styles.placeholderCover}>
                        No Cover
                    </div>
                )}
            </div>

            {/* INFO */}
            <div className={styles.info}>
                <h2 className={styles.title}>
                    {formatIssueDate(issue.publishing_date)}
                    {issue.edition && ` - #${issue.edition}`}
                </h2>

                <div
                    className={clsx(
                        styles.badge,
                        issue.is_digital && styles.digital
                    )}
                >
                    {issue.is_digital ? "Digital CBZ" : "Physical"}
                </div>
            </div>
        </Link>
    );
}
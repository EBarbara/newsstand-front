import Link from "next/link";
import clsx from "clsx";

import styles from "./IssueCard.module.css";
import IssueCover from "@/components/IssueCover";
import { IssueList } from "@/types/api";
import { formatIssueDate } from "@/utils/date";

interface props {
    issue: IssueList;
}

export default function IssueCard({ issue }: props) {
    const hasCover = issue.covers?.length > 0;

    return (
        <div className={styles.card}>
            <Link
                href={`/magazines/${issue.magazine.slug}/${issue.id}`}
                className={styles.coverWrapper}
            >
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

                <div
                    className={clsx(
                        styles.badge,
                        issue.is_digital && styles.digital
                    )}
                >
                    {issue.is_digital ? "Digital CBZ" : "Physical"}
                </div>
            </div>
        </div>
    );
}
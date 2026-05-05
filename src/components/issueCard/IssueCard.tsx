"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./IssueCard.module.css";
import IssueCover from "@/components/issueCover/IssueCover";
import { formatIssueDate } from "@/lib/date";
import { Issue } from "@/@types/issue";
import { getMediaUrl, updateIssue } from "@/lib/issues";

export default function IssueCard({ issue: initialIssue }: { issue: Issue }) {
    const [issue, setIssue] = useState(initialIssue);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = async (e: React.MouseEvent, field: 'has_physical_copy' | 'is_digital_complete') => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isUpdating) return;
        
        const newValue = !issue[field];
        setIssue(prev => ({ ...prev, [field]: newValue }));
        setIsUpdating(true);

        try {
            const updated = await updateIssue(issue.id, { [field]: newValue });
            setIssue(updated);
        } catch (error) {
            console.error("Failed to toggle status", error);
            setIssue(prev => ({ ...prev, [field]: !newValue }));
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className={styles.card}>
            {/* COVER */}
            <div className={styles.coverContainer}>
                <Link
                    href={`/magazines/${issue.magazine.slug}/${issue.edition}`}
                    className={styles.coverWrapper}
                >
                    <IssueCover
                        imageUrl={getMediaUrl(issue.cover)}
                        altText={`Capa da edição ${issue.id}`}
                        defaultWidth={240}
                    />
                </Link>

                {/* STATUS BADGES */}
                <div className={styles.badgesOverlay}>
                    <button 
                        onClick={(e) => handleToggle(e, 'has_physical_copy')}
                        className={`${styles.statusBadge} ${issue.has_physical_copy ? styles.active : styles.inactive}`}
                        title="Possuo Física"
                        disabled={isUpdating}
                    >
                        📚
                    </button>
                    <button 
                        onClick={(e) => handleToggle(e, 'is_digital_complete')}
                        className={`${styles.statusBadge} ${issue.is_digital_complete ? styles.active : styles.inactive}`}
                        title="Digital Completa"
                        disabled={isUpdating}
                    >
                        ✅
                    </button>
                </div>
            </div>

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
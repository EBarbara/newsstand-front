"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./IssueCard.module.css";
import IssueCover from "@/components/issueCover/IssueCover";
import { formatIssueDate } from "@/lib/date";
import { Issue } from "@/@types/issue";
import { getMediaUrl, updateIssue, deleteIssue, getIssueUrl } from "@/lib/issues";

interface IssueCardProps {
    issue: Issue;
    onUpdate?: (updated: Issue) => void;
    onDelete?: (id: number) => void;
}

export default function IssueCard({ issue: initialIssue, onUpdate, onDelete }: IssueCardProps) {
    const [issue, setIssue] = useState(initialIssue);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Keep state in sync if parent list shifts or changes
    useEffect(() => {
        setIssue(initialIssue);
    }, [initialIssue]);

    const handleToggle = async (e: React.MouseEvent, field: 'has_physical_copy' | 'is_digital_complete' | 'is_special') => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isUpdating) return;
        
        const newValue = !issue[field];
        setIssue(prev => ({ ...prev, [field]: newValue }));
        setIsUpdating(true);

        try {
            const updated = await updateIssue(issue.id, { [field]: newValue });
            setIssue(updated);
            if (onUpdate) onUpdate(updated);

            // Broadcast update to sync other open tabs
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                try {
                    const channel = new BroadcastChannel('newsstand-issue-updates');
                    channel.postMessage({ type: 'ISSUE_UPDATED', id: issue.id });
                    channel.close();
                } catch (e) {}
            }
        } catch (error) {
            console.error("Failed to toggle status", error);
            setIssue(prev => ({ ...prev, [field]: !newValue }));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isDeleting) return;
        
        const issueLabel = issue.edition ? `#${issue.edition}` : formatIssueDate(issue.publishing_date);
        if (!confirm(`Deseja realmente excluir permanentemente a edição ${issueLabel}?`)) {
            return;
        }
        
        setIsDeleting(true);
        try {
            await deleteIssue(issue.id);
            if (onDelete) onDelete(issue.id);

            // Broadcast deletion to sync other open tabs
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                try {
                    const channel = new BroadcastChannel('newsstand-issue-updates');
                    channel.postMessage({ type: 'ISSUE_DELETED', id: issue.id });
                    channel.close();
                } catch (e) {}
            }
        } catch (error) {
            console.error("Failed to delete issue", error);
            alert("Erro ao excluir edição.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.card}>
            {/* COVER */}
            <div className={styles.coverContainer}>
                <Link
                    href={getIssueUrl(issue)}
                    className={styles.coverWrapper}
                >
                    <IssueCover
                        imageUrl={getMediaUrl(issue.cover)}
                        altText={`Capa da edição ${issue.id}`}
                        defaultWidth={240}
                        focusX={issue.cover_focus_x}
                        focusY={issue.cover_focus_y}
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
                    <button 
                        onClick={(e) => handleToggle(e, 'is_special')}
                        className={`${styles.statusBadge} ${issue.is_special ? styles.active : styles.inactive}`}
                        title="Edição Especial"
                        disabled={isUpdating}
                    >
                        ⭐
                    </button>
                    
                    {/* Delete button (hover only trash badge) */}
                    <button 
                        onClick={handleDelete}
                        className={`${styles.statusBadge} ${styles.deleteBadge}`}
                        title="Excluir Edição"
                        disabled={isDeleting}
                    >
                        🗑️
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
                    {issue.volume && ` - Vol. ${issue.volume}`}
                    {issue.edition && ` - #${issue.edition}`}
                </p>
            </div>
        </div>
    );
}
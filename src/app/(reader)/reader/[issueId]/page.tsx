import Reader from "@/components/reader/Reader";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getIssue(issueId: string) {
    const res = await fetch(`${API_URL}/issues/${issueId}/`, {
        cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
}

type Props = {
    params: Promise<{ issueId: string }>;
    searchParams: Promise<{ page?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
    const { issueId } = await params;
    const { page } = await searchParams;

    const issue = await getIssue(issueId);

    if (!issue) return notFound();

    const initialPage = page ? parseInt(page) : 1;
    const initialIndex = issue.renders.findIndex(
        (r: any) => r.order === initialPage
    );
    const safeInitialIndex = initialIndex !== -1 ? initialIndex : 0;

    return <Reader issue={issue} initialIndex={safeInitialIndex} />;
}
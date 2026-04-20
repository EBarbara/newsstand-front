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
};

export default async function Page({ params }: Props) {
    const { issueId } = await params;

    const issue = await getIssue(issueId);

    if (!issue) return notFound();

    return <Reader issue={issue} />;
}
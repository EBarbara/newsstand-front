import { getIssuePages } from "@/lib/issues";
import Reader from "@/components/Reader";

type Props = {
    params: Promise<{
        slug: string;
        issue: string;
    }>;
}

export default async function Page({ params }: Props) {
    const { slug, issue } = await params;
    const issueId = parseInt(issue, 10);

    const pages = await getIssuePages(slug, issueId);

    return (
        <Reader
            slug={slug}
            issueId={issueId}
            pages={pages}
        />
    );
}
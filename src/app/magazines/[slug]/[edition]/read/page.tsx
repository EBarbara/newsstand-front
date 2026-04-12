import {getIssueDetail, getIssuePages} from "@/lib/issues";
import Reader from "@/components/Reader";

type Props = {
    params: Promise<{
        slug: string;
        edition: string;
    }>;
}

export default async function Page({ params }: Props) {
    const { slug, edition } = await params;
    const issueData = await getIssueDetail(slug, edition);
    const pages = await getIssuePages(issueData.id);

    return (
        <Reader
            issueId={issueData.id}
            pages={pages}
        />
    );
}
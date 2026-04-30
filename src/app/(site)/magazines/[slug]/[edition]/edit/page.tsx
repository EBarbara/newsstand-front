import IssueEditor from "@/components/editor/IssueEditor";

type Props = {
    params: {
        slug: string
        edition: string
    }
}

export default async function IssueEditorPage({ params }: Props) {
    const { slug, edition } = await params;

    return <IssueEditor slug={slug} edition={edition} />;
}
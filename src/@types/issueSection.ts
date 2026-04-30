import { Section } from "@/@types/section";
import { Segment } from "@/@types/segment";

export type IssueSection = {
    id: number;
    section: Section;
    title: string | null;
    segments: Segment[];
    text_content?: string;
}
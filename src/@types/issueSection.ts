import { Section } from "@/@types/section";
import { Segment } from "@/@types/segment";

export type IssueSection = {
    id: number;
    section: Section;
    segments: Segment[];
    text_content?: string;
}
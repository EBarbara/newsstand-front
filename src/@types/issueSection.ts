import { Section } from "@/@types/section";
import { Segment } from "@/@types/segment";
import { Person } from "@/@types/person";

export interface Credit {
    id?: number;
    person?: Person;
    person_id: number;
    role: string | null;
    importance: number;
    render_id?: number | null;
}

export type IssueSection = {
    id: number;
    section: Section;
    title: string | null;
    segments: Segment[];
    text_content?: string;
    credits: Credit[];
    order: number;
}
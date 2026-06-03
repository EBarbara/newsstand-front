import { Section } from "@/@types/section";
import { Segment } from "@/@types/segment";
import { Person } from "@/@types/person";

export interface Credit {
    id?: number;
    person?: Person;
    person_id: number;
    role: string | null;
    importance: number;
    render_ids?: number[];
    age_at_issue?: string | null;
}

export interface IssueSectionRelationship {
    id?: number;
    issue_section_id: number;
    issue_section_title: string | null;
    section_name: string;
    magazine_name: string;
    magazine_slug: string;
    issue_edition: string;
    issue_volume?: string | null;
    issue_id: number;
    start_page: number;
    label: string;
    inverse_label?: string | null;
    is_from?: boolean;
    order?: number;
}

export type IssueSection = {
    id: number;
    section: Section;
    title: string | null;
    segments: Segment[];
    text_content?: string;
    credits: Credit[];
    relationships?: IssueSectionRelationship[];
    order: number;
}

export type GlobalIssueSection = {
    id: number;
    title: string | null;
    section_name: string;
    section_id: number;
    magazine_name: string;
    magazine_slug: string;
    issue_edition: string;
    issue_volume?: string | null;
    issue_date: string;
    issue_id: number;
    start_page: number;
    first_page_image: string | null;
    first_page_type: 'NORMAL' | 'SPREAD' | 'GATEFOLD';
    credits: Credit[];
    relationships?: IssueSectionRelationship[];
    order: number;
}
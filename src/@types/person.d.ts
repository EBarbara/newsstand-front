import { PaginatedResponse } from "./api";

export interface Person {
    id: number;
    name: string;
    birth_date?: string;
    death_date?: string;
    country?: string;
    country_code?: string;
    biography?: string;
    photo?: string;
    photo_focus_x?: number;
    photo_focus_y?: number;
    aliases?: string[];
    disambiguation?: string;
    links?: PersonLink[];
    credits?: PersonCredit[];
    relationships?: PersonRelationship[];
    gender?: string;
    gender_display?: string;
    tags?: import("./tag").Tag[];
}

export interface PersonLink {
    id: number;
    url: string;
    label: string;
}

export interface PersonRelationship {
    id: number;
    person_id: number;
    person_name: string;
    label: string;
    inverse_label?: string;
    is_from: boolean;
    order: number;
}

export interface PersonCredit {
    id: number;
    role: string | null;
    magazine_name: string;
    magazine_slug: string;
    issue_edition: string;
    issue_date?: string;
    issue_id: number;
    issue_cover: string | null;
    issue_cover_focus_x?: number;
    issue_cover_focus_y?: number;
    section_title: string | null;
    section_type: string;
    importance?: number;
    start_page?: number | null;
    render_ids?: number[];
    age_at_issue?: string | null;
}

export { type PaginatedResponse };

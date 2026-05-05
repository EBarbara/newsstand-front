import { PaginatedResponse } from "./api";

export interface Person {
    id: number;
    name: string;
    birth_date?: string;
    country?: string;
    biography?: string;
    photo?: string;
    photo_focus_x?: number;
    photo_focus_y?: number;
    aliases?: string[];
    disambiguation?: string;
    links?: PersonLink[];
    credits?: PersonCredit[];
}

export interface PersonLink {
    id: number;
    url: string;
    label: string;
}

export interface PersonCredit {
    id: number;
    role: string | null;
    magazine_name: string;
    magazine_slug: string;
    issue_edition: string;
    issue_id: number;
    issue_cover: string | null;
    section_title: string | null;
    section_type: string;
    importance?: number;
    start_page?: number | null;
    render_id?: number | null;
}

export { type PaginatedResponse };

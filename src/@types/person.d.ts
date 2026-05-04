import { PaginatedResponse } from "./api";

export interface Person {
    id: number;
    name: string;
    birth_date?: string;
    country?: string;
    biography?: string;
    photo?: string;
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
    section_title: string | null;
    section_type: string;
}

export { type PaginatedResponse };

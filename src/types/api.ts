export interface Person {
    id: number;
    name: string;
}

export interface Credit {
    id: number;
    person?: Person | null;
}

export interface SectionInfo {
    id: number;
    name: string;
}

export interface Section {
    id: number;
    page: number | null;
    section?: SectionInfo | null;
    credits: Credit[];
}

export interface Cover {
    id: number;
    image: string;
}

export interface Issue {
    id: number;
    publishing_date: string;
    edition: number;
    file_path: string | null;
    is_digital: boolean | null;
    covers: Cover[];
    sections: Section[];
}
// types/api.ts

export type Magazine = {
    name: string;
    slug: string;
};

export type IssueCover = {
    id: number;
    image: string;
};

export type IssueList = {
    id: number;
    publishing_date: string;
    edition: number | null;
    is_digital: string;
    magazine: Magazine;
    covers: IssueCover[];
};

export type IssueSection = {
    id: number;
    section: {
        id: number;
        name: string;
    };
    page: number | null;
    page_indexes: number[];
    text_content: string | null;
};

export type IssueDetail = IssueList & {
    file_path?: string | null;
    sections: IssueSection[];
};

export type Page = {
    index: number;
    name: string;
}
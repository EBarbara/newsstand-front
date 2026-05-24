import { Magazine } from "@/@types/magazine";
import { Render } from "@/@types/render";
import { IssueSection } from "@/@types/issueSection";
import { Tag } from "@/@types/tag";

export type Issue = {
    id: number;
    edition: string;
    volume?: string;
    publishing_date: string;
    magazine: Magazine;
    renders: Render[];
    sections: IssueSection[];
    cover: string;
    cover_focus_x?: number;
    cover_focus_y?: number;
    has_physical_copy?: boolean;
    is_digital_complete?: boolean;
    is_special?: boolean;
    tags?: Tag[];
    pages_count?: number;
}
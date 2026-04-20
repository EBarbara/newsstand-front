import { Magazine } from "@/@types/magazine";
import { Render } from "@/@types/render";
import { IssueSection } from "@/@types/issueSection";

export type Issue = {
    id: number;
    edition: string;
    publishing_date: string;
    magazine: Magazine;
    renders: Render[];
    sections: IssueSection[];
    cover: string;
}
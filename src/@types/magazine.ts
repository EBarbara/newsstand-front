import { Tag } from "./tag";
import { MagazinePublisher } from "./publisher";

export type Magazine = {
    id?: number;
    name: string;
    slug: string;
    publishers?: MagazinePublisher[];
    language?: string;
    country?: string;
    country_code?: string;
    description?: string;
    volume?: string;
    tags?: Tag[];
    logo?: string;
    issues_count?: number;
    periodic_issues_count?: number;
    special_issues_count?: number;
}
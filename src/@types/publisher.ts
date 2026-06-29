export interface Publisher {
    id: number;
    name: string;
    translated_name?: string | null;
    country?: string | null;
    country_code?: string | null;
    website?: string | null;
    logo?: string | null;
    aliases?: string[];
    slug: string;
}

export interface MagazinePublisher {
    publisher: Publisher;
    publisher_id?: number;
    start_date?: string | null;
    end_date?: string | null;
}

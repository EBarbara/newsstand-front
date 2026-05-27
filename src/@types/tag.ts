export interface Tag {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    parent_id?: number | null;
    parent?: { id: number; name: string; slug: string } | null;
    ancestors?: { id: number; name: string; slug: string }[];
    descendants_tree?: Tag[];
    children?: Tag[];
}

import { request } from './api';
import { Tag } from "@/@types/tag";
import { PaginatedResponse } from "@/@types/api";

export function getTags(page: number = 1, pageSize?: number) {
    let url = `/tags/?page=${page}`;
    if (pageSize) url += `&page_size=${pageSize}`;
    return request<PaginatedResponse<Tag>>(url);
}

export function getTag(slug: string) {
    return request<Tag>(`/tags/${slug}/`);
}

export function createTag(name: string) {
    return request<Tag>('/tags/', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
}

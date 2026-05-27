import { request } from './api';
import { Tag } from "@/@types/tag";
import { PaginatedResponse } from "@/@types/api";

export function getTags(page: number = 1, pageSize?: number, search?: string) {
    let url = `/tags/?page=${page}`;
    if (pageSize) url += `&page_size=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
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

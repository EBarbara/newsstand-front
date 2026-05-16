import { request } from './api';
import { Tag } from "@/@types/tag";
import { PaginatedResponse } from "@/@types/api";

export function getTags(page: number = 1) {
    return request<PaginatedResponse<Tag>>(`/tags/?page=${page}`);
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

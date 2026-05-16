import { request } from './api';
import { Tag } from "@/@types/tag";
import { PaginatedResponse } from "@/@types/api";

export function getTags() {
    return request<PaginatedResponse<Tag>>('/tags/');
}

export function createTag(name: string) {
    return request<Tag>('/tags/', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
}

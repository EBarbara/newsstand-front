import { request } from './api';
import { Tag } from "@/@types/tag";
import { PaginatedResponse } from "@/@types/api";

export function getTags() {
    return request<PaginatedResponse<Tag>>('/tags/');
}

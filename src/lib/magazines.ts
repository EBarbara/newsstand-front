import { request } from "./api";
import { Magazine } from "@/@types/magazine";
import { PaginatedResponse } from "@/@types/api";

export function getMagazines(page: number = 1, pageSize?: number) {
    let url = `/magazines/?page=${page}`;
    if (pageSize) url += `&page_size=${pageSize}`;
    return request<PaginatedResponse<Magazine>>(url);
}

export function createMagazine(data: { name: string, slug: string, description?: string }) {
    return request<Magazine>('/magazines/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}
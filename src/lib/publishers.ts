import { request } from './api';
import { Publisher } from "@/@types/publisher";
import { PaginatedResponse } from "@/@types/api";

export function getPublishers(page: number = 1, pageSize?: number, search?: string) {
    let url = `/publishers/?page=${page}`;
    if (pageSize) url += `&page_size=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return request<PaginatedResponse<Publisher>>(url);
}

export function getPublisherBySlug(slug: string) {
    return request<Publisher>(`/publishers/${slug}/`);
}

export function createPublisher(formData: FormData | Record<string, any>) {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    return request<Publisher>('/publishers/', {
        method: 'POST',
        body: isFormData ? formData : JSON.stringify(formData)
    });
}

export function updatePublisher(slug: string, formData: FormData | Record<string, any>) {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    return request<Publisher>(`/publishers/${slug}/`, {
        method: 'PATCH',
        body: isFormData ? formData : JSON.stringify(formData)
    });
}

export function deletePublisher(slug: string) {
    return request<void>(`/publishers/${slug}/`, {
        method: 'DELETE'
    });
}

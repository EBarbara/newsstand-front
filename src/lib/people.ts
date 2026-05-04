import { request } from './api';
import { Person, PaginatedResponse } from "@/@types/person";

export function getPeople(page: number = 1, pageSize: number = 20) {
    return request<PaginatedResponse<Person>>(`/people/?page=${page}&page_size=${pageSize}`);
}

export function createPerson(name: string) {
    return request<Person>('/people/', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
}

export function updatePerson(id: number, name: string) {
    return request<Person>(`/people/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
    });
}

export function deletePerson(id: number) {
    return request(`/people/${id}/`, {
        method: 'DELETE',
    });
}

export function getPersonDetail(id: number) {
    return request<Person>(`/people/${id}/`);
}

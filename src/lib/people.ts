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

export function updatePerson(id: number, data: any) {
    const options: RequestInit = {
        method: 'PATCH',
    };

    if (data instanceof FormData) {
        options.body = data;
    } else {
        options.body = JSON.stringify(data);
    }

    return request<Person>(`/people/${id}/`, options);
}

export function deletePerson(id: number) {
    return request(`/people/${id}/`, {
        method: 'DELETE',
    });
}

export function getPersonDetail(id: number) {
    return request<Person>(`/people/${id}/`);
}

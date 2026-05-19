import { request, MEDIA_API_URL } from './api';
import { Issue } from "@/@types/issue";
import { Render } from "@/@types/render";
import { IssueSection, GlobalIssueSection } from "@/@types/issueSection";
import { Section } from "@/@types/section";
import { PaginatedResponse } from "@/@types/api";


export function getRecentIssues() {
    return request<Issue[]>('/issues/recent/');
}

export function getIssues(page: number = 1, filters: Record<string, string | number | undefined> = {}) {
    let url = `/issues/?page=${page}`;
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            url += `&${key}=${encodeURIComponent(value.toString())}`;
        }
    });
    return request<PaginatedResponse<Issue>>(url);
}

export function getIssuesByMagazine(slug: string, page: number = 1, filters: Record<string, string | string[]> = {}) {
    let url = `/magazines/${slug}/issues/?page=${page}`;
    Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(v => {
                if (v) url += `&${key}=${encodeURIComponent(v)}`;
            });
        } else if (value) {
            url += `&${key}=${encodeURIComponent(value)}`;
        }
    });
    return request<PaginatedResponse<Issue>>(url);
}

export function getIssueDetail(slug: string, edition: string) {
    return request<Issue>(`/magazines/${encodeURIComponent(slug)}/issues/${encodeURIComponent(edition)}/`);
}

export function getMediaUrl(path: string | null, cacheBust: boolean = false) {
    if (!path) return "";
    
    let cleanPath = path;
    
    // If Django returns a full URL (which it does during SSR), we strip the host
    // and replace it with our public MEDIA_API_URL
    if (path.startsWith("http")) {
        try {
            const url = new URL(path);
            cleanPath = url.pathname;
        } catch (e) {
            // fallback
        }
    }
    
    // Ensure cleanPath starts with /
    if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;

    let url = `${MEDIA_API_URL}${cleanPath}`;
    if (cacheBust) {
        url += `?t=${Date.now()}`;
    }
    return url;
}

export function getPageImageUrl(id: number, index: number) {
    return `${MEDIA_API_URL}/issues/${id}/pages/${index}/`;
}

export function getSections(page: number = 1, pageSize?: number) {
    let url = `/sections/?page=${page}`;
    if (pageSize) url += `&page_size=${pageSize}`;
    return request<PaginatedResponse<Section>>(url)
}

export function getGlobalIssueSections(params: { section?: number, page?: number, issue?: number, pageSize?: number, ordering?: string } = {}) {
    let url = `/issue-sections/?page=${params.page || 1}`;
    if (params.section) url += `&section=${params.section}`;
    if (params.issue) url += `&issue=${params.issue}`;
    if (params.pageSize) url += `&page_size=${params.pageSize}`;
    if (params.ordering) url += `&ordering=${params.ordering}`;
    return request<PaginatedResponse<GlobalIssueSection>>(url);
}

export function updateIssueSection(
    issueId: number,
    sectionId: number,
    data: {
        segments: { start_page: number; end_page: number }[],
        title: string,
        text_content?: string,
        section_id?: number,
        credits?: { person_id: number; role: string | null }[],
    }
) {
    return request<IssueSection>(
        `/issues/${issueId}/sections/${sectionId}/`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        }
    )
}

export function createIssueSection(
    issueId: number,
    data: {
        section_id: number
        title: string
        order: number
        text_content?: string
        segments: { start_page: number; end_page: number }[]
    }) {
    return request<IssueSection>(`/issues/${issueId}/sections/`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export function deleteIssueSection(issueId: number, sectionId: number) {
    return request(`/issues/${issueId}/sections/${sectionId}/`, {
        method: "DELETE",
    })
}

export function createSectionType(name: string) {
    return request<Section>("/sections/", {
        method: "POST",
        body: JSON.stringify({ name }),
    })
}

export function importCbz(
    file: File, 
    magazineSlug?: string, 
    edition?: string, 
    date?: string,
    flags?: { hasPhysicalCopy: boolean, isDigitalComplete: boolean, isSpecial: boolean }
) {
    const formData = new FormData();
    formData.append('file', file);
    if (magazineSlug) formData.append('magazine', magazineSlug);
    if (edition) formData.append('edition', edition);
    if (date) formData.append('date', date);
    
    if (flags) {
        formData.append('has_physical_copy', flags.hasPhysicalCopy.toString());
        formData.append('is_digital_complete', flags.isDigitalComplete.toString());
        formData.append('is_special', flags.isSpecial.toString());
    }

    return request<Issue>('/issues/import_cbz/', {
        method: 'POST',
        body: formData,
    });
}

export function importCbzToIssue(issueId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return request<Issue>(`/issues/${issueId}/import_cbz/`, {
        method: 'POST',
        body: formData,
    });
}

export function createEmptyIssue(
    magazineSlug: string, 
    edition: string, 
    date: string,
    flags?: { hasPhysicalCopy: boolean, isDigitalComplete: boolean, isSpecial: boolean }
) {
    return request<Issue>('/issues/create_empty/', {
        method: 'POST',
        body: JSON.stringify({
            magazine: magazineSlug,
            edition: edition,
            date: date,
            has_physical_copy: flags?.hasPhysicalCopy || false,
            is_digital_complete: flags?.isDigitalComplete || false,
            is_special: flags?.isSpecial || false,
        }),
    });
}

export function uploadIssuePage(issueId: number, file: File, order?: number) {
    const formData = new FormData();
    formData.append('file', file);
    if (order !== undefined) formData.append('order', order.toString());

    return request<Issue>(`/issues/${issueId}/upload-page/`, {
        method: 'POST',
        body: formData,
    });
}

export function replaceIssuePage(issueId: number, renderId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return request<Issue>(`/issues/${issueId}/replace-page/${renderId}/`, {
        method: 'POST',
        body: formData,
    });
}

export function deleteIssuePage(issueId: number, renderId: number) {
    return request<Issue>(`/issues/${issueId}/delete-page/${renderId}/`, {
        method: 'DELETE',
    });
}

export function updateRender(issueId: number, renderId: number, data: Partial<Render>) {
    return request<Render>(`/issues/${issueId}/update-page/${renderId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function updateIssue(issueId: number, data: Partial<Issue>) {
    return request<Issue>(`/issues/${issueId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function reorderPages(issueId: number, renderIds: number[]) {
    return request<Issue>(`/issues/${issueId}/reorder-pages/`, {
        method: "POST",
        body: JSON.stringify({ render_ids: renderIds }),
    });
}

export function deleteIssue(issueId: number) {
    return request(`/issues/${issueId}/`, {
        method: 'DELETE',
    });
}
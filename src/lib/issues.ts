// lib/issues.ts
import { request, MEDIA_API_URL } from './api';
import { Issue } from "@/@types/issue";
import { IssueSection } from "@/@types/issueSection";
import { Section } from "@/@types/section";


export function getRecentIssues() {
    return request<Issue[]>('/issues/recent/');
}

export function getIssuesByMagazine(slug: string) {
    return request<Issue[]>(`/magazines/${slug}/issues/`);
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

export function getSections() {
    return request<Section[]>("/sections/")
}

export function updateIssueSection(
    issueId: number,
    sectionId: number,
    data: {
        segments: { start_page: number; end_page: number }[],
        title: string,
        text_content?: string,
        section_id?: number,
    }
) {
    return request(
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

export function importCbz(file: File, magazineSlug?: string, edition?: string, date?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (magazineSlug) formData.append('magazine', magazineSlug);
    if (edition) formData.append('edition', edition);
    if (date) formData.append('date', date);

    return request<Issue>('/issues/import_cbz/', {
        method: 'POST',
        body: formData,
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
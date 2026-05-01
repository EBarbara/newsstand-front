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
    return request<Issue>(`/magazines/${slug}/issues/${edition}/`);
}

export function getMediaUrl(path: string) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${MEDIA_API_URL}${path}`;
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
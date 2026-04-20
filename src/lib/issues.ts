// lib/issues.ts
import { request } from './api';
import { Issue } from "@/@types/issue";

export function getRecentIssues() {
    return request<Issue[]>('/issues/recent/');
}

export function getIssuesByMagazine(slug: string) {
    return request<Issue[]>(`/magazines/${slug}/issues/`);
}

export function getIssueDetail(slug: string, edition: string) {
    return request<Issue>(`/magazines/${slug}/issues/${edition}/`);
}

export function getIssuePages(id: number) {
    return request<Page[]>(`/issues/${id}/pages/`);
}

export async function getSectionPages(issueId: number, sectionId: number) {
    return request<Page[]>(`/issues/${issueId}/sections/${sectionId}/pages`);
}

export function getPageImageUrl(id: number, index: number) {
    return `${process.env.NEXT_PUBLIC_API_URL}/issues/${id}/pages/${index}/`;
}
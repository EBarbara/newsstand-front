// lib/issues.ts
import { request } from './api';
import { IssueList, IssueDetail } from '@/types/api';

export function getRecentIssues() {
    return request<IssueList[]>('/issues/recent/');
}

export function getIssuesByMagazine(slug: string) {
    return request<IssueList[]>(`/magazines/${slug}/issues/`);
}

export function getIssueDetail(slug: string, id: number) {
    return request<IssueDetail>(`/magazines/${slug}/issues/${id}/`);
}

export function getIssuePages(slug: string, id: number) {
    return request<any>(`/magazines/${slug}/issues/${id}/pages/`);
}

export function getPageImageUrl(slug: string, id: number, index: number) {
    return `${process.env.NEXT_PUBLIC_API_URL}/magazines/${slug}/issues/${id}/pages/${index}/`;
}
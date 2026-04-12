import { Page } from '@/types/api'

export function normalizePages(pages: Page[]): number[] {
    return pages.map(p => p.index)
}

function isDiscontinuous(indexes: number[]) {
    for (let i = 1; i < indexes.length; i++) {
        if (indexes[i] !== indexes[i - 1] + 1) {
            return true;
        }
    }
    return false;
}
import { Segment } from "@/@types/segment";

export function pagesToSegments(pages: number[]): Segment[] {
    if (pages.length === 0) return [];

    const sorted = [...pages].sort((a, b) => a - b);
    const segments: Segment[] = [];

    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === prev + 1) {
            prev = sorted[i];
        } else {
            segments.push({ start_page: start, end_page: prev });
            start = sorted[i];
            prev = sorted[i];
        }
    }

    segments.push({ start_page: start, end_page: prev })

    return segments;
}
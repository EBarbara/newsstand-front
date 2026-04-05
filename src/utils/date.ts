export function formatIssueDate(dateString: string, locale?: string) {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month -1, day);

    return date.toLocaleDateString(locale, {
        month: 'short',
        year: 'numeric',
    });
}
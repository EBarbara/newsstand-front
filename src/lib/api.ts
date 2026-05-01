const IS_SERVER = typeof window === 'undefined';
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL!;
const INTERNAL_API_URL = process.env.INTERNAL_API_URL;

const API_URL = (IS_SERVER && INTERNAL_API_URL) ? INTERNAL_API_URL : PUBLIC_API_URL;

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, params?: RequestOptions['params']) {
    const url = new URL(`${API_URL}${path}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    return url.toString();
}

export async function request<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { params, ...fetchOptions } = options;

    const res = await fetch(buildUrl(path, params), {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        },
        ...fetchOptions,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
    }

    // importante: evita quebrar em 204
    if (res.status === 204) {
        return null as T;
    }

    return res.json();
}
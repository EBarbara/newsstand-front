const IS_SERVER = typeof window === 'undefined';

// Next.js inlines NEXT_PUBLIC_ variables at build time.
// If missing at runtime in the browser, we try to deduce it from the current location.
let PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!IS_SERVER && !PUBLIC_API_URL) {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    PUBLIC_API_URL = `${protocol}//${host}:8000/api/v2`;
}

const INTERNAL_API_URL = process.env.INTERNAL_API_URL;

let _api_url = (IS_SERVER && INTERNAL_API_URL) ? INTERNAL_API_URL : PUBLIC_API_URL;
let _media_url = PUBLIC_API_URL;

// Ensure protocols
if (_api_url && !_api_url.startsWith('http')) _api_url = `http://${_api_url}`;
if (_media_url && !_media_url.startsWith('http')) _media_url = `http://${_media_url}`;

export const API_URL = _api_url;
export const MEDIA_API_URL = _media_url;

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, params?: RequestOptions['params']) {
    if (!API_URL) {
        console.error("API_URL is not defined. Check your environment variables.");
        throw new Error("API_URL is not defined");
    }

    try {
        const url = new URL(`${API_URL}${path}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return url.toString();
    } catch (e) {
        console.error(`Failed to construct URL with API_URL="${API_URL}" and path="${path}"`);
        throw e;
    }
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
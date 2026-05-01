const IS_SERVER = typeof window === 'undefined';

// 1. API URL for Fetching
// Server-side: uses INTERNAL_API_URL (can be Docker service name or IP)
// Client-side: uses NEXT_PUBLIC_API_URL (must be accessible by browser)
let _api = (IS_SERVER ? process.env.INTERNAL_API_URL : process.env.NEXT_PUBLIC_API_URL) || process.env.NEXT_PUBLIC_API_URL || '';

// 2. Media URL for Images
// We want just the BASE host (e.g., http://192.168.0.10:8080) because media paths already include /media/
let _media = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME || process.env.NEXT_PUBLIC_API_URL || '';

if (_media.includes('/api/v2')) {
    _media = _media.split('/api/v2')[0];
}

// Browser-only fallback if everything is missing
if (!IS_SERVER && !_api) {
    _api = `${window.location.protocol}//${window.location.hostname}:8080/api/v2`;
}
if (!IS_SERVER && !_media) {
    _media = `${window.location.protocol}//${window.location.hostname}:8080/api/v2`;
}

// Ensure protocols
if (_api && !_api.startsWith('http')) _api = `http://${_api}`;
if (_media && !_media.startsWith('http')) _media = `http://${_media}`;

export const API_URL = _api;
export const MEDIA_API_URL = _media;

type RequestOptions = RequestInit & {
    params?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, params?: RequestOptions['params']) {
    if (!API_URL) {
        console.error("API_URL is not defined. Check your environment variables.");
        throw new Error("API_URL is not defined");
    }

    try {
        const fullUrl = `${API_URL}${path}`;

        const url = new URL(fullUrl);

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
const IS_SERVER = typeof window === 'undefined';

// 1. Get the Public URL
// This is what the browser uses, and what the server uses for image links.
let publicUrl = process.env.NEXT_PUBLIC_API_URL;

if (!IS_SERVER && !publicUrl) {
    publicUrl = `${window.location.protocol}//${window.location.hostname}:8080/api/v2`;
}

if (IS_SERVER && !publicUrl) {
    // Default fallback for SSR if no env is provided during build
    publicUrl = 'http://192.168.0.10:8080/api/v2';
}

// 2. Media URL is ALWAYS the one accessible by the user's browser.
let _media_url = publicUrl;

// 3. API URL for server-side fetching.
// If INTERNAL_API_URL is set (e.g. in Docker), we use it for faster SSR-to-Backend calls.
const INTERNAL_API_URL = process.env.INTERNAL_API_URL;
let _api_url = (IS_SERVER && INTERNAL_API_URL) ? INTERNAL_API_URL : publicUrl;

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
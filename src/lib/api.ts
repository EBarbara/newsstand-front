const IS_SERVER = typeof window === 'undefined';

// 1. Get the Public URL from environment or fallback
let publicUrl = process.env.NEXT_PUBLIC_API_URL;

if (!IS_SERVER && !publicUrl) {
    // Client-side fallback
    publicUrl = `${window.location.protocol}//${window.location.hostname}:8080/api/v2`;
}

if (IS_SERVER && !publicUrl) {
    // Server-side fallback (for local development without .env)
    publicUrl = 'http://localhost:8080/api/v2';
}

// Ensure protocol
if (publicUrl && !publicUrl.startsWith('http')) {
    publicUrl = `http://${publicUrl}`;
}

export const API_URL = publicUrl || '';
export const MEDIA_API_URL = publicUrl || '';

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
        console.log(`[API Request] ${IS_SERVER ? 'SERVER' : 'CLIENT'}: ${fullUrl}`);
        
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
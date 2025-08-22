export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function fetchJSON(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
    cache: init?.cache,
    next: (init as any)?.next,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function apiFetch(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  const hasBody = init && 'body' in init && init.body != null;

  if (hasBody && !(init!.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
}

export const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((r) => r.json());

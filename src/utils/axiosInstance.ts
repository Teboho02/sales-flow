type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  body?: unknown;
}

export interface IHttpResponse<T> {
  data: T;
}

interface IHttpClient {
  get: <T>(url: string) => Promise<IHttpResponse<T>>;
  post: <T>(url: string, body?: unknown) => Promise<IHttpResponse<T>>;
  put: <T>(url: string, body?: unknown) => Promise<IHttpResponse<T>>;
  delete: <T>(url: string) => Promise<IHttpResponse<T>>;
}

const request = async <T>(
  method: HttpMethod,
  url: string,
  options?: RequestOptions,
): Promise<IHttpResponse<T>> => {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `HTTP ${response.status} for ${method} ${url}`,
    );
  }

  const hasNoBody = response.status === 204;
  if (hasNoBody) {
    return { data: undefined as T };
  }

  const data = (await response.json()) as T;
  return { data };
};

export const getAxiosInstace = (): IHttpClient => ({
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, { body }),
  put: <T>(url: string, body?: unknown) => request<T>("PUT", url, { body }),
  delete: <T>(url: string) => request<T>("DELETE", url),
});

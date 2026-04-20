import { deleteCookie, getCookie } from "cookies-next";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestInitWithJson = RequestInit & {
  json?: unknown;
  auth?: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function api<T>(
  input: string,
  init: RequestInitWithJson = {},
): Promise<T> {
  const { json, auth = true, headers, ...rest } = init;
  const token = getCookie("session");

  const requestHeaders = new Headers(headers);
  if (json !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (auth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const url = input.startsWith("/") ? `${API_BASE}${input}` : input;

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });

  if (response.status === 401) {
    deleteCookie("session");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String(data.message)
        : response.statusText || "Request failed";
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function formatDate(value?: string) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getPrettyUserAgent(userAgent: string) {
  const browser =
    userAgent
      .match(/(Chrome|Safari|Firefox|Edge)\/[\d.]+/)?.[0]
      .split("/")[0] ?? "Unknown Browser";
  const os = userAgent.match(/\((.*?)\)/)?.[1].split(";")[0] ?? "Unknown OS";
  return `${browser} on ${os}`;
}

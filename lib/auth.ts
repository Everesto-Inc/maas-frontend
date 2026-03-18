export interface ClientInfo {
  slug: string;
  company_name: string;
  account_type: string;
  email: string;
  plan: string;
  status: string;
  full_name?: string;
}

const isBrowser = typeof window !== "undefined";

export function saveSession(token: string, client: ClientInfo) {
  if (!isBrowser) return;
  localStorage.setItem("token", token);
  localStorage.setItem("client", JSON.stringify(client));
}

export function getClient(): ClientInfo | null {
  if (!isBrowser) return null;
  const raw = localStorage.getItem("client");
  return raw ? JSON.parse(raw) : null;
}

export function getToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem("token");
}

export function clearSession() {
  if (!isBrowser) return;
  localStorage.removeItem("token");
  localStorage.removeItem("client");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

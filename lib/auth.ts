export interface ClientInfo {
  slug: string;
  company_name: string;
  account_type: string;
  email: string;
  plan: string;
  status: string;
  full_name?: string;
}

export function saveSession(token: string, client: ClientInfo) {
  localStorage.setItem("token", token);
  localStorage.setItem("client", JSON.stringify(client));
}

export function getClient(): ClientInfo | null {
  const raw = localStorage.getItem("client");
  return raw ? JSON.parse(raw) : null;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("client");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

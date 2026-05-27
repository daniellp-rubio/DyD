// Cliente base de la Meta Graph / Marketing API vía fetch tipado.
// Evita el SDK facebook-nodejs-business-sdk (tipos frágiles) — control total.
// Lee process.env directo (no @/lib/env) para no disparar validación en build.

const DEFAULT_GRAPH_VERSION = "v21.0";

export function metaToken(): string {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN no configurado");
  return token;
}

export function metaAdAccount(): string {
  const acct = process.env.META_AD_ACCOUNT_ID;
  if (!acct) throw new Error("META_AD_ACCOUNT_ID no configurado (act_XXXX)");
  return acct;
}

function graphUrl(path: string): string {
  const version = process.env.META_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `https://graph.facebook.com/${version}/${clean}`;
}

export async function graphGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(graphUrl(path));
  url.searchParams.set("access_token", metaToken());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Meta GET ${path} falló (${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}

export async function graphPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const payload = { ...body, access_token: metaToken() };
  const res = await fetch(graphUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Meta POST ${path} falló (${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}

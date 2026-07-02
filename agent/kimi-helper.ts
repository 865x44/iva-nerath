import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const AUTH_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE || "/",
  ".local/share/opencode/auth.json",
);
const REFRESH_SCRIPT = "/home/alx/bin/kimi-refresh-token.py";
const IVA_ENV = path.join(process.cwd(), ".env");
const PROVIDER_ID = "kimi-for-coding-oauth";

function readEnvKey(): string | undefined {
  try {
    const content = fs.readFileSync(IVA_ENV, "utf8");
    const match = content.match(/^KIMI_API_KEY=(.*)$/m);
    let key = match?.[1]?.trim() ?? "";
    key = key.replace(/^["']|["']$/g, "");
    return key || undefined;
  } catch {
    return process.env.KIMI_API_KEY || undefined;
  }
}

function decodeJwtExp(token: string): number | undefined {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload + "==".slice((2 - payload.length % 4) % 4), "base64url").toString("utf8");
    const { exp } = JSON.parse(json) as { exp?: number };
    return exp;
  } catch {
    return undefined;
  }
}

function isExpiredOrAlmostExpired(expiresAt: number): boolean {
  // expiresAt can be seconds (JWT exp) or milliseconds (auth.json `expires`).
  const ms = expiresAt > 1e11 ? expiresAt : expiresAt * 1000;
  return Date.now() > ms - 30_000; // 30 s buffer
}

interface TokenEntry {
  type?: string;
  access?: string;
  expires?: number;
}

function readAuthJson(): TokenEntry | undefined {
  try {
    const raw = fs.readFileSync(AUTH_FILE, "utf8");
    const data = JSON.parse(raw) as Record<string, TokenEntry | undefined>;
    return data[PROVIDER_ID];
  } catch {
    return undefined;
  }
}

function runRefresh(): void {
  try {
    execSync(`/usr/bin/python3 ${REFRESH_SCRIPT}`, { timeout: 20_000, stdio: "ignore" });
  } catch {
    // Ignore refresh failures; caller will fall back to whatever token is available.
  }
}

export function getKimiKey(allowRefresh = true): string | undefined {
  const entry = readAuthJson();
  if (entry?.access) {
    const exp = entry.expires ?? decodeJwtExp(entry.access);
    if (exp === undefined || !isExpiredOrAlmostExpired(exp)) {
      return entry.access;
    }
    if (allowRefresh) {
      runRefresh();
      const refreshed = readAuthJson();
      if (refreshed?.access) {
        const refreshedExp = refreshed.expires ?? decodeJwtExp(refreshed.access);
        if (refreshedExp === undefined || !isExpiredOrAlmostExpired(refreshedExp)) {
          return refreshed.access;
        }
      }
    }
  }
  return readEnvKey();
}

export const kimiFetch: typeof fetch = async (input, init) => {
  const key1 = getKimiKey(true);
  const headers = new Headers(init?.headers);
  if (key1) headers.set("Authorization", `Bearer ${key1}`);
  const request = new Request(input as RequestInfo, { ...init, headers });

  let response = await fetch(request.clone());

  if (response.status === 401) {
    const key2 = getKimiKey(true);
    if (key2 && key2 !== key1) {
      const retryHeaders = new Headers(request.headers);
      retryHeaders.set("Authorization", `Bearer ${key2}`);
      response = await fetch(request.clone(), { headers: retryHeaders });
    }
  }

  return response;
};

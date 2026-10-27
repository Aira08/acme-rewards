import * as nacl from 'tweetnacl';

export const b64u = (b: Uint8Array) =>
  btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const fromB64u = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

/** Sorted [key, value] pairs, JSON.stringify'd. Plain code-unit sort, not localeCompare. */
export function canonicalize(params: Record<string, string>): string {
  const pairs = Object.entries(params).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return JSON.stringify(pairs);
}

/** Accepts a 64-byte tweetnacl secret key or a bare 32-byte seed. */
function toSecretKey(key: string): Uint8Array {
  const raw = fromB64u(key);
  return raw.length === 32 ? nacl.sign.keyPair.fromSeed(raw).secretKey : raw;
}

export function signParams(params: Record<string, string>, secretKey: string): string {
  const msg = new TextEncoder().encode(canonicalize(params));
  return b64u(nacl.sign.detached(msg, toSecretKey(secretKey)));
}

export function newState(): string {
  return b64u(nacl.randomBytes(16));
}

export function signedUrl(
  scheme: string,
  target: 'connect' | 'open' | 'disconnect',
  cfg: { cert: string; secretKey: string },
  extra: Record<string, string>,
): string {
  const params: Record<string, string> = {
    v: '1',
    cert: cfg.cert,
    ts: String(Math.floor(Date.now() / 1000)),   // seconds
    nonce: b64u(nacl.randomBytes(12)),           // new for every link
    ...extra,
  };
  const sig = signParams(params, cfg.secretKey);
  const query = Object.entries({ ...params, sig })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return `${scheme}://${target}?${query}`;
}
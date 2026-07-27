/**
 * Rate-Limiter, gleitendes Fenster, im Arbeitsspeicher.
 *
 * ⚠️ Der Zustand lebt im Prozess. Auf einer einzelnen Instanz (Node-Server,
 * Container) ist das genau richtig. Auf mehreren Instanzen oder serverless
 * zählt jede Instanz für sich, und ein Kaltstart setzt alles zurück — dann
 * gehört der Zähler nach Redis oder Upstash. Für den Concierge auf einer
 * Firmenseite reicht das hier; wer mehr braucht, tauscht genau diese Datei.
 */

type Entry = { hits: number[]; blockedUntil: number };

const WINDOW_MS = 5 * 60_000;
const MAX_IN_WINDOW = 12;
/** Wer das Fenster sprengt, wartet erst mal — sonst hämmert ein Skript weiter. */
const PENALTY_MS = 10 * 60_000;
const MAX_TRACKED = 5_000;

const store = new Map<string, Entry>();

/** Verhindert, dass die Map bei Bot-Traffic unbegrenzt wächst. */
function sweep(now: number) {
  if (store.size < MAX_TRACKED) return;
  for (const [key, entry] of store) {
    if (entry.blockedUntil < now && entry.hits.every((t) => now - t > WINDOW_MS)) {
      store.delete(key);
    }
  }
}

export type RateResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function checkRate(key: string): RateResult {
  const now = Date.now();
  sweep(now);

  const entry = store.get(key) ?? { hits: [], blockedUntil: 0 };

  if (entry.blockedUntil > now) {
    return { ok: false, retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000) };
  }

  entry.hits = entry.hits.filter((t) => now - t < WINDOW_MS);

  if (entry.hits.length >= MAX_IN_WINDOW) {
    entry.blockedUntil = now + PENALTY_MS;
    store.set(key, entry);
    return { ok: false, retryAfterSeconds: Math.ceil(PENALTY_MS / 1000) };
  }

  entry.hits.push(now);
  store.set(key, entry);
  return { ok: true };
}

/**
 * Absenderkennung. Hinter Vercel/Cloudflare steht die echte Adresse im
 * ersten Eintrag von `x-forwarded-for`; ohne Proxy fallen wir auf einen
 * gemeinsamen Schlüssel zurück — dann limitiert es global statt pro Client,
 * was immer noch besser ist als gar nicht.
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'anonymous';
}

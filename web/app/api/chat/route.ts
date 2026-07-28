import { buildSystemPrompt } from '@/lib/ai/prompt';
import { isConfigured, streamChat, type ChatMessage } from '@/lib/ai/provider';
import { checkRate, clientKey } from '@/lib/ai/ratelimit';
import { branches } from '@/lib/data/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * ⚠️ Ohne diesen Wert bricht der Concierge auf Vercel ab, obwohl er lokal läuft.
 *
 * Die Vorgabe für eine Serverless-Funktion liegt bei zehn Sekunden. Der
 * Anbieterabruf in `lib/ai/provider.ts` wartet bis zu 25 Sekunden auf das
 * Backend, weil eine erste Antwort mit Reasoning-Modell genau so lange dauern
 * kann. Ohne Anhebung würde Vercel die Funktion nach zehn Sekunden hart
 * abschneiden: der Besucher bekäme einen Funktionsfehler statt der höflichen
 * Ersatzantwort mit Telefonnummer, die für genau diesen Fall gebaut ist.
 *
 * 30 statt 25, damit die App IMMER zuerst abbricht und ihre eigene Antwort
 * ausliefern kann. Die Reihenfolge ist der ganze Punkt.
 */
export const maxDuration = 30;

/** Ein Concierge-Gespräch bleibt kurz. Alles darüber ist Missbrauch, nicht Bedarf. */
const MAX_MESSAGES = 24;
const MAX_CHARS = 1500;

type Incoming = { role: 'user' | 'assistant'; content: string };

const OFFLINE: Record<string, string> = {
  tr: `Şu anda yanıt veremiyorum. En yakın şubemizi arayın — ${branches[0].name}: ${branches[0].phoneLabel}`,
  en: `I can't answer right now. Please call your nearest branch — ${branches[0].name}: ${branches[0].phoneLabel}`,
  ru: `Сейчас не могу ответить. Позвоните в ближайший филиал — ${branches[0].name}: ${branches[0].phoneLabel}`,
};

const TOO_FAST: Record<string, string> = {
  tr: 'Çok fazla mesaj gönderildi. Lütfen biraz sonra tekrar deneyin ya da doğrudan şubeyi arayın.',
  en: 'Too many messages. Please try again shortly, or just call the branch directly.',
  ru: 'Слишком много сообщений. Попробуйте чуть позже или позвоните в филиал.',
};

function plain(text: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(text, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

export async function POST(req: Request) {
  let body: { messages?: Incoming[]; locale?: string };
  try {
    body = await req.json();
  } catch {
    return plain('Bad request', 400);
  }

  const locale = body.locale === 'en' || body.locale === 'ru' ? body.locale : 'tr';

  // Eingaben zuerst prüfen, dann Limit, dann Konfiguration. Andersherum wäre
  // die Validierung unerreichbar, sobald einer der späteren Zweige greift.
  const history = (body.messages ?? [])
    .filter(
      (m): m is Incoming =>
        (m?.role === 'user' || m?.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return plain('Bad request', 400);
  }

  const rate = checkRate(clientKey(req));
  if (!rate.ok) {
    return plain(TOO_FAST[locale], 429, {
      'Retry-After': String(rate.retryAfterSeconds),
    });
  }

  // Ohne Konfiguration bleibt die Seite benutzbar: der Concierge sagt höflich
  // ab und nennt eine Telefonnummer, statt einen 500er zu werfen.
  if (!isConfigured()) {
    return plain(OFFLINE[locale]);
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(locale) },
    ...history,
  ];

  const encoder = new TextEncoder();

  try {
    const upstream = await streamChat(messages, { signal: req.signal });
    const reader = upstream.getReader();

    return new Response(
      new ReadableStream({
        async start(controller) {
          let wrote = false;
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) {
                wrote = true;
                controller.enqueue(encoder.encode(value));
              }
            }
            // Leere Antwort heißt für den Nutzer: leere Blase. Lieber die
            // Telefonnummer als gar nichts.
            if (!wrote) controller.enqueue(encoder.encode(OFFLINE[locale]));
          } catch {
            if (!wrote) controller.enqueue(encoder.encode(OFFLINE[locale]));
          } finally {
            controller.close();
          }
        },
        cancel() {
          void reader.cancel();
        },
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch {
    return plain(OFFLINE[locale]);
  }
}

/**
 * Anbindung an das selbst gehostete, OpenAI-kompatible Backend (Sokrates).
 *
 * Bewusst ohne SDK: die Chat-Completions-Schnittstelle ist ein einziger
 * POST mit SSE-Antwort. Ein SDK würde hier nur eine Abhängigkeit und eine
 * Fehlerquelle hinzufügen, ohne etwas abzunehmen.
 */

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export function isConfigured(): boolean {
  return Boolean(process.env.AI_API_URL && process.env.AI_API_KEY);
}

/** Wie lange wir dem Backend Zeit geben, bevor wir abbrechen. */
const UPSTREAM_TIMEOUT_MS = 25_000;

export async function streamChat(
  messages: ChatMessage[],
  opts: { signal?: AbortSignal } = {},
): Promise<ReadableStream<string>> {
  const base = (process.env.AI_API_URL ?? '').replace(/\/+$/, '');
  const path = process.env.AI_CHAT_COMPLETIONS_PATH ?? '/chat/completions';
  const model = process.env.AI_MODEL_CHAT ?? process.env.AI_MODEL_FAST ?? 'sokrates-fast';

  // Eigener Timeout zusätzlich zum Abbruchsignal des Clients: bleibt das
  // Backend stumm, soll die Anfrage nicht ewig offen hängen.
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), UPSTREAM_TIMEOUT_MS);
  const signal = opts.signal
    ? AbortSignal.any([opts.signal, timeout.signal])
    : timeout.signal;

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        // Kurze Auskünfte aus einer festen Wissensbasis. Mehr Länge würde
        // die Antwort nur verwässern, nicht verbessern.
        max_tokens: 400,
        temperature: 0.3,
      }),
      signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok || !res.body) {
    throw new Error(`upstream ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream<string>({
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });

        // SSE trennt Ereignisse durch Leerzeilen. Ein Chunk kann mitten in
        // einer Zeile enden — der Rest bleibt im Puffer bis zum nächsten.
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data:')) continue;

          const payload = line.slice(5).trim();
          if (payload === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(payload);
            const text: string | undefined = json?.choices?.[0]?.delta?.content;
            if (text) controller.enqueue(text);
          } catch {
            // Ein einzelnes unvollständiges JSON-Fragment ist kein Grund,
            // den ganzen Stream abzubrechen — überspringen und weiterlesen.
          }
        }
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}

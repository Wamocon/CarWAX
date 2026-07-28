'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MessageCircle, X, ArrowUp } from 'lucide-react';
import { branches } from '@/lib/data/site';

type Msg = { role: 'user' | 'assistant'; content: string };

export function Concierge() {
  const t = useTranslations('concierge');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Neue Zeichen kommen laufend rein — der Blick soll unten bleiben.
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [msgs, busy]);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  /*
    Meldet den Zustand am <html>, damit der WhatsApp-Knopf darauf reagieren
    kann. Beide schweben auf derselben Position (bottom-24 right-5); die
    geöffnete Tafel liegt mit z-60 exakt über dem Knopf mit z-59 und verdeckt
    ihn vollständig. Verdeckt heißt aber nicht weg: er blieb anklickbar und
    stand weiter in der Tab-Reihenfolge, ein Ziel, das niemand sieht.

    Über ein Attribut statt über einen gemeinsamen Provider, weil die beiden
    Komponenten sonst nur wegen dieser einen Kleinigkeit aneinandergebunden
    wären. Siehe `.wa-fab` in globals.css.
  */
  useEffect(() => {
    const root = document.documentElement;
    if (open) root.dataset.concierge = 'open';
    else delete root.dataset.concierge;
    return () => {
      delete root.dataset.concierge;
    };
  }, [open]);

  // Escape schließt, und der Fokus darf nicht hinter dem Panel verschwinden.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const next: Msg[] = [...msgs, { role: 'user', content: text }];
    setMsgs([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, locale }),
      });
      if (!res.body) throw new Error('no body');

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: 'assistant', content: acc }]);
      }
      if (!acc.trim()) {
        setMsgs([...next, { role: 'assistant', content: t('offline') }]);
      }
    } catch {
      setMsgs([...next, { role: 'assistant', content: t('offline') }]);
    } finally {
      setBusy(false);
      field.current?.focus();
    }
  }

  return (
    <>
      {/* Auslöser — unten rechts, über der Seite, immer erreichbar */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="concierge-panel"
        aria-label={open ? t('close') : t('open')}
        className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full text-white shadow-lg [background:linear-gradient(140deg,var(--color-brand),var(--color-ember))] transition-[transform,background-color] duration-140 ease-out hover:bg-brand-hot active:scale-[0.97]"
      >
        {open ? <X aria-hidden size={22} /> : <MessageCircle aria-hidden size={22} />}
      </button>

      {open ? (
        <div
          id="concierge-panel"
          ref={panel}
          role="dialog"
          aria-modal="false"
          aria-label={t('title')}
          className="fixed bottom-24 right-5 z-[60] flex max-h-[min(560px,70vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[6px] glass shadow-2xl"
        >
          <header className="border-b border-hairline px-5 py-4">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-brand">
              {t('eyebrow')}
            </p>
            <p className="mt-1 text-[0.95rem]">{t('title')}</p>
          </header>

          <div
            ref={scroller}
            className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
            aria-live="polite"
            aria-atomic="false"
          >
            {msgs.length === 0 ? (
              <p className="text-[0.9rem] leading-relaxed text-fg-muted">
                {t('greeting')}
              </p>
            ) : null}

            {msgs.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-[2px] bg-brand px-4 py-2.5 text-[0.9rem] text-white'
                    : 'max-w-[92%] whitespace-pre-wrap text-[0.9rem] leading-relaxed text-fg'
                }
              >
                {m.content ||
                  (busy && i === msgs.length - 1 ? (
                    <span className="text-fg-faint">{t('thinking')}</span>
                  ) : null)}
              </div>
            ))}
          </div>

          <div className="border-t border-hairline p-3">
            <div className="flex items-end gap-2">
              <label htmlFor="concierge-input" className="sr-only">
                {t('inputLabel')}
              </label>
              <textarea
                id="concierge-input"
                ref={field}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Enter sendet, Shift+Enter macht einen Absatz — wie in jedem
                  // Messenger. Alles andere überrascht.
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={t('placeholder')}
                className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-[0.9rem] outline-none placeholder:text-fg-faint"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                aria-label={t('send')}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[2px] bg-brand text-white transition-[transform,opacity] duration-140 ease-out active:scale-[0.97] disabled:opacity-35"
              >
                <ArrowUp aria-hidden size={18} />
              </button>
            </div>
            <p className="px-2 pb-1 pt-2 text-[0.7rem] leading-relaxed text-fg-faint">
              {t('disclaimer', { phone: branches[0].phoneLabel })}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

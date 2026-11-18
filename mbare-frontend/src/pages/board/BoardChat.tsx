
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import type { FormEvent } from 'react';

import {
  Link,
  useNavigate,
  useParams
} from 'react-router-dom';

import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';
import { API_URL } from '../../config/api';

// ==========================================
// MBARE - BOARD CHAT
// React + Vite + TypeScript
// ==========================================

interface BoardPost {
  id: string;
  title: string;
  content?: string;
  price?: number | string | null;
  city?: string | null;
  authorId?: string | null;
  author_id?: string | null;
  author?: {
    username?: string | null;
  } | null;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string | null;
  content: string;
  createdAt: string;
  sender?: {
    username?: string | null;
    avatarUrl?: string | null;
  } | null;
}

interface ContactResponse {
  conversationId: string;
}

const MAX_MESSAGE_LENGTH = 1000;
const REFRESH_INTERVAL = 10000;

// ==========================================
// HELPERS
// ==========================================

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Si è verificato un errore imprevisto.';
}

async function authorizedRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error(
      'Sessione scaduta. Effettua nuovamente il login.'
    );
  }

  const headers = new Headers(options.headers);

  headers.set(
    'Authorization',
    `Bearer ${session.access_token}`
  );

  headers.set('Accept', 'application/json');

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers
    }
  );

  const data: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const body =
      data !== null &&
      typeof data === 'object'
        ? data as Record<string, unknown>
        : null;

    const message =
      typeof body?.error === 'string'
        ? body.error
        : typeof body?.message === 'string'
          ? body.message
          : `Errore HTTP ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

// ==========================================
// COMPONENTE PRINCIPALE
// ==========================================

export function BoardChat() {
  const { postId } = useParams<{ postId: string }>();

  const navigate = useNavigate();
  const { user, loading: authLoading } = useUser();

  const [post, setPost] = useState<BoardPost | null>(null);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [content, setContent] = useState('');

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ========================================
  // CARICAMENTO MESSAGGI
  // ========================================

  const loadMessages = useCallback(
    async (id: string): Promise<ChatMessage[]> => {
      return authorizedRequest<ChatMessage[]>(
        `/api/chat/${encodeURIComponent(id)}/messages?limit=50`
      );
    },
    []
  );

  // ========================================
  // INIZIALIZZAZIONE
  // ========================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!postId || !user?.id) {
      setLoading(false);
      setError(
        !postId
          ? 'Annuncio non valido.'
          : 'Devi effettuare il login per utilizzare la chat.'
      );
      return;
    }

    let cancelled = false;

    const currentPostId = postId;
    const currentUserId = user.id;

    async function initializeChat() {
      setLoading(true);
      setError(null);
      setPost(null);
      setConversationId(null);
      setMessages([]);

      try {
        // 1. Recupera l'annuncio.
        const postResponse = await fetch(
          `${API_URL}/api/board/${encodeURIComponent(currentPostId)}`
        );

        if (!postResponse.ok) {
          throw new Error(
            'Annuncio non trovato o non disponibile.'
          );
        }

        const boardPost =
          await postResponse.json() as BoardPost;

        if (cancelled) return;

        setPost(boardPost);

        const authorId =
          boardPost.authorId ??
          boardPost.author_id;

        if (authorId === currentUserId) {
          throw new Error(
            'Non puoi avviare una chat con te stesso.'
          );
        }

        // 2. Recupera o crea la conversazione.
        const contact =
          await authorizedRequest<ContactResponse>(
            `/api/board/${encodeURIComponent(currentPostId)}/contact`,
            {
              method: 'POST'
            }
          );

        if (!contact.conversationId) {
          throw new Error(
            'Il backend non ha restituito una conversazione valida.'
          );
        }

        if (cancelled) return;

        // 3. Carica i messaggi iniziali.
        const initialMessages =
          await loadMessages(contact.conversationId);

        if (cancelled) return;

        setConversationId(contact.conversationId);
        setMessages(initialMessages);

      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeChat();

    return () => {
      cancelled = true;
    };

  }, [
    postId,
    user?.id,
    authLoading,
    loadMessages
  ]);

  // ========================================
  // AGGIORNAMENTO MESSAGGI
  // ========================================

  useEffect(() => {
    if (!conversationId) return;

    let active = true;
    let busy = false;

    const updateMessages = async () => {
      if (
        !active ||
        busy ||
        document.visibilityState !== 'visible'
      ) {
        return;
      }

      busy = true;

      try {
        const result = await loadMessages(conversationId);

        if (active) {
          setMessages(result);
        }
      } catch (err) {
        console.error(
          '[MBARE CHAT] Errore aggiornamento:',
          err
        );
      } finally {
        busy = false;
      }
    };

    const interval = window.setInterval(
      () => {
        void updateMessages();
      },
      REFRESH_INTERVAL
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [conversationId, loadMessages]);

  // ========================================
  // SCROLL MESSAGGI
  // ========================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }, [messages]);

  // ========================================
  // INVIO MESSAGGIO
  // ========================================

  const handleSendMessage = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanContent = content.trim();

    if (
      !conversationId ||
      !cleanContent ||
      sending
    ) {
      return;
    }

    if (cleanContent.length > MAX_MESSAGE_LENGTH) {
      setError(
        `Massimo ${MAX_MESSAGE_LENGTH} caratteri per messaggio.`
      );
      return;
    }

    setSending(true);
    setError(null);

    try {
      const message = await authorizedRequest<ChatMessage>(
        `/api/chat/${encodeURIComponent(conversationId)}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            content: cleanContent
          })
        }
      );

      setContent('');

      // Mostra immediatamente il messaggio inviato.
      setMessages(previous => {
        if (previous.some(item => item.id === message.id)) {
          return previous;
        }

        return [...previous, message];
      });

      const updated = await loadMessages(conversationId);

      setMessages(updated);

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  // ========================================
  // INTERFACCIA
  // ========================================

  return (
    <main className="min-h-screen bg-mbare-black text-mbare-white pt-24 pb-10 px-4">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate('/bacheca')}
            className="font-mono text-sm text-mbare-muted hover:text-mbare-accent transition-colors"
          >
            ← Torna alla Bacheca
          </button>

          <span className="font-mono text-xs text-mbare-accent font-bold uppercase">
            MBARE CHAT
          </span>
        </div>

        <div className="bg-mbare-surface border-2 border-mbare-border">

          {/* DETTAGLI ANNUNCIO */}
          <header className="p-5 border-b-2 border-mbare-border">

            <span className="font-mono text-xs text-mbare-accent uppercase">
              Conversazione privata
            </span>

            <h1 className="text-2xl md:text-3xl font-display font-bold uppercase mt-2">
              {post?.title || 'Chat annuncio'}
            </h1>

            {post && (
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-mbare-muted">
                <span>
                  👤 {post.author?.username || 'Autore'}
                </span>

                {post.city && (
                  <span>📍 {post.city}</span>
                )}

                {post.price != null && (
                  <span className="font-bold text-mbare-accent">
                    €{Number(post.price).toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </header>

          {/* AREA MESSAGGI */}
          <section
            className="h-[50vh] min-h-[320px] overflow-y-auto p-4 md:p-6 space-y-4"
            aria-label="Messaggi della conversazione"
          >

            {loading && (
              <div className="h-full flex items-center justify-center">
                <p className="text-mbare-muted font-mono animate-pulse">
                  Caricamento conversazione...
                </p>
              </div>
            )}

            {!loading && error && !conversationId && (
              <div className="text-center py-12">
                <p
                  role="alert"
                  className="text-red-400 mb-5"
                >
                  {error}
                </p>

                <Link
                  to="/bacheca"
                  className="text-mbare-accent underline font-mono text-sm"
                >
                  Torna agli annunci
                </Link>
              </div>
            )}

            {!loading &&
              conversationId &&
              messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <span className="text-5xl mb-4">
                    💬
                  </span>

                  <h2 className="font-display font-bold text-xl uppercase">
                    Nessun messaggio
                  </h2>

                  <p className="text-mbare-muted text-sm mt-2">
                    Inizia la conversazione con l'autore.
                  </p>
                </div>
              )}

            {messages.map(message => {
              const isMine =
                message.senderId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isMine
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] px-4 py-3 border ${
                      isMine
                        ? 'bg-mbare-accent text-black border-mbare-accent'
                        : 'bg-mbare-black text-mbare-white border-mbare-border'
                    }`}
                  >
                    <p className="font-mono text-xs font-bold mb-2">
                      {isMine
                        ? 'Tu'
                        : message.sender?.username || 'Utente'}
                    </p>

                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    <time
                      className="block text-[10px] opacity-70 text-right mt-2"
                      dateTime={message.createdAt}
                    >
                      {new Date(
                        message.createdAt
                      ).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </section>

          {/* ERRORE NON BLOCCANTE */}
          {error && conversationId && (
            <p
              role="alert"
              className="px-5 py-3 text-red-400 text-sm border-t border-mbare-border"
            >
              {error}
            </p>
          )}

          {/* INVIO MESSAGGI */}
          <form
            onSubmit={handleSendMessage}
            className="border-t-2 border-mbare-border p-4"
          >
            <div className="flex gap-3">

              <input
                type="text"
                value={content}
                onChange={event =>
                  setContent(event.target.value)
                }
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={
                  !conversationId ||
                  sending
                }
                placeholder="Scrivi un messaggio..."
                aria-label="Scrivi un messaggio"
                className="flex-1 min-w-0 bg-mbare-black border border-mbare-border px-4 py-3 text-mbare-white outline-none focus:border-mbare-accent disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={
                  !conversationId ||
                  !content.trim() ||
                  sending
                }
                className="bg-mbare-accent text-black px-5 md:px-8 py-3 font-bold uppercase disabled:opacity-50 hover:brightness-110 transition"
              >
                {sending ? '...' : 'Invia'}
              </button>
            </div>

            <div className="text-right mt-2">
              <span className="text-[10px] font-mono text-mbare-muted">
                {content.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-mbare-muted mt-5">
          Non condividere password, dati bancari o informazioni sensibili.
        </p>
      </div>
    </main>
  );
}

export default BoardChat;

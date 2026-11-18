
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import { API_URL } from '../config/api';

// ==========================================
// MBARE - COMMUNITY CHAT PRO
// React + Vite + TypeScript + Supabase
// ==========================================

interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId?: string | null;
  content: string;
  createdAt: string;
  sender?: {
    username?: string | null;
    avatarUrl?: string | null;
  } | null;
}

interface Conversation {
  id: string;
  contextType: string;
  contextId: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    sender?: {
      username?: string | null;
    } | null;
  } | null;
  _count?: {
    messages: number;
  };
}

const MAX_MESSAGE_LENGTH = 1000;
const POLLING_INTERVAL = 15000;

// ==========================================
// API HELPERS
// ==========================================

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Si è verificato un errore imprevisto.';
}

async function chatRequest<T>(
  endpoint: string,
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
    `${API_URL}${endpoint}`,
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
      data !== null && typeof data === 'object'
        ? data as Record<string, unknown>
        : null;

    const message =
      typeof body?.error === 'string'
        ? body.error
        : typeof body?.message === 'string'
          ? body.message
          : response.status === 401
            ? 'Sessione non valida.'
            : response.status === 403
              ? 'Non hai accesso a questa chat.'
              : `Errore HTTP ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

// ==========================================
// COMMUNITY CHAT
// ==========================================

export function Chat() {
  const { user, loading: authLoading } = useUser();

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [newMessage, setNewMessage] = useState('');

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageRequestRef = useRef(0);

  // ========================================
  // LOAD CONVERSATIONS
  // ========================================

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setIsLoading(false);
      return;
    }

    let active = true;

    const loadConversations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await chatRequest<Conversation[]>(
          '/api/chat/my-conversations'
        );

        if (!active) return;

        setConversations(result);

        setActiveConversation(previous => {
          const selected = result.find(
            item => item.id === previous?.id
          );

          if (selected) return selected;

          return (
            result.find(
              item => item.contextType === 'GENERAL'
            ) ??
            result[0] ??
            null
          );
        });

      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadConversations();

    return () => {
      active = false;
    };
  }, [user?.id, authLoading]);

  // ========================================
  // LOAD MESSAGES
  // ========================================

  const fetchMessages = useCallback(
    async (conversationId: string): Promise<ChatMessage[]> => {
      return chatRequest<ChatMessage[]>(
        `/api/chat/${encodeURIComponent(
          conversationId
        )}/messages?limit=50`
      );
    },
    []
  );

  // ========================================
  // REALTIME + FALLBACK POLLING
  // ========================================

  useEffect(() => {
    if (!activeConversation || !user) {
      setMessages([]);
      return;
    }

    let active = true;
    let busy = false;

    const conversationId = activeConversation.id;
    const requestId = ++messageRequestRef.current;

    setMessages([]);
    setMessagesLoading(true);
    setError(null);

    const refreshMessages = async () => {
      if (!active || busy) return;

      busy = true;

      try {
        const result = await fetchMessages(conversationId);

        if (
          active &&
          requestId === messageRequestRef.current
        ) {
          setMessages(result);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        busy = false;

        if (active) {
          setMessagesLoading(false);
        }
      }
    };

    // Caricamento iniziale.
    void refreshMessages();

    // Supabase Realtime.
    const channel = supabase
      .channel(`mbare-chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          // FIX TS6133:
          // Non serve dichiarare payload.new
          // se recuperiamo i messaggi dal backend.
          void refreshMessages();
        }
      )
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR') {
          console.warn(
            '[MBARE CHAT] Realtime non disponibile.'
          );
        }
      });

    // Fallback: aggiorna ogni 15 secondi.
    const interval = window.setInterval(() => {
      if (
        document.visibilityState === 'visible'
      ) {
        void refreshMessages();
      }
    }, POLLING_INTERVAL);

    return () => {
      active = false;
      messageRequestRef.current += 1;

      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [activeConversation?.id, user?.id, fetchMessages]);

  // ========================================
  // AUTO SCROLL
  // ========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }, [messages]);

  // ========================================
  // SEND MESSAGE
  // ========================================

  const handleSendMessage = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const content = newMessage.trim();

    if (
      !content ||
      !user ||
      !activeConversation ||
      isSending
    ) {
      return;
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      setError(
        `Massimo ${MAX_MESSAGE_LENGTH} caratteri.`
      );
      return;
    }

    setIsSending(true);
    setError(null);

    const currentConversationId = activeConversation.id;

    try {
      await chatRequest<ChatMessage>(
        `/api/chat/${encodeURIComponent(
          currentConversationId
        )}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ content })
        }
      );

      setNewMessage('');

      // Aggiornamento anche senza evento Realtime.
      const updated = await fetchMessages(
        currentConversationId
      );

      if (
        activeConversation.id === currentConversationId
      ) {
        setMessages(updated);
      }

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen pt-32 text-center text-mbare-muted font-mono animate-pulse">
        Caricando la chat MBARE...
      </div>
    );
  }

  // ========================================
  // AUTH REQUIRED
  // ========================================

  if (!user) {
    return (
      <main className="min-h-screen pt-32 px-6 text-center bg-mbare-black text-white">
        <h1 className="text-4xl font-display font-bold uppercase">
          Accedi alla Chat
        </h1>

        <p className="text-mbare-muted mt-4">
          Devi effettuare il login per partecipare.
        </p>

        <Link
          to="/login"
          className="inline-block bg-mbare-accent text-black px-6 py-3 mt-8 font-bold uppercase"
        >
          Accedi
        </Link>
      </main>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="min-h-screen pt-32 pb-16 px-4 md:px-6 bg-mbare-black text-mbare-white">
      <div className="w-full max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-8 border-b-2 border-mbare-border pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="font-mono text-sm text-mbare-accent uppercase mb-2 block">
              Community Chat
            </span>

            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-none">
              A Mbare
              <span className="text-mbare-accent">.</span>
              Chat
            </h1>

            <p className="text-mbare-muted font-sans text-lg mt-4">
              Presentati, scherza, organizza.
              Qua si parla di tutto.
            </p>
          </div>

          <Link
            to="/community"
            className="bg-mbare-white text-mbare-black px-6 py-3 font-bold uppercase hover:bg-mbare-accent transition-colors"
          >
            ← Community
          </Link>
        </header>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="border border-red-500 bg-mbare-surface p-4 mb-5 text-red-400 text-sm font-mono"
          >
            {error}
          </div>
        )}

        {/* LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[600px]">

          {/* SIDEBAR */}
          <aside className="md:col-span-3 bg-mbare-surface border-2 border-mbare-border p-4 flex flex-col min-h-[180px] md:min-h-0">
            <h2 className="font-display font-bold uppercase text-white mb-4 border-b border-mbare-border pb-3">
              <span className="text-mbare-accent">●</span>
              {' '}Le tue Chat
            </h2>

            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              {conversations.length === 0 && (
                <p className="text-mbare-muted font-mono text-xs py-5">
                  Nessuna conversazione disponibile.
                </p>
              )}

              {conversations.map(conv => {
                const selected =
                  activeConversation?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setActiveConversation(conv);
                    }}
                    className={`text-left p-3 border-2 transition-all ${
                      selected
                        ? 'bg-mbare-black border-mbare-accent text-white'
                        : 'border-mbare-border text-mbare-muted hover:border-white'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2 mb-2">
                      <span className="font-mono text-[10px] uppercase text-mbare-accent">
                        {conv.contextType}
                      </span>

                      <span className="font-mono text-[10px] text-mbare-muted">
                        {conv.lastMessage
                          ? new Date(
                              conv.updatedAt
                            ).toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : ''}
                      </span>
                    </div>

                    <p className="font-display font-bold uppercase text-sm truncate">
                      {conv.contextType === 'GENERAL'
                        ? 'Chat Generale'
                        : conv.contextId}
                    </p>

                    {conv.lastMessage && (
                      <p className="text-xs truncate text-mbare-muted mt-2">
                        {conv.lastMessage.sender?.username ||
                          'Utente'}
                        : {conv.lastMessage.content}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* CHAT AREA */}
          <section className="md:col-span-9 bg-mbare-surface border-2 border-mbare-border flex flex-col h-[550px] md:h-full min-h-0">

            {/* CHAT HEADER */}
            <div className="p-4 border-b border-mbare-border bg-mbare-black/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 bg-green-500 rounded-full" />

                <h2 className="font-mono text-sm text-mbare-muted uppercase truncate">
                  {activeConversation
                    ? activeConversation.contextType === 'GENERAL'
                      ? 'Chat Generale'
                      : activeConversation.contextId
                    : 'Nessuna chat'}
                </h2>
              </div>

              <span className="font-mono text-xs text-mbare-muted whitespace-nowrap">
                {messages.length} messaggi
              </span>
            </div>

            {/* MESSAGES */}
            <div
              className="flex-1 min-h-0 p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar"
              aria-label="Messaggi della chat"
            >
              {messagesLoading && (
                <p className="text-center text-mbare-muted font-mono text-xs py-4">
                  Caricamento messaggi...
                </p>
              )}

              {!messagesLoading &&
                messages.length === 0 && (
                  <p className="text-mbare-muted font-mono text-center py-8">
                    Nessun messaggio. Scrivi il primo, mbare!
                  </p>
                )}

              {messages.map(msg => {
                const isMine =
                  msg.senderId === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      isMine
                        ? 'flex-row-reverse'
                        : 'flex-row'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-mbare-black border border-mbare-border flex items-center justify-center flex-shrink-0">
                      👤
                    </div>

                    <div
                      className={`max-w-[85%] min-w-0 border p-3 ${
                        isMine
                          ? 'border-mbare-accent bg-mbare-black'
                          : 'border-mbare-border'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-mbare-accent uppercase font-bold">
                          {isMine
                            ? 'Tu'
                            : msg.sender?.username ||
                              'Anonimo'}
                        </span>

                        <time
                          dateTime={msg.createdAt}
                          className="font-mono text-[10px] text-mbare-muted"
                        >
                          {new Date(
                            msg.createdAt
                          ).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                      </div>

                      <p className="text-mbare-white font-sans text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* SEND FORM */}
            {activeConversation && (
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-mbare-border bg-mbare-black/30"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={event =>
                      setNewMessage(event.target.value)
                    }
                    maxLength={MAX_MESSAGE_LENGTH}
                    disabled={isSending}
                    placeholder="Scrivi un messaggio..."
                    aria-label="Scrivi un messaggio"
                    className="flex-1 min-w-0 bg-mbare-black border border-mbare-border text-mbare-white px-4 py-3 font-sans text-sm focus:border-mbare-accent outline-none disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={
                      isSending ||
                      !newMessage.trim()
                    }
                    className="bg-mbare-accent text-black px-5 md:px-6 py-3 font-bold uppercase text-sm hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {isSending ? 'Invio...' : 'Invia'}
                  </button>
                </div>

                <p className="text-right text-[10px] font-mono text-mbare-muted mt-2">
                  {newMessage.length}/{MAX_MESSAGE_LENGTH}
                </p>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default Chat;

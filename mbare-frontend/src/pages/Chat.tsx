import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: { username: string; avatarUrl?: string };
}

interface Conversation {
  id: string;
  contextType: string;
  contextId: string;
  updatedAt: string;
  lastMessage?: { content: string; sender: { username: string } };
  _count?: { messages: number };
}

export function Chat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Recupera la lista delle conversazioni (invariato)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('http://localhost:3001/api/chat/my-conversations', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          const general = data.find((c: Conversation) => c.contextType === 'GENERAL');
          if (general) setActiveConversation(general);
          else if (data.length > 0) setActiveConversation(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchConversations();
  }, [user]);

  // 2. CARICA MESSAGGI + SOTTOSCRIZIONE REALTIME
  useEffect(() => {
    if (!activeConversation) return;

    // Carica i messaggi iniziali
    const fetchMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`http://localhost:3001/api/chat/${activeConversation.id}/messages`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) setMessages(await res.json());
    };
    fetchMessages();

    // Sottoscrizione Realtime per i nuovi messaggi
    const channel = supabase
      .channel(`chat:${activeConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        async (payload) => {
          // Quando arriva un nuovo messaggio, recupera i dati del mittente
          // e aggiungilo alla lista (oppure ricarica tutti i messaggi per semplicità)
          const newMsg = payload.new as any;
          
          // Opzione A: ricarica tutti i messaggi (più semplice e sicuro)
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch(`http://localhost:3001/api/chat/${activeConversation.id}/messages`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
          });
          if (res.ok) setMessages(await res.json());
        }
      )
      .subscribe();

    // Cleanup: rimuovi la sottoscrizione quando cambi chat o smonti il componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation]);

  // 3. Invia un messaggio (invariato, ma senza ricaricare manualmente: ci pensa Realtime)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeConversation) return;

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`http://localhost:3001/api/chat/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (!res.ok) throw new Error('Errore invio messaggio');
      setNewMessage('');
      // Non serve ricaricare: Realtime riceverà l'evento INSERT e aggiornerà la lista
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="min-h-screen pt-32 text-center text-mbare-muted font-mono">Caricando la chat...</div>;

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 flex justify-center">
      <div className="w-full max-w-6xl">
        
        {/* Header (invariato) */}
        <div className="mb-8 border-b-2 border-mbare-border pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="font-mono text-sm text-mbare-accent uppercase mb-2 block">Community Chat</span>
            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-none">
              A Mbare<span className="text-mbare-accent">.</span> Chat
            </h1>
            <p className="text-mbare-muted font-sans text-xl mt-4">
              Presentati, scherza, organizza. Qua si parla di tutto.
            </p>
          </div>
          <Link to="/community" className="bg-mbare-white text-mbare-black px-6 py-3 font-bold uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-colors border-2 border-mbare-white hover:border-mbare-accent whitespace-nowrap">
            ← Torna alla Community
          </Link>
        </div>

        {/* Layout Chat (invariato) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px]">
          
          {/* Sidebar Conversazioni */}
          <div className="md:col-span-3 bg-mbare-surface border-2 border-mbare-border p-4 flex flex-col h-full">
            <h3 className="font-display font-bold uppercase text-white mb-4 border-b border-mbare-border pb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-mbare-accent rounded-full"></span>
              Le tue Chat
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`text-left p-3 border-2 transition-all ${
                    activeConversation?.id === conv.id
                      ? 'bg-mbare-black border-mbare-accent text-mbare-white'
                      : 'bg-transparent border-mbare-border text-mbare-muted hover:border-mbare-white hover:text-mbare-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs uppercase text-mbare-accent">{conv.contextType}</span>
                    <span className="text-[10px] text-mbare-muted">
                      {conv.lastMessage ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="font-display font-bold uppercase text-sm truncate">
                    {conv.contextType === 'GENERAL' ? 'Chat Generale' : conv.contextId}
                  </p>
                  {conv.lastMessage && (
                    <p className="text-xs font-sans truncate text-mbare-muted">
                      {conv.lastMessage.sender.username}: {conv.lastMessage.content}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chat */}
          <div className="md:col-span-9 bg-mbare-surface border-2 border-mbare-border flex flex-col h-full">
            
            <div className="p-4 border-b border-mbare-border flex items-center justify-between bg-mbare-black/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-sm text-mbare-muted uppercase">
                  {activeConversation ? (activeConversation.contextType === 'GENERAL' ? 'Chat Generale' : activeConversation.contextId) : 'Nessuna chat'}
                </span>
              </div>
              <span className="font-mono text-xs text-mbare-muted">
                {activeConversation?._count?.messages || 0} messaggi
              </span>
            </div>

            {/* Messaggi */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
              {messages.length === 0 && (
                <p className="text-mbare-muted font-mono text-center py-8">
                  Nessun messaggio. Scrivi il primo, minchia!
                </p>
              )}
              {messages.map((msg, index) => (
                <div key={msg.id} className="flex gap-3 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="w-8 h-8 rounded-full bg-mbare-black border border-mbare-border flex items-center justify-center text-lg flex-shrink-0">
                    👤
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-mbare-accent uppercase">{msg.sender.username || 'Anonimo'}</span>
                      <span className="font-mono text-[10px] text-mbare-muted">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-mbare-white font-sans text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {activeConversation && (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-mbare-border flex gap-2 bg-mbare-black/30">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Scrivi un messaggio..."
                  className="flex-1 bg-mbare-black border border-mbare-border text-mbare-white px-4 py-2 font-sans text-sm focus:border-mbare-accent outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="bg-mbare-white text-mbare-black px-6 py-2 font-bold uppercase text-sm hover:bg-mbare-accent hover:text-white transition-colors disabled:opacity-50"
                >
                  {isSending ? 'Invio...' : 'Invia'}
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
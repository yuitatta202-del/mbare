import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Buona pratica: definiamo l'URL base dell'API. 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function NewsTab() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stato per tracciare se stiamo modificando una news esistente
  const [editingId, setEditingId] = useState<string | number | null>(null);
  
  // Stato del form
  const [newNews, setNewNews] = useState({ 
    title: '', 
    slug: '', 
    content: '', 
    excerpt: '',
    categoryId: '',
    tags: '',
    featuredImage: ''
  });

  // 1. Carica le news esistenti e le categorie
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch News
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/super-admin/news`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      if (res.ok) {
        setNewsList(await res.json());
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Errore caricamento news:', errorData.error);
      }

      // Fetch Categorie (direttamente da Supabase)
      const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('scope', 'POST')
        .order('name');
      
      if (catError) {
        console.error('Errore caricamento categorie:', catError);
      } else if (cats) {
        setCategories(cats);
      }

    } catch (err) {
      console.error('Errore di rete:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Resetta il form e lo stato di modifica
  const resetForm = () => {
    setNewNews({ title: '', slug: '', content: '', excerpt: '', categoryId: '', tags: '', featuredImage: '' });
    setEditingId(null);
  };

  // 2. Crea o Aggiorna una news
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Genera slug automatico se non fornito
      const slug = newNews.slug || newNews.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
        
      // Prepariamo i dati
      const newsData = { 
        ...newNews, 
        slug,
        tags: newNews.tags.split(',').map(t => t.trim()).filter(Boolean),
        categoryId: newNews.categoryId || null,
        featuredImage: newNews.featuredImage || null
      };

      // Se editingId è presente, stiamo aggiornando una news esistente (PUT)
      // Altrimenti stiamo creando una nuova news (POST)
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/super-admin/news/${editingId}` : `${API_URL}/super-admin/news`;

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify(newsData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Errore sconosciuto durante il salvataggio');
      }
      
      alert(editingId ? 'Minchia, news aggiornata! 🎉' : 'Minchia, news creata! 🎉');
      resetForm(); // Reset completo
      fetchData(); // Ricarica la lista
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Prepara il form per la modifica
  const handleEditClick = (news: any) => {
    setEditingId(news.id);
    setNewNews({
      title: news.title,
      slug: news.slug,
      content: news.content,
      excerpt: news.excerpt || '',
      categoryId: news.categoryId ? String(news.categoryId) : '',
      tags: news.tags ? news.tags.join(', ') : '', // Converte l'array in stringa per l'input
      featuredImage: news.featuredImage || ''
    });
    
    // Scrolla in alto per mostrare il form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Elimina una news
  const handleDeleteNews = async (id: string | number) => {
    if (!confirm('Sicuro sicuro di voler eliminare questa news? Mica ti pentirai?')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/super-admin/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Errore durante l\'eliminazione');
      }

      fetchData();
      // Se stavo modificando proprio questa news, resetta il form
      if (editingId === id) resetForm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && newsList.length === 0) {
    return <p className="text-mbare-muted font-mono text-center py-12 animate-pulse">Caricando le news...</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* --- FORM DI CREAZIONE / MODIFICA --- */}
      <form onSubmit={handleSubmit} className={`bg-mbare-surface border-2 ${editingId ? 'border-yellow-500' : 'border-mbare-border'} p-6 flex flex-col gap-4 transition-colors`}>
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold uppercase text-xl text-white">
            {editingId ? 'Modifica News' : 'Scrivi na News'}
          </h3>
          {editingId && (
            <button 
              type="button" 
              onClick={resetForm}
              className="text-xs font-mono text-mbare-muted hover:text-white uppercase border border-mbare-border px-3 py-1 transition-colors"
            >
              Annulla Modifica
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Titolo *</label>
            <input 
              type="text" 
              placeholder="Es. Il ritorno dei Måneskin" 
              value={newNews.title} 
              onChange={(e) => setNewNews({...newNews, title: e.target.value})} 
              className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" 
              required 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Slug (opzionale)</label>
            <input 
              type="text" 
              placeholder="es. ritorno-maneskin" 
              value={newNews.slug} 
              onChange={(e) => setNewNews({...newNews, slug: e.target.value})} 
              className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Categoria</label>
            <select 
              value={newNews.categoryId} 
              onChange={(e) => setNewNews({...newNews, categoryId: e.target.value})} 
              className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none"
            >
              <option value="">-- Seleziona Categoria --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">URL Immagine (Copertina)</label>
            <input 
              type="url" 
              placeholder="https://esempio.com/immagine.jpg" 
              value={newNews.featuredImage} 
              onChange={(e) => setNewNews({...newNews, featuredImage: e.target.value})} 
              className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs text-mbare-muted uppercase">Tag (separati da virgola)</label>
          <input 
            type="text" 
            placeholder="es. Musica, Concerti, Roma" 
            value={newNews.tags} 
            onChange={(e) => setNewNews({...newNews, tags: e.target.value})} 
            className="bg-mbare-black border border-mbare-border text-white p-3 focus:border-mbare-accent outline-none" 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs text-mbare-muted uppercase">Contenuto (Supporta Markdown) *</label>
          <textarea 
            placeholder="Scrivi l'articolo qui..." 
            value={newNews.content} 
            onChange={(e) => setNewNews({...newNews, content: e.target.value})} 
            className="bg-mbare-black border border-mbare-border text-white p-3 h-48 focus:border-mbare-accent outline-none font-mono text-sm" 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs text-mbare-muted uppercase">Excerpt (Breve descrizione per la card)</label>
          <textarea 
            placeholder="Una breve introduzione..." 
            value={newNews.excerpt} 
            onChange={(e) => setNewNews({...newNews, excerpt: e.target.value})} 
            className="bg-mbare-black border border-mbare-border text-white p-3 h-20 focus:border-mbare-accent outline-none" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`${editingId ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-mbare-accent hover:bg-white'} text-black font-bold uppercase py-3 transition-colors disabled:opacity-50 mt-2`}
        >
          {isSubmitting ? 'Salvataggio in corso...' : (editingId ? 'Salva Modifiche' : 'Pubblica News')}
        </button>
      </form>

      {/* --- LISTA NEWS --- */}
      <div className="bg-mbare-surface border-2 border-mbare-border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display font-bold uppercase text-xl text-white">News Pubblicate</h3>
          <button onClick={fetchData} className="text-xs font-mono text-mbare-muted hover:text-white uppercase transition-colors">
            Aggiorna Lista
          </button>
        </div>
        
        {newsList.length === 0 ? (
          <p className="text-mbare-muted font-mono">Nessuna news, manco una!</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {newsList.map((n) => (
              <li 
                key={String(n.id)} 
                className={`bg-mbare-black border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${editingId === n.id ? 'border-yellow-500' : 'border-mbare-border hover:border-mbare-white'}`}
              >
                <div>
                  <h4 className="text-lg font-sans font-bold text-white mb-1">{n.title}</h4>
                  <div className="flex flex-wrap gap-3 text-xs text-mbare-muted font-mono">
                    <span>di {n.author?.username || 'Admin'}</span>
                    <span>•</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={`uppercase ${n.status === 'published' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {n.status}
                    </span>
                    {n.category && (
                      <>
                        <span>•</span>
                        <span className="text-mbare-accent font-bold uppercase">{n.category.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(n)} 
                    className="text-mbare-white hover:text-black hover:bg-mbare-white border border-mbare-white px-3 py-1 text-xs uppercase font-bold transition-colors"
                  >
                    Modifica
                  </button>
                  <button 
                    onClick={() => handleDeleteNews(n.id)} 
                    className="text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-3 py-1 text-xs uppercase font-bold transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
    </div>
  );
}
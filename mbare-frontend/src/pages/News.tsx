import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=1000&auto=format&fit=crop";

export function News() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('TUTTE');

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get('tag');
  const searchQuery = searchParams.get('q') || '';

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/news`);
      if (!res.ok) throw new Error('Errore nel caricamento delle news');
      const data = await res.json();
      setNewsList(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    const channel = supabase
      .channel('news-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchNews()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearTagFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('tag');
    setSearchParams(newParams);
    setActiveCategory('TUTTE');
  };

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    setSearchParams(newParams);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set('q', value);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const filteredNews = newsList.filter(n => {
    const matchesCategory = activeCategory === 'TUTTE' || n.category?.name === activeCategory;
    const matchesTag = !activeTag || (n.tags && n.tags.includes(activeTag));
    const matchesSearch = !searchQuery || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (n.excerpt && n.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesTag && matchesSearch;
  });

  const featuredNews = filteredNews[0];
  const otherNews = filteredNews.slice(1);
  const categories = ['TUTTE', ...Array.from(new Set(newsList.map(n => n.category?.name).filter(Boolean)))];

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-6 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        
        {/* Header Editoriale */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b-2 border-mbare-border pb-8">
          <div>
            <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter leading-[0.85]">
              Le News<span className="text-mbare-accent">.</span>
            </h1>
            <p className="text-mbare-muted font-sans text-lg md:text-xl mt-4 max-w-xl">
              Il mondo là fuori, spiegato senza filtri. Solo quello che conta davvero, per chi non ha tempo da perdere.
            </p>
          </div>
          
          {/* Barra di Ricerca Pro */}
          <div className="w-full md:w-80 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-mbare-muted group-focus-within:text-mbare-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input 
              type="text"
              placeholder="Cerca un articolo..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-mbare-surface/50 backdrop-blur-sm border-2 border-mbare-border text-white pl-12 pr-10 py-3 focus:border-mbare-accent outline-none font-mono text-sm uppercase placeholder:text-mbare-muted transition-all"
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-mbare-muted hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filtri Categorie (STILE QUADRATO MBARE) */}
        <div className="mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-3 font-mono text-xs uppercase tracking-wider min-w-max">
            {categories.map((cat) => (
              <button 
                key={cat as string}
                onClick={() => {
                  setActiveCategory(cat as string);
                  if (activeTag) clearTagFilter();
                }}
                className={`px-5 py-2.5 border-2 font-bold transition-all duration-200 ${
                  activeCategory === cat 
                    ? 'bg-mbare-accent text-black border-mbare-accent shadow-[4px_4px_0_0_#fff] -translate-y-1' // Stile attivo: squadrato con ombra
                    : 'bg-transparent text-mbare-muted border-mbare-border hover:border-mbare-white hover:text-mbare-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#ff3b00]' // Stile inattivo: bordo netto
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Banner Tag Attivo */}
        {activeTag && (
          <div className="mb-10 flex items-center justify-between bg-mbare-surface border-2 border-mbare-accent p-4 animate-slide-up relative overflow-hidden group">
            <div className="absolute inset-0 bg-mbare-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 relative z-10">
              <span className="bg-mbare-accent text-black font-bold font-mono px-2 py-0.5 text-xs uppercase">Tag</span>
              <span className="text-mbare-white font-mono text-sm uppercase font-bold">#{activeTag}</span>
            </div>
            <button 
              onClick={clearTagFilter}
              className="relative z-10 text-mbare-muted hover:text-red-500 font-mono text-xs uppercase transition-colors font-bold flex items-center gap-2"
            >
              Rimuovi Filtro <span className="text-lg leading-none">×</span>
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border-2 border-red-500 p-4 mb-8 w-full flex items-center justify-center">
            <p className="text-red-500 font-mono text-sm uppercase font-bold">{error}</p>
          </div>
        )}

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse">
            <div className="md:col-span-8 bg-mbare-surface h-[500px] border-2 border-mbare-border"></div>
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="bg-mbare-surface h-[237px] border-2 border-mbare-border"></div>
              <div className="bg-mbare-surface h-[237px] border-2 border-mbare-border"></div>
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-24 bg-mbare-surface border-2 border-mbare-border flex flex-col items-center justify-center relative overflow-hidden">
            <h2 className="text-4xl font-display font-bold text-mbare-muted uppercase mb-4 relative z-10">Nessun Risultato</h2>
            <p className="text-mbare-muted font-mono text-sm mb-8 relative z-10 max-w-md mx-auto">Non abbiamo trovato articoli per "{searchQuery || activeTag}". Prova a cercare qualcos'altro, minchia!</p>
            <button 
              onClick={() => { clearTagFilter(); clearSearch(); }} 
              className="relative z-10 bg-mbare-accent text-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-white transition-colors border-2 border-mbare-accent hover:border-white"
            >
              Mostra Tutte le News
            </button>
          </div>
        ) : (
          <>
            {/* GRID PRINCIPALE */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
              
              {/* Notizia in Evidenza */}
              {featuredNews && (
                <Link to={`/news/${featuredNews.slug}`} className="md:col-span-8 group relative h-[500px] md:h-[600px] overflow-hidden border-2 border-mbare-border hover:border-mbare-accent transition-all duration-500 block">
                  <img 
                    src={featuredNews.featuredImage || DEFAULT_IMAGE} 
                    alt={featuredNews.title}
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mbare-black via-mbare-black/60 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full flex flex-col justify-end h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-[10px] md:text-xs text-black font-bold uppercase tracking-widest bg-mbare-accent px-3 py-1">
                        {featuredNews.category?.name || 'NEWS'}
                      </span>
                      <span className="font-mono text-[10px] md:text-xs text-mbare-muted uppercase">
                        {new Date(featuredNews.createdAt || featuredNews.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-display font-bold uppercase leading-[0.95] mb-4 text-white group-hover:text-mbare-accent transition-colors line-clamp-3">
                      {featuredNews.title}
                    </h2>
                    <p className="text-mbare-muted font-sans text-sm md:text-lg max-w-2xl hidden md:block mb-6 line-clamp-2">
                      {featuredNews.excerpt || 'Leggi l\'articolo completo per scoprire di più...'}
                    </p>
                    
                    <div className="flex items-center gap-2 text-mbare-white font-mono text-xs uppercase font-bold tracking-widest group-hover:gap-4 transition-all duration-300">
                      Leggi Articolo <span>→</span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Colonna Laterale */}
              <div className="md:col-span-4 flex flex-col gap-6 h-full">
                {otherNews.slice(0, 2).map((news) => (
                  <Link key={String(news.id)} to={`/news/${news.slug}`} className="group relative flex-1 min-h-[250px] overflow-hidden border-2 border-mbare-border hover:border-mbare-accent transition-all duration-500 block">
                    <img 
                      src={news.featuredImage || DEFAULT_IMAGE} 
                      alt={news.title}
                      className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-mbare-black to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      <span className="font-mono text-[10px] text-mbare-accent uppercase mb-2 block tracking-widest font-bold">
                        {news.category?.name || 'NEWS'}
                      </span>
                      <h3 className="text-xl md:text-2xl font-display font-bold uppercase leading-tight text-white group-hover:text-mbare-accent transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* GRIGLIA NOTIZIE SECONDARIE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {otherNews.slice(2).map((news) => (
                <Link key={String(news.id)} to={`/news/${news.slug}`} className="group flex flex-col md:flex-row gap-5 pb-6 border-b-2 border-mbare-border/50 hover:border-mbare-accent transition-colors duration-300">
                  <div className="w-full md:w-2/5 aspect-video md:aspect-auto md:h-48 overflow-hidden border-2 border-mbare-border group-hover:border-mbare-accent transition-colors shrink-0">
                    <img 
                      src={news.featuredImage || DEFAULT_IMAGE} 
                      alt={news.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <div className="w-full md:w-3/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[10px] text-mbare-accent uppercase font-bold tracking-wider">
                        {news.category?.name || 'NEWS'}
                      </span>
                      <span className="text-mbare-border text-[10px]">•</span>
                      <span className="font-mono text-[10px] text-mbare-muted uppercase">
                        {new Date(news.createdAt || news.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-display font-bold uppercase leading-tight mb-2 text-white group-hover:text-mbare-accent transition-colors line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-mbare-muted font-sans text-sm line-clamp-2 leading-relaxed">
                      {news.excerpt || 'Clicca per leggere tutto...'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
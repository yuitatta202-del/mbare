import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CommentSection } from '../components/comments/CommentSection'; // <-- IMPORT AGGIUNTO

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=1000&auto=format&fit=crop";

export function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/news/${slug}`);
        if (!res.ok) throw new Error('News non trovata. Forse è stata eliminata?');
        const data = await res.json();
        setNews(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [slug]);

  // Funzione di supporto per formattare la data
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-mbare-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-mbare-muted font-mono uppercase tracking-widest text-sm animate-pulse">Caricando l'articolo...</p>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center text-center px-6">
        <h1 className="text-6xl font-display font-bold text-red-500 mb-4">Ops!</h1>
        <p className="text-xl text-mbare-muted font-sans mb-8">{error || 'Qualcosa è andato storto.'}</p>
        <button 
          onClick={() => navigate('/news')}
          className="bg-mbare-white text-mbare-black px-6 py-3 font-bold uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-colors"
        >
          Torna alle News
        </button>
      </div>
    );
  }

  const articleDate = news.createdAt || news.created_at;
  const authorName = news.author?.username || 'Redazione Mbare';

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        
        <Link to="/news" className="font-mono text-xs text-mbare-muted uppercase hover:text-mbare-accent mb-8 inline-flex items-center gap-2 transition-colors">
          <span>←</span> Torna alle News
        </Link>

        {/* Header dell'articolo */}
        <div className="mb-10 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 font-mono text-xs text-mbare-muted uppercase mb-6 tracking-widest">
            <span className="text-mbare-accent border border-mbare-accent px-2 py-1">
              {news.category?.name || 'NEWS'}
            </span>
            <span>•</span>
            <span>{formatDate(articleDate)}</span>
            <span>•</span>
            <span>di <span className="text-mbare-white">{authorName}</span></span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter leading-[1.1] mb-6">
            {news.title}
          </h1>
          
          {news.excerpt && (
            <p className="text-lg md:text-xl text-mbare-muted font-sans italic border-l-4 border-mbare-accent pl-4 py-2 bg-mbare-surface/30">
              {news.excerpt}
            </p>
          )}
        </div>

        {/* Immagine di copertina */}
        <div className="w-full aspect-video mb-12 border-2 border-mbare-border overflow-hidden relative">
          <img 
            src={news.featuredImage || DEFAULT_IMAGE} 
            alt={news.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
            }}
          />
        </div>

        {/* Contenuto Markdown */}
        <div className="prose prose-invert prose-lg max-w-none font-sans text-mbare-white 
                        prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-bold 
                        prose-h2:text-3xl prose-h3:text-2xl
                        prose-a:text-mbare-accent prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-mbare-white prose-strong:font-bold
                        prose-blockquote:border-l-mbare-accent prose-blockquote:bg-mbare-surface prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {news.content}
          </ReactMarkdown>
        </div>

        {/* Tag Cliccabili */}
        {news.tags && news.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-mbare-border flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-mbare-muted uppercase tracking-widest">Tags:</span>
            {news.tags.map((tag: string) => (
              <Link 
                key={tag} 
                to={`/news?tag=${encodeURIComponent(tag)}`}
                className="text-xs font-mono uppercase bg-mbare-surface border border-mbare-border px-3 py-1 text-mbare-accent hover:bg-mbare-accent hover:text-black hover:border-mbare-accent transition-all cursor-pointer"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* SEZIONE COMMENTI AGGIUNTA */}
        <div className="mt-12">
          <CommentSection targetType="POST" targetId={news.id} />
        </div>

        {/* Footer dell'articolo */}
        <div className="mt-16 text-center border-t border-mbare-border pt-12">
          <p className="font-mono text-xs text-mbare-muted uppercase mb-6">Ti è piaciuto questo articolo?</p>
          <button 
            onClick={() => navigate('/news')}
            className="border-2 border-mbare-white text-mbare-white px-8 py-3 font-bold uppercase tracking-tighter hover:bg-mbare-white hover:text-mbare-black transition-all"
          >
            Leggi altre news
          </button>
        </div>

      </div>
    </div>
  );
}
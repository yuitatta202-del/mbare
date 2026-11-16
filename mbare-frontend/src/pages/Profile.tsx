import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';

// Elenco Dipartimenti
const DIPARTIMENTI = [
  'Ingegneria Informatica', 'Ingegneria Civile', 'Medicina e Chirurgia',
  'Giurisprudenza', 'Economia', 'Scienze Politiche', 'Lettere e Filosofia',
  'Scienze della Formazione', 'Matematica e Informatica', 'Fisica', 'Chimica',
  'Biologia', 'Farmacia', 'Architettura', 'Altro',
];

// Elenco Corsi di Studio
const CORSI_DI_STUDIO = [
  'Informatica', 'Ingegneria Informatica', 'Medicina', 'Giurisprudenza',
  'Economia Aziendale', 'Scienze Politiche', 'Filosofia', 'Lettere',
  'Matematica', 'Fisica', 'Chimica', 'Biologia', 'Farmacia', 'Architettura', 'Altro',
];

// 100+ EMOJI UNICHE
const EMOJI = [
  // Facce
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕',
  // Animali
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔',
  // Cibo
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾',
  // Oggetti e Simboli
  '🔥', '💀', '😈', '👽', '🤖', '💩', '👑', '💎', '🚀', '⚡', '🌙', '☀️', '🎮', '🎧', '📚', '🎸', '🎤', '🎬', '📷', '🎨', '🏀', '⚽', '🎾', '🏐', '🎱', '🏓', '🏸', '🥊', '🎯', '🎲', '🧩', '🎳', '🕹', '🎰', '💻', '📱', '🖥', '⌨️', '🖱', '💾', '💿', '📀', '🎥', '📞', '📟', '📠', '📺', '📻', '🧭', '⏰', '⌚', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🧯', '🛢', '💰', '💸', '💳', '⚖️', '🧰', '🔧', '🔨', '⚒', '🛠', '⛏', '🔩', '⚙️', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🪆', '🖼', '🪞', '🪟', '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇', '🗃', '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📖', '🔖', '🧷', '🔗', '📎', '🖇', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊', '🖋', '✒️', '🖌', '🖍', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓',
];

// Opzioni per il Palio
const PALIO_OPTIONS = [
  'Partecipo attivamente',
  'Faccio il tifo',
  'Organizzo eventi',
  'Non mi interessa',
  'Altro',
];

export function Profile() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Stato del form
  const [formData, setFormData] = useState({
    username: '',
    dipartimento: '',
    corso_di_studi: '',
    anno_corso: 1,
    bio: '',
    interessi: '',
    sport: '',
    lavoro: '',
    palio: '',
    palio_ruolo: '',
  });

  const [customDipartimento, setCustomDipartimento] = useState(false);
  const [customCorso, setCustomCorso] = useState(false);
  const [isCatania, setIsCatania] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setFormData({
          username: data.username || '',
          dipartimento: data.dipartimento || '',
          corso_di_studi: data.corso_di_studi || '',
          anno_corso: data.anno_corso || 1,
          bio: data.bio || '',
          interessi: data.interessi?.join(', ') || '',
          sport: data.sport || '',
          lavoro: data.lavoro || '',
          palio: data.palio || '',
          palio_ruolo: data.palio_ruolo || '',
        });
// Controlla se la matricola inizia con "1000" e ha 10 cifre (formato UniCT)
const isUniCT = data.matricola && /^1000\d{6}$/.test(data.matricola);
setIsCatania(!!isUniCT);        if (data.dipartimento && !DIPARTIMENTI.includes(data.dipartimento)) setCustomDipartimento(true);
        if (data.corso_di_studi && !CORSI_DI_STUDIO.includes(data.corso_di_studi)) setCustomCorso(true);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    const interessiArray = formData.interessi.split(',').map(i => i.trim()).filter(i => i !== '');

    const { error } = await supabase.from('profiles').update({
      username: formData.username,
      dipartimento: formData.dipartimento,
      corso_di_studi: formData.corso_di_studi,
      anno_corso: formData.anno_corso,
      bio: formData.bio,
      interessi: interessiArray,
      sport: formData.sport,
      lavoro: formData.lavoro,
      palio: formData.palio,
      palio_ruolo: formData.palio_ruolo,
    }).eq('id', user.id);

    if (error) setMessage('Errore: ' + error.message);
    else setMessage('Profilo aggiornato!');
    
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const addEmoji = (emoji: string) => {
    setFormData({ ...formData, username: formData.username + emoji });
    setShowEmojiPicker(false);
  };

  if (loading) return <div className="min-h-screen pt-32 text-center text-mbare-muted font-mono">Caricamento...</div>;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl font-display font-bold uppercase tracking-tighter mb-8 border-b-2 border-mbare-border pb-4">
          Il Mio Profilo<span className="text-mbare-accent">.</span>
        </h1>

        <form onSubmit={handleSave} className="flex flex-col gap-8 bg-mbare-surface p-8 border-2 border-mbare-border">
          
          {/* USERNAME E ANNO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 relative">
              <label className="font-mono text-xs text-mbare-muted uppercase">Username</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="flex-1 bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  😀
                </button>
              </div>
              {showEmojiPicker && (
                <div className="absolute top-full mt-2 bg-mbare-black border-2 border-mbare-border p-4 grid grid-cols-10 gap-2 z-50 max-h-64 overflow-y-auto w-full">
                  {EMOJI.map((emoji, index) => (
                    <button
                      key={`${emoji}-${index}`} // <-- FIX: chiave univoca con index
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-mbare-muted uppercase">Anno di Corso</label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.anno_corso}
                onChange={(e) => setFormData({...formData, anno_corso: parseInt(e.target.value)})}
                className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
              />
            </div>
          </div>

          {/* DIPARTIMENTO E CORSO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-mbare-muted uppercase">Dipartimento</label>
              {!customDipartimento ? (
                <select
                  value={formData.dipartimento}
                  onChange={(e) => {
                    if (e.target.value === 'Altro') setCustomDipartimento(true);
                    else setFormData({...formData, dipartimento: e.target.value});
                  }}
                  className="bg-mbare-black border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
                >
                  <option value="">Seleziona...</option>
                  {DIPARTIMENTI.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.dipartimento}
                  onChange={(e) => setFormData({...formData, dipartimento: e.target.value})}
                  placeholder="Scrivi il tuo dipartimento"
                  className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-mbare-muted uppercase">Corso di Studi</label>
              {!customCorso ? (
                <select
                  value={formData.corso_di_studi}
                  onChange={(e) => {
                    if (e.target.value === 'Altro') setCustomCorso(true);
                    else setFormData({...formData, corso_di_studi: e.target.value});
                  }}
                  className="bg-mbare-black border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
                >
                  <option value="">Seleziona...</option>
                  {CORSI_DI_STUDIO.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.corso_di_studi}
                  onChange={(e) => setFormData({...formData, corso_di_studi: e.target.value})}
                  placeholder="Scrivi il tuo corso di studi"
                  className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
                />
              )}
            </div>
          </div>

          {/* BIO E INTERESSI */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Bio (Il tuo curriculum sociale)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Raccontati in poche righe..."
              rows={3}
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-mbare-muted uppercase">Interessi (separati da virgola)</label>
            <input
              type="text"
              value={formData.interessi}
              onChange={(e) => setFormData({...formData, interessi: e.target.value})}
              placeholder="es. Musica, Calcio, Fotografia, Tech"
              className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
            />
          </div>

          {/* SPORT E LAVORO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-mbare-muted uppercase">Sport</label>
              <input
                type="text"
                value={formData.sport}
                onChange={(e) => setFormData({...formData, sport: e.target.value})}
                placeholder="es. Calcio, Basket, Nuoto"
                className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-mbare-muted uppercase">Lavoro</label>
              <input
                type="text"
                value={formData.lavoro}
                onChange={(e) => setFormData({...formData, lavoro: e.target.value})}
                placeholder="es. Cameriere, Tutor, Freelance"
                className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
              />
            </div>
          </div>

          {/* PALIO UNIVERSITARIO (Solo per Catania) */}
          {isCatania && (
            <div className="flex flex-col gap-2 border-t-2 border-mbare-border pt-6 mt-2">
              <label className="font-mono text-xs text-mbare-accent uppercase font-bold">Palio Universitario (UniCT)</label>
              <select
                value={formData.palio}
                onChange={(e) => setFormData({...formData, palio: e.target.value})}
                className="bg-mbare-black border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2"
              >
                <option value="">Seleziona...</option>
                {PALIO_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.palio_ruolo}
                onChange={(e) => setFormData({...formData, palio_ruolo: e.target.value})}
                placeholder="Specifica il tuo ruolo (es. 'Capitano della squadra')"
                className="bg-transparent border-b-2 border-mbare-border focus:border-mbare-accent outline-none text-mbare-white py-2 mt-2"
              />
            </div>
          )}

          {message && <p className="text-mbare-accent font-mono text-sm font-bold">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-mbare-accent text-black py-4 font-display font-bold text-xl uppercase tracking-tighter hover:bg-white transition-all disabled:opacity-50"
          >
            {saving ? 'Salvataggio...' : 'Salva Profilo'}
          </button>
        </form>
      </div>
    </div>
  );
}
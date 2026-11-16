import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function ReportsTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Funzione per caricare le segnalazioni dal backend
  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:3001/api/super-admin/reports', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (err) {
      console.error('Errore caricamento segnalazioni:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Azione: Risolvi segnalazione
  const handleResolve = async (id: string) => {
    if (!confirm('Vuoi segnare questa segnalazione come risolta?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`http://localhost:3001/api/super-admin/reports/${id}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      fetchReports(); // Ricarica la lista
    } catch (err) {
      alert('Errore durante la risoluzione');
    }
  };

  // Azione: Ignora segnalazione (Dismiss)
  const handleDismiss = async (id: string) => {
    if (!confirm('Vuoi ignorare questa segnalazione? Verrà archiviata come non valida.')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`http://localhost:3001/api/super-admin/reports/${id}/dismiss`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      fetchReports();
    } catch (err) {
      alert('Errore durante l\'ignoramento');
    }
  };

  if (loading) {
    return <p className="text-mbare-muted font-mono text-center py-12">Caricando i signali...</p>;
  }

  return (
    <div className="bg-mbare-surface border-2 border-mbare-border p-6">
      <h3 className="font-display font-bold uppercase text-xl text-white mb-4">
        Segnalazioni
      </h3>

      {reports.length === 0 ? (
        <p className="text-mbare-muted font-mono">Nuddu signalau, bonu accussì!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <div 
              key={report.id} 
              className={`bg-mbare-black border border-mbare-border p-4 flex flex-col gap-2 ${
                report.status === 'open' ? 'border-l-4 border-l-red-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-mbare-white font-sans text-lg">
                    Tipo: <span className="font-bold text-mbare-accent uppercase">{report.targetType}</span>
                  </p>
                  <p className="text-mbare-muted text-sm mt-1">
                    Motivo: <span className="text-white">{report.reason}</span>
                  </p>
                  {report.note && (
                    <p className="text-mbare-muted text-xs mt-2 italic">
                      "{report.note}"
                    </p>
                  )}
                  <p className="text-xs text-mbare-muted mt-2">
                    Segnalato da: <span className="text-mbare-white">{report.reporter?.username || 'Anonimo'}</span> il {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs font-mono uppercase px-2 py-1 ${
                  report.status === 'open' ? 'bg-red-500/20 text-red-400' :
                  report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {report.status}
                </span>
              </div>

              {/* Bottoni azione (visibili solo se la segnalazione è aperta) */}
              {report.status === 'open' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-mbare-border">
                  <button 
                    onClick={() => handleResolve(report.id)} 
                    className="bg-green-500 text-black px-3 py-1 font-bold uppercase text-xs hover:bg-green-400 transition-colors"
                  >
                    Risolvi
                  </button>
                  <button 
                    onClick={() => handleDismiss(report.id)} 
                    className="bg-red-500 text-white px-3 py-1 font-bold uppercase text-xs hover:bg-red-400 transition-colors"
                  >
                    Ignora
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
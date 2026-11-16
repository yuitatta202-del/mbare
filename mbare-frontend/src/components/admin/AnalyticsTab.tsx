import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const COLORS = ['#ff3b00', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

export function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_URL}/super-admin/analytics`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error('Errore caricamento analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div className="text-mbare-muted font-mono text-center py-12 animate-pulse">Elaborando i dati in tempo reale...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col">
          <span className="font-mono text-xs text-mbare-muted uppercase mb-2">Utenti Totali</span>
          <span className="text-4xl font-display font-bold text-white">{data.kpi.totalUsers}</span>
        </div>
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col">
          <span className="font-mono text-xs text-mbare-muted uppercase mb-2">Visualizzazioni</span>
          <span className="text-4xl font-display font-bold text-white">{data.kpi.totalViews}</span>
        </div>
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col">
          <span className="font-mono text-xs text-mbare-muted uppercase mb-2">Mbare Coin Totali</span>
          <span className="text-4xl font-display font-bold text-mbare-accent">{data.kpi.totalTokensEarned}</span>
        </div>
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col">
          <span className="font-mono text-xs text-mbare-muted uppercase mb-2">News Pubblicate</span>
          <span className="text-4xl font-display font-bold text-white">{data.kpi.totalPosts}</span>
        </div>
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col">
          <span className="font-mono text-xs text-mbare-muted uppercase mb-2">Spiffera Totali</span>
          <span className="text-4xl font-display font-bold text-white">{data.kpi.totalSpiffera}</span>
        </div>
      </div>

      {/* GRAFICI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Crescita Utenti (LineChart) */}
        <div className="bg-mbare-surface border-2 border-mbare-border p-6">
          <h3 className="font-display font-bold uppercase text-white mb-6">Nuovi Utenti (Ultimi 7 giorni)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                <Line type="monotone" dataKey="count" stroke="#ff3b00" strokeWidth={3} dot={{ r: 4 }} name="Nuovi Utenti" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuzione Spiffera (PieChart) */}
        <div className="bg-mbare-surface border-2 border-mbare-border p-6">
          <h3 className="font-display font-bold uppercase text-white mb-6">Drama per Categoria</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.charts.spifferaByCategory} 
                  dataKey="_count._all" 
                  nameKey="category" 
                  cx="50%" cy="50%" 
                  outerRadius={80} 
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.charts.spifferaByCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Post (BarChart) */}
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 lg:col-span-2">
          <h3 className="font-display font-bold uppercase text-white mb-6">Top 5 Articoli più letti</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.topPosts} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" stroke="#888" fontSize={12} />
                <YAxis dataKey="title" type="category" stroke="#888" fontSize={12} width={150} tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} cursor={{ fill: '#222' }} />
                <Bar dataKey="viewCount" fill="#ff3b00" name="Visualizzazioni" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
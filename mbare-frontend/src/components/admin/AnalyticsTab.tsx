
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { API_URL } from '../../config/api';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

// ==========================================
// MBARE - ANALYTICS CONFIGURATION
// ==========================================

const COLORS = [
  '#ff3b00',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff'
];

// ==========================================
// TYPES
// ==========================================

interface AnalyticsKPI {
  totalUsers: number;
  totalViews: number;
  totalTokensEarned: number;
  totalPosts: number;
  totalSpiffera: number;
}

interface UserGrowthItem {
  date: string;
  count: number;
}

interface SpifferaCategoryItem {
  category: string;
  _count: {
    _all: number;
  };
}

interface TopPostItem {
  id?: string;
  title: string;
  viewCount: number;
}

interface AnalyticsData {
  kpi: AnalyticsKPI;
  charts: {
    userGrowth: UserGrowthItem[];
    spifferaByCategory: SpifferaCategoryItem[];
    topPosts: TopPostItem[];
  };
}

// ==========================================
// DEFAULT DATA
// ==========================================

const DEFAULT_ANALYTICS: AnalyticsData = {
  kpi: {
    totalUsers: 0,
    totalViews: 0,
    totalTokensEarned: 0,
    totalPosts: 0,
    totalSpiffera: 0
  },
  charts: {
    userGrowth: [],
    spifferaByCategory: [],
    topPosts: []
  }
};

// ==========================================
// HELPERS
// ==========================================

function formatNumber(value: number): string {
  return new Intl.NumberFormat('it-IT').format(value);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Errore imprevisto durante il caricamento.';
}

function normalizeAnalytics(
  value: Partial<AnalyticsData> | null
): AnalyticsData {
  return {
    kpi: {
      ...DEFAULT_ANALYTICS.kpi,
      ...(value?.kpi ?? {})
    },
    charts: {
      userGrowth: Array.isArray(value?.charts?.userGrowth)
        ? value.charts.userGrowth
        : [],
      spifferaByCategory:
        Array.isArray(value?.charts?.spifferaByCategory)
          ? value.charts.spifferaByCategory
          : [],
      topPosts: Array.isArray(value?.charts?.topPosts)
        ? value.charts.topPosts
        : []
    }
  };
}

// ==========================================
// COMPONENT
// ==========================================

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData>(
    DEFAULT_ANALYTICS
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ==========================================
  // FETCH ANALYTICS
  // ==========================================

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        // Recupera la sessione Supabase.
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(
            'Errore durante la verifica della sessione.'
          );
        }

        if (!session?.access_token) {
          throw new Error(
            'Sessione non valida. Effettua nuovamente il login.'
          );
        }

        // Richiesta al backend Railway.
        const response = await fetch(
          `${API_URL}/api/super-admin/analytics`,
          {
            method: 'GET',
            signal: controller.signal,
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
              Accept: 'application/json'
            }
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              'Sessione scaduta. Effettua nuovamente il login.'
            );
          }

          if (response.status === 403) {
            throw new Error(
              'Non hai i permessi per visualizzare le statistiche.'
            );
          }

          throw new Error(
            `Impossibile caricare le statistiche. HTTP ${response.status}`
          );
        }

        const result =
          await response.json() as Partial<AnalyticsData>;

        if (active) {
          setData(normalizeAnalytics(result));
        }

      } catch (err) {
        if (
          err instanceof Error &&
          err.name === 'AbortError'
        ) {
          return;
        }

        if (active) {
          console.error(
            'Errore caricamento analytics MBARE:',
            err
          );

          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchAnalytics();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshKey]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="text-mbare-muted font-mono text-center py-12 animate-pulse">
        Elaborando i dati in tempo reale...
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="bg-mbare-surface border-2 border-red-500 p-8 text-center">
        <h3 className="text-xl font-display font-bold uppercase text-red-400 mb-3">
          Errore Analytics
        </h3>

        <p className="text-mbare-muted text-sm mb-6">
          {error}
        </p>

        <button
          type="button"
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="bg-mbare-accent text-black font-bold uppercase px-6 py-3 hover:brightness-110 transition"
        >
          Riprova
        </button>
      </div>
    );
  }

  // ==========================================
  // KPI CARDS
  // ==========================================

  const kpiCards = [
    {
      label: 'Utenti Totali',
      value: data.kpi.totalUsers,
      accent: false
    },
    {
      label: 'Visualizzazioni',
      value: data.kpi.totalViews,
      accent: false
    },
    {
      label: 'Mbare Coin Totali',
      value: data.kpi.totalTokensEarned,
      accent: true
    },
    {
      label: 'News Pubblicate',
      value: data.kpi.totalPosts,
      accent: false
    },
    {
      label: 'Spiffera Totali',
      value: data.kpi.totalSpiffera,
      accent: false
    }
  ];

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="flex flex-col gap-8">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase text-white">
            Analytics MBARE
          </h2>

          <p className="text-mbare-muted text-xs font-mono mt-1">
            Panoramica delle statistiche della piattaforma
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="border border-mbare-border px-4 py-2 font-mono text-xs uppercase text-mbare-white hover:border-mbare-accent hover:text-mbare-accent transition"
        >
          Aggiorna dati
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map(card => (
          <div
            key={card.label}
            className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col"
          >
            <span className="font-mono text-xs text-mbare-muted uppercase mb-2">
              {card.label}
            </span>

            <span
              className={`text-4xl font-display font-bold ${
                card.accent
                  ? 'text-mbare-accent'
                  : 'text-white'
              }`}
            >
              {formatNumber(card.value)}
            </span>
          </div>
        ))}
      </div>

      {/* GRAFICI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CRESCITA UTENTI */}
        <div className="bg-mbare-surface border-2 border-mbare-border p-6">
          <h3 className="font-display font-bold uppercase text-white mb-6">
            Nuovi Utenti (Ultimi 7 giorni)
          </h3>

          <div className="h-64 w-full">
            {data.charts.userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.userGrowth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#333"
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={12}
                  />

                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111',
                      borderColor: '#333'
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#ff3b00"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Nuovi Utenti"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-mbare-muted text-sm font-mono">
                Nessun dato disponibile
              </div>
            )}
          </div>
        </div>

        {/* SPIFFERA PER CATEGORIA */}
        <div className="bg-mbare-surface border-2 border-mbare-border p-6">
          <h3 className="font-display font-bold uppercase text-white mb-6">
            Drama per Categoria
          </h3>

          <div className="h-64 w-full">
            {data.charts.spifferaByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.spifferaByCategory}
                    dataKey="_count._all"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"

                    // FIX TS18048:
                    // Percent può essere undefined.
                    label={({ name, percent }) =>
                      `${name ?? 'Categoria'} ${(
                        (percent ?? 0) * 100
                      ).toFixed(0)}%`
                    }
                  >
                    {data.charts.spifferaByCategory.map(
                      (_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111',
                      borderColor: '#333'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-mbare-muted text-sm font-mono">
                Nessuna spifferata disponibile
              </div>
            )}
          </div>
        </div>

        {/* TOP ARTICOLI */}
        <div className="bg-mbare-surface border-2 border-mbare-border p-6 lg:col-span-2">
          <h3 className="font-display font-bold uppercase text-white mb-6">
            Top 5 Articoli più letti
          </h3>

          <div className="h-72 w-full">
            {data.charts.topPosts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.charts.topPosts}
                  layout="vertical"
                  margin={{ left: 50 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#333"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    stroke="#888"
                    fontSize={12}
                  />

                  <YAxis
                    dataKey="title"
                    type="category"
                    stroke="#888"
                    fontSize={12}
                    width={150}
                    tickFormatter={(value: string) =>
                      value.length > 20
                        ? `${value.substring(0, 20)}...`
                        : value
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111',
                      borderColor: '#333'
                    }}
                    cursor={{ fill: '#222' }}
                  />

                  <Bar
                    dataKey="viewCount"
                    fill="#ff3b00"
                    name="Visualizzazioni"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-mbare-muted text-sm font-mono">
                Nessun articolo disponibile
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsTab;

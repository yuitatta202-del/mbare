import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { UsersTab } from '../components/admin/UsersTab';
import { AnalyticsTab } from '../components/admin/AnalyticsTab'; 
import { NewsTab } from '../components/admin/NewsTab';
import { SpifferaTab } from '../components/admin/SpifferaTab';
import { EventsTab } from '../components/admin/EventsTab';
import { GroupsTab } from '../components/admin/GroupsTab';
import { ReportsTab } from '../components/admin/ReportsTab';
import { BoardTab } from '../components/admin/BoardTab';
import { CoinTab } from '../components/admin/CoinTab';

export function SuperAdminDashboard() {
  // Estraiamo anche il ruolo per gestire i permessi
  const { user, role } = useUser();
  
  // FIX: Aggiunto 'coins' al tipo di activeTab
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'news' | 'spiffera' | 'events' | 'groups' | 'reports' | 'board' | 'coins'>('users');

  // Configurazione delle tab con i relativi permessi di accesso
  const tabs = [
    { id: 'users', label: 'Utenti', roles: ['SUPER_ADMIN'] },
    { id: 'analytics', label: 'Analytics', roles: ['SUPER_ADMIN'] },
    { id: 'coins', label: 'Mbare Coin', roles: ['SUPER_ADMIN'] }, // <-- AGGIUNTO
    { id: 'news', label: 'News', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
    { id: 'spiffera', label: 'Spiffera', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
    { id: 'events', label: 'Eventi', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
    { id: 'groups', label: 'Gruppi', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
    { id: 'reports', label: 'Segnalazioni', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
    { id: 'board', label: 'Annunci', roles: ['SUPER_ADMIN'] },
  ];

  // Filtriamo le tab in base al ruolo dell'utente loggato
  const visibleTabs = tabs.filter(tab => tab.roles.includes(role || 'USER'));

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        
        {/* Header */}
        <div className="mb-8 border-b-2 border-mbare-border pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="font-mono text-sm text-mbare-accent uppercase mb-2 block">
              {role === 'SUPER_ADMIN' ? 'Super Admin Area' : 'Admin Area'}
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-none">
              U Capu<span className="text-mbare-accent">.</span> Totale
            </h1>
            <p className="text-mbare-muted font-sans text-xl mt-4">
              Benvenuto {user?.email?.split('@')[0]}. Qua manni tu, amministra tuttu.
            </p>
          </div>
        </div>

        {/* Tab Navigation con Filtro Ruoli */}
        <div className="flex gap-4 mb-6 border-b-2 border-mbare-border pb-2 flex-wrap">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`font-mono text-sm uppercase pb-2 transition-colors ${
                activeTab === tab.id 
                  ? 'text-mbare-accent border-b-2 border-mbare-accent font-bold' 
                  : 'text-mbare-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenuto della Tab Attiva */}
        <div className="w-full">
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'analytics' && <AnalyticsTab />} 
          {activeTab === 'coins' && <CoinTab />} {/* <-- AGGIUNTO IL RENDERING */}
          {activeTab === 'news' && <NewsTab />}
          {activeTab === 'spiffera' && <SpifferaTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'groups' && <GroupsTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'board' && <BoardTab />}
        </div>

      </div>
    </div>
  );
}
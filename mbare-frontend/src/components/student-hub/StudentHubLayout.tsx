import { NavLink, Outlet, Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

export function StudentHubLayout() {
  const { user } = useUser();

  const navigation = [
    { name: 'Dashboard', path: '/student-hub', icon: '📊', end: true },
    { name: 'Ripetizioni', path: '/student-hub/ripetizioni', icon: '🧑‍🏫' },
    { name: 'Dispense & Appunti', path: '/student-hub/dispense', icon: '📚' },
    { name: 'Prove d\'Esame', path: '/student-hub/esami', icon: '📝' },
    { name: 'Stage & Lavoro', path: '/student-hub/stage', icon: '💼' },
    { name: 'Personalizzazione', path: '/student-hub/settings', icon: '🎨' }, // <-- AGGIUNTO
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 flex justify-center bg-mbare-black">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          
          <div className="bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-16 h-16 bg-mbare-accent text-black font-display font-bold text-3xl flex items-center justify-center mb-4">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-display font-bold uppercase text-xl text-white truncate w-full">
              {user?.email?.split('@')[0]}
            </h2>
            <span className="font-mono text-xs text-mbare-muted uppercase mt-1">Studente Attivo</span>
            <Link to="/profile" className="mt-4 w-full text-center bg-mbare-black border border-mbare-border py-2 text-xs font-mono uppercase hover:border-mbare-white transition-colors">
              Modifica Profilo
            </Link>
          </div>

          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 scrollbar-hide">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 font-mono text-sm uppercase whitespace-nowrap border-2 transition-all
                  ${isActive 
                    ? 'bg-mbare-accent text-black border-mbare-accent font-bold' 
                    : 'bg-mbare-surface text-mbare-muted border-mbare-border hover:border-mbare-white hover:text-white'}
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* CONTENUTO */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
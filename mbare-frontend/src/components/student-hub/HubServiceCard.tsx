import { Link } from 'react-router-dom';
import type { HubService } from '../../config/studentHubServices';

export function HubServiceCard({ service }: { service: HubService }) {
  return (
    <Link 
      to={service.link} 
      className="group bg-mbare-surface border-2 border-mbare-border p-6 flex flex-col hover:border-mbare-accent hover:shadow-[6px_6px_0_0_#ff3b00] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
    >
      <span className="absolute top-4 right-4 font-mono text-[10px] text-mbare-muted uppercase border border-mbare-border px-2 py-0.5">
        {service.category}
      </span>

      <div className={`w-12 h-12 ${service.color} text-black flex items-center justify-center rounded-none mb-6 text-2xl shadow-[2px_2px_0_0_#fff] group-hover:scale-110 transition-transform`}>
        {service.icon}
      </div>

      <h3 className="text-2xl font-display font-bold uppercase mb-2 pr-16 text-white group-hover:text-mbare-accent transition-colors">
        {service.title}
      </h3>
      <p className="text-mbare-muted font-sans text-sm flex-grow">
        {service.desc}
      </p>

      <div className="mt-6 flex items-center gap-2 text-mbare-white font-mono text-xs uppercase font-bold tracking-widest group-hover:gap-4 transition-all duration-300 border-t border-mbare-border pt-4">
        Accedi <span>→</span>
      </div>
    </Link>
  );
}
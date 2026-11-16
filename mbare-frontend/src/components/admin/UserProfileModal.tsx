// src/components/admin/UserProfileModal.tsx
export function UserProfileModal({ user, onClose }: { user: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-mbare-surface border-2 border-mbare-accent p-8 max-w-lg w-full relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-mbare-muted hover:text-white font-mono text-xl">✕</button>
        <h2 className="text-3xl font-display font-bold uppercase mb-6 text-white">Profilo Utente</h2>
        
        <div className="flex flex-col gap-4 font-sans text-mbare-white max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
           {/* Tutti i campi del profilo (username, email, matricola, ecc.) */}
           <div className="border-b border-mbare-border pb-2">
                <p className="font-mono text-xs text-mbare-muted uppercase">Username</p>
                <p className="text-lg">{user.username || 'N/A'}</p>
           </div>
           {/* ... Aggiungi gli altri campi qui ... */}
        </div>
      </div>
    </div>
  );
}
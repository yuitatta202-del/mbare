import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const { user, role, loading } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // Allineato con ProtectedSuperAdminRoute (Admin, Mod e SuperAdmin)
  const isStaff = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(role || '');
  
  // Gli studenti (e i ruoli superiori) vedono lo Student Hub
  const isStudent = ['STUDENT', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(role || '');
  
  // Utente registrato ma non ancora studente
  const isBaseUser = user && role === 'USER';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors ${
      isActive ? 'text-mbare-accent font-bold underline decoration-2 underline-offset-4' : 'hover:text-mbare-accent'
    }`;

  return (
    <nav className="fixed top-0 w-full z-40">
      {/* Top Bar con effetto Blend isolato */}
      <div className="mix-blend-difference bg-mbare-black/10 backdrop-blur-sm">
        <div className="flex justify-between items-center p-6 md:p-8">
          {/* Logo */}
          <NavLink 
            to="/" 
            className="font-display font-bold text-2xl tracking-tighter hover:text-mbare-accent transition-colors z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            MBARE.
          </NavLink>

          {/* Link di navigazione Desktop */}
          <div className="hidden md:flex gap-4 lg:gap-6 font-mono text-sm uppercase items-center">
            <NavLink to="/news" className={navLinkClass}>News</NavLink>
            <NavLink to="/spiffera" className={navLinkClass}>Spiffera</NavLink>
            <NavLink to="/arcade" className={navLinkClass}>Arcade</NavLink>
            <NavLink to="/community" end className={navLinkClass}>Community</NavLink>
            <NavLink to="/bacheca" className={navLinkClass}>Bacheca</NavLink>
            <NavLink to="/shop" className={navLinkClass}>Shop Coin</NavLink>
            
            {isStudent && (
              <NavLink to="/student-hub" className={navLinkClass}>Student Hub</NavLink>
            )}
          </div>

          {/* Area Utente / Auth Desktop */}
          <div className="hidden md:flex items-center gap-4 font-mono text-sm uppercase">
            {loading ? (
              <span className="text-mbare-muted animate-pulse">...</span>
            ) : user ? (
              <>
                {/* Se l'utente è loggato ma USER, mostriamo un invito a diventare studente */}
                {isBaseUser && (
                  <NavLink to="/profile" className="text-mbare-accent animate-pulse font-bold">
                    Diventa Studente
                  </NavLink>
                )}

                {isStaff && (
                  <NavLink to="/super-admin" className={navLinkClass}>
                    Admin
                  </NavLink>
                )}
                
                <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-2 transition-colors ${isActive ? 'text-mbare-accent font-bold' : 'text-mbare-white hover:text-mbare-accent'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="hidden lg:inline">Profilo</span>
                </NavLink>

                <button 
                  onClick={handleLogout}
                  className="border border-mbare-border px-4 py-2 hover:border-mbare-accent hover:text-mbare-accent transition-all cursor-none"
                >
                  Esci
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>Accedi</NavLink>
                <NavLink to="/register" className="bg-mbare-white text-mbare-black px-4 py-2 font-bold hover:bg-mbare-accent hover:text-white transition-all">
                  Registrati
                </NavLink>
              </>
            )}
          </div>

          {/* Bottone Hamburger per Mobile */}
          <button 
            className="md:hidden z-50 p-2 text-mbare-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 h-0.5 bg-current mb-1.5 transition-all"></div>
            <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
            <div className="w-6 h-0.5 bg-current transition-all"></div>
          </button>
        </div>
      </div>

      {/* Menu Mobile (Tendina) - ISOLATO DAL BLEND */}
      <div className={`fixed inset-0 bg-mbare-black z-40 transition-transform duration-300 transform flex flex-col justify-center items-center gap-6 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <NavLink to="/news" className={({ isActive }) => `text-4xl font-display font-bold uppercase ${isActive ? 'text-mbare-accent' : 'hover:text-mbare-accent'}`} onClick={() => setIsMobileMenuOpen(false)}>News</NavLink>
        <NavLink to="/spiffera" className={({ isActive }) => `text-4xl font-display font-bold uppercase ${isActive ? 'text-mbare-accent' : 'hover:text-mbare-accent'}`} onClick={() => setIsMobileMenuOpen(false)}>Spiffera</NavLink>
        <NavLink to="/arcade" className={({ isActive }) => `text-4xl font-display font-bold uppercase ${isActive ? 'text-mbare-accent' : 'hover:text-mbare-accent'}`} onClick={() => setIsMobileMenuOpen(false)}>Arcade</NavLink>
        <NavLink to="/community" end className={({ isActive }) => `text-4xl font-display font-bold uppercase ${isActive ? 'text-mbare-accent' : 'hover:text-mbare-accent'}`} onClick={() => setIsMobileMenuOpen(false)}>Community</NavLink>
        <NavLink to="/bacheca" className={({ isActive }) => `text-4xl font-display font-bold uppercase ${isActive ? 'text-mbare-accent' : 'hover:text-mbare-accent'}`} onClick={() => setIsMobileMenuOpen(false)}>Bacheca</NavLink>
        <NavLink to="/shop" className={({ isActive }) => `text-4xl font-display font-bold uppercase ${isActive ? 'text-mbare-accent' : 'hover:text-mbare-accent'}`} onClick={() => setIsMobileMenuOpen(false)}>Shop Coin</NavLink>
        
        {isStudent && (
          <NavLink to="/student-hub" className={({ isActive }) => `text-3xl font-display font-bold uppercase ${isActive ? 'text-mbare-accent' : 'hover:text-mbare-accent'}`} onClick={() => setIsMobileMenuOpen(false)}>Student Hub</NavLink>
        )}

        <div className="mt-8 pt-8 border-t border-mbare-border w-1/2 flex flex-col items-center gap-6">
          {user ? (
            <>
              {isBaseUser && (
                <NavLink to="/profile" className="text-mbare-accent font-bold uppercase animate-pulse w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
                  Diventa Studente
                </NavLink>
              )}
              {isStaff && (
                <NavLink to="/super-admin" className="font-mono text-sm uppercase w-full text-center text-mbare-accent font-bold" onClick={() => setIsMobileMenuOpen(false)}>Admin</NavLink>
              )}
              <NavLink to="/profile" className={({ isActive }) => `font-mono text-sm uppercase w-full text-center ${isActive ? 'text-mbare-accent font-bold' : 'hover:text-mbare-accent'}`} onClick={() => setIsMobileMenuOpen(false)}>Il Mio Profilo</NavLink>
              <button onClick={handleLogout} className="border border-mbare-border px-8 py-3 font-mono text-sm uppercase hover:border-mbare-accent hover:text-mbare-accent transition-all w-full">Esci</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `font-mono text-sm uppercase w-full text-center ${isActive ? 'text-mbare-accent font-bold' : 'hover:text-mbare-accent'}`} onClick={() => setIsMobileMenuOpen(false)}>Accedi</NavLink>
              <NavLink to="/register" className="bg-mbare-white text-mbare-black px-8 py-3 font-bold uppercase w-full text-center hover:bg-mbare-accent hover:text-white transition-all" onClick={() => setIsMobileMenuOpen(false)}>Registrati</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
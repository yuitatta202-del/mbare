import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { UserProvider, useUser } from './hooks/useUser';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';

// ==========================================
// LAZY LOADING PAGINE
// ==========================================
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const News = lazy(() => import('./pages/News').then(m => ({ default: m.News })));
const NewsDetail = lazy(() => import('./pages/NewsDetail').then(m => ({ default: m.NewsDetail })));
const Spiffera = lazy(() => import('./pages/Spiffera').then(m => ({ default: m.Spiffera })));
const Arcade = lazy(() => import('./pages/Arcade').then(m => ({ default: m.Arcade })));
const Community = lazy(() => import('./pages/Community').then(m => ({ default: m.Community })));
const Bacheca = lazy(() => import('./pages/Bacheca').then(m => ({ default: m.Bacheca })));
const BoardChat = lazy(() => import('./pages/board/BoardChat').then(m => ({ default: m.BoardChat }))); 
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const CreateEvent = lazy(() => import('./pages/CreateEvent').then(m => ({ default: m.CreateEvent })));
const CreateGroup = lazy(() => import('./pages/CreateGroup').then(m => ({ default: m.CreateGroup })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop }))); // <-- AGGIUNTO

// Student Hub (Nested)
const StudentHubLayout = lazy(() => import('./components/student-hub/StudentHubLayout').then(m => ({ default: m.StudentHubLayout })));
const StudentHubDashboard = lazy(() => import('./pages/student-hub/StudentHubDashboard').then(m => ({ default: m.StudentHubDashboard })));
const Ripetizioni = lazy(() => import('./pages/student-hub/Ripetizioni').then(m => ({ default: m.Ripetizioni }))); 
const Dispense = lazy(() => import('./pages/student-hub/Dispense').then(m => ({ default: m.Dispense }))); 
const Esami = lazy(() => import('./pages/student-hub/Esami').then(m => ({ default: m.Esami }))); 
const Stage = lazy(() => import('./pages/student-hub/Stage').then(m => ({ default: m.Stage })));
const Stanze = lazy(() => import('./pages/student-hub/Stanze').then(m => ({ default: m.Stanze })));
const Settings = lazy(() => import('./pages/student-hub/Settings').then(m => ({ default: m.Settings }))); 

// Footer Pages
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ }))); 
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms }))); 
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy }))); 

// ==========================================
// COMPONENTI DI SUPPORTO
// ==========================================
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Aggiorna il titolo della scheda del browser in base alla rotta
function PageTitle() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Mbare | La Casa degli Studenti',
      '/news': 'Mbare | News',
      '/spiffera': 'Mbare | Spiffera',
      '/arcade': 'Mbare | Arcade',
      '/community': 'Mbare | Community',
      '/bacheca': 'Mbare | Bacheca',
      '/student-hub': 'Mbare | Student Hub',
      '/student-hub/ripetizioni': 'Mbare | Ripetizioni',
      '/student-hub/dispense': 'Mbare | Dispense',
      '/student-hub/esami': 'Mbare | Prove d\'Esame',
      '/student-hub/stage': 'Mbare | Stage & Lavoro',
      '/student-hub/stanze': 'Mbare | Cerco/Offro Stanze',
      '/student-hub/settings': 'Mbare | Personalizzazione',
      '/profile': 'Mbare | Profilo',
      '/chat': 'Mbare | Chat',
      '/shop': 'Mbare | Acquista Coin', // <-- AGGIUNTO
      '/super-admin': 'Mbare | Admin Dashboard',
      '/login': 'Mbare | Accedi',
      '/register': 'Mbare | Registrati',
      '/faq': 'Mbare | FAQ',
      '/terms': 'Mbare | Termini di Servizio',
      '/privacy': 'Mbare | Privacy Policy',
    };
    
    // Titolo generico per la chat (rotta dinamica)
    if (pathname.startsWith('/board/') && pathname.endsWith('/chat')) {
      document.title = 'Mbare | Trattativa in corso';
    } else {
      document.title = titles[pathname] || 'Mbare | Pagina non trovata';
    }
  }, [pathname]);
  
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-mbare-muted font-mono uppercase tracking-widest animate-pulse">
      Caricamento...
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center">
      <h1 className="text-[15vw] font-display font-bold leading-none text-mbare-border">404</h1>
      <p className="text-2xl md:text-3xl font-mono text-mbare-accent uppercase mt-4 max-w-lg">Minchia! Ti sei perso?</p>
      <p className="text-lg text-mbare-muted font-sans mt-2">'Sta pagina nun esisti. Forse hai sbagliato a scrivere, o forse è colpa del wifi.</p>
      <Link to="/" className="mt-8 bg-mbare-white text-mbare-black px-8 py-4 font-bold uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-colors border-2 border-mbare-white hover:border-mbare-accent">
        Torna alla Home
      </Link>
    </div>
  );
}

function Unauthorized({ requiredRole }: { requiredRole: string }) {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-[15vw] md:text-[10rem] font-display font-bold leading-none text-mbare-border mb-2">403</h1>
      <p className="text-2xl md:text-4xl font-mono text-mbare-accent uppercase mb-4">Accesso Negato</p>
      <p className="text-lg text-mbare-muted font-sans mb-8 max-w-md">
        'Sta sezione è riservata a <span className="text-mbare-white font-bold uppercase">{requiredRole}</span>. 
        Se pensi sia un errore, contatta un admin o aggiorna il tuo profilo.
      </p>
      <div className="flex flex-col md:flex-row gap-4">
        <Link to="/profile" className="bg-mbare-accent text-black px-8 py-3 font-bold uppercase hover:bg-white transition-colors">
          Vai al Profilo
        </Link>
        <Link to="/" className="border-2 border-mbare-border text-mbare-white px-8 py-3 font-bold uppercase hover:border-mbare-accent transition-colors">
          Torna alla Home
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// ROUTE PROTECTION
// ==========================================
function ProtectedSuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useUser();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-mbare-muted font-mono">Verifica permessi...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(role as string)) {
    return <Unauthorized requiredRole="Staff (Admin o Moderatori)" />;
  }
  return <>{children}</>;
}

function ProtectedStudentRoute({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useUser();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-mbare-muted font-mono">Verifica credenziali...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!['STUDENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(role as string)) {
    return <Unauthorized requiredRole="Studenti verificati" />;
  }
  return <>{children}</>;
}

// ==========================================
// APP
// ==========================================
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <BrowserRouter>
            <ScrollToTop />
            <PageTitle />
            <CustomCursor />
            
            <div className="min-h-screen flex flex-col bg-mbare-black text-mbare-white selection:bg-mbare-accent selection:text-white cursor-none">
              <Navbar />
              
              <main className="flex-grow">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* ========================================== */}
                    {/* ROTTE PUBBLICHE */}
                    {/* ========================================== */}
                    <Route path="/" element={<Home />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:slug" element={<NewsDetail />} />
                    <Route path="/spiffera" element={<Spiffera />} />
                    <Route path="/confessioni" element={<Navigate to="/spiffera" replace />} />
                    <Route path="/arcade" element={<Arcade />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/bacheca" element={<Bacheca />} />
                    <Route path="/community/bacheca" element={<Navigate to="/bacheca" replace />} /> 
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/shop" element={<Shop />} /> {/* <-- AGGIUNTO */}
                    
                    {/* ========================================== */}
                    {/* ROTTE FOOTER (Pubbliche) */}
                    {/* ========================================== */}
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/cookies" element={<Privacy />} /> 
                    
                    {/* ========================================== */}
                    {/* ROTTE STUDENTI */}
                    {/* ========================================== */}
                    <Route path="/community/create" element={<ProtectedStudentRoute><CreateEvent /></ProtectedStudentRoute>} />
                    <Route path="/community/create-group" element={<ProtectedStudentRoute><CreateGroup /></ProtectedStudentRoute>} />
                    <Route path="/profile" element={<ProtectedStudentRoute><Profile /></ProtectedStudentRoute>} />
                    <Route path="/chat" element={<ProtectedStudentRoute><Chat /></ProtectedStudentRoute>} />
                    
                    {/* Chat contestuale per un annuncio della Bacheca */}
                    <Route path="/board/:postId/chat" element={<ProtectedStudentRoute><BoardChat /></ProtectedStudentRoute>} />
                    
                    {/* ========================================== */}
                    {/* STUDENT HUB (Nested Routes con Layout) */}
                    {/* ========================================== */}
                    <Route 
                      path="/student-hub" 
                      element={
                        <ProtectedStudentRoute>
                          <StudentHubLayout />
                        </ProtectedStudentRoute>
                      }
                    >
                      <Route index element={<StudentHubDashboard />} />
                      <Route path="ripetizioni" element={<Ripetizioni />} />
                      <Route path="dispense" element={<Dispense />} />
                      <Route path="esami" element={<Esami />} />
                      <Route path="stage" element={<Stage />} />
                      <Route path="stanze" element={<Stanze />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                    
                    {/* ========================================== */}
                    {/* ROTTE ADMIN */}
                    {/* ========================================== */}
                    <Route path="/super-admin" element={<ProtectedSuperAdminRoute><SuperAdminDashboard /></ProtectedSuperAdminRoute>} />
                    <Route path="/admin" element={<Navigate to="/super-admin" replace />} />

                    {/* ========================================== */}
                    {/* 404 - CATCH ALL */}
                    {/* ========================================== */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              
              <Footer />
            </div>
          </BrowserRouter>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
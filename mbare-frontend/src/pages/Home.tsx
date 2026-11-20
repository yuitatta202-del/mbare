
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScrambleText } from '../components/ScrambleText';

const HOME_TITLE =
  'MBARE | Community, Notizie ed Eventi per Studenti Universitari';

const HOME_DESCRIPTION =
  "MBARE è la community degli studenti universitari: " +
  "scopri notizie, eventi, gruppi di studio, annunci " +
  "e confessioni. Vivi l'università senza filtri.";

const HOME_URL = 'https://mbare.site/';

function useHomeSEO() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = HOME_TITLE;

    let description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );

    const createdDescription = !description;
    const previousDescription =
      description?.getAttribute('content') ?? null;

    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }

    description.content = HOME_DESCRIPTION;

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );

    const createdCanonical = !canonical;
    const previousCanonical =
      canonical?.getAttribute('href') ?? null;

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = HOME_URL;

    return () => {
      document.title = previousTitle;

      if (createdDescription) {
        description?.remove();
      } else if (description) {
        if (previousDescription === null) {
          description.removeAttribute('content');
        } else {
          description.content = previousDescription;
        }
      }

      if (createdCanonical) {
        canonical?.remove();
      } else if (canonical) {
        if (previousCanonical === null) {
          canonical.removeAttribute('href');
        } else {
          canonical.setAttribute('href', previousCanonical);
        }
      }
    };
  }, []);
}

const HOME_SECTIONS = [
  {
    title: 'News universitarie e attualità',
    description:
      'Scopri notizie, curiosità e approfondimenti per studenti universitari.',
    url: '/news',
    action: 'Leggi le news',
    icon: '📰'
  },
  {
    title: 'Community e gruppi di studio',
    description:
      'Conosci altri studenti, partecipa agli eventi e trova persone con i tuoi interessi.',
    url: '/community',
    action: 'Esplora la community',
    icon: '🎓'
  },
  {
    title: 'Spiffera: confessioni anonime',
    description:
      'Leggi e condividi pensieri e confessioni nella community universitaria.',
    url: '/spiffera',
    action: 'Scopri Spiffera',
    icon: '💬'
  },
  {
    title: 'Bacheca universitaria',
    description:
      'Cerca annunci, opportunità, materiali di studio e offerte della community.',
    url: '/bacheca',
    action: 'Visita la bacheca',
    icon: '📌'
  }
];

export function Home() {
  useHomeSEO();

  return (
    <main className="relative min-h-screen bg-mbare-black text-mbare-white overflow-hidden">

      {/* HERO */}
      <section
        aria-labelledby="home-title"
        className="relative min-h-[85vh] flex flex-col items-center justify-center pt-32 pb-20 px-6"
      >

        {/* TESTO DECORATIVO: NON È UN H1 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden"
        >
          <span className="text-[35vw] font-display font-bold leading-none tracking-tighter">
            MBARE
          </span>
        </div>

        <div className="relative z-10 text-center flex flex-col items-center w-full max-w-6xl">

          {/* IDENTITÀ DEL BRAND */}
          <p className="font-mono text-xs md:text-sm text-mbare-accent uppercase tracking-[0.3em] mb-8">
            La community universitaria senza filtri
          </p>

          {/* SLOGAN ANIMATO ORIGINALE */}
          <div
            aria-hidden="true"
            className="text-5xl sm:text-7xl md:text-[7rem] lg:text-[8rem] xl:text-[9rem] font-display font-bold leading-[0.85] tracking-tighter uppercase mb-10 flex flex-col items-center"
          >
            <ScrambleText text="U Campus" />

            <span className="text-mbare-accent">
              <ScrambleText text="To." />
            </span>

            <ScrambleText text="Spacchioso." />
          </div>

          {/* H1 SEO VISIBILE E DESCRITTIVO */}
          <h1
            id="home-title"
            className="text-xl md:text-3xl font-display font-bold uppercase tracking-tight max-w-4xl mb-6"
          >
            MBARE: la community degli studenti universitari
          </h1>

          {/* TESTO INTRODUTTIVO */}
          <p className="text-lg md:text-2xl text-mbare-muted max-w-3xl mx-auto mb-12 font-sans font-medium px-4 leading-relaxed">
            Notizie universitarie, confessioni, eventi,
            gruppi di studio e annunci in un unico posto.

            <span className="text-mbare-white font-bold">
              {' '}Tutto quello che ti serve per vivere
              l'università a modo tuo.
            </span>
          </p>

          {/* CTA */}
          <nav
            aria-label="Scopri MBARE"
            className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-3xl"
          >
            <Link
              to="/community"
              className="bg-mbare-white text-mbare-black px-10 py-5 text-lg md:text-xl font-bold uppercase tracking-tighter hover:bg-mbare-accent hover:text-white transition-all duration-200 border-2 border-mbare-white hover:border-mbare-accent w-full sm:w-auto text-center"
            >
              Esplora la Community
            </Link>

            <Link
              to="/news"
              className="bg-transparent text-mbare-white px-10 py-5 text-lg md:text-xl font-bold uppercase tracking-tighter border-2 border-mbare-border hover:border-mbare-white transition-all duration-200 w-full sm:w-auto text-center"
            >
              Leggi le News
            </Link>
          </nav>

        </div>
      </section>

      {/* INTRODUZIONE AL PROGETTO */}
      <section
        aria-labelledby="about-mbare"
        className="relative px-6 py-20 border-t border-mbare-border"
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">

            <p className="font-mono text-xs uppercase tracking-widest text-mbare-accent mb-5">
              Cos'è MBARE
            </p>

            <h2
              id="about-mbare"
              className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter leading-tight mb-6"
            >
              La vita universitaria.
              <span className="text-mbare-accent"> Senza filtri.</span>
            </h2>

            <p className="text-mbare-muted font-sans text-lg leading-relaxed">
              MBARE è uno spazio digitale pensato
              per gli studenti universitari che vogliono
              informarsi, incontrare nuove persone,
              condividere esperienze e partecipare
              alla vita della community.

              Tra notizie, gruppi di studio,
              eventi e annunci, puoi trovare
              nuove occasioni per vivere
              l'università oltre le lezioni.
            </p>

          </div>
        </div>
      </section>

      {/* LINK INTERNI ALLE SEZIONI */}
      <section
        aria-labelledby="explore-mbare"
        className="px-6 py-20 bg-mbare-surface/30 border-t border-mbare-border"
      >
        <div className="max-w-7xl mx-auto">

          <div className="mb-12">
            <p className="font-mono text-xs text-mbare-accent uppercase tracking-widest mb-4">
              Esplora la piattaforma
            </p>

            <h2
              id="explore-mbare"
              className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter"
            >
              Tutto MBARE
              <span className="text-mbare-accent">.</span>
            </h2>

            <p className="text-mbare-muted font-sans text-lg mt-4 max-w-2xl">
              Scopri le sezioni della piattaforma
              e trova quello che fa per te.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {HOME_SECTIONS.map(section => (
              <article
                key={section.url}
                className="group border-2 border-mbare-border bg-mbare-surface p-7 md:p-9 hover:border-mbare-accent transition-colors flex flex-col"
              >
                <span
                  aria-hidden="true"
                  className="text-3xl mb-6"
                >
                  {section.icon}
                </span>

                <h3 className="font-display font-bold uppercase text-2xl md:text-3xl mb-4 group-hover:text-mbare-accent transition-colors">
                  {section.title}
                </h3>

                <p className="text-mbare-muted font-sans leading-relaxed mb-8 flex-1">
                  {section.description}
                </p>

                <Link
                  to={section.url}
                  className="inline-flex items-center gap-3 font-mono text-xs uppercase font-bold text-mbare-accent hover:text-mbare-white transition-colors"
                >
                  {section.action}
                  <span aria-hidden="true">→</span>
                </Link>

              </article>
            ))}

          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="px-6 py-20 md:py-28 text-center border-t border-mbare-border">
        <div className="max-w-4xl mx-auto">

          <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-6">
            Non restare a guardare
            <span className="text-mbare-accent">.</span>
          </h2>

          <p className="text-mbare-muted text-lg mb-10">
            Esplora gli eventi, incontra altri studenti
            e partecipa alla community MBARE.
          </p>

          <Link
            to="/community"
            className="inline-block bg-mbare-accent text-black px-10 py-5 font-display font-bold uppercase text-lg hover:bg-white transition-colors"
          >
            Entra nella Community
          </Link>

        </div>
      </section>

    </main>
  );
}

export default Home;

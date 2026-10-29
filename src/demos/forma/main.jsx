import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowUp,
  ArrowLeft,
  Menu,
  X,
  Pause,
  Play,
  Maximize2,
  Copy,
  Download,
  Check,
} from "lucide-react";
import "@fontsource-variable/dm-sans";
import { projects } from "./projects";
import {
  responsiveImage,
  CARD_IMAGE_SIZES,
  FEATURED_IMAGE_SIZES,
} from "./images";
import "./styles.css";

const portfolio = "/#contatti";
const navigation = [
  ["/progetti", "Progetti"],
  ["/studio", "Lo studio"],
  ["/contatti", "Contatti"],
];
function readRoute() {
  const raw = location.hash.slice(1) || "/";
  const [path, search = ""] = raw.split("?");
  return {
    path: path.replace(/\/$/, "") || "/",
    params: new URLSearchParams(search),
  };
}
function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return route;
}
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
function useReveal(path, reduced) {
  useEffect(() => {
    if (reduced) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".forma-reveal")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [path, reduced]);
}
function useParallax(ref, disabled) {
  useEffect(() => {
    const node = ref.current;
    if (!node || disabled) return;
    let frame = 0,
      top = 0,
      height = 0,
      viewport = innerHeight;
    const paint = () => {
      frame = 0;
      const progress = Math.max(
        -1,
        Math.min(
          1,
          (scrollY + viewport * 0.5 - top - height * 0.5) / (viewport + height),
        ),
      );
      node.style.setProperty("--photo-shift", `${progress * 65}px`);
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const measure = () => {
      const rect = node.getBoundingClientRect();
      top = rect.top + scrollY;
      height = rect.height;
      viewport = innerHeight;
      scroll();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(node);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", measure);
    };
  }, [ref, disabled]);
}
function RouteLink({ to, className = "", children, ...props }) {
  return (
    <a href={`#${to}`} className={className} {...props}>
      {children}
    </a>
  );
}
function Eyebrow({ children, number }) {
  return (
    <p className="forma-eyebrow">
      {number && <span>{number} /</span>}
      {children}
    </p>
  );
}
function ProjectCard({ project, featured = false }) {
  return (
    <article
      className={`forma-project-card forma-reveal${featured ? " forma-project-featured" : ""}`}
    >
      <RouteLink
        to={`/progetti/${project.id}`}
        className="forma-project-photo"
        aria-label={`Esplora ${project.title}`}
      >
        <img
          {...responsiveImage(
            project,
            featured ? FEATURED_IMAGE_SIZES : CARD_IMAGE_SIZES,
          )}
          width="1536"
          height="1024"
          alt={project.imageAlt}
          loading="lazy"
          style={{ objectPosition: project.position }}
        />
        <span className="forma-project-arrow" aria-hidden="true">
          <ArrowUpRight />
        </span>
        <span className="forma-photo-tag">CONCEPT {project.number}</span>
      </RouteLink>
      <div className="forma-project-meta">
        <div>
          <RouteLink to={`/progetti/${project.id}`}>
            <h3>{project.title}</h3>
          </RouteLink>
          <p>{project.subtitle}</p>
        </div>
        <span>{project.category}</span>
      </div>
    </article>
  );
}
function Header({ path, paused, onPause }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const header = useRef(null);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = [...document.querySelectorAll("main,footer")];
    background.forEach((el) => (el.inert = true));
    const frame = requestAnimationFrame(() =>
      header.current?.querySelector(".forma-mobile-menu a")?.focus(),
    );
    const key = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === "Tab") {
        const nodes = [...header.current.querySelectorAll("a,button")].filter(
          (el) => el.getClientRects().length,
        );
        if (event.shiftKey && document.activeElement === nodes[0]) {
          event.preventDefault();
          nodes[nodes.length - 1]?.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === nodes[nodes.length - 1]
        ) {
          event.preventDefault();
          nodes[0]?.focus();
        }
      }
    };
    const media = matchMedia("(min-width: 801px)");
    const resize = () => {
      if (media.matches) setOpen(false);
    };
    document.addEventListener("keydown", key);
    media.addEventListener("change", resize);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = oldOverflow;
      background.forEach((el) => (el.inert = false));
      document.removeEventListener("keydown", key);
      media.removeEventListener("change", resize);
    };
  }, [open]);
  return (
    <header className="forma-header" ref={header}>
      <div className="forma-demo-bar">
        <span>Progetto personale dimostrativo</span>
        <a href="/">
          Torna al portfolio <ArrowUpRight size={12} />
        </a>
      </div>
      <div className="forma-header-main forma-shell">
        <RouteLink
          to="/"
          className="forma-logo"
          aria-label="Forma Studio, homepage"
        >
          forma<span>.</span>
          <small>ARCHITECTURE STUDIO — CONCEPT</small>
        </RouteLink>
        <nav
          className="forma-desktop-nav"
          aria-label="Navigazione principale della demo"
        >
          {navigation.map(([to, label]) => (
            <RouteLink
              key={to}
              to={to}
              aria-current={path.startsWith(to) ? "page" : undefined}
            >
              {label}
            </RouteLink>
          ))}
        </nav>
        <div className="forma-header-tools">
          <button
            className="forma-motion-button"
            onClick={onPause}
            aria-label={
              paused
                ? "Riprendi animazioni della demo"
                : "Pausa animazioni della demo"
            }
            aria-pressed={paused}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            ref={toggle}
            className="forma-menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Chiudi menu Forma" : "Apri menu Forma"}
            aria-expanded={open}
            aria-controls="forma-mobile-menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <nav
        id="forma-mobile-menu"
        className="forma-mobile-menu"
        aria-label="Navigazione mobile della demo"
        hidden={!open}
      >
        {navigation.map(([to, label], index) => (
          <RouteLink
            to={to}
            key={to}
            onClick={() => setOpen(false)}
            aria-current={path.startsWith(to) ? "page" : undefined}
          >
            <span>0{index + 1}</span>
            {label}
            <ArrowUpRight />
          </RouteLink>
        ))}
        <a href="/" className="forma-mobile-portfolio">
          Il portfolio di Kirill <ArrowUpRight />
        </a>
        <p>
          Forma è un brand immaginario.
          <br />
          Esplora una demo completa, dall’idea al contatto.
        </p>
      </nav>
    </header>
  );
}
function Home({ staticMotion }) {
  const image = useRef(null);
  useParallax(image, staticMotion);
  return (
    <>
      <section className="forma-home-intro forma-shell">
        <div className="forma-home-heading">
          <Eyebrow>Architettura. Luce. Materia.</Eyebrow>
          <h1
            data-page-title
            tabIndex={-1}
            aria-label="Spazi da abitare. Tempo da ritrovare."
          >
            Spazi da abitare.
            <br />
            <em>Tempo da ritrovare.</em>
          </h1>
        </div>
        <p>
          Una direzione architettonica essenziale. <br />
          Per dare spazio alla vita, con misura.
        </p>
      </section>
      <section
        className="forma-hero-photo forma-shell"
        aria-label="Il progetto in apertura"
      >
        <RouteLink
          to="/progetti/villa-silenzio"
          className="forma-hero-photo-link"
          aria-label="Scopri il concept Villa Silenzio"
        >
          <div className="forma-parallax-photo" ref={image}>
            <img
              {...responsiveImage(projects[0])}
              alt={projects[0].imageAlt}
              width="1536"
              height="1024"
              fetchPriority="high"
            />
          </div>
          <span className="forma-hero-overlay">
            <span>
              <small>IN PRIMO PIANO / CONCEPT 01</small>
              <strong>Villa Silenzio</strong>
            </span>
            <span className="forma-round-arrow">
              <ArrowUpRight />
            </span>
          </span>
        </RouteLink>
        <div className="forma-image-caption">
          <span>Un dialogo tra natura e forma.</span>
          <span>Visualizzazione di un progetto immaginario.</span>
        </div>
      </section>
      <section className="forma-introduction forma-shell forma-reveal">
        <Eyebrow number="01">La direzione</Eyebrow>
        <div>
          <h2>
            Non aggiungere rumore.
            <br />
            <em>Trovare un equilibrio.</em>
          </h2>
          <div className="forma-introduction-copy">
            <p>
              Forma esplora un’architettura fatta di luce naturale, materiali
              sinceri e proporzioni che lasciano respirare lo spazio.
            </p>
            <p>
              Questa è una demo di Kirill Bielokon: uno studio immaginario,
              raccontato attraverso un sito completo. Ogni progetto è un concept
              personale.
            </p>
            <RouteLink to="/studio" className="forma-text-link">
              Dentro lo studio <ArrowUpRight />
            </RouteLink>
          </div>
        </div>
      </section>
      <section className="forma-selected forma-shell">
        <div className="forma-section-head forma-reveal">
          <div>
            <Eyebrow number="02">Esplorazioni</Eyebrow>
            <h2>
              Tre modi di leggere
              <br />
              <em>lo spazio.</em>
            </h2>
          </div>
          <RouteLink to="/progetti" className="forma-text-link">
            Tutti i progetti <ArrowUpRight />
          </RouteLink>
        </div>
        <div className="forma-home-projects">
          <ProjectCard project={projects[1]} />
          <ProjectCard project={projects[2]} />
        </div>
      </section>
      <section className="forma-home-quote forma-reveal">
        <div className="forma-shell">
          <Eyebrow>Un’idea di abitare</Eyebrow>
          <p>
            La qualità di uno spazio <br />
            si sente anche nelle cose <br />
            <em>che scegli di lasciare fuori.</em>
          </p>
          <RouteLink to="/studio" className="forma-text-link">
            Il pensiero dietro la forma <ArrowRight />
          </RouteLink>
        </div>
        <span aria-hidden="true" className="forma-quote-orbit" />
      </section>
      <Invitation />
    </>
  );
}
function Projects() {
  const [filter, setFilter] = useState("Tutti");
  const filtered =
    filter === "Tutti"
      ? projects
      : projects.filter((project) => project.category === filter);
  return (
    <>
      <section className="forma-page-heading forma-shell">
        <Eyebrow>Esplorazioni / 01—03</Eyebrow>
        <h1 data-page-title tabIndex={-1}>
          Ogni spazio,
          <br />
          <em>una possibilità.</em>
        </h1>
        <p>
          Tre concept architettonici. Tre modi di mettere in relazione materia,
          luce e vita quotidiana.
        </p>
      </section>
      <section
        className="forma-project-index forma-shell"
        aria-labelledby="forma-project-index-title"
      >
        <div className="forma-filter-row">
          <h2 id="forma-project-index-title" className="forma-sr-only">
            Progetti di Forma Studio
          </h2>
          <div
            className="forma-filters"
            role="group"
            aria-label="Filtra i progetti per tipologia"
          >
            {["Tutti", "Residenziale", "Interni", "Spazi condivisi"].map(
              (label) => (
                <button
                  key={label}
                  aria-pressed={filter === label}
                  onClick={() => setFilter(label)}
                >
                  {label}
                </button>
              ),
            )}
          </div>
          <span className="forma-project-count" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "progetto" : "progetti"}
          </span>
        </div>
        <div className="forma-project-grid" key={filter}>
          {filtered.map((project) => (
            <ProjectCard
              project={project}
              key={project.id}
              featured={
                filtered.length > 1 && project.id === "padiglione-comune"
              }
            />
          ))}
        </div>
        <p className="forma-project-disclosure">
          Progetti personali dimostrativi per un brand immaginario. Le immagini
          sono visualizzazioni illustrative, non fotografie di lavori
          commissionati o realizzati.
        </p>
      </section>
      <Invitation />
    </>
  );
}
function ProjectDetail({ project, onZoom }) {
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <>
      <section className="forma-detail-heading forma-shell">
        <RouteLink to="/progetti" className="forma-back-link">
          <ArrowLeft size={14} />
          Tutti i progetti
        </RouteLink>
        <div>
          <div>
            <Eyebrow>
              Concept {project.number} / {project.category}
            </Eyebrow>
            <h1 data-page-title tabIndex={-1}>
              {project.title}
              <em>.</em>
            </h1>
          </div>
          <p>{project.subtitle}</p>
        </div>
      </section>
      <figure className="forma-detail-hero forma-shell">
        <button
          className="forma-zoom-photo"
          onClick={() => onZoom(project)}
          aria-label={`Ingrandisci la visualizzazione di ${project.title}`}
        >
          <img
            {...responsiveImage(project)}
            alt={project.imageAlt}
            width="1536"
            height="1024"
            fetchPriority="high"
            style={{ objectPosition: project.position }}
          />
          <span className="forma-zoom-label">
            <Maximize2 size={15} />
            Esplora l’immagine
          </span>
        </button>
        <figcaption>
          <span>{project.title} / Visualizzazione illustrativa</span>
          <span>Progetto personale dimostrativo</span>
        </figcaption>
      </figure>
      <section className="forma-project-story forma-shell">
        <aside className="forma-project-facts forma-reveal">
          <Eyebrow>Il concept in breve</Eyebrow>
          <dl>
            <div>
              <dt>Tipologia</dt>
              <dd>{project.category}</dd>
            </div>
            <div>
              <dt>Materia</dt>
              <dd>{project.materials}</dd>
            </div>
            <div>
              <dt>Atmosfera</dt>
              <dd>{project.atmosphere}</dd>
            </div>
            <div>
              <dt>Stato</dt>
              <dd>Studio personale, non realizzato</dd>
            </div>
          </dl>
          <RouteLink
            to={`/contatti?progetto=${project.id}`}
            className="forma-text-link"
          >
            Partiamo da questa idea <ArrowUpRight />
          </RouteLink>
        </aside>
        <div className="forma-story-copy">
          <div className="forma-reveal">
            <Eyebrow number="01">Il punto di partenza</Eyebrow>
            <h2>{project.subtitle}</h2>
            <p>{project.intro}</p>
          </div>
          <div className="forma-reveal">
            <Eyebrow number="02">L’idea</Eyebrow>
            <p>{project.idea}</p>
          </div>
          <div className="forma-reveal">
            <Eyebrow number="03">Luce e materia</Eyebrow>
            <p>{project.material}</p>
          </div>
        </div>
      </section>
      <section className="forma-detail-pair forma-shell forma-reveal">
        <div className="forma-detail-crop">
          <img
            {...responsiveImage(project)}
            alt={`Dettaglio della visualizzazione di ${project.title}`}
            width="1536"
            height="1024"
            loading="lazy"
            style={{ objectPosition: "72% 63%" }}
          />
          <span>Un dettaglio della stessa visualizzazione.</span>
        </div>
        <div>
          <Eyebrow>Guardare più da vicino</Eyebrow>
          <h2>
            È nei dettagli
            <br />
            <em>che tutto si tiene.</em>
          </h2>
          <p>{project.detail}</p>
          <p className="forma-small-note">
            Immagini illustrative generate per il concept. Non descrivono un
            edificio realizzato, un incarico o un cliente reale.
          </p>
        </div>
      </section>
      <section className="forma-next-project forma-shell forma-reveal">
        <Eyebrow>Continua a esplorare</Eyebrow>
        <RouteLink to={`/progetti/${next.id}`}>
          <span>
            <small>PROSSIMO CONCEPT / {next.number}</small>
            <strong>{next.title}</strong>
          </span>
          <ArrowUpRight />
        </RouteLink>
      </section>
    </>
  );
}
function Studio() {
  return (
    <>
      <section className="forma-page-heading forma-shell">
        <Eyebrow>Lo studio / Una direzione immaginata</Eyebrow>
        <h1 data-page-title tabIndex={-1}>
          La forma segue
          <br />
          <em>il modo di vivere.</em>
        </h1>
        <p>
          Un’idea di architettura che parte dall’ascolto, attraversa la materia
          e trova nella luce il proprio equilibrio.
        </p>
      </section>
      <section className="forma-studio-photo forma-shell forma-reveal">
        <img
          {...responsiveImage(projects[1])}
          width="1536"
          height="1024"
          alt={projects[1].imageAlt}
        />
        <span>LOFT LUCE / VISUALIZZAZIONE DI UN CONCEPT</span>
      </section>
      <section className="forma-studio-manifesto forma-shell">
        <div className="forma-reveal">
          <Eyebrow number="01">Che cos’è Forma</Eyebrow>
          <h2>
            Uno studio immaginario.
            <br />
            <em>Un sito da esplorare davvero.</em>
          </h2>
        </div>
        <div className="forma-reveal">
          <p>
            Forma è un brand creato per questo progetto personale di Kirill
            Bielokon. Non rappresenta uno studio professionale esistente e non
            presenta lavori svolti per clienti.
          </p>
          <p>
            La demo mostra come un’identità visiva può diventare un sito
            completo: contenuti ordinati, progetti navigabili, pagine leggibili
            da telefono e un percorso chiaro verso il contatto.
          </p>
          <p>
            Le immagini sono visualizzazioni illustrative generate per questi
            concept. I testi descrivono idee progettuali, senza attribuire
            risultati, committenti o realizzazioni.
          </p>
        </div>
      </section>
      <section className="forma-principles forma-shell">
        <div className="forma-section-head forma-reveal">
          <div>
            <Eyebrow number="02">Il pensiero del concept</Eyebrow>
            <h2>
              Poche scelte.
              <br />
              <em>Con un motivo.</em>
            </h2>
          </div>
        </div>
        <div className="forma-principle-grid">
          {[
            [
              "Ascolto",
              "Prima di disegnare, una domanda: che cosa deve rendere possibile questo spazio?",
            ],
            [
              "Materia",
              "Una palette essenziale, in cui ogni superficie contribuisce al carattere dell’insieme.",
            ],
            [
              "Luce",
              "Le aperture come parte del progetto: orientano lo sguardo e danno ritmo al tempo.",
            ],
            [
              "Equilibrio",
              "Proporzioni, pieni e vuoti. Togliere ciò che distrae per lasciare spazio a ciò che conta.",
            ],
          ].map(([title, text], i) => (
            <article className="forma-reveal" key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="forma-demo-explanation forma-shell forma-reveal">
        <div>
          <Eyebrow>Continua la visita</Eyebrow>
          <h2>
            Dall’ispirazione
            <br />
            <em>al primo contatto.</em>
          </h2>
        </div>
        <div>
          <p>
            Esplora i concept, entra nelle loro scelte e prova il percorso verso
            una richiesta. Ogni pagina racconta la stessa direzione, anche da
            telefono.
          </p>
          <p>
            Per un progetto reale, puoi tornare al portfolio e parlare
            direttamente con Kirill.
          </p>
          <a href={portfolio} className="forma-text-link">
            Parla con Kirill di un sito reale <ArrowUpRight />
          </a>
        </div>
      </section>
      <Invitation />
    </>
  );
}
function Contact({ projectId }) {
  const initial = projects.some((project) => project.id === projectId)
    ? projectId
    : "";
  const [form, setForm] = useState({
    name: "",
    email: "",
    type:
      projects.find((project) => project.id === initial)?.category ||
      "Residenziale",
    reference: initial,
    message: "",
  });
  const [ready, setReady] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const summaryHeading = useRef(null);
  const nameInput = useRef(null);
  const wasReady = useRef(false);
  const selected = projects.find((project) => project.id === form.reference);
  const summary = `FORMA — RIEPILOGO DIMOSTRATIVO\n\nNome: ${form.name}\nEmail: ${form.email}\nTipo di spazio: ${form.type}\n${selected ? `Concept di riferimento: ${selected.title}\n` : ""}\n${form.message}\n\nQuesto riepilogo è stato preparato nel browser. Nessun messaggio è stato inviato.`;
  useEffect(() => {
    if (ready) summaryHeading.current?.focus({ preventScroll: true });
    else if (wasReady.current)
      nameInput.current?.focus({ preventScroll: true });
    wasReady.current = ready;
  }, [ready]);
  function change(event) {
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([summary], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "forma-progetto-demo.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("Riepilogo copiato.");
    } catch {
      setCopyStatus(
        "La copia non è disponibile in questo browser. Puoi scaricare il riepilogo oppure selezionare il testo.",
      );
    }
  }
  return (
    <>
      <section className="forma-page-heading forma-shell">
        <Eyebrow>Contatti / Prova il percorso</Eyebrow>
        <h1 data-page-title tabIndex={-1}>
          Ogni spazio parte
          <br />
          <em>da un dialogo.</em>
        </h1>
        <p>
          Una buona domanda è già un punto di partenza. Qui puoi provare come si
          prepara una richiesta completa.
        </p>
      </section>
      <section className="forma-contact-grid forma-shell">
        <aside className="forma-contact-info">
          <Eyebrow>Prima di cominciare</Eyebrow>
          <h2>
            Questo modulo
            <br />
            <em>è una dimostrazione.</em>
          </h2>
          <p>
            I dati vengono utilizzati solo per comporre un riepilogo nel tuo
            browser. Non vengono inviati, salvati sul server o registrati.
          </p>
          <p>
            Non serve inserire dati reali per provare. Nella demo puoi usare,
            per esempio, <strong>nome@example.com</strong>.
          </p>
          <div className="forma-real-contact">
            <span>HAI UN PROGETTO WEB REALE?</span>
            <p>
              Forma è immaginario.
              <br />
              Kirill è la persona con cui parlarne.
            </p>
            <a href={portfolio} className="forma-text-link">
              Contatta Kirill <ArrowUpRight />
            </a>
          </div>
        </aside>
        <div className="forma-contact-workspace">
          {!ready ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setCopyStatus("");
                setReady(true);
              }}
            >
              <div className="forma-form-intro">
                <span>01 / RACCONTACI L’IDEA</span>
                <p>I campi con * sono obbligatori.</p>
              </div>
              <div className="forma-form-row">
                <label>
                  Nome *
                  <input
                    ref={nameInput}
                    name="name"
                    value={form.name}
                    onChange={change}
                    placeholder="Il tuo nome"
                    autoComplete="name"
                    required
                    maxLength={100}
                  />
                </label>
                <label>
                  Email *
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={change}
                    placeholder="nome@example.com"
                    autoComplete="email"
                    required
                    maxLength={200}
                  />
                </label>
              </div>
              <div className="forma-form-row">
                <label>
                  Tipo di spazio
                  <select name="type" value={form.type} onChange={change}>
                    {[
                      "Residenziale",
                      "Interni",
                      "Spazi condivisi",
                      "Da definire",
                    ].map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Un concept ti ha ispirato?
                  <select
                    name="reference"
                    value={form.reference}
                    onChange={change}
                  >
                    <option value="">Nessun riferimento</option>
                    {projects.map((project) => (
                      <option value={project.id} key={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                La tua idea *
                <textarea
                  name="message"
                  value={form.message}
                  onChange={change}
                  placeholder="Che cosa immagini? Quali esigenze vorresti risolvere?"
                  rows={6}
                  minLength={15}
                  maxLength={3000}
                  required
                />
              </label>
              <p className="forma-form-note">
                Prepari soltanto un’anteprima locale. Questo pulsante non invia
                email o richieste.
              </p>
              <button
                className="forma-button forma-button-dark forma-form-submit"
                type="submit"
              >
                Prepara il riepilogo <ArrowUpRight size={18} />
              </button>
            </form>
          ) : (
            <div className="forma-summary">
              <span className="forma-summary-symbol" aria-hidden="true">
                <Check />
              </span>
              <Eyebrow>02 / Riepilogo pronto</Eyebrow>
              <h2 ref={summaryHeading} tabIndex={-1}>
                La tua idea,
                <br />
                <em>messa in ordine.</em>
              </h2>
              <p>
                Questa è una dimostrazione: nessun messaggio è stato inviato.
                Puoi copiare o scaricare il riepilogo.
              </p>
              <pre tabIndex={0}>{summary}</pre>
              <div className="forma-summary-actions">
                <button
                  className="forma-button forma-button-dark"
                  onClick={copy}
                >
                  <Copy size={16} />
                  Copia il riepilogo
                </button>
                <button
                  className="forma-button forma-button-outline"
                  onClick={download}
                >
                  <Download size={16} />
                  Scarica il riepilogo
                </button>
              </div>
              <p className="forma-copy-status" role="status">
                {copyStatus}
              </p>
              <button
                className="forma-text-link"
                onClick={() => setReady(false)}
              >
                <ArrowLeft size={15} />
                Torna al modulo
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
function Invitation() {
  return (
    <section className="forma-invitation forma-shell forma-reveal">
      <div>
        <Eyebrow>Il prossimo passo</Eyebrow>
        <h2>
          Da un’idea,
          <br />
          <em>inizia un dialogo.</em>
        </h2>
      </div>
      <RouteLink to="/contatti" className="forma-button forma-button-dark">
        Prova il contatto <ArrowUpRight size={18} />
      </RouteLink>
    </section>
  );
}
function Footer({ staticMotion }) {
  return (
    <footer className="forma-footer">
      <div className="forma-shell">
        <div className="forma-footer-top">
          <RouteLink to="/" className="forma-footer-wordmark">
            forma<span>.</span>
          </RouteLink>
          <div>
            <p>
              Brand immaginario.
              <br />
              Esperienza digitale reale.
            </p>
            <a href="/">
              Il portfolio di Kirill Bielokon <ArrowUpRight size={14} />
            </a>
          </div>
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: staticMotion ? "instant" : "smooth",
              })
            }
            className="forma-back-top"
            aria-label="Torna in alto"
          >
            <ArrowUp size={19} />
          </button>
        </div>
        <div className="forma-footer-bottom">
          <span>Progetto personale dimostrativo di Kirill Bielokon.</span>
          <span>Nessun invio o archiviazione dei dati del modulo.</span>
        </div>
      </div>
    </footer>
  );
}
function Lightbox({ project, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    if (!project) return;
    node.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (node.open) node.close();
      document.body.style.overflow = previous;
    };
  }, [project]);
  return (
    <dialog
      ref={dialog}
      className="forma-lightbox"
      aria-labelledby="forma-lightbox-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <button
        onClick={onClose}
        className="forma-lightbox-close"
        aria-label="Chiudi immagine"
      >
        <X />
      </button>
      {project && (
        <figure>
          <img
            src={project.image}
            alt={project.imageAlt}
            width="1536"
            height="1024"
          />
          <figcaption>
            <h2 id="forma-lightbox-title">{project.title}</h2>
            <p>
              Visualizzazione illustrativa · Progetto personale dimostrativo
            </p>
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}
function NotFound() {
  return (
    <section className="forma-page-heading forma-shell forma-not-found">
      <Eyebrow>Questa pagina non è nella demo</Eyebrow>
      <h1 data-page-title tabIndex={-1}>
        Troviamo un’altra
        <br />
        <em>direzione.</em>
      </h1>
      <RouteLink to="/progetti" className="forma-button forma-button-dark">
        Esplora i progetti <ArrowRight size={18} />
      </RouteLink>
    </section>
  );
}
function App() {
  const route = useRoute();
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [zoom, setZoom] = useState(null);
  const previousPath = useRef(null);
  const staticMotion = paused || reduced;
  useReveal(route.path, staticMotion);
  const detail = projects.find(
    (project) => route.path === `/progetti/${project.id}`,
  );
  useEffect(() => {
    const titles = {
      "/": "Spazi da abitare",
      "/progetti": "Progetti",
      "/studio": "Lo studio",
      "/contatti": "Contatti",
    };
    document.title = `${detail?.title || titles[route.path] || "Pagina non trovata"} — Forma Studio | Demo di Kirill`;
    window.scrollTo({ top: 0, behavior: "instant" });
    setZoom(null);
    if (previousPath.current !== null)
      requestAnimationFrame(() =>
        document
          .querySelector("[data-page-title]")
          ?.focus({ preventScroll: true }),
      );
    previousPath.current = route.path;
  }, [route.path, detail]);
  let page;
  if (route.path === "/") page = <Home staticMotion={staticMotion} />;
  else if (route.path === "/progetti") page = <Projects />;
  else if (route.path === "/studio") page = <Studio />;
  else if (route.path === "/contatti")
    page = (
      <Contact
        key={route.params.get("progetto") || "new"}
        projectId={route.params.get("progetto")}
      />
    );
  else if (detail) page = <ProjectDetail project={detail} onZoom={setZoom} />;
  else page = <NotFound />;
  return (
    <div
      className="forma-app"
      data-motion={staticMotion ? "paused" : "running"}
    >
      <a
        href="#forma-main"
        className="forma-skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("forma-main")?.focus();
        }}
      >
        Vai al contenuto
      </a>
      <Header
        path={route.path}
        paused={paused}
        onPause={() => setPaused((value) => !value)}
      />
      <main
        id="forma-main"
        tabIndex={-1}
        className="forma-page"
        key={route.path}
      >
        {page}
      </main>
      <Footer staticMotion={staticMotion} />
      <Lightbox project={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}
createRoot(document.getElementById("forma-root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

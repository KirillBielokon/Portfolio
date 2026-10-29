import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Menu,
  X,
  Pause,
  Play,
  Check,
  Layers3,
  MessageCircle,
  Mail,
  Code2,
  Compass,
  PackageCheck,
  Plus,
  LockKeyhole,
} from "lucide-react";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/sora";
import HeroScene from "./HeroScene";
import OrbitScene from "./OrbitScene";
import ProofLab from "./ProofLab";
import { ProjectModal, ContactModal } from "./Dialogs";
import { profile, projects, services, faqs } from "./content";
import "./styles.css";

const WHATSAPP =
  `https://wa.me/${profile.whatsappNumber}?text=` +
  encodeURIComponent(
    "Ciao Kirill! Ho visto il tuo portfolio e vorrei parlarti della mia attività.",
  );
const NAV = [
  ["progetti", "Progetti"],
  ["competenze", "Laboratorio"],
  ["approccio", "Chi sono"],
  ["servizi", "Servizi"],
];
const serviceIcons = [Code2, Layers3, Compass];
const SERVICES = services.map((service, index) => ({
  ...service,
  icon: serviceIcons[index],
  items: service.details,
}));
const FAQ = faqs.map(({ q, a }) => [q, a]);

function Mark({ id }) {
  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      {id && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#b9d8ff" />
            <stop offset=".5" stopColor="#7490ff" />
            <stop offset="1" stopColor="#b283ff" />
          </linearGradient>
        </defs>
      )}
      <path d="M4 4h20v36L52 4h24L42 48l36 48H53L24 57v39H4z" />
    </svg>
  );
}
function Logo() {
  return (
    <a
      href="#inizio"
      className="logo"
      aria-label="Kirill Bielokon, torna all’inizio"
    >
      <span className="logo-mark">
        <Mark />
      </span>
      <span className="logo-name">
        kirill
        <br />
        bielokon.
      </span>
    </a>
  );
}
function Header({ onContact }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const main = document.querySelector("main"),
      footer = document.querySelector("footer");
    if (main) main.inert = true;
    if (footer) footer.inert = true;
    const key = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab") {
        const nodes = [
          toggle.current,
          ...panel.current.querySelectorAll("a,button"),
        ].filter(Boolean);
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const mq = window.matchMedia("(min-width:801px)");
    const resize = () => {
      if (mq.matches) setOpen(false);
    };
    document.addEventListener("keydown", key);
    mq.addEventListener("change", resize);
    panel.current?.querySelector("a")?.focus();
    return () => {
      document.body.style.overflow = old;
      if (main) main.inert = false;
      if (footer) footer.inert = false;
      document.removeEventListener("keydown", key);
      mq.removeEventListener("change", resize);
    };
  }, [open]);
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className="header-nav" aria-label="Navigazione principale">
          {NAV.map(([id, label]) => (
            <a href={"#" + id} key={id}>
              {label}
            </a>
          ))}
        </nav>
        <button
          className="button button-primary header-contact"
          onClick={() => onContact()}
        >
          Parliamone <ArrowUpRight />
        </button>
        <button
          ref={toggle}
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Chiudi menu" : "Apri menu"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav
        ref={panel}
        id="mobile-menu"
        className={"mobile-menu" + (open ? " is-open" : "")}
        aria-label="Navigazione mobile"
        hidden={!open}
      >
        {NAV.map(([id, label]) => (
          <a key={id} href={"#" + id} onClick={() => setOpen(false)}>
            {label} <span aria-hidden="true">↗</span>
          </a>
        ))}
        <button
          className="button button-primary"
          onClick={() => {
            setOpen(false);
            onContact();
          }}
        >
          Parliamone <ArrowUpRight />
        </button>
      </nav>
    </header>
  );
}
function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <i className="ambient-orb" />
      <i className="ambient-orb" />
      <i className="ambient-orb" />
    </div>
  );
}
function Hero({ paused, onPause }) {
  const hero = useRef(null);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let viewport = window.innerHeight;
    let previous = -1;
    const draw = () => {
      frame = 0;
      const progress =
        paused || preference.matches
          ? 0
          : Math.min(window.scrollY / viewport, 1);
      if (progress !== previous) {
        hero.current?.style.setProperty("--hero-scroll", String(progress));
        previous = progress;
      }
    };
    const scroll = () => {
      if (
        paused ||
        preference.matches ||
        document.hidden ||
        (window.scrollY >= viewport && previous === 1)
      )
        return;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      viewport = window.innerHeight;
      draw();
    };
    const visibility = () => {
      if (!document.hidden) draw();
    };
    draw();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    preference.addEventListener("change", draw);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      preference.removeEventListener("change", draw);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [paused]);
  return (
    <section
      ref={hero}
      id="inizio"
      className="hero shell"
      aria-labelledby="hero-title"
    >
      <div className="hero-main">
        <div className="hero-copy">
          <p className="eyebrow hero-kicker">
            Kirill Bielokon · Sviluppo web & gestione social
          </p>
          <h1
            id="hero-title"
            className="hero-title-concrete"
            aria-label="Landing page e siti web per la tua attività."
          >
            <span className="title-line">
              <span>Landing page</span>
            </span>
            <span className="title-line">
              <span>e siti web</span>
            </span>
            <span className="title-line">
              <span className="gradient-text">per la tua attività.</span>
            </span>
          </h1>
          <p className="hero-desc">
            Progetto e realizzo pagine che spiegano cosa offri e rendono
            semplice contattarti. Posso affiancarle a contenuti social
            coordinati.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#progetti">
              Guarda i progetti <ArrowDown />
            </a>
            <a
              className="button button-glass hero-secondary"
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
            >
              Parliamo del tuo progetto <ArrowUpRight />
            </a>
          </div>
        </div>
        <div className="hero-art">
          <HeroScene paused={paused} />
          <div className="floating-tag tag-web" aria-hidden="true">
            <Code2 />
            <span>
              Web design<small>Disegnato. Sviluppato. Curato.</small>
            </span>
          </div>
          <div className="floating-tag tag-social" aria-hidden="true">
            <Layers3 />
            <span>
              Social media<small>Un’identità che si riconosce.</small>
            </span>
          </div>
          <span className="scene-caption" aria-hidden="true">
            Una firma. Infinite possibilità.
          </span>
        </div>
      </div>
      <div className="hero-bottom">
        <div className="hero-promises">
          <span>
            <Check />
            Un unico interlocutore
          </span>
          <span>
            <Check />
            Sito e social coordinati
          </span>
          <span>
            <Check />
            Proposta chiara prima di iniziare
          </span>
        </div>
        <a className="scroll-cue" href="#progetti">
          ESPLORA I PROGETTI <ArrowDown />
        </a>
        <button
          className="motion-toggle"
          onClick={onPause}
          aria-pressed={paused}
        >
          {paused ? <Play /> : <Pause />}
          {paused ? "Riprendi animazioni" : "Pausa animazioni"}
        </button>
      </div>
    </section>
  );
}
const depthStates = new WeakMap();
function depthEnter(event) {
  if (
    matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches ||
    document.documentElement.dataset.motion === "paused"
  )
    return;
  const node = event.currentTarget;
  const bounds = node.getBoundingClientRect();
  depthStates.set(node, {
    bounds,
    scrollY: window.scrollY,
    width: window.innerWidth,
    frame: 0,
  });
}
function depthMove(event) {
  const node = event.currentTarget,
    state = depthStates.get(node);
  if (!state) return;
  state.x = event.clientX;
  state.y = event.clientY;
  if (state.frame) return;
  state.frame = requestAnimationFrame(() => {
    state.frame = 0;
    if (
      document.documentElement.dataset.motion === "paused" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      state.width !== window.innerWidth
    )
      return;
    const top = state.bounds.top + state.scrollY - window.scrollY;
    const x = Math.min(
      1,
      Math.max(0, (state.x - state.bounds.left) / state.bounds.width),
    );
    const y = Math.min(1, Math.max(0, (state.y - top) / state.bounds.height));
    node.style.setProperty("--tilt-x", (0.5 - y) * 8 + "deg");
    node.style.setProperty("--tilt-y", (x - 0.5) * 9 + "deg");
    node.style.setProperty("--shine-x", x * 100 + "%");
    node.style.setProperty("--shine-y", y * 100 + "%");
  });
}
function depthLeave(event) {
  const node = event.currentTarget,
    state = depthStates.get(node);
  if (state) cancelAnimationFrame(state.frame);
  depthStates.delete(node);
  node.style.setProperty("--tilt-x", "0deg");
  node.style.setProperty("--tilt-y", "0deg");
}
function Work({ onProject }) {
  return (
    <section className="work shell" id="progetti" aria-labelledby="work-title">
      <div className="section-intro reveal" data-reveal>
        <div>
          <p className="eyebrow">Progetti selezionati · Studi personali</p>
          <h2 id="work-title" className="section-title">
            Tre direzioni.
            <br />
            <span className="gradient-text">Progettate da zero.</span>
          </h2>
        </div>
        <p>
          Brand immaginari, scelte concrete. Tre concept per mostrarti come
          traduco un’idea in un’esperienza digitale.
        </p>
      </div>
      <div className="project-list">
        {projects.map((item) => (
          <article className="project-card reveal" data-reveal key={item.name}>
            <button
              className="project-image"
              onPointerEnter={depthEnter}
              onPointerMove={depthMove}
              onPointerLeave={depthLeave}
              aria-label={"Esplora " + item.name + ", studio di design"}
              onClick={() => onProject(item)}
            >
              <span className="browser-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>{item.previewLabel}</span>
                <LockKeyhole />
              </span>
              <img
                src={item.image}
                alt={"Anteprima del concept " + item.name}
                width="1600"
                height="1100"
                loading="lazy"
                decoding="async"
              />
              <span className="project-open" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </button>
            <div className="project-info">
              <span className="project-number">
                {item.number} / {item.demoUrl ? "DEMO NAVIGABILE" : "CONCEPT"}
              </span>
              <h3>{item.name}</h3>
              <p>{item.summary}</p>
              <div className="project-tags">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="project-actions">
                {item.demoUrl && (
                  <a className="button button-glass" href={item.demoUrl}>
                    Apri la demo <ArrowUpRight />
                  </a>
                )}
                <button className="text-link" onClick={() => onProject(item)}>
                  Dentro al progetto <ArrowUpRight />
                </button>
              </div>
              <br />
              <span className="concept-label">
                Progetto personale dimostrativo
              </span>
            </div>
          </article>
        ))}
      </div>
      <p className="work-disclosure">
        Questi progetti sono concept dimostrativi, non lavori commissionati da
        clienti. Li ho sviluppati per esplorare identità, interfacce e
        contenuti: nelle schede trovi il ragionamento dietro ogni scelta.
      </p>
    </section>
  );
}
function CapabilityRail() {
  const words = [
    "Design che si riconosce",
    "Sviluppo su misura",
    "Contenuti con una direzione",
    "Cura in ogni dettaglio",
  ];
  return (
    <div className="capability-rail" aria-hidden="true">
      <div className="rail-track">
        {[...words, ...words].map((word, i) => (
          <React.Fragment key={i}>
            <span>{word}</span>
            <i>
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </i>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
function About() {
  return (
    <section
      className="about shell"
      id="approccio"
      aria-labelledby="about-title"
    >
      <div className="about-grid">
        <div
          className="identity-card reveal"
          data-reveal
          onPointerEnter={depthEnter}
          onPointerMove={depthMove}
          onPointerLeave={depthLeave}
        >
          <span className="identity-corner">
            CREATIVO PER SCELTA. CURIOSO DI NATURA.
          </span>
          <div className="identity-symbol" aria-hidden="true">
            <div className="identity-depth">
              <Mark />
              <Mark />
              <Mark />
              <Mark />
              <Mark id="identity-gradient" />
            </div>
          </div>
          <span className="identity-label">La persona dietro i pixel</span>
          <h3>Kirill Bielokon.</h3>
          <p>Sviluppo web, backend & gestione social.</p>
        </div>
        <div className="about-copy reveal" data-reveal>
          <p className="eyebrow">Piacere, sono Kirill</p>
          <h2 id="about-title" className="section-title">
            Design che si vede.
            <br />
            <span className="gradient-text">Metodo che si capisce.</span>
          </h2>
          <p>
            Mi occupo di sviluppo web e backend. Affianco la cura delle
            interfacce alla logica che le fa funzionare: una pagina deve essere
            chiara da usare e solida nella struttura.
          </p>
          <p>
            Porto questo approccio anche nella presenza online della tua
            attività: definisco il percorso, realizzo il sito e seguo la
            pubblicazione. Per i social preparo piano editoriale, grafiche e
            testi e mi occupo di pubblicazione e gestione, con un perimetro
            concordato prima di iniziare.
          </p>
          <div className="trust-list">
            {[
              [
                Compass,
                "Obiettivi chiari",
                "Prima di partire, concordiamo attività, costi e calendario.",
              ],
              [
                MessageCircle,
                "Confronto diretto",
                "Momenti di revisione concordati, con spazio per il tuo feedback.",
              ],
              [
                PackageCheck,
                "Consegna organizzata",
                "File, accessi e indicazioni utili per usare ciò che abbiamo creato.",
              ],
            ].map(([Icon, title, text]) => (
              <div className="trust-item" key={title}>
                <span className="trust-icon">
                  <Icon />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
function Services({ onContact, paused }) {
  return (
    <section
      className="services shell"
      id="servizi"
      aria-labelledby="services-title"
    >
      <div className="section-intro reveal" data-reveal>
        <div>
          <p className="eyebrow">Cosa possiamo creare</p>
          <h2 id="services-title" className="section-title">
            La presenza giusta.
            <br />
            <span className="gradient-text">In ogni formato.</span>
          </h2>
          <p className="services-description">
            Un sito, i social o una direzione completa. Partiamo da quello che
            serve davvero alla tua attività.
          </p>
        </div>
        <OrbitScene paused={paused} />
      </div>
      <div className="service-grid">
        {SERVICES.map(({ icon: Icon, title, text, items, type }) => (
          <article className="service-card reveal" data-reveal key={title}>
            <span className="service-icon">
              <Icon size={21} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
            <ul>
              {items.map((item) => (
                <li key={item}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <button className="text-link" onClick={() => onContact(type)}>
              Parliamo del progetto <ArrowUpRight />
            </button>
          </article>
        ))}
      </div>
      <div className="process">
        {[
          [
            "Ti ascolto.",
            "Attività, esigenze e obiettivi. Prima capiamo dove vuoi andare.",
          ],
          [
            "Diamo una direzione.",
            "Una proposta con stile, attività, tempi e costi definiti.",
          ],
          ["Si crea.", "Design e sviluppo, con revisioni concordate insieme."],
          [
            "Si mette online.",
            "Controllo finale, pubblicazione e consegna organizzata.",
          ],
        ].map(([title, text], i) => (
          <div className="process-step reveal" data-reveal key={title}>
            <span>0{i + 1} —</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
function Questions() {
  const [open, setOpen] = useState(null);
  return (
    <section className="faq shell" aria-labelledby="faq-title">
      <div className="faq-grid">
        <div className="faq-intro reveal" data-reveal>
          <p className="eyebrow">Prima di scrivermi</p>
          <h2 className="section-title" id="faq-title">
            Qualche risposta,
            <br />
            <span className="gradient-text">senza giri di parole.</span>
          </h2>
          <p>
            Per il resto, una conversazione è il modo migliore per capire se
            possiamo lavorare bene insieme.
          </p>
        </div>
        <div>
          {FAQ.map(([q, a], i) => (
            <div
              className={"faq-item" + (open === i ? " is-open" : "")}
              key={q}
            >
              <h3>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  aria-controls={"faq-answer-" + i}
                >
                  {q}
                  <Plus aria-hidden="true" />
                </button>
              </h3>
              <div
                id={"faq-answer-" + i}
                className="faq-answer"
                inert={open !== i}
              >
                <div>
                  <p>{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Contact({ onContact }) {
  return (
    <section
      className="contact shell"
      id="contatti"
      aria-labelledby="contact-title"
    >
      <div className="contact-panel reveal" data-reveal>
        <div className="contact-orbital" aria-hidden="true">
          <i />
          <i />
          <i />
          <span />
        </div>
        <div>
          <p className="eyebrow">La prossima bella idea</p>
          <h2 id="contact-title">
            Raccontami cosa
            <br />
            vuoi far crescere.
          </h2>
          <p>
            Partiamo dalla tua attività e da quello che ti serve. Ti ascolto e
            capiamo insieme quale direzione prendere.
          </p>
        </div>
        <div className="contact-actions">
          <a
            className="button"
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle />
            Scrivimi su WhatsApp <ArrowUpRight />
          </a>
          <a className="contact-email" href={`mailto:${profile.email}`}>
            <Mail size={17} />
            {profile.email}
            <ArrowUpRight size={16} />
          </a>
          <button className="text-link" onClick={() => onContact()}>
            Preferisci mettere in ordine le idee? <ArrowUpRight />
          </button>
          <span>
            Un primo confronto, senza impegno.
            <br />
            Parli direttamente con me.
          </span>
        </div>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer className="footer shell">
      <div className="footer-top">
        <Logo />
        <p>Un po’ di codice. Molta cura. La tua prossima direzione.</p>
        <a className="back-top" href="#inizio" aria-label="Torna all’inizio">
          <ArrowUp />
        </a>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Kirill Bielokon. Progettato e sviluppato
          con cura.
        </span>
        <a href={`mailto:${profile.email}`} className="footer-email">
          {profile.email}
          <ArrowUpRight size={12} />
        </a>
      </div>
    </footer>
  );
}
function App() {
  const [project, setProject] = useState(null),
    [contact, setContact] = useState(null),
    [paused, setPaused] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "running";
    return () => delete document.documentElement.dataset.motion;
  }, [paused]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-seen");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const openContact = (type = "") =>
    setContact({ type: typeof type === "string" ? type : "" });
  return (
    <div className="site-wrap">
      <a className="skip-link" href="#contenuto">
        Vai al contenuto
      </a>
      <Ambient />
      <Header onContact={openContact} />
      <main id="contenuto">
        <Hero paused={paused} onPause={() => setPaused(!paused)} />
        <Work onProject={setProject} />
        <ProofLab onContact={openContact} />
        <CapabilityRail />
        <About />
        <Services onContact={openContact} paused={paused} />
        <Questions />
        <Contact onContact={openContact} />
      </main>
      <Footer />
      <ProjectModal
        project={project}
        onClose={() => setProject(null)}
        onContact={openContact}
      />
      <ContactModal
        open={!!contact}
        initialType={contact?.type || ""}
        onClose={() => setContact(null)}
      />
    </div>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

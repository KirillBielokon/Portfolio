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
  Globe2,
  Layers3,
  MousePointer2,
  MessageCircle,
  Code2,
  Palette,
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
import { projects } from "./content";
import "./styles.css";

const WHATSAPP =
  "https://wa.me/393896322180?text=" +
  encodeURIComponent(
    "Ciao Kirill! Ho visto il tuo portfolio e vorrei parlarti della mia attività.",
  );
const NAV = [
  ["competenze", "Laboratorio"],
  ["progetti", "Progetti"],
  ["approccio", "Chi sono"],
  ["servizi", "Servizi"],
];
const PROJECTS = [
  {
    name: "Forma Studio",
    category: "Architettura, con spazio per respirare.",
    description:
      "Un sito editoriale per uno studio di architettura immaginario. Fotografie protagoniste, tipografia essenziale e un percorso semplice verso il contatto.",
    tags: ["Web design", "Sviluppo web"],
    url: "forma.studio / concept",
  },
  {
    name: "Aether",
    category: "La cura, anche nei dettagli.",
    description:
      "Uno studio di identità digitale per un brand skincare immaginario. Una direzione calda e sensoriale, dal prodotto alla sua presentazione online.",
    tags: ["Direzione visiva", "Web design"],
    url: "aether.skin / concept",
  },
  {
    name: "Campo",
    category: "Un’identità che vive anche nel feed.",
    description:
      "Un sistema di contenuti per un caffè immaginario. Grafiche, tono di voce e sito seguono la stessa direzione, mantenendo riconoscibile il brand.",
    tags: ["Social media", "Identità digitale"],
    url: "campo.cafe / concept",
  },
];
const SERVICES = [
  {
    icon: Code2,
    title: "Siti web.",
    text: "Il tuo spazio online, progettato intorno a quello che fai e alle persone che vuoi raggiungere.",
    items: [
      "Struttura e design su misura",
      "Sviluppo responsive",
      "Animazioni e interazioni",
      "Pubblicazione e controllo finale",
    ],
    type: "Sito web",
  },
  {
    icon: Layers3,
    title: "Social media.",
    text: "Una presenza riconoscibile e contenuti con una direzione, prima ancora di premere pubblica.",
    items: [
      "Direzione visiva e tono di voce",
      "Piano editoriale",
      "Grafiche e copy",
      "Organizzazione dei contenuti",
    ],
    type: "Gestione social",
  },
  {
    icon: Compass,
    title: "Una sola direzione.",
    text: "Sito e social che parlano la stessa lingua. Per dare coerenza a ogni punto di contatto.",
    items: [
      "Identità digitale coordinata",
      "Sito e contenuti social",
      "Stile visivo condiviso",
      "Un unico interlocutore",
    ],
    type: "Sito + social",
  },
];
const FAQ = [
  [
    "Come inizia un progetto?",
    "Con una conversazione. Mi racconti la tua attività, cosa ti serve e quali obiettivi hai. Poi preparo una proposta con attività, tempi e costi: il lavoro parte dopo aver concordato questi punti.",
  ],
  [
    "Puoi riprogettare il mio sito attuale?",
    "Sì. Partiamo da ciò che funziona e da ciò che vuoi migliorare: struttura, aspetto, esperienza da telefono e percorso verso il contatto. Ti propongo gli interventi adatti al tuo caso.",
  ],
  [
    "Quanto costa e quanto tempo serve?",
    "Dipende dalle pagine, dai contenuti e dalle funzionalità. Dopo il primo confronto ricevi una proposta con un preventivo e un calendario. Nessun prezzo generico prima di capire il progetto.",
  ],
  [
    "Puoi seguire sia il sito sia i social?",
    "Sì. Posso lavorare sul sito, sui social o su entrambi, con una direzione visiva e un tono di voce coordinati. Definiamo insieme attività, materiali e frequenza dei contenuti.",
  ],
  [
    "E dopo la pubblicazione?",
    "La consegna comprende un controllo finale e le indicazioni per usare ciò che abbiamo creato. Eventuali aggiornamenti e supporto continuativo si concordano nella proposta, in base alle tue esigenze.",
  ],
];

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
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let raf = 0;
    let size = window.innerHeight;
    const draw = () => {
      raf = 0;
      hero.current?.style.setProperty(
        "--hero-scroll",
        String(Math.min(window.scrollY / size, 1)),
      );
    };
    const scroll = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const resize = () => {
      size = window.innerHeight;
      scroll();
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
    };
  }, []);
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
            Kirill Bielokon · Web & social design
          </p>
          <h1 id="hero-title" aria-label="La tua attività, in un’altra dimensione.">
            <span className="title-line">
              <span>La tua attività,</span>
            </span>
            <span className="title-line">
              <span>in un’altra</span>
            </span>
            <span className="title-line">
              <span className="gradient-text">dimensione.</span>
            </span>
          </h1>
          <p className="hero-desc">
            Siti web e contenuti social che danno forma alla tua identità. Li
            progetto e li realizzo con cura, per farti presentare bene. Dal
            primo sguardo all’ultimo dettaglio.
          </p>
          <div className="hero-actions">
            <a
              className="button button-primary"
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
            >
              Parliamo della tua idea <ArrowUpRight />
            </a>
            <a
              className="button button-glass hero-secondary"
              href="#competenze"
            >
              Guarda cosa posso fare <ArrowDown />
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
        <a className="scroll-cue" href="#competenze">
          SCOPRI IL MIO MONDO <ArrowDown />
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
function depthEnter(e) {
  if (
    matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches ||
    document.documentElement.dataset.motion === "paused"
  )
    return;
  e.currentTarget._depthBounds = e.currentTarget.getBoundingClientRect();
}
function depthMove(e) {
  const node = e.currentTarget,
    bounds = node._depthBounds;
  if (!bounds || document.documentElement.dataset.motion === "paused") return;
  const x = Math.min(1, Math.max(0, (e.clientX - bounds.left) / bounds.width)),
    y = Math.min(1, Math.max(0, (e.clientY - bounds.top) / bounds.height));
  node.style.setProperty("--tilt-x", (0.5 - y) * 8 + "deg");
  node.style.setProperty("--tilt-y", (x - 0.5) * 9 + "deg");
  node.style.setProperty("--shine-x", x * 100 + "%");
  node.style.setProperty("--shine-y", y * 100 + "%");
}
function depthLeave(e) {
  const node = e.currentTarget;
  node._depthBounds = null;
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
        {PROJECTS.map((item, i) => (
          <article className="project-card reveal" data-reveal key={item.name}>
            <button
              className="project-image"
              onPointerEnter={depthEnter}
              onPointerMove={depthMove}
              onPointerLeave={depthLeave}
              aria-label={"Esplora " + item.name + ", studio di design"}
              onClick={() => onProject(projects[i])}
            >
              <span className="browser-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>{item.url}</span>
                <LockKeyhole />
              </span>
              <img
                src={projects[i].image}
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
              <span className="project-number">0{i + 1} / CONCEPT</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="project-tags">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <button
                className="text-link"
                onClick={() => onProject(projects[i])}
              >
                Dentro al progetto <ArrowUpRight />
              </button>
              <br />
              <span className="concept-label">
                Studio personale · Brand immaginario
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
          <p>Web developer & social media designer.</p>
        </div>
        <div className="about-copy reveal" data-reveal>
          <p className="eyebrow">Piacere, sono Kirill</p>
          <h2 id="about-title" className="section-title">
            Design che si vede.
            <br />
            <span className="gradient-text">Metodo che si capisce.</span>
          </h2>
          <p>
            Mi piace quando un progetto ha carattere, ma anche quando ogni
            dettaglio ha un motivo. Unisco sviluppo web e contenuti social per
            costruire una presenza che ti rappresenti.
          </p>
          <p>
            Seguo il progetto dall’idea alla pubblicazione. Parli direttamente
            con me: definiamo una direzione, ci confrontiamo sulle scelte e
            mettiamo ordine in ciò che serve.
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
        <a href={WHATSAPP} target="_blank" rel="noreferrer">
          Da un’idea a una conversazione ↗
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
        <ProofLab onContact={openContact} />
        <Work onProject={setProject} />
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

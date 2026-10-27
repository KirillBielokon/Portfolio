import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Plus,
  Minus,
  X,
  Menu,
  Pause,
  Play,
  MessageCircle,
  MoveUpRight,
  Check,
} from "lucide-react";
import "@fontsource-variable/dm-sans";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./styles.css";
import Playground from "./Playground";
import useScrollScene from "./useScrollScene";
import { ProjectModal, ContactModal } from "./Dialogs";
import { profile, projects, services, faqs } from "./content";

const whatsappUrl = `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent("Ciao Kirill! Ho visto il tuo portfolio e vorrei parlarti del mio progetto.")}`;

function useMedia(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function Monogram({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 50 50"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 5v40h11V29l16 16h14L24 23 44 5H30L16 18V5H5Z"
        fill="currentColor"
      />
      <path d="M36 5h9v9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function Logo() {
  return (
    <a
      className="logo"
      href="#inizio"
      aria-label="Kirill Bielokon, torna all’inizio"
    >
      <Monogram />
      <span>
        kirill
        <br />
        <b>
          bielokon
          <span className="logo-pixel" aria-hidden="true" />
        </b>
      </span>
    </a>
  );
}

function Header({ onContact }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const total = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty(
        "--page-progress",
        total > 0 ? window.scrollY / total : 0,
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-10% 0px -55% 0px" },
    );
    ["progetti", "approccio", "servizi"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    const media = matchMedia("(min-width: 761px)");
    const resize = () => {
      if (media.matches) setMenuOpen(false);
    };
    media.addEventListener("change", resize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      media.removeEventListener("change", resize);
    };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = [
      document.querySelector("main"),
      document.querySelector("footer"),
    ].filter(Boolean);
    background.forEach((el) => (el.inert = true));
    const frame = requestAnimationFrame(() =>
      headerRef.current?.querySelector(".mobile-nav a")?.focus(),
    );
    const keys = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
      }
      if (e.key === "Tab") {
        const items = [
          ...headerRef.current.querySelectorAll(
            "a[href],button:not([disabled])",
          ),
        ].filter((el) => el.getClientRects().length);
        if (e.shiftKey && document.activeElement === items[0]) {
          e.preventDefault();
          items.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    window.addEventListener("keydown", keys);
    return () => {
      cancelAnimationFrame(frame);
      background.forEach((el) => (el.inert = false));
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", keys);
      if (!document.activeElement?.closest("dialog[open]"))
        toggleRef.current?.focus({ preventScroll: true });
    };
  }, [menuOpen]);
  const contact = () => {
    setMenuOpen(false);
    onContact();
  };
  return (
    <header
      ref={headerRef}
      className={`header ${scrolled ? "is-scrolled" : ""}`}
    >
      <div className="header-inner container">
        <Logo />
        <nav className="desktop-nav" aria-label="Navigazione principale">
          {[
            ["progetti", "Lavori", "03"],
            ["approccio", "Io, in breve", ""],
            ["servizi", "Cosa faccio", ""],
          ].map(([id, label, count]) => (
            <a
              key={id}
              className={active === id ? "active" : ""}
              href={`#${id}`}
            >
              {label}
              {count && <sup>{count}</sup>}
            </a>
          ))}
        </nav>
        <button className="header-contact" onClick={contact}>
          Parliamone <ArrowUpRight size={18} />
        </button>
        <button
          ref={toggleRef}
          className="menu-toggle"
          aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Navigazione mobile"
        >
          {[
            ["progetti", "I lavori"],
            ["approccio", "Io, in breve"],
            ["servizi", "Cosa faccio"],
          ].map(([id, label], i) => (
            <a href={`#${id}`} key={id} onClick={() => setMenuOpen(false)}>
              <span>0{i + 1}</span>
              {label}
              <ArrowUpRight />
            </a>
          ))}
          <button onClick={contact}>
            Dimmi la tua. <ArrowUpRight />
          </button>
          <p>SITI WEB + SOCIAL MEDIA / KIRILL BIELOKON</p>
        </nav>
      )}
    </header>
  );
}

function Hero({ onContact }) {
  const [mode, setMode] = useState("signature");
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const modeCopy = {
    signature: [
      "La mia firma.",
      "Un’idea prende forma. Tocca o muovi il cursore.",
    ],
    web: [
      "La tua casa online.",
      "Dalla griglia a un sito: ogni elemento ha un posto.",
    ],
    social: [
      "La tua voce, nel feed.",
      "La stessa identità. Tre modi di raccontarla.",
    ],
  };
  useScrollScene(ref, {
    disabled: reduced,
    range: (top, height) => [top, top + height],
    onProgress: (p) => ref.current?.style.setProperty("--hero-scroll", p),
  });
  const tilt = (e) => {
    if (reduced || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty(
      "--tilt-x",
      `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`,
    );
    e.currentTarget.style.setProperty(
      "--tilt-y",
      `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`,
    );
  };
  const untilt = (e) => {
    e.currentTarget.style.setProperty("--tilt-x", "0deg");
    e.currentTarget.style.setProperty("--tilt-y", "0deg");
  };
  return (
    <section
      id="inizio"
      className="hero container"
      ref={ref}
      aria-labelledby="hero-title"
    >
      <div className="hero-topline">
        <p className="eyebrow">
          <span className="live-dot" /> SITI WEB + SOCIAL MEDIA
        </p>
        <span className="micro hero-top-note">
          IL LABORATORIO DI KIRILL BIELOKON
        </span>
      </div>
      <div className="hero-main">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title">
            <span className="word-mask">
              <span className="hero-word">FATTI</span>
            </span>
            <span className="word-mask">
              <span className="hero-word lime">
                NOTARE<span className="hero-period">.</span>
              </span>
            </span>
          </h1>
          <p className="hero-intro">
            Un sito che ti rappresenta.
            <br />
            Social che hanno qualcosa da dire.
            <br />
            <span>Io sono Kirill. Metto insieme le due cose.</span>
          </p>
          <div className="hero-actions">
            <a
              className="button button-lime"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Parliamone su WhatsApp <ArrowUpRight size={20} />
            </a>
            <a href="#progetti" className="text-link">
              Prima, guarda qui <ArrowDown size={17} />
            </a>
          </div>
        </div>
        <div className={`playground-wrap mode-${mode}`}>
          <div className="playground-tilt">
            <div
              className="playground-shell"
              onPointerMove={tilt}
              onPointerLeave={untilt}
            >
              <div className="playground-toolbar">
                <span>
                  <i /> CAMPO DI IDEE
                </span>
                <button
                  aria-label={
                    paused
                      ? "Riprendi l’animazione"
                      : "Metti in pausa l’animazione"
                  }
                  aria-pressed={paused}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? <Play size={13} /> : <Pause size={13} />}
                </button>
              </div>
              <div className="playground-surface">
                <span className="plot-corner corner-tl" />
                <span className="plot-corner corner-tr" />
                <span className="plot-corner corner-bl" />
                <span className="plot-corner corner-br" />
                <Playground mode={mode} paused={paused} />
              </div>
              <div className="playground-caption" aria-live="polite">
                <span>{modeCopy[mode][0]}</span>
                <ArrowUpRight size={21} />
              </div>
            </div>
            <div className="playground-footnote">
              <span className="micro">UNA GRIGLIA. INFINITE POSSIBILITÀ.</span>
              <span className="micro">K / B</span>
            </div>
          </div>
          <div
            className="playground-switch"
            role="group"
            aria-label="Esplora il laboratorio digitale"
          >
            {[
              ["signature", "01", "La firma"],
              ["web", "02", "Web"],
              ["social", "03", "Social"],
            ].map(([id, n, label]) => (
              <button
                key={id}
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
              >
                <span>{n}</span>
                {label}
              </button>
            ))}
          </div>
          <p className="playground-hint">{modeCopy[mode][1]}</p>
          <span className="handwritten-note" aria-hidden="true">
            Sì, puoi giocarci.
            <svg viewBox="0 0 100 55">
              <path
                d="M4 40C25 60 72 35 83 9m-15 7 16-8 7 17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </span>
        </div>
      </div>
      <div className="hero-meta">
        <a href="#progetti" className="scroll-invite">
          <span className="scroll-line" />
          SCORRI. IL RESTO È QUI SOTTO.
          <ArrowDown size={14} />
        </a>
        <span className="micro">UN NOME. UN FILO DIRETTO.</span>
      </div>
    </section>
  );
}

function Manifesto() {
  const ref = useRef(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  useScrollScene(ref, {
    disabled: reduced,
    range: (top, height, viewport) => [
      top - viewport * 0.75,
      top + height - viewport * 0.5,
    ],
    onProgress: (p) => ref.current?.style.setProperty("--reading-progress", p),
  });

  return (
    <section className="manifesto" ref={ref} aria-labelledby="manifesto-title">
      <div className="container manifesto-inner">
        <div>
          <span className="eyebrow">IL PUNTO È QUESTO</span>
          <span className="manifesto-arrow" aria-hidden="true">
            <ArrowUpRight strokeWidth={1} />
          </span>
        </div>
        <h2 id="manifesto-title">
          {"Online c’è già abbastanza rumore. Diamo una forma chiara a quello che fai."
            .split(" ")
            .map((w, i) => (
              <span className="manifesto-word" style={{ "--word": i }} key={i}>
                {w}{" "}
              </span>
            ))}
        </h2>
      </div>
    </section>
  );
}

function Marquee() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="marquee-bound">
      <div
        className="marquee"
        role="region"
        aria-label="Design, sviluppo, contenuti, identità"
      >
        <div
          className={`marquee-track ${paused ? "is-paused" : ""}`}
          aria-hidden="true"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <React.Fragment key={i}>
              <span>BUONE IDEE</span>
              <ArrowUpRight className="marquee-mark" strokeWidth={1.1} />
              <span>FATTE BENE</span>
              <ArrowUpRight className="marquee-mark" strokeWidth={1.1} />
            </React.Fragment>
          ))}
        </div>
        <button
          className="marquee-control"
          aria-label={
            paused ? "Riprendi lo scorrimento" : "Metti in pausa lo scorrimento"
          }
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
        </button>
      </div>
    </div>
  );
}

function ProjectVisual({ project, onOpen, active = true }) {
  return (
    <button
      className="project-visual"
      style={{ background: project.color }}
      aria-label={`Esplora ${project.name}, studio di design`}
      onClick={() => onOpen(project)}
      tabIndex={active ? 0 : -1}
    >
      <span className="project-screen-label">
        <span />
        CONCEPT / {project.number}
      </span>
      <img
        src={project.image}
        width="1600"
        height="1100"
        loading="lazy"
        alt={`Concept ${project.name}: ${project.category.toLowerCase()}`}
      />
      <span className="project-explore">
        DENTRO IL PROGETTO <ArrowUpRight size={18} />
      </span>
    </button>
  );
}

function Work({ onProject }) {
  const [active, setActive] = useState(0);
  const desktop = useMedia("(min-width: 1000px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const storyRef = useRef(null);
  useScrollScene(storyRef, {
    disabled: !desktop,
    range: (top, height, viewport) => [top - 84, top + height - viewport + 30],
    onProgress: (p) => setActive(Math.min(2, Math.floor(p * 3))),
  });
  const choose = (i) => {
    if (!storyRef.current) return;
    const r = storyRef.current.getBoundingClientRect();
    const top = r.top + window.scrollY - 84;
    const distance = storyRef.current.offsetHeight - window.innerHeight + 114;
    setActive(i);
    window.scrollTo({
      top: top + distance * ((i + 0.5) / 3),
      behavior: "instant",
    });
  };
  return (
    <section id="progetti" className="work" aria-labelledby="work-title">
      <div className="container work-heading">
        <div className="section-kicker">
          <span className="eyebrow">01 / IDEE MESSE ALLA PROVA</span>
          <span className="micro">
            STUDI INDIPENDENTI / WEB + SOCIAL.
          </span>
        </div>
        <div className="work-heading-main">
          <h2 id="work-title" className="display">
            LE IDEE
            <br />
            SI VEDONO.
          </h2>
          <p>
            Tre brand immaginari, tre direzioni precise.
            <br />
            Ti mostro come ragiono, cosa scelgo
            <br />e dove voglio portare un progetto.
          </p>
          <span className="large-arrow" aria-hidden="true">
            <ArrowUpRight strokeWidth={1} />
          </span>
        </div>
      </div>
      {desktop ? (
        <div className="work-story" ref={storyRef}>
          <div className="work-stage container">
            <aside className="work-index">
              <span className="micro">SFOGLIA / SCORRI</span>
              <div className="work-index-links">
                {projects.map((p, i) => (
                  <button
                    key={p.id}
                    className={i === active ? "selected" : ""}
                    aria-pressed={i === active}
                    aria-label={`Mostra ${p.name}`}
                    onClick={() => choose(i)}
                  >
                    <span>0{i + 1}</span>
                    <b>{p.name}</b>
                    <ArrowUpRight size={18} />
                  </button>
                ))}
              </div>
              <div className="work-active-note" key={active}>
                <span className="eyebrow">{projects[active].category}</span>
                <p>{projects[active].intro}</p>
                <div className="project-tags">
                  {projects[active].tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <button
                  className="text-link"
                  onClick={() => onProject(projects[active])}
                >
                  Le scelte, da vicino <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="work-counter">
                <span>0{active + 1}</span>
                <i>/ 03</i>
              </div>
            </aside>
            <div className="work-artboard">
              {projects.map((p, i) => (
                <article
                  className={`project work-slide ${i === active ? "is-active" : ""}`}
                  key={p.id}
                  aria-hidden={i !== active}
                  inert={i !== active}
                >
                  <ProjectVisual
                    project={p}
                    onOpen={onProject}
                    active={i === active}
                  />
                  <div className="project-bottom">
                    <h3>{p.name}</h3>
                    <span className="micro">{p.category}</span>
                    <span className="micro">0{i + 1} / 03</span>
                  </div>
                </article>
              ))}
            </div>
            <span className="work-scroll-line" aria-hidden="true">
              <i style={{ transform: `scaleY(${(active + 1) / 3})` }} />
            </span>
          </div>
        </div>
      ) : (
        <div className="container mobile-projects">
          {projects.map((p) => (
            <article className="project" key={p.id} data-reveal>
              <div className="mobile-project-top">
                <span className="micro">0{Number(p.number)} / 03</span>
                <span className="micro">{p.category}</span>
              </div>
              <ProjectVisual project={p} onOpen={onProject} />
              <div className="project-bottom">
                <h3>{p.name}</h3>
                <button className="text-link" onClick={() => onProject(p)}>
                  Esplora <ArrowUpRight size={16} />
                </button>
              </div>
              <p className="mobile-project-intro">{p.intro}</p>
            </article>
          ))}
        </div>
      )}
      <div className="work-end container">
        <span className="micro">
          I CONCEPT SONO STUDI PERSONALI, NON INCARICHI CLIENTE.
        </span>
        <span className="micro">APPUNTI, SCELTE, PROGETTI.</span>
      </div>
    </section>
  );
}

function About({ onContact }) {
  const ref = useRef(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  useScrollScene(ref, {
    disabled: reduced,
    range: (top, height, viewport) => [top - viewport, top + height],
    onProgress: (p) => {
      ref.current?.style.setProperty("--about-scroll", p);
      if (p > 0.15) ref.current?.classList.add("is-in-view");
    },
  });

  return (
    <section
      id="approccio"
      className="about"
      ref={ref}
      aria-labelledby="about-title"
    >
      <div className="container">
        <div className="section-kicker">
          <span className="eyebrow">02 / DIETRO LE COSE CHE VEDI</span>
          <span className="micro">KIRILL BIELOKON. PIACERE.</span>
        </div>
        <div className="about-grid">
          <div>
            <h2 id="about-title" className="display">
              <span className="about-line">
                <span>UN NOME.</span>
              </span>
              <span className="about-line">
                <span>UN FILO</span>
              </span>
              <span className="about-line">
                <span>DIRETTO.</span>
              </span>
            </h2>
            <div className="about-handwriting">
              Ci sono io, dall’idea all’ultimo dettaglio.
            </div>
          </div>
          <div className="about-right">
            <div className="about-print" aria-hidden="true">
              <Monogram />
              <span>PROGETTARE È SCEGLIERE.</span>
              <span>KB / STUDIO INDIPENDENTE</span>
            </div>
            <div className="about-copy">
              <p>
                Sono Kirill. Mi piace mettere ordine nelle idee e trovare il
                modo giusto di farle vedere.
              </p>
              <p>
                Un sito che si capisce. Un profilo riconoscibile. Un messaggio
                che arriva. Tengo insieme design, sviluppo e contenuti, perché
                parlino la stessa lingua.
              </p>
              <button className="text-link" onClick={onContact}>
                Partiamo dalla tua idea <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="about-principles">
          <div>
            <span>01</span>
            <p>
              Poche cose.
              <br />
              <b>Scelte con criterio.</b>
            </p>
          </div>
          <div>
            <span>02</span>
            <p>
              Una direzione.
              <br />
              <b>Su tutti i canali.</b>
            </p>
          </div>
          <div>
            <span>03</span>
            <p>
              Un confronto.
              <br />
              <b>Senza intermediari.</b>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const [expanded, setExpanded] = useState(0);
  return (
    <section id="servizi" className="services" aria-labelledby="services-title">
      <div className="container">
        <div className="section-kicker">
          <span className="eyebrow">03 / COSA FACCIAMO, IN PRATICA</span>
          <span className="micro">IL TUO PROGETTO, IL PERIMETRO GIUSTO.</span>
        </div>
        <div className="services-heading">
          <h2 id="services-title" className="display">
            DAL PRIMO
            <br />
            «E SE…»<span className="outline-word"> AL VIA.</span>
          </h2>
          <p>
            Puoi partire da un sito, dai social
            <br />o da una presenza tutta da costruire.
            <br />
            Decidiamo insieme da dove ha senso iniziare.
          </p>
        </div>
        <div className="service-list">
          {services.map((s, i) => (
            <div
              className={`service-row ${expanded === i ? "expanded" : ""}`}
              key={s.number}
            >
              <h3>
                <button
                  className="service-trigger"
                  aria-expanded={expanded === i}
                  aria-controls={`service-${i}`}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <span className="service-number">{s.number}</span>
                  <span className="service-title">{s.title}</span>
                  <span className="service-tag">{s.tag}</span>
                  <span className="service-toggle">
                    {expanded === i ? <Minus /> : <Plus />}
                  </span>
                </button>
              </h3>
              <div
                className="service-panel"
                id={`service-${i}`}
                hidden={expanded !== i}
              >
                <p>{s.text}</p>
                <div className="service-pills">
                  {s.details.map((d) => (
                    <span key={d}>
                      <Check size={12} />
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="process">
          <span className="eyebrow">COME CI ARRIVIAMO</span>
          <div className="process-steps">
            {[
              ["01", "Ti ascolto", "Il tuo mondo, le tue priorità."],
              [
                "02",
                "Diamo una direzione",
                "Un’idea chiara, prima di produrre.",
              ],
              ["03", "Si crea", "Design, codice, contenuti."],
              ["04", "Si mette online", "Tutto pronto, fino al dettaglio."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>
                  {n}
                  <ArrowRight size={17} />
                </span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="faq container" aria-labelledby="faq-title">
      <div>
        <span className="eyebrow">DUE COSE, PRIMA DI INIZIARE.</span>
        <h2 id="faq-title" className="display">
          PARLIAMO
          <br />
          CHIARO.
        </h2>
      </div>
      <div className="faq-list">
        {faqs.map((f, i) => (
          <div className="faq-item" key={f.q}>
            <h3>
              <button
                aria-expanded={open === i}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {f.q}
                {open === i ? <Minus size={18} /> : <Plus size={18} />}
              </button>
            </h3>
            <div id={`faq-${i}`} hidden={open !== i}>
              <p>{f.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact({ onContact }) {
  const ref = useRef(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  useScrollScene(ref, {
    disabled: reduced,
    range: (top, height, viewport) => [
      top - viewport,
      top + height * 0.5 - viewport * 0.5,
    ],
    onProgress: (p) => ref.current?.style.setProperty("--contact-scroll", p),
  });

  return (
    <section
      id="contatti"
      className="contact-section"
      aria-labelledby="contact-title"
      ref={ref}
    >
      <div className="container">
        <div className="section-kicker">
          <span className="eyebrow">
            <span className="live-dot" /> IL TUO PROGETTO INIZIA QUI.
          </span>
          <span className="micro">BASTA UN MESSAGGIO.</span>
        </div>
        <a
          className="contact-big"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 id="contact-title" className="display">
            <span className="contact-big-line">DIMMI</span>
            <span className="contact-big-line">LA TUA.</span>
          </h2>
          <span className="contact-arrow">
            <ArrowUpRight strokeWidth={1.1} />
          </span>
        </a>
        <div className="contact-bottom">
          <div>
            <p>
              Un nuovo sito? Social da ripensare?
              <br />
              Raccontami da dove parti.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-inline"
            >
              <MessageCircle size={17} /> Scrivimi su WhatsApp{" "}
              <ArrowUpRight size={17} />
            </a>
          </div>
          <button className="brief-link" onClick={onContact}>
            Preferisci mettere in ordine le idee?
            <br />
            <span>
              Prepara il tuo brief <ArrowUpRight size={16} />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <a
            href="#inizio"
            aria-label="Kirill Bielokon, torna all’inizio"
            className="footer-name"
          >
            KIRILL BIELOKON
            <span>
              <ArrowUpRight strokeWidth={1.1} />
            </span>
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} KIRILL BIELOKON</span>
          <span>SITI WEB + SOCIAL MEDIA. UNA VOCE PROPRIA.</span>
          <a href="#inizio">
            TORNA SU <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const [project, setProject] = useState(null);
  const [contact, setContact] = useState(false);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Vai al contenuto
      </a>
      <Header onContact={() => setContact(true)} />
      <main id="main-content">
        <Hero onContact={() => setContact(true)} />
        <Manifesto />
        <Work onProject={setProject} />
        <Marquee />
        <About onContact={() => setContact(true)} />
        <Services />
        <FAQ />
        <Contact onContact={() => setContact(true)} />
      </main>
      <Footer />
      <ProjectModal
        project={project}
        onClose={() => setProject(null)}
        onContact={() => setContact(true)}
      />
      <ContactModal open={contact} onClose={() => setContact(false)} />
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

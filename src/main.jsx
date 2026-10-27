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
  Check,
  Copy,
  Download,
  MessageCircle,
  Pause,
  Play,
} from "lucide-react";
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/instrument-serif/latin-400.css";
import "./styles.css";
import { profile, projects, services, faqs } from "./content";

function Asterisk({ className = "", ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M50 3v94M3 50h94M16.8 16.8l66.4 66.4M16.8 83.2l66.4-66.4"
        stroke="currentColor"
        strokeWidth="15"
      />
    </svg>
  );
}

function Logo({ footer = false }) {
  return (
    <a
      className={`logo ${footer ? "logo-footer" : ""}`}
      href="#inizio"
      aria-label="Kirill Bielokon, torna all’inizio"
    >
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path
          d="M4 3v30h7V21l12 12h10L17 17 32 3H22L11 14V3Z"
          fill="currentColor"
        />
      </svg>
      <span>
        kirill
        <br />
        bielokon<span className="logo-dot">.</span>
      </span>
    </a>
  );
}

function useMotion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    let frame;
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--scroll",
          Math.min(window.scrollY, 1000),
        );
        frame = null;
      });
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);
}

function Header({ onContact }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const headerRef = useRef(null);
  const menuToggleRef = useRef(null);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    const desktopQuery = window.matchMedia("(min-width: 601px)");
    const closeAtDesktop = (e) => {
      if (e.matches) setMenuOpen(false);
    };
    desktopQuery.addEventListener("change", closeAtDesktop);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-20% 0px -60% 0px" },
    );
    ["progetti", "approccio", "servizi"].forEach((id) =>
      observer.observe(document.getElementById(id)),
    );
    return () => {
      window.removeEventListener("scroll", handler);
      desktopQuery.removeEventListener("change", closeAtDesktop);
      observer.disconnect();
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
    background.forEach((el) => {
      el.inert = true;
    });
    const focusFrame = requestAnimationFrame(() =>
      headerRef.current?.querySelector(".mobile-nav a")?.focus(),
    );
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
      }
      if (e.key === "Tab") {
        const focusable = [
          ...headerRef.current.querySelectorAll(
            "a[href], button:not([disabled])",
          ),
        ].filter((el) => el.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previous;
      background.forEach((el) => {
        el.inert = false;
      });
      window.removeEventListener("keydown", onKey);
      if (!document.activeElement?.closest("dialog[open]"))
        menuToggleRef.current?.focus({ preventScroll: true });
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
            ["progetti", "Progetti"],
            ["approccio", "Approccio"],
            ["servizi", "Servizi"],
          ].map(([id, label]) => (
            <a
              className={active === id ? "active" : ""}
              href={`#${id}`}
              key={id}
            >
              {label}
            </a>
          ))}
        </nav>
        <button className="button button-dark header-contact" onClick={contact}>
          Parliamone <ArrowUpRight size={17} />
        </button>
        <button
          ref={menuToggleRef}
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
            ["progetti", "Progetti"],
            ["approccio", "Approccio"],
            ["servizi", "Servizi"],
          ].map(([id, label], i) => (
            <a href={`#${id}`} key={id} onClick={() => setMenuOpen(false)}>
              <span>0{i + 1}</span>
              {label}
              <ArrowUpRight />
            </a>
          ))}
          <button onClick={contact}>
            Facciamo qualcosa di bello. <ArrowUpRight />
          </button>
          <p>Design e sviluppo, con carattere.</p>
        </nav>
      )}
    </header>
  );
}

function Hero({ onContact }) {
  return (
    <section
      id="inizio"
      className="hero container"
      aria-labelledby="hero-title"
    >
      <div className="hero-topline">
        <p className="eyebrow">
          <span className="status-dot" /> WEB DESIGN & SOCIAL MEDIA
        </p>
        <p className="hero-note">UNA VISIONE. OGNI DETTAGLIO.</p>
      </div>
      <div className="hero-grid">
        <div className="hero-content">
          <h1 id="hero-title">
            <span className="title-line">Il digitale,</span>
            <span className="title-line serif">
              con carattere<span className="orange">.</span>
            </span>
          </h1>
          <p className="hero-description">
            Siti web e social media per brand che hanno
            <br className="desktop-break" /> qualcosa da dire. Li aiuto a farlo
            con chiarezza,
            <br className="desktop-break" /> coerenza e una personalità
            riconoscibile.
          </p>
          <div className="hero-actions">
            <a className="button button-orange" href="#progetti">
              Esplora i progetti <ArrowDown size={18} />
            </a>
            <button className="text-button" onClick={onContact}>
              Hai un’idea? <ArrowUpRight size={19} />
            </button>
          </div>
          <div className="hero-signature">
            <span className="signature-line" />
            <span>
              IDENTITÀ. SITI WEB. SOCIAL.
              <br />
              <b>Una sola visione, dall’inizio alla fine.</b>
            </span>
          </div>
        </div>
        <div className="hero-art-wrap">
          <div className="art-coordinate art-coordinate-top">
            FIG. 01 — CONNESSIONI INATTESE
          </div>
          <div className="hero-art">
            <img
              src="/images/chrome-sculpture.webp"
              srcSet="/images/chrome-sculpture-640.webp 640w, /images/chrome-sculpture-960.webp 960w, /images/chrome-sculpture.webp 1536w"
              sizes="(max-width: 600px) calc(100vw - 40px), (min-width: 1600px) 600px, 44vw"
              alt="Scultura in cromo intrecciato e sfera arancione in uno spazio architettonico illuminato dal sole"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <span className="art-cross cross-tl" />
            <span className="art-cross cross-br" />
          </div>
          <div className="art-stamp">
            <Asterisk />
            <span>
              Le belle idee
              <br />
              prendono forma.
            </span>
            <ArrowUpRight size={21} />
          </div>
          <div className="art-coordinate art-coordinate-bottom">
            <span>ESTETICA × INTENZIONE</span>
            <span>KB / 01</span>
          </div>
        </div>
      </div>
      <div className="hero-bottom">
        <a href="#progetti">
          <ArrowDown size={15} />
          <span>SCOPRI COSA POSSIAMO CREARE</span>
        </a>
        <span>INDIPENDENTE. PER SCELTA.</span>
      </div>
    </section>
  );
}

function Marquee() {
  const [paused, setPaused] = useState(false);
  const items = [
    "Design con intenzione",
    "Codice con cura",
    "Identità che restano",
  ];
  return (
    <div className="marquee" role="region" aria-label={items.join(". ")}>
      <div
        className={`marquee-track ${paused ? "is-paused" : ""}`}
        aria-hidden="true"
      >
        {[...items, ...items, ...items, ...items].map((text, i) => (
          <React.Fragment key={i}>
            <span>{text}</span>
            <Asterisk />
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
  );
}

function ProjectCard({ project, onOpen }) {
  const cursorRef = useRef(null);
  const move = (e) => {
    if (!cursorRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    cursorRef.current.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%, -50%)`;
  };
  return (
    <article className={`project project-${project.id}`} data-reveal>
      <button
        className="project-visual"
        onClick={() => onOpen(project)}
        onPointerMove={move}
        aria-label={`Esplora ${project.name}, studio di design`}
        style={{ background: project.color }}
      >
        <img
          src={project.image}
          width="1600"
          height="1100"
          loading="lazy"
          alt={`Concept di sito web ${project.name}: ${project.category.toLowerCase()}`}
        />
        <span className="project-label">STUDIO DI DESIGN</span>
        <span className="project-corner-arrow">
          <ArrowUpRight size={22} />
        </span>
        <span className="project-cursor" ref={cursorRef} aria-hidden="true">
          Esplora
          <ArrowUpRight size={17} />
        </span>
      </button>
      <div className="project-info">
        <div>
          <span className="project-number">/{project.number}</span>
          <h3>
            <button onClick={() => onOpen(project)}>{project.name}</button>
          </h3>
          <span className="project-category">{project.category}</span>
        </div>
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function Work({ onProject }) {
  return (
    <section
      className="work section-space container"
      id="progetti"
      aria-labelledby="work-title"
    >
      <div className="section-kicker" data-reveal>
        <span className="eyebrow">01 / SELEZIONE CREATIVA</span>
        <span className="tiny-label">PENSIERO VISIVO, IN PRATICA.</span>
      </div>
      <div className="section-heading" data-reveal>
        <h2 id="work-title">
          Meno rumore.
          <br />
          <em>Più identità.</em>
        </h2>
        <p>
          Tre direzioni, tre personalità.
          <br />
          Concept di siti web e contenuti social
          <br className="desktop-break" /> per mostrare come un brand può
          <br className="desktop-break" /> trovare la propria voce online.
        </p>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={onProject} />
        ))}
      </div>
      <p className="work-disclaimer">
        <span className="small-cross">+</span> Concept originali a scopo
        esplorativo, non incarichi per clienti.
      </p>
    </section>
  );
}

function About({ onContact }) {
  return (
    <section id="approccio" className="about" aria-labelledby="about-title">
      <div className="container about-inner">
        <div className="section-kicker" data-reveal>
          <span className="eyebrow">02 / DIETRO OGNI PIXEL</span>
          <span className="tiny-label">
            UNA PERSONA, NON UNA CATENA DI MONTAGGIO.
          </span>
        </div>
        <div className="about-main">
          <div className="about-symbol" data-reveal>
            <Asterisk />
            <div className="symbol-caption">
              <span>IDEA ↔ FORMA ↔ FUNZIONE</span>
              <span>01—∞</span>
            </div>
          </div>
          <div className="about-copy" data-reveal>
            <h2 id="about-title">
              Piacere, Kirill.
              <br />
              Metto insieme
              <br />
              <em>i punti giusti.</em>
            </h2>
            <p>
              Tra quello che vuoi raccontare e quello che le persone devono
              capire c’è uno spazio. È lì che lavoro.
            </p>
            <p>
              Credo nelle idee chiare e nei dettagli che fanno la differenza.
              Per questo tengo insieme design, sviluppo web e contenuti social:
              una presenza coerente, costruita intorno al tuo brand.
            </p>
            <button className="light-text-button" onClick={onContact}>
              Conosciamoci <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
        <div className="about-principles" data-reveal>
          <div>
            <span>01</span>
            <p>
              La sostanza,
              <br />
              <b>prima dello stile.</b>
            </p>
          </div>
          <div>
            <span>02</span>
            <p>
              Su misura,
              <br />
              <b>fino all’ultimo pixel.</b>
            </p>
          </div>
          <div>
            <span>03</span>
            <p>
              Una bella esperienza,
              <br />
              <b>su ogni schermo.</b>
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
    <section
      id="servizi"
      className="services section-space container"
      aria-labelledby="services-title"
    >
      <div className="section-kicker" data-reveal>
        <span className="eyebrow">03 / COSA POSSIAMO FARE</span>
        <Asterisk className="small-asterisk" />
      </div>
      <div className="section-heading" data-reveal>
        <h2 id="services-title">
          Dall’intuizione
          <br />
          <em>all’ultimo dettaglio.</em>
        </h2>
        <p>
          Ogni progetto ha bisogno di una direzione.
          <br />E di qualcuno che sappia portarla
          <br className="desktop-break" /> fino in fondo.
        </p>
      </div>
      <div className="service-list">
        {services.map((service, i) => (
          <div
            className={`service-row ${expanded === i ? "expanded" : ""}`}
            key={service.number}
            data-reveal
          >
            <button
              className="service-trigger"
              aria-expanded={expanded === i}
              aria-controls={`service-${i}`}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className="service-number">{service.number}</span>
              <span className="service-title">{service.title}</span>
              <span className="service-tag">{service.tag}</span>
              <span className="service-toggle">
                {expanded === i ? <Minus size={22} /> : <Plus size={22} />}
              </span>
            </button>
            <div
              className="service-panel"
              id={`service-${i}`}
              hidden={expanded !== i}
            >
              <p>{service.text}</p>
              <div className="service-pills">
                {service.details.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="process" data-reveal>
        <span className="eyebrow">IL PERCORSO, SENZA GIRI DI PAROLE.</span>
        <div className="process-steps">
          {[
            ["01", "Ascolto", "Il tuo mondo, i tuoi obiettivi."],
            ["02", "Direzione", "Un’idea chiara, condivisa."],
            ["03", "Creazione", "Siti e contenuti, con cura."],
            ["04", "Lancio", "Ogni dettaglio al suo posto."],
          ].map(([n, title, desc]) => (
            <div key={n}>
              <span>
                {n}
                <ArrowRight size={17} />
              </span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="faq container" aria-labelledby="faq-title">
      <div data-reveal>
        <span className="eyebrow">PRIMA DI INIZIARE</span>
        <h2 id="faq-title">
          Le domande
          <br />
          <em>giuste.</em>
        </h2>
      </div>
      <div className="faq-list" data-reveal>
        {faqs.map((faq, i) => (
          <div className={`faq-item ${open === i ? "open" : ""}`} key={faq.q}>
            <h3>
              <button
                aria-expanded={open === i}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {faq.q}
                <span>
                  {open === i ? <Minus size={19} /> : <Plus size={19} />}
                </span>
              </button>
            </h3>
            <div id={`faq-${i}`} hidden={open !== i}>
              <p>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact({ onContact }) {
  return (
    <section
      className="contact-section"
      id="contatti"
      aria-labelledby="contact-title"
    >
      <div className="container">
        <div className="contact-top" data-reveal>
          <span className="eyebrow">
            <span className="status-dot" /> IL PROSSIMO BEL PROGETTO?
          </span>
          <span className="tiny-label">POTREBBE ESSERE IL TUO.</span>
        </div>
        <button className="contact-big" onClick={onContact} data-reveal>
          <h2 id="contact-title">
            Facciamolo
            <br />
            <em>succedere.</em>
          </h2>
          <span className="contact-arrow">
            <ArrowUpRight strokeWidth={1.2} />
          </span>
        </button>
        <div className="contact-bottom" data-reveal>
          <p>
            Un nuovo sito, social da curare o entrambi?
            <br />
            Partiamo da una conversazione.
          </p>
          <a
            className="button button-dark"
            href={`https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent("Ciao Kirill! Ho visto il tuo portfolio e vorrei parlarti del mio progetto.")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Scrivimi su WhatsApp <MessageCircle size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer container">
      <div className="footer-main">
        <Logo footer />
        <p>
          Siti web e social.
          <br />
          Un’identità, con carattere.
        </p>
        <a href="#inizio" className="back-top">
          Torna su <ArrowUpRight size={18} />
        </a>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Kirill Bielokon</span>
        <span>PENSATO CON CURA. COSTRUITO CON INTENZIONE.</span>
        <a
          href={`https://wa.me/${profile.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-whatsapp"
        >
          WhatsApp <ArrowUpRight size={11} />
        </a>
      </div>
    </footer>
  );
}

function Modal({ open, onClose, labelledBy, children, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) {
      dialog.showModal();
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
        if (dialog.open) dialog.close();
      };
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-shell">
        <button
          className="modal-close"
          aria-label="Chiudi finestra"
          onClick={onClose}
        >
          <X size={22} />
        </button>
        {children}
      </div>
    </dialog>
  );
}

function ProjectModal({ project, onClose, onContact }) {
  return (
    <Modal
      open={!!project}
      onClose={onClose}
      labelledBy="project-modal-title"
      className="project-modal"
    >
      {project && (
        <>
          <div className="project-modal-head">
            <span className="eyebrow">
              STUDIO INDIPENDENTE / {project.number}
            </span>
            <h2 id="project-modal-title">
              {project.name}
              <span className="orange">.</span>
            </h2>
            <p>{project.intro}</p>
            <div className="project-tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <img
            className="project-modal-image"
            src={project.image}
            alt={`Studio visivo ${project.name}`}
            width="1600"
            height="1100"
          />
          <div className="project-modal-content">
            <p className="project-modal-intro">{project.description}</p>
            <div className="case-study-columns">
              <div>
                <h3>La domanda di partenza</h3>
                <p>{project.challenge}</p>
              </div>
              <div>
                <h3>La direzione</h3>
                <p>{project.approach}</p>
              </div>
            </div>
            {project.secondaryImage && (
              <div className="case-social-companion">
                <h3>Dal feed al sito. La stessa identità.</h3>
                <img
                  src={project.secondaryImage}
                  width="1600"
                  height="1100"
                  loading="lazy"
                  alt="Il concept web di Campo, coordinato alla direzione social"
                />
              </div>
            )}
            <div className="deliverables">
              <span className="eyebrow">IL PERIMETRO DEL CONCEPT</span>
              {project.deliverables.map((d) => (
                <span key={d}>
                  {d}
                  <Check size={15} />
                </span>
              ))}
            </div>
            <p className="concept-note">
              Questo progetto è un concept originale per un brand immaginario.
              Non rappresenta un incarico cliente, un sito pubblicato o
              risultati commerciali.
            </p>
            <button
              className="button button-orange"
              onClick={() => {
                onClose();
                onContact();
              }}
            >
              Una direzione per il tuo brand? <ArrowUpRight size={18} />
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

function ContactModal({ open, onClose }) {
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "Sito web",
    message: "",
  });
  const brief = `Ciao Kirill!\n\nSono ${form.name}.\n${form.email ? `La mia email: ${form.email}` : ""}\nIl mio progetto: ${form.type}\n\n${form.message}\n`;
  const whatsappUrl = `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(ready ? brief : "Ciao Kirill! Ho visto il tuo portfolio e vorrei parlarti del mio progetto.")}`;
  const change = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    setReady(true);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  const download = () => {
    const blob = new Blob([brief], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "il-mio-progetto-per-kirill.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  useEffect(() => {
    if (open) {
      setReady(false);
      setCopied(false);
      setCopyError(false);
    }
  }, [open]);
  useEffect(() => {
    if (ready)
      document
        .getElementById("contact-modal-title")
        ?.focus({ preventScroll: true });
  }, [ready]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="contact-modal-title"
      className="contact-modal"
    >
      <div className="contact-modal-content">
        <span className="eyebrow">DA COSA NASCE COSA.</span>
        <h2 id="contact-modal-title" tabIndex={-1}>
          {ready ? (
            <>
              Ottimo inizio<em>.</em>
            </>
          ) : (
            <>
              La tua prossima
              <br />
              <em>bella idea.</em>
            </>
          )}
        </h2>
        {!ready ? (
          <>
            <p>
              Raccontami cosa hai in mente. Possiamo iniziare con un messaggio,
              senza impegno.
            </p>
            <a
              className="button button-whatsapp"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={19} /> Scrivimi su WhatsApp{" "}
              <ArrowUpRight size={18} />
            </a>
            <div className="contact-separator">
              <span />
              OPPURE PREPARA IL TUO BRIEF
              <span />
            </div>
            <form onSubmit={submit}>
              <div className="form-grid">
                <label>
                  Come ti chiami?
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={change}
                    placeholder="Il tuo nome"
                    maxLength={100}
                  />
                </label>
                <label>
                  Email (facoltativa)
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={change}
                    placeholder="nome@azienda.it"
                    maxLength={200}
                  />
                </label>
              </div>
              <fieldset>
                <legend>A cosa stai pensando?</legend>
                <div className="type-options">
                  {["Sito web", "Gestione social", "Sito + social"].map(
                    (type) => (
                      <label
                        className={form.type === type ? "selected" : ""}
                        key={type}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={form.type === type}
                          onChange={change}
                        />
                        {type}
                      </label>
                    ),
                  )}
                </div>
              </fieldset>
              <label>
                Raccontami qualcosa
                <textarea
                  required
                  name="message"
                  value={form.message}
                  onChange={change}
                  placeholder="Il tuo brand, cosa vuoi ottenere, le tue idee…"
                  rows={4}
                  minLength={15}
                  maxLength={5000}
                />
              </label>
              <p className="form-privacy">
                I dati rimangono nel tuo browser. Scegli tu quando aprire
                WhatsApp e inviare il messaggio.
              </p>
              <button
                className="button button-orange form-submit"
                type="submit"
              >
                Prepara il messaggio <ArrowUpRight size={19} />
              </button>
            </form>
          </>
        ) : (
          <div className="brief-ready">
            <p>
              Il tuo messaggio è pronto. Aprilo su WhatsApp: potrai rileggerlo e
              modificarlo prima di inviarlo.
            </p>
            <pre tabIndex={0}>{brief}</pre>
            <div className="brief-actions">
              <a
                className="button button-whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={17} /> Apri WhatsApp{" "}
                <ArrowUpRight size={17} />
              </a>
              <button
                className="button button-outline"
                onClick={copy}
                aria-label="Copia il messaggio"
              >
                {copied ? <Check size={17} /> : <Copy size={17} />}
              </button>
              <button className="button button-outline" onClick={download}>
                Scarica <Download size={17} />
              </button>
            </div>
            <p className="copy-status" role="status">
              {copyError
                ? "La copia non è disponibile in questo browser. Scarica il messaggio oppure seleziona il testo qui sopra."
                : copied
                  ? "Copiato. Ora puoi incollarlo nella tua conversazione."
                  : ""}
            </p>
            <button className="text-button" onClick={() => setReady(false)}>
              Modifica il messaggio <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  useMotion();
  const openContact = () => setContactOpen(true);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Vai al contenuto
      </a>
      <Header onContact={openContact} />
      <main id="main-content">
        <Hero onContact={openContact} />
        <Marquee />
        <Work onProject={setSelectedProject} />
        <About onContact={openContact} />
        <Services />
        <FAQ />
        <Contact onContact={openContact} />
      </main>
      <Footer />
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onContact={openContact}
      />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

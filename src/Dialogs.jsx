import React, { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  X,
  Check,
  Copy,
  Download,
  MessageCircle,
} from "lucide-react";
import { profile } from "./content";

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

export function ProjectModal({ project, onClose, onContact }) {
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
            <span className="eyebrow">CONCEPT / {project.number}</span>
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
              Parliamo del tuo progetto <ArrowUpRight size={18} />
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export function ContactModal({ open, onClose, initialType = "" }) {
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
      if (
        ["Sito web", "Gestione social", "Sito + social"].includes(initialType)
      ) {
        setForm((previous) => ({ ...previous, type: initialType }));
      }
    }
  }, [open, initialType]);
  useEffect(() => {
    if (open) {
      document
        .getElementById("contact-modal-title")
        ?.focus({ preventScroll: true });
    }
  }, [ready, open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="contact-modal-title"
      className="contact-modal"
    >
      <div className="contact-modal-content">
        <span className="eyebrow">IL PRIMO PASSO È UNA CONVERSAZIONE.</span>
        <h2 id="contact-modal-title" tabIndex={-1}>
          {ready ? (
            <>
              Il messaggio è pronto<em>.</em>
            </>
          ) : (
            <>
              Parliamo
              <br />
              <em>del progetto.</em>
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
              PREFERISCI METTERE A FUOCO L’IDEA?
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
                        <span>{type}</span>
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

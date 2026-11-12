import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource/instrument-serif/400-italic.css";
import "./site.css";

/* ------------------------------------------------------------------
   Statistiche visite (facoltative, senza cookie).
   1. Crea un account gratuito su https://www.goatcounter.com
   2. Scrivi qui il codice scelto, es. "kirillbielokon"
   3. npm run build e pubblica. Le visite e i clic sui pulsanti di
      contatto compariranno su https://<codice>.goatcounter.com
   ------------------------------------------------------------------ */
const GOATCOUNTER_CODE = "";

const WHATSAPP = "393896322180";
const EMAIL = "kirillbielokon@gmail.com";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

/* ---------- Analytics ---------- */
if (GOATCOUNTER_CODE && !/^(localhost|127\.)/.test(location.hostname)) {
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
  document.head.append(s);
}
function track(name) {
  try {
    window.goatcounter?.count?.({ path: `clic-${name}`, title: name, event: true });
  } catch {}
}
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-track]");
  if (el && el.tagName !== "BUTTON") track(el.dataset.track);
});

/* ---------- Year ---------- */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------- Nav: shadow on scroll + mobile menu ---------- */
const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-menu-toggle]");
const menu = document.getElementById("menu");
const darkSections = [...document.querySelectorAll(".work, .contact, .footer")];
const onScroll = () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 12);
  const probe = 36; // nav centre line
  nav.classList.toggle(
    "is-dark",
    darkSections.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom > probe;
    }),
  );
  document.body.classList.toggle("show-fab", window.scrollY > window.innerHeight * 0.8);
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Hide the floating WhatsApp button while the contact section is on screen.
const contact = document.getElementById("contatti");
if (contact && "IntersectionObserver" in window) {
  new IntersectionObserver(([en]) => document.body.classList.toggle("hide-fab", en.isIntersecting), {
    threshold: 0.15,
  }).observe(contact);
}

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".sr-only").textContent = open ? "Chiudi il menu" : "Apri il menu";
  menu.hidden = !open;
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("no-scroll", open);
}
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
menu.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !menu.hidden) {
    setMenu(false);
    toggle.focus();
  }
});
window.matchMedia("(min-width: 900px)").addEventListener("change", (m) => m.matches && setMenu(false));

/* ---------- Reveal on scroll ---------- */
const reveals = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((el) => el.classList.add("is-in"));
} else {
  // Stagger siblings that enter together.
  const io = new IntersectionObserver(
    (entries) => {
      let i = 0;
      entries
        .filter((en) => en.isIntersecting)
        .forEach((en) => {
          en.target.style.transitionDelay = `${Math.min(i++ * 70, 350)}ms`;
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  reveals.forEach((el) => io.observe(el));
}

/* ---------- Hero stage: flatten on scroll + tilt on pointer ---------- */
const stage = document.querySelector("[data-stage]");
const tilt = document.querySelector("[data-tilt]");
if (stage && tilt && !reduceMotion) {
  let px = 0, py = 0, sp = 0, raf = 0;
  const render = () => {
    raf = 0;
    const rx = 16 * (1 - sp) + py * -4;
    const ry = px * 6;
    const sc = 0.94 + sp * 0.06;
    tilt.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    tilt.style.setProperty("--sp", sp.toFixed(3));
  };
  const queue = () => (raf ||= requestAnimationFrame(render));
  const measure = () => {
    const r = stage.getBoundingClientRect();
    const vh = window.innerHeight;
    sp = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9) - 0.15));
    queue();
  };
  measure();
  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", measure);
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
      queue();
    });
  }
}

/* ---------- Spotlight on service cards ---------- */
document.querySelectorAll("[data-spot]").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

/* ---------- FAQ: one open at a time ---------- */
const qas = document.querySelectorAll(".qa");
qas.forEach((d) =>
  d.addEventListener("toggle", () => {
    if (d.open) qas.forEach((o) => o !== d && (o.open = false));
  }),
);

/* ---------- Brief → WhatsApp / email ---------- */
const form = document.querySelector("[data-brief]");
if (form) {
  const err = form.querySelector("[data-brief-error]");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const via = e.submitter?.value || "whatsapp";
    const data = new FormData(form);
    const nome = String(data.get("nome") || "").trim();
    const tipi = data.getAll("tipo");
    const budget = data.get("budget");
    const msg = String(data.get("messaggio") || "").trim();

    if (!nome) {
      err.textContent = "Scrivi almeno il tuo nome, così so chi sei.";
      err.hidden = false;
      form.querySelector("#b-nome").focus();
      return;
    }
    err.hidden = true;

    const lines = [
      `Ciao Kirill, sono ${nome}.`,
      tipi.length ? `Mi serve: ${tipi.join(", ")}.` : "",
      budget ? `Budget indicativo: ${budget}.` : "",
      msg ? `\n${msg}` : "",
      "\n(Scritto dal brief su kirillbielokon.com)",
    ].filter(Boolean);
    const text = lines.join("\n");

    track(`brief-${via}`);
    if (via === "email") {
      const subject = `Nuovo progetto — ${nome}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }
  });
}

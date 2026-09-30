/* =========================================================
   Carrosserie Jeanne d'Arc — scripts
   Infos du garage : modifier l'objet BUSINESS ci-dessous
   ========================================================= */
const BUSINESS = {
  whatsapp: "33788815526",
  // Lundi = 1 ... Vendredi = 5 ; créneaux en minutes depuis minuit
  days: [1, 2, 3, 4, 5],
  slots: [
    [9 * 60, 12 * 60],
    [14 * 60, 18 * 60],
  ],
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Header : fond au scroll + menu mobile ---------- */
const header = document.querySelector(".header");
const burger = document.querySelector(".burger");

function onScroll() {
  header.classList.toggle("scrolled", window.scrollY > 40);
}
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

function setMenu(open) {
  header.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
}
burger.addEventListener("click", () => setMenu(!header.classList.contains("open")));
document.querySelectorAll(".mobile-menu a, .logo").forEach((a) =>
  a.addEventListener("click", () => setMenu(false))
);

/* ---------- Apparition en fondu des sections ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- Badge Ouvert / Fermé (heure de Marseille) ---------- */
function computeStatus() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t) => (parts.find((p) => p.type === t) || {}).value || "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  const fmt = (m) => `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`;

  if (BUSINESS.days.includes(day)) {
    for (const [start, end] of BUSINESS.slots) {
      if (minutes >= start && minutes < end) return { open: true, label: `Ouvert · ferme à ${fmt(end)}` };
      if (minutes < start) return { open: false, label: `Fermé · ouvre à ${fmt(start)}` };
    }
  }
  const next = day === 5 || day === 6 ? "lundi" : "demain";
  return { open: false, label: `Fermé · ouvre ${next} à 9h00` };
}

function updateStatus() {
  const { open, label } = computeStatus();
  document.querySelectorAll("[data-status]").forEach((el) => {
    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
    el.querySelector("[data-status-label]").textContent = label;
  });
}
updateStatus();
setInterval(updateStatus, 60000);

/* ---------- Compteurs animés ---------- */
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countObserver.unobserve(entry.target);
      const el = entry.target;
      const to = Number(el.dataset.to);
      const decimals = Number(el.dataset.decimals || 0);
      const suffix = el.dataset.suffix || "";
      const render = (v) =>
        (el.textContent =
          v.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix);
      if (reduceMotion) return render(to);
      const start = performance.now();
      const duration = 1400;
      const tick = (t) => {
        const p = Math.min((t - start) / duration, 1);
        render(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll("[data-to]").forEach((el) => countObserver.observe(el));

/* ---------- Galerie : boucle infinie + agrandissement ---------- */
const lightbox = document.querySelector(".lightbox");
const lightboxImg = lightbox.querySelector("img");
let lastFocus = null;

function openLightbox(src, alt) {
  lastFocus = document.activeElement;
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.setAttribute("aria-label", alt);
  lightbox.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => lightbox.classList.add("open")));
  lightbox.focus();
}
function closeLightbox() {
  lightbox.classList.remove("open");
  setTimeout(() => (lightbox.hidden = true), 250);
  if (lastFocus) lastFocus.focus();
}
lightbox.addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox-frame").addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
});

document.querySelectorAll(".marquee-track").forEach((track) => {
  // Duplique les photos pour que le défilement boucle sans coupure
  [...track.children].forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.tabIndex = -1;
    track.appendChild(clone);
  });
  track.addEventListener("click", (e) => {
    const item = e.target.closest(".marquee-item");
    if (!item) return;
    const img = item.querySelector("img");
    openLightbox(img.currentSrc || img.src, img.alt);
  });
});

/* ---------- Formulaire de devis → WhatsApp ---------- */
const form = document.getElementById("devis-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (name) => (form.elements[name].value || "").trim();
    const errors = {};
    if (!v("nom")) errors.nom = "Indiquez votre nom.";
    if (v("tel").replace(/\D/g, "").length < 10) errors.tel = "Indiquez un numéro valide (10 chiffres).";

    ["nom", "tel"].forEach((name) => {
      const input = form.elements[name];
      const msg = document.getElementById(`${name}-err`);
      msg.textContent = errors[name] || "";
      input.setAttribute("aria-invalid", String(!!errors[name]));
      if (errors[name]) input.setAttribute("aria-describedby", `${name}-err`);
      else input.removeAttribute("aria-describedby");
    });
    if (Object.keys(errors).length) {
      form.elements[errors.nom ? "nom" : "tel"].focus();
      return;
    }

    const lines = [
      "Bonjour Carrosserie Jeanne d'Arc, je souhaite un devis.",
      "",
      `*Nom :* ${v("nom")}`,
      `*Téléphone :* ${v("tel")}`,
      v("vehicule") ? `*Véhicule :* ${v("vehicule")}` : null,
      `*Prestation :* ${v("prestation")}`,
      `*Passage par l'assurance :* ${v("assurance")}`,
      v("message") ? `*Message :* ${v("message")}` : null,
      "",
      "(J'envoie les photos des dégâts juste après.)",
    ].filter((l) => l !== null);

    const url = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    // Nouvel onglet ; si le navigateur le bloque, on ouvre WhatsApp dans l'onglet courant.
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
    document.getElementById("form-note").textContent =
      "WhatsApp s'est ouvert : appuyez sur Envoyer pour transmettre votre demande.";
  });
}

/* ---------- Année du footer ---------- */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const d = document;
const $ = <T extends Element = Element>(sel: string, ctx: ParentNode = d) =>
  ctx.querySelector<T>(sel);
const $$ = <T extends Element = Element>(sel: string, ctx: ParentNode = d) =>
  Array.from(ctx.querySelectorAll<T>(sel));

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const safe = (fn: () => void) => {
  try {
    fn();
  } catch (err) {
    console.warn('[phenix]', err);
  }
};

/* Tokens de movimiento de PHENIX. Salen de la ficha, no de un sitio anterior. */
const M = {
  ease: 'power3.out',
  dur: 0.9,
  stagger: 0.07,
  dist: 28,
  lerp: 0.1,
};

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/* Expuestas para depuración y para las herramientas de revisión. */
declare global {
  interface Window {
    gsap: typeof gsap;
    ScrollTrigger: typeof ScrollTrigger;
    Lenis: typeof Lenis;
  }
}
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.Lenis = Lenis;

/* --- Scroll suave ------------------------------------------------------- */
let lenis: Lenis | null = null;

if (!RM) {
  lenis = new Lenis({ lerp: M.lerp, smoothWheel: true, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis && lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* --- Anclas ------------------------------------------------------------- */
safe(() => {
  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -72 });
      else (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});

/* --- Firma: la chispa, el techo, el botón ------------------------------- */
const firmaPortada = () => {
  const root = $<HTMLElement>('[data-portada]');
  if (!root) return null;

  const marco = $<SVGPathElement>('.chispa__marco', root);
  const alas = $$<SVGPathElement>('.chispa__ala', root);
  const celdas = $$<SVGRectElement>('.celda', root);

  const trazos = [marco, ...alas].filter(Boolean) as SVGPathElement[];
  trazos.forEach((p) => {
    const L = p.getTotalLength();
    gsap.set(p, { strokeDasharray: `${L} ${L + 6}`, strokeDashoffset: L + 3 });
  });
  gsap.set(alas, { fillOpacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: M.ease } });

  tl.to(marco, { strokeDashoffset: 0, duration: 1.15, ease: 'power2.inOut' }, 0)
    .to('.hero__in', { yPercent: 0, duration: 1.15 }, 0.05)
    .to('[data-hero-panel]', { autoAlpha: 1, y: 0, duration: M.dur }, 0.15)
    .to(alas, { strokeDashoffset: 0, duration: 0.75, stagger: 0.1, ease: 'power2.inOut' }, 0.35)
    .to('[data-hero-in]', { autoAlpha: 1, y: 0, duration: M.dur, stagger: M.stagger }, 0.4)
    .to(alas, { fillOpacity: 1, duration: 0.6, stagger: 0.09 }, 0.95)
    .to(
      celdas,
      {
        fill: 'rgba(196, 85, 45, 0.42)',
        duration: 0.55,
        stagger: { each: 0.035, from: 'start' },
      },
      1.15
    )
    .to('.celda--marca', { fill: '#F2A33C', duration: 0.5 }, 1.7)
    .to('.hero__acciones .btn__spark', { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, 2);

  return tl;
};

/* --- Estados iniciales -------------------------------------------------- */
if (!RM) {
  gsap.set('[data-hero-in]', { autoAlpha: 0, y: M.dist });
  gsap.set('[data-hero-panel]', { autoAlpha: 0, y: 24 });
  gsap.set('.hero__in', { yPercent: 112 });
  gsap.set('.hero__acciones .btn__spark', { scaleX: 0 });
}

/* --- Revelado al bajar --------------------------------------------------- */
const revelados = () => {
  gsap.set('[data-reveal]', { opacity: 0, y: M.dist });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: M.dur,
        ease: M.ease,
        stagger: Math.min(M.stagger, 0.6 / batch.length),
        overwrite: true,
      }),
  });
};

/* --- Arranque ------------------------------------------------------------ */
let tl: gsap.core.Timeline | null = null;

const repetir = (btn: HTMLElement) => {
  if (!tl) return;
  const lejos = !!btn.closest('.cierre');
  if (lejos && lenis) {
    lenis.scrollTo('#portada', { offset: -64 });
    window.setTimeout(() => tl && tl.restart(), 650);
    return;
  }
  tl.restart();
};

safe(() => {
  const botones = $$<HTMLButtonElement>('[data-ver-de-nuevo]');
  const aviso = $<HTMLElement>('[data-aviso-rm]');

  if (RM) {
    if (aviso) aviso.hidden = false;
    botones.forEach((btn) =>
      btn.addEventListener('click', () => {
        gsap.fromTo(
          '[data-portada] .hero__firma, [data-portada] .hero__title, [data-portada] .hero__pie, [data-portada] .hero__trust, [data-portada] .medidor',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, stagger: 0.1, ease: 'none' }
        );
      })
    );
    return;
  }

  const arrancar = () => {
    tl = firmaPortada();
    revelados();
    ScrollTrigger.refresh();
  };

  Promise.race([
    d.fonts ? d.fonts.ready : Promise.resolve(),
    new Promise((r) => window.setTimeout(r, 1200)),
  ]).then(() => safe(arrancar));

  botones.forEach((btn) => btn.addEventListener('click', () => repetir(btn)));
});

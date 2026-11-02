import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/* ==========================================================================
   PHENIX · Landing
   Datos de contacto: completar antes de publicar.
   ========================================================================== */

const WHATSAPP = ''; // número del negocio, con código de país y sin + ni espacios
const CORREO = ''; // correo del negocio

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

const M = { ease: 'power3.out', dur: 0.9, stagger: 0.07, dist: 28, lerp: 0.1 };

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

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
  /* Una pregunta del FAQ se abre sola cuando el enlace apunta a ella. */
  const abrirDetalle = (target: Element | null, enfocar = false) => {
    if (!(target instanceof HTMLDetailsElement) || target.open) return;
    target.open = true;
    if (enfocar) target.querySelector('summary')?.focus({ preventScroll: true });
  };

  /* Si el destino todavía no se reveló, se saca el desplazamiento de entrada
     para que el ancla caiga donde corresponde y no 28 px más arriba. */
  const prepararDestino = (target: Element) => {
    if (window.gsap && target.hasAttribute('data-reveal')) {
      window.gsap.set(target, { opacity: 1, y: 0 });
    }
  };

  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();

      abrirDetalle(target, true);
      prepararDestino(target);

      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -72 });
      else (target as HTMLElement).scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });

      /* La URL queda apuntando a la pregunta: al compartirla o recargar, se abre igual. */
      if (target instanceof HTMLDetailsElement && history.replaceState) {
        try {
          history.replaceState(null, '', id);
        } catch {
          /* algunos navegadores no permiten cambiar la URL: no es crítico */
        }
      }
    });
  });

  const abrirDesdeHash = () => {
    if (!location.hash) return;
    try {
      abrirDetalle(d.querySelector(location.hash));
    } catch {
      /* hash inválido: no hacemos nada */
    }
  };

  abrirDesdeHash();
  window.addEventListener('hashchange', abrirDesdeHash);
});

/* --- Firma de la portada ------------------------------------------------ */
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
      { fill: 'rgba(196, 85, 45, 0.42)', duration: 0.55, stagger: { each: 0.035, from: 'start' } },
      1.15
    )
    .to('.celda--marca', { fill: '#F2A33C', duration: 0.5 }, 1.7)
    .to('.hero__acciones .btn__spark', { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, 2);

  return tl;
};

if (!RM) {
  gsap.set('[data-hero-in]', { autoAlpha: 0, y: M.dist });
  gsap.set('[data-hero-panel]', { autoAlpha: 0, y: 24 });
  gsap.set('.hero__in', { yPercent: 112 });
  gsap.set('.hero__acciones .btn__spark', { scaleX: 0 });
}

/* --- Revelado al bajar --------------------------------------------------- */
const revelados = () => {
  gsap.set('[data-reveal]', { opacity: 0, y: M.dist });

  /* Si la página abre con un ancla, ese bloque se muestra de una vez:
     así el salto inicial cae en el lugar correcto. */
  let destino: Element | null = null;
  try {
    destino = location.hash ? d.querySelector(location.hash) : null;
  } catch {
    destino = null;
  }
  if (destino) gsap.set(destino, { opacity: 1, y: 0 });

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

/* --- Pestañas de soluciones --------------------------------------------- */
safe(() => {
  const root = $<HTMLElement>('[data-tabs]');
  if (!root) return;

  const tabs = $$<HTMLButtonElement>('.tabs__tab', root);
  const panels = $$<HTMLElement>('.tabs__panel', root);
  if (!tabs.length || !panels.length) return;

  const activar = (id: string, enfocar = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && enfocar) t.focus();
    });
    panels.forEach((p) => {
      p.hidden = p.dataset.panel !== id;
    });
  };

  activar(tabs[0].dataset.tab || 'casa');

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activar(t.dataset.tab || 'casa'));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const paso = e.key === 'ArrowRight' ? 1 : -1;
      const next = (i + paso + tabs.length) % tabs.length;
      activar(tabs[next].dataset.tab || 'casa', true);
    });
  });
});

/* --- Calculadora --------------------------------------------------------- */
const GEN = 1400; // kWh por kWp al año, promedio del país
const PERD = 0.12; // pérdidas de conversión y cableado
const AUTO: Record<string, number> = { casa: 0.7, comercio: 0.78, industria: 0.85 };

const num = (v: string) => Number(String(v).replace(/\D/g, '')) || 0;
const fmt = (n: number, dec = 0) =>
  new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(n);

safe(() => {
  const form = $<HTMLFormElement>('[data-calc-form]');
  const res = $<HTMLElement>('[data-calc-resultado]');
  if (!form || !res) return;

  const facturaEl = $<HTMLInputElement>('input[name="factura"]', form);
  const consumoEl = $<HTMLInputElement>('input[name="consumo"]', form);
  const errorEl = $<HTMLElement>('[data-calc-error]');
  const out = {
    kwp: $<HTMLElement>('[data-out="kwp"]', res),
    generacion: $<HTMLElement>('[data-out="generacion"]', res),
    ahorro: $<HTMLElement>('[data-out="ahorro"]', res),
    pct: $<HTMLElement>('[data-out="pct"]', res),
  };
  if (!facturaEl || !consumoEl) return;

  let ultimo = '';

  const pintar = () => {
    const factura = Math.min(num(facturaEl.value), 50_000_000);
    const consumo = Math.min(num(consumoEl.value), 200_000);
    const tipo =
      ($<HTMLInputElement>('input[name="tipo"]:checked', form)?.value as string) || 'casa';
    const auto = AUTO[tipo] ?? AUTO.casa;

    if (factura < 1000 || consumo < 10) {
      if (errorEl) errorEl.hidden = false;
      return;
    }
    if (errorEl) errorEl.hidden = true;

    const anual = consumo * 12;
    const kwp = anual / (GEN * (1 - PERD) * auto);
    const generacion = Math.round(kwp * GEN * (1 - PERD));
    const ahorro = Math.round(factura * auto * (1 - PERD));
    const pct = Math.round(auto * (1 - PERD) * 100);

    const clave = `${kwp.toFixed(1)}|${generacion}|${ahorro}|${pct}`;
    if (clave === ultimo) return;
    ultimo = clave;

    if (out.kwp) out.kwp.textContent = fmt(Math.round(kwp * 10) / 10, 1);
    if (out.generacion) out.generacion.textContent = fmt(generacion);
    if (out.ahorro) out.ahorro.textContent = fmt(ahorro);
    if (out.pct) out.pct.textContent = String(pct);

    if (!RM) gsap.fromTo(res, { opacity: 0.45 }, { opacity: 1, duration: 0.35, ease: 'none' });
  };

  form.addEventListener('input', pintar);
  form.addEventListener('change', pintar);
  form.addEventListener('submit', (e) => e.preventDefault());

  [facturaEl, consumoEl].forEach((el) => {
    el.addEventListener('blur', () => {
      const n = num(el.value);
      if (n > 0) el.value = fmt(n);
      pintar();
    });
  });

  pintar();
});

/* --- Formulario a WhatsApp ---------------------------------------------- */
safe(() => {
  const form = $<HTMLFormElement>('[data-form]');
  if (!form) return;

  const errorEl = $<HTMLElement>('[data-form-error]', form);
  const listo = $<HTMLElement>('[data-form-listo]', form);
  const mensajeEl = $<HTMLElement>('[data-form-mensaje]', form);
  const copiado = $<HTMLElement>('[data-form-copiado]', form);
  const copiar = $<HTMLButtonElement>('[data-form-copiar]', form);
  const porCorreo = $<HTMLAnchorElement>('[data-form-correo]', form);

  const armar = () => {
    const datos = new FormData(form);
    const get = (k: string) => String(datos.get(k) || '').trim();
    const nombre = get('nombre');
    const ciudad = get('ciudad');

    if (!nombre || !ciudad) {
      if (errorEl) errorEl.hidden = false;
      const primero = (!nombre ? form.elements.namedItem('nombre') : form.elements.namedItem('ciudad')) as unknown as
        | HTMLInputElement
        | null;
      primero?.focus();
      return null;
    }
    if (errorEl) errorEl.hidden = true;

    const lineas = [
      'Hola PHENIX, quiero una cotización.',
      '',
      `Nombre: ${nombre}`,
      `Ciudad: ${ciudad}`,
      `Tipo: ${get('tipo') || 'Casa'}`,
    ];

    const factura = get('factura');
    const consumo = get('consumo');
    if (factura) lineas.push(`Factura mensual: $${factura}`);
    if (consumo) lineas.push(`Consumo mensual: ${consumo} kWh`);

    const extra = get('mensaje');
    if (extra) lineas.push('', extra);

    return lineas.join('\n');
  };

  const mostrar = (texto: string) => {
    if (mensajeEl) mensajeEl.textContent = texto;
    if (listo) listo.hidden = false;
    listo?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = armar();
    if (!texto) return;

    if (WHATSAPP) {
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
      return;
    }
    mostrar(texto);
  });

  porCorreo?.addEventListener('click', (e) => {
    e.preventDefault();
    if (CORREO) {
      const texto = armar();
      if (!texto) return;
      window.location.href = `mailto:${CORREO}?subject=${encodeURIComponent(
        'Cotización de energía solar'
      )}&body=${encodeURIComponent(texto)}`;
      return;
    }
    const texto = armar();
    if (texto) mostrar(texto);
  });

  copiar?.addEventListener('click', async () => {
    const texto = mensajeEl?.textContent || '';
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const area = d.createElement('textarea');
      area.value = texto;
      d.body.appendChild(area);
      area.select();
      d.execCommand('copy');
      area.remove();
    }
    if (copiado) {
      copiado.hidden = false;
      window.setTimeout(() => (copiado.hidden = true), 2200);
    }
  });
});

/* --- Barra fija del celular --------------------------------------------- */
safe(() => {
  const barra = $<HTMLElement>('[data-barra]');
  if (!barra) return;

  const hero = $<HTMLElement>('[data-portada]');
  const contacto = $<HTMLElement>('#contacto');
  let fueraHero = false;
  let enContacto = false;

  const pintar = () => barra.classList.toggle('barra--visible', fueraHero && !enContacto);

  if (hero) {
    new IntersectionObserver(
      ([e]) => {
        fueraHero = !e.isIntersecting;
        pintar();
      },
      { threshold: 0 }
    ).observe(hero);
  }

  if (contacto) {
    new IntersectionObserver(
      ([e]) => {
        enContacto = e.isIntersecting;
        pintar();
      },
      { rootMargin: '0px 0px -30% 0px' }
    ).observe(contacto);
  }
});

/* --- Arranque ------------------------------------------------------------ */
safe(() => {
  if (RM) return;

  const arrancar = () => {
    firmaPortada();
    revelados();
    ScrollTrigger.refresh();
  };

  Promise.race([
    d.fonts ? d.fonts.ready : Promise.resolve(),
    new Promise((r) => window.setTimeout(r, 1200)),
  ]).then(() => safe(arrancar));
});

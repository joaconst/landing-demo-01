# PHENIX · Landing de energía solar distribuida

Sitio de demostración para vender energía solar llave en mano en Argentina.
Marca, textos, fotos y datos de contacto son de ejemplo y se reemplazan por los del comprador.

- Landing: `/`
- Hoja de dirección de arte (interna, `noindex`): `/marca/`

---

## 1. Cómo correrlo

Necesitás Node 20 o superior.

```bash
npm install      # una sola vez
npm run dev      # desarrollo en http://localhost:4321
npm run build    # genera dist/
npm run preview  # sirve dist/ en http://localhost:4321
```

Es un sitio estático: `dist/` se sube tal cual a cualquier hosting (Netlify, Vercel, Cloudflare Pages, un VPS con Nginx).

---

## 2. Stack

| Pieza | Versión | Para qué |
|---|---|---|
| Astro | 7.4.4 | Generación estática, componentes, scoped styles |
| CSS nativo | | Tokens y componentes, sin Tailwind |
| GSAP + ScrollTrigger | 3.13.0 | Firma de portada y revelados al bajar |
| Lenis | 1.3.11 | Scroll suave |
| Fontsource | 5.3.0 | Archivo Variable, Instrument Sans Variable, IBM Plex Mono, autoalojadas |

Sin frameworks de UI. El JavaScript de la página pesa lo mínimo: GSAP, Lenis y un archivo propio.

---

## 3. Estructura

```
src/
  layouts/Base.astro          head, fuentes, guard no-js → js, favicon
  pages/
    index.astro               landing completa (markup + estilos + datos de secciones)
    marca.astro               hoja de dirección de arte (interna)
  components/
    Spark.astro               símbolo "La chispa"
    Wordmark.astro            logotipo PHENIX
  scripts/landing.ts          interacción: firma, revelados, pestañas, calculadora, formulario
  styles/
    tokens.css                color, tipografía, espacio, movimiento
    global.css                base, botones, utilidades, reduced motion
public/brand/                 favicon y apple-touch-icon
```

Los estilos de la landing viven en el `<style>` de `index.astro`. Los de la hoja de marca, en `marca.astro`. Los tokens son la única fuente de verdad del color y la tipografía.

---

## 4. Datos de contacto (lo primero que hay que completar)

En `src/scripts/landing.ts`, arriba de todo:

```ts
const WHATSAPP = ''; // número con código de país, sin + ni espacios. Ej: 5491123456789
const CORREO = '';   // correo del negocio
```

- Con `WHATSAPP` vacío, el formulario arma el mensaje, lo muestra en pantalla y ofrece copiarlo. Sirve para revisar el flujo sin número.
- Al cargar el número, el botón abre `wa.me` con el mensaje ya escrito.
- Con `CORREO` vacío, el enlace "Prefiero escribirlo por correo" también muestra el mensaje. Al cargarlo, abre el cliente de correo con asunto y cuerpo.
- El texto visible de WhatsApp, correo, ciudad y plazo de respuesta está en la sección 09 y en el pie de `index.astro`, marcado en amarillo.

El mensaje que se arma tiene este formato:

```
Hola PHENIX, quiero una cotización.

Nombre: ...
Ciudad: ...
Tipo: ...
Factura mensual: $...
Consumo mensual: ... kWh

...
```

---

## 5. Calculadora

Pide dos datos: factura mensual y consumo mensual. No pide tarifa ni precio de equipo, para no inventar cifras.

Modelo (idéntico en `index.astro` y en `landing.ts`):

```
anual       = consumo × 12
kWp         = anual / (1400 × 0,88 × autoconsumo)
generación  = kWp × 1400 × 0,88
ahorro      = factura × autoconsumo × 0,88
% ahorro    = autoconsumo × 0,88
```

| Supuesto | Valor | Origen |
|---|---|---|
| Generación específica | 1.400 kWh por kWp al año | Promedio del país, varía por provincia y orientación |
| Pérdidas | 12% | Conversión y cableado |
| Autoconsumo casa | 70% | Supuesto de perfil residencial |
| Autoconsumo comercio | 78% | Supuesto de perfil comercial |
| Autoconsumo industria | 85% | Supuesto de perfil industrial |

El retorno no se calcula en la página: depende del precio de la cotización. Se cita la referencia de mercado de 3 a 4 años con fuente y fecha.

El panel de la portada muestra ese mismo ejemplo: casa, 460 kWh por mes, 6,4 kWp y −62%. Si cambiás los valores iniciales de la calculadora, actualizá también el panel.

**Si cambiás un supuesto, cambialo en los dos archivos.** Están duplicados a propósito: Astro los necesita en el HTML inicial y el navegador los necesita para recalcular.

---

## 6. Placeholders pendientes

Todo lo que falta está entre corchetes y resaltado en amarillo. En el HTML final son 27 marcadores.

| Marcador | Dónde | Qué poner |
|---|---|---|
| `[WHATSAPP]` | Contacto, pie, `<noscript>` | Número con código de país |
| `[CORREO]` | Contacto, pie, `<noscript>` | Correo del negocio |
| `[CIUDAD]` | Contacto, pie, proyectos | Ciudad base |
| `[PLAZO DE RESPUESTA]` | Contacto, formulario | Ej: "menos de 24 horas hábiles" |
| `[PLAZO]` | Proceso, FAQ | Plazo de instalación desde la aprobación |
| `[DÍAS DE OBRA]` | FAQ | Duración de la obra |
| `[GARANTÍA]` | Diferenciales | Plazos y cobertura reales |
| `[AVISO DE PRIVACIDAD]` | Pie | Enlace al aviso legal |
| `[TESTIMONIO REAL DE CLIENTE]` | Testimonios | Texto autorizado, sin retocar el sentido |
| `[NOMBRE] · [CIUDAD]` | Testimonios | Autor y ciudad |
| `[TIPO DE SISTEMA]` | Testimonios | Ej: "6,4 kWp en techo inclinado" |
| `[FOTO DEL PROYECTO N]` | Proyectos | Foto real, reemplaza el bloque tramado |
| `[POTENCIA]`, `[AHORRO REAL]`, `[AÑO]` | Proyectos | Datos verificables de cada obra |

Regla: si un dato no existe, se deja el marcador. No se completa con estimaciones ni con ejemplos que parezcan reales.

---

## 7. Cifras de mercado y fuentes

Las cifras de la sección 02 son del informe de generación distribuida de la Secretaría de Energía a septiembre de 2026, citado por pv magazine Latam el 14/10/2026:

- 223,7 MW de potencia instalada en el país
- 5.246 usuarios-generadores conectados
- 144,25 MW en comercio e industria, +80,9% interanual
- 1.356 solicitudes en trámite, 61,8 MW pendientes

Referencia de retorno: 3 a 4 años, Energía Estratégica, 08/05/2026.

**Cautela documentada:** el mismo informe muestra 223,7 MW en el cuadro provincial y 181 MW en la apertura por categoría. La página usa las cifras conservadoras por segmento y no suma categorías. Antes de publicar, conviene confirmar el número con el informe oficial descargado, no con la nota periodística.

---

## 8. Accesibilidad y movimiento

- Un solo CTA principal, "Calculá mi ahorro", repetido en menú, portada, calculadora, barra del celular y pie.
- Navegación por teclado en las pestañas de soluciones, con flechas izquierda y derecha.
- Foco visible en todos los controles. Campos con etiqueta real, no placeholder.
- El formulario avisa qué falta con un mensaje de texto, no solo con color.
- Contraste: el CTA usa `--cta` (#C95C32), un punto más claro que `--brasa` para que el texto oscuro pase AA. No volver a `--brasa` en botones.
- Con `prefers-reduced-motion: reduce` no se ejecuta ninguna animación de GSAP y el contenido aparece completo.
- Sin JavaScript se ve todo el contenido: las tres pestañas de soluciones quedan abiertas y el formulario muestra un aviso con los contactos.
- El enlace "Ley 27.424" del pie abre la pregunta correspondiente del FAQ, deja el foco en ella y actualiza la URL para poder compartirla.
- Área táctil mínima de 44 px en botones y pestañas.

---

## 9. Revisión

La última corrida de `revisar-sitio.mjs` no encontró problemas técnicos:

- Celular 375 px: 10.319 px de alto, sin desborde lateral, sin contenido oculto, consola limpia.
- Escritorio 1440 px: 7.809 px de alto, mismas verificaciones en verde.
- Reducir movimiento y sin JavaScript: contenido completo, sin desborde.
- Fuentes cargadas y GSAP 3.13.0 con Lenis activo.

Capturas y reporte en `revision-landing/`. La hoja de marca tiene su propia carpeta, `revision-muestra/`.

---

## 10. Antes de publicar

1. Completar `WHATSAPP` y `CORREO` en `src/scripts/landing.ts`.
2. Reemplazar los 27 marcadores de la tabla de la sección 6.
3. Reemplazar la marca PHENIX por la del comprador: `Wordmark.astro`, `Spark.astro`, favicon, `apple-touch-icon` y tokens de color.
4. Cambiar el dominio y las etiquetas `og:` en `index.astro`.
5. Decidir qué hacer con `/marca/`: borrar `src/pages/marca.astro` o dejarla con `noindex`.
6. Confirmar las cifras de mercado con el informe oficial.
7. Probar el envío real a WhatsApp y el correo desde un teléfono.
8. Revisar el aviso de privacidad si el formulario va a recolectar datos.

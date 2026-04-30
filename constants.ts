import { PostFormat, CarouselSlideRole, MessageType, VisualScene, CompositionType, VisualIntensity } from './types';

export const SYNTIWEB_CONTEXT = `
SYNTIweb es una plataforma SaaS multi-tenant diseñada para que negocios venezolanos creen rápida y económicamente una landing page, menú digital o catálogo de productos.
Productos:
1. SYNTIstudio (STUDIO): Sitios web completos para servicios (barberías, clínicas, etc.).
2. SYNTIfood (FOOD): Menús digitales para restaurantes con pedidos por WhatsApp.
3. SYNTIcat (CAT): Catálogos con carrito y checkout para tiendas.
Valores: Rapidez, simplicidad, presencia profesional en minutos, integración con WhatsApp, moneda REF (conversión automática a bolívares).
`;

export const SOCIAL_SYSTEM_PROMPT = `
Eres un equipo experto de marketing digital para Instagram (Año 2026) trabajando para la marca "SYNTIweb" y sus productos (Studio, Food, Cat).

Roles que debes interpretar simultáneamente:
1. Social Media Manager: Estrategia, KPIs (Watch time, Shares), Objetivos de negocio.
2. Content Creator: Estética visual, formatos 3:4 y 9:16, Hooks para Reels.
3. Community Manager: Fomentar debate, DMs, cercanía.
4. Ads Specialist: Segmentación técnica, API de conversiones.
5. SEO Specialist: Palabras clave, Alt Text, búsqueda externa.

Contexto del Negocio:
${SYNTIWEB_CONTEXT}

Tu tarea es analizar la imagen proporcionada (o el tema si no hay imagen) y generar una estructura JSON estricta con el contenido del post.

INSTRUCCIONES DE CONTENIDO (Copy-Paste):
- hook: Una frase corta de impacto inicial (Paso 1).
- body: Explicación clara del beneficio principal (Paso 2).
- cta: Instrucción directa de ir al link o realizar una acción (Paso 3).
- question: Una pregunta estratégica para generar comentarios (Paso 4).
- hashtags: Lista de hashtags relevantes para el nicho (Paso 5).

IMPORTANTE: El tono debe ser profesional, ágil y adaptado al mercado venezolano/latino.
`;

export const FORMAT_DIMENSIONS = {
  [PostFormat.FEED_PORTRAIT]: { width: 1080, height: 1440, label: 'Feed (3:4)', aspect: 'aspect-[3/4]' },
  [PostFormat.REEL_STORY]: { width: 1080, height: 1920, label: 'Story/Reel (9:16)', aspect: 'aspect-[9/16]' }
};

export const PRODUCT_DEFAULTS = {
  SYNTIWEB: {
    visualScene: 'HERO_CENTERED',
    composition: 'CENTERED',
    intensity: 'MEDIUM',
    typoTone: 'TECH',
    realism: 'HYBRID',
    hookType: 'STRONG_STATEMENT',
    productContext: 'AUTOMATION',
    negativeLevel: 'STRICT',
    preset: 'DARK_NAVY',
    visualMode: 'DARK_FORCE',
  },
  STUDIO: {
    visualScene: 'FLOATING_UI',
    composition: 'LEFT_TEXT_RIGHT_VISUAL',
    intensity: 'MEDIUM',
    typoTone: 'MINIMAL_ELEGANT',
    realism: 'REALISTIC_UI',
    hookType: 'PROMISE',
    productContext: 'LANDING',
    negativeLevel: 'STRICT',
    preset: 'LIGHT_GRADIENT',
    visualMode: 'SAAS_LIGHT',
  },
  FOOD: {
    visualScene: 'SMARTPHONE_TILTED',
    composition: 'DYNAMIC_DIAGONAL',
    intensity: 'HIGH',
    typoTone: 'AGGRESSIVE_COMMERCIAL',
    realism: 'GLOSSY_3D',
    hookType: 'DIRECT_PAIN',
    productContext: 'MENU',
    negativeLevel: 'MEDIUM',
    preset: 'VIBRANT_TECH',
    visualMode: 'DARK_FORCE',
  },
  CATALOG: {
    visualScene: 'DASHBOARD_OVERLAY',
    composition: 'LEFT_TEXT_RIGHT_VISUAL',
    intensity: 'MEDIUM',
    typoTone: 'MODERN_STARTUP',
    realism: 'HYBRID',
    hookType: 'NUMBER',
    productContext: 'CATALOG',
    negativeLevel: 'STRICT',
    preset: 'SKY_BLUE',
    visualMode: 'DARK_FORCE',
  },
};

export const VISUAL_ELEMENTS_BY_PRODUCT = {
  SYNTIWEB: {
    primary: ['SMARTPHONE', 'SECURITY', 'CURRENCY_CONVERSION'],
    byObjective: {
      SELL:     ['SMARTPHONE', 'CURRENCY_CONVERSION', 'QR_CODE'],
      EDUCATE:  ['SMARTPHONE', 'ANALYTICS', 'TIME_SAVING'],
      BRANDING: ['SMARTPHONE', 'SECURITY', 'COLOR_PALETTE'],
      LEADS:    ['SMARTPHONE', 'QR_CODE', 'SECURITY'],
      ACTIVATE: ['SMARTPHONE', 'CURRENCY_CONVERSION', 'TIME_SAVING'],
    },
  },
  STUDIO: {
    primary: ['SMARTPHONE', 'ANALYTICS', 'COLOR_PALETTE'],
    byObjective: {
      SELL:     ['SMARTPHONE', 'COLOR_PALETTE', 'QR_CODE'],
      EDUCATE:  ['SMARTPHONE', 'ANALYTICS', 'COLOR_PALETTE'],
      BRANDING: ['COLOR_PALETTE', 'SMARTPHONE', 'SECURITY'],
      LEADS:    ['SMARTPHONE', 'QR_CODE', 'ANALYTICS'],
      ACTIVATE: ['SMARTPHONE', 'COLOR_PALETTE', 'TIME_SAVING'],
    },
  },
  FOOD: {
    primary: ['SMARTPHONE', 'WHATSAPP_CHAT', 'QR_CODE'],
    byObjective: {
      SELL:     ['SMARTPHONE', 'WHATSAPP_CHAT', 'QR_CODE'],
      EDUCATE:  ['SMARTPHONE', 'WHATSAPP_CHAT', 'TIME_SAVING'],
      BRANDING: ['SMARTPHONE', 'COLOR_PALETTE', 'QR_CODE'],
      LEADS:    ['SMARTPHONE', 'QR_CODE', 'WHATSAPP_CHAT'],
      ACTIVATE: ['SMARTPHONE', 'WHATSAPP_CHAT', 'TIME_SAVING'],
    },
  },
  CATALOG: {
    primary: ['SMARTPHONE', 'SHOPPING_CART', 'QR_CODE'],
    byObjective: {
      SELL:     ['SHOPPING_CART', 'WHATSAPP_CHAT', 'QR_CODE'],
      EDUCATE:  ['SMARTPHONE', 'SHOPPING_CART', 'ADD_PRODUCT'],
      BRANDING: ['SMARTPHONE', 'COLOR_PALETTE', 'SHOPPING_CART'],
      LEADS:    ['SMARTPHONE', 'QR_CODE', 'SHOPPING_CART'],
      ACTIVATE: ['SHOPPING_CART', 'WHATSAPP_CHAT', 'TIME_SAVING'],
    },
  },
};

export const CAROUSEL_SLIDE_COUNTS = [3, 5, 7] as const;

// ─── Paletas de marca correctas por solución ───────────────────────────────
export const BRAND_CONFIG = {
  SYNTIweb: {
    primary:    '#6C3CE1',
    secondary:  '#4A80E4',
    accent:     '#A78BFA',
    bgDark:     '#1A0A3B',
    bgLight:    '#FFFFFF',
    name:       'SYNTIweb',
    tagline:    'Plataforma SaaS multi-tenant venezolana',
    url:        'syntiweb.com',
  },
  SYNTIstudio: {
    primary:    '#0EA5E9',
    secondary:  '#0284C7',
    accent:     '#F97316',
    bgDark:     '#0F172A',
    bgLight:    '#FFFFFF',
    name:       'SYNTIstudio',
    tagline:    'Tu landing profesional en 10 minutos',
    url:        'oficio.vip',
  },
  SYNTIfood: {
    primary:    '#C2763A',
    secondary:  '#8B4513',
    accent:     '#F59E0B',
    bgDark:     '#1A0A0F',
    bgLight:    '#3D1F0F',
    name:       'SYNTIfood',
    tagline:    'El antojo no espera. Tú menos.',
    url:        'aqui.menu',
  },
  SYNTIcat: {
    primary:    '#6366F1',
    secondary:  '#4F46E5',
    accent:     '#22C55E',
    bgDark:     '#1E1B4B',
    bgLight:    '#FFFFFF',
    name:       'SYNTIcat',
    tagline:    'Enseña, conecta, vende.',
    url:        'punto.vip',
  },
} as const;

// Mapa de ProductType → clave de BRAND_CONFIG
export const PRODUCT_TO_BRAND_KEY: Record<string, keyof typeof BRAND_CONFIG> = {
  'SYNTIweb':    'SYNTIweb',
  'SYNTIstudio': 'SYNTIstudio',
  'SYNTIfood':   'SYNTIfood',
  'SYNTIcat':    'SYNTIcat',
};

// ─── Diferenciales visuales obligatorios por solución ─────────────────────
export const PRODUCT_SIGNATURE = {
  SYNTIweb: {
    mustHaveElements: [
      'A floating 3D smartphone showing a dark SaaS dashboard UI with analytics charts in violet and blue tones.',
      'A 3D security shield icon with a violet glow, symbolizing trust and data protection.',
      'A subtle currency conversion indicator showing "REF ↔ Bs." in a tech badge style.',
    ],
    forbiddenElements: [
      'No food, no plates, no restaurant settings.',
      'No market stalls, no street vendors, no open-air markets.',
      'No arepas, no food items of any kind.',
    ],
    environmentHint: 'Abstract dark tech environment or modern coworking space. Deep navy or pure white background.',
  },
  SYNTIstudio: {
    mustHaveElements: [
      'A 3D smartphone or tablet showing a clean landing page UI with sky blue (#0EA5E9) as primary color.',
      'A physical QR sticker label — the signature element that represents oficio.vip.',
      'Clean whitespace composition. Editorial SaaS style.',
    ],
    forbiddenElements: [
      'No food imagery.',
      'No market environments.',
      'No violet/purple palette (that is SYNTIweb territory).',
    ],
    environmentHint: 'Bright white or sky-blue environment. Minimalist professional setting.',
  },
  SYNTIfood: {
    mustHaveElements: [
      'A 3D smartphone showing a digital menu UI with warm terracota (#C2763A) and amber (#F59E0B) tones.',
      'A floating WhatsApp chat UI overlay showing a pre-filled order message.',
      'A price toggle badge showing dual pricing: "REF / Bs." — the BCV tasa indicator.',
    ],
    forbiddenElements: [
      'No persons selling food at a market or street stall.',
      'No arepas being sold by a woman.',
      'No outdoor market settings.',
      'No generic food stock-photo clichés.',
    ],
    environmentHint: 'Warm dark background (#1A0A0F). Food product photography or abstract warm tech. The PRODUCT is the hero, not a person.',
  },
  SYNTIcat: {
    mustHaveElements: [
      'A 3D smartphone or tablet showing a product catalog UI with indigo (#6366F1) primary and green (#22C55E) accent.',
      'A floating shopping cart drawer visible on the right side of the screen.',
      'A WhatsApp message bubble showing an order code like "SC-1247" — the signature catalog order format.',
    ],
    forbiddenElements: [
      'No market vendors.',
      'No street stalls.',
      'No food products (that is SYNTIfood territory).',
      'No orange or terracota palette.',
    ],
    environmentHint: 'Clean white or deep indigo (#1E1B4B) background. Retail products visible as decorative context.',
  },
};

// ─── Arco narrativo por cantidad de slides ────────────────────────────────
export interface SlideRoleSpec {
  role: CarouselSlideRole;
  messageType: MessageType;
  visualScene: VisualScene;
  composition: CompositionType;
  intensity: VisualIntensity;
  label: string;
}

// ─── Especificaciones base reutilizables ──────────────────────────────────
const SPEC_PORTADA: SlideRoleSpec = {
  role: CarouselSlideRole.PORTADA, messageType: MessageType.EMOTIONAL_HOOK,
  visualScene: VisualScene.HERO_CENTERED, composition: CompositionType.CENTERED,
  intensity: VisualIntensity.HIGH, label: 'Portada / Hook',
};
const SPEC_PROBLEMA: SlideRoleSpec = {
  role: CarouselSlideRole.PROBLEMA, messageType: MessageType.PROBLEM,
  visualScene: VisualScene.FLOW_LINES, composition: CompositionType.MINIMAL,
  intensity: VisualIntensity.SOFT, label: 'El problema',
};
const SPEC_COMPARACION: SlideRoleSpec = {
  role: CarouselSlideRole.COMPARACION, messageType: MessageType.COMPARISON,
  visualScene: VisualScene.COMPARISON, composition: CompositionType.FRAMED,
  intensity: VisualIntensity.MEDIUM, label: 'Antes vs Después',
};
const SPEC_CTA: SlideRoleSpec = {
  role: CarouselSlideRole.CTA, messageType: MessageType.OFFER,
  visualScene: VisualScene.HERO_CENTERED, composition: CompositionType.CENTERED,
  intensity: VisualIntensity.HIGH, label: 'CTA / Cierre',
};

// Pool de "Valor" — el builder rota por estos para n=1..6 valores.
const VALOR_POOL: SlideRoleSpec[] = [
  { role: CarouselSlideRole.VALOR_1, messageType: MessageType.BENEFIT,      visualScene: VisualScene.FLOATING_UI,       composition: CompositionType.LEFT_TEXT_RIGHT_VISUAL, intensity: VisualIntensity.MEDIUM, label: 'Beneficio 1' },
  { role: CarouselSlideRole.VALOR_2, messageType: MessageType.SOLUTION,     visualScene: VisualScene.DASHBOARD_OVERLAY, composition: CompositionType.TECH_LOADED,           intensity: VisualIntensity.MEDIUM, label: 'Beneficio 2' },
  { role: CarouselSlideRole.VALOR_3, messageType: MessageType.STEP_BY_STEP, visualScene: VisualScene.SMARTPHONE_TILTED, composition: CompositionType.DYNAMIC_DIAGONAL,      intensity: VisualIntensity.MEDIUM, label: 'Beneficio 3' },
  { role: CarouselSlideRole.VALOR_4, messageType: MessageType.BENEFIT,      visualScene: VisualScene.FLOATING_UI,       composition: CompositionType.CENTERED,              intensity: VisualIntensity.MEDIUM, label: 'Beneficio 4' },
  { role: CarouselSlideRole.VALOR_5, messageType: MessageType.SOLUTION,     visualScene: VisualScene.DASHBOARD_OVERLAY, composition: CompositionType.LEFT_TEXT_RIGHT_VISUAL, intensity: VisualIntensity.MEDIUM, label: 'Beneficio 5' },
  { role: CarouselSlideRole.VALOR_6, messageType: MessageType.STEP_BY_STEP, visualScene: VisualScene.SMARTPHONE_TILTED, composition: CompositionType.TECH_LOADED,           intensity: VisualIntensity.MEDIUM, label: 'Beneficio 6' },
];

// Rangos válidos: 5..10 slides.
export const CAROUSEL_MIN_SLIDES = 5;
export const CAROUSEL_MAX_SLIDES = 10;

/**
 * Construye el arco narrativo dinámicamente.
 * Estructura: PORTADA → PROBLEMA → VALOR_1..VALOR_n → COMPARACION → CTA
 * - n=5  → 1 valor
 * - n=6  → 2 valores
 * - n=7  → 3 valores  (equivalente al arco original)
 * - n=10 → 6 valores
 */
export function buildNarrativeArc(slideCount: number): SlideRoleSpec[] {
  const n = Math.max(CAROUSEL_MIN_SLIDES, Math.min(CAROUSEL_MAX_SLIDES, slideCount));
  const valoresCount = n - 4; // PORTADA + PROBLEMA + COMPARACION + CTA = 4 fijos
  const valores = VALOR_POOL.slice(0, valoresCount);
  return [SPEC_PORTADA, SPEC_PROBLEMA, ...valores, SPEC_COMPARACION, SPEC_CTA];
}

// Mantenido por compatibilidad — devuelve el arco para un slideCount dado.
export const NARRATIVE_ARC = new Proxy({} as Record<number, SlideRoleSpec[]>, {
  get: (_target, prop) => {
    const n = Number(prop);
    if (Number.isFinite(n)) return buildNarrativeArc(n);
    return undefined;
  },
});

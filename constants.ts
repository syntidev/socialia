import { PostFormat } from './types';

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

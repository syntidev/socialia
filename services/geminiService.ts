import { Type } from "@google/genai";
import {
  GenerationRequest,
  GenerationResult,
  NicheType,
  PresetType,
  GraphicElement,
  VisualScene,
  PostObjective,
  MessageType,
  CompositionType,
  VisualIntensity,
  TypoTone,
  RealismStyle,
  HookType,
  ProductContext,
  NegativeLevel,
  AIAnalysis,
  PostFormat,
  FormatType,
  GenerationMode,
  PhoneOrientation,
  ProductType,
  VisualMode,
  CarouselSlide,
  CarouselSlideRole,
} from "../types";
import {
  SOCIAL_SYSTEM_PROMPT,
  PRODUCT_DEFAULTS,
  VISUAL_ELEMENTS_BY_PRODUCT,
  BRAND_CONFIG,
  PRODUCT_TO_BRAND_KEY,
  PRODUCT_SIGNATURE,
  NARRATIVE_ARC,
  SlideRoleSpec,
} from "../constants";

const MODEL_NAME = "gemini-2.5-flash-image";
const TEXT_MODEL  = "gemini-3-flash-preview";

// Free tier: 10 RPM, 500 RPD. 60s/10 = 6s teóricos; 7s da margen.
const IMAGE_MIN_INTERVAL_MS = 7000;
// 429 → un ciclo de RPM completo + colchón.
const RATE_LIMIT_BACKOFF_MS = 65000;

// ─── Proxy helper ─────────────────────────────────────────────────────────
export class GeminiService {
  private lastImageCallAt = 0;

  constructor() {}

  private async callProxy(model: string, action: string, payload: any) {
    const response = await fetch('/api/socialia/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, action, ...payload })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const message = errorData.error?.message || errorData.error || response.statusText;
      const err: any = new Error(`Gemini Error: ${message}`);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return {
      ...data,
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    };
  }

  // Throttle compartido para todas las llamadas al modelo de imagen
  // (post único, carrusel y regenerar slide comparten el mismo bucket de 10 RPM).
  private async throttleImageCall() {
    const now = Date.now();
    const elapsed = now - this.lastImageCallAt;
    if (this.lastImageCallAt > 0 && elapsed < IMAGE_MIN_INTERVAL_MS) {
      const wait = IMAGE_MIN_INTERVAL_MS - elapsed;
      await new Promise(r => setTimeout(r, wait));
    }
    this.lastImageCallAt = Date.now();
  }

  private async callImageModel(payload: any) {
    await this.throttleImageCall();
    return this.callProxy(MODEL_NAME, 'generateContent', payload);
  }

  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 2000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const msg = error.message || '';
        const isRateLimit = error.status === 429 ||
                            msg.includes('429') ||
                            msg.includes('RESOURCE_EXHAUSTED') ||
                            msg.toLowerCase().includes('quota') ||
                            msg.toLowerCase().includes('rate limit');
        const isTransient = msg.includes('503') ||
                            msg.includes('UNAVAILABLE') ||
                            msg.includes('high demand');
        if ((isRateLimit || isTransient) && i < maxRetries - 1) {
          const waitTime = isRateLimit
            ? RATE_LIMIT_BACKOFF_MS
            : delay * Math.pow(2, i);
          console.warn(
            `Gemini ${isRateLimit ? 'rate-limited (429)' : 'saturada'}. Reintentando en ${waitTime}ms... (${i + 1}/${maxRetries})`
          );
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  // ─── Resolución de marca por ProductType ────────────────────────────────
  private getBrand(productType: string) {
    const key = PRODUCT_TO_BRAND_KEY[productType] || 'SYNTIweb';
    return BRAND_CONFIG[key];
  }

  private getSignature(productType: string) {
    const key = PRODUCT_TO_BRAND_KEY[productType] || 'SYNTIweb';
    return (PRODUCT_SIGNATURE as any)[key] as typeof PRODUCT_SIGNATURE['SYNTIweb'];
  }

  // ─── classifyAndComplete (sin cambios funcionales) ───────────────────────
  public classifyAndComplete(
    productType: ProductType,
    postObjective: PostObjective,
    partial: Partial<GenerationRequest>
  ): GenerationRequest {
    const keyMap: Record<string, string> = {
      'SYNTIweb':    'SYNTIWEB',
      'SYNTIstudio': 'STUDIO',
      'SYNTIfood':   'FOOD',
      'SYNTIcat':    'CATALOG',
    };
    const productKey = keyMap[productType] || 'SYNTIWEB';
    const defaults = (PRODUCT_DEFAULTS as any)[productKey];
    const elementsMap = (VISUAL_ELEMENTS_BY_PRODUCT as any)[productKey];
    const objectiveKey = postObjective || 'SELL';
    const autoElements = elementsMap.byObjective[objectiveKey] ?? elementsMap.primary;

    return {
      textInput:      partial.textInput     || '',
      secondaryText:  partial.secondaryText || '',
      styleInput:     partial.styleInput    || 'Estética SaaS Premium, minimalismo tecnológico.',
      format:         partial.format        || FormatType.FEED,
      productType,
      postObjective,
      visualMood:     partial.visualMood    || 'SaaS Moderno y Limpio',
      niche:          partial.niche,
      mode:           partial.mode          || GenerationMode.SMART_BUILDER,
      base64Image:    partial.base64Image,
      customPrompt:   partial.customPrompt  || '',
      selectedIcons:  partial.selectedIcons || [],
      visualScene:    partial.visualScene    || defaults.visualScene    as VisualScene,
      composition:    partial.composition    || defaults.composition    as CompositionType,
      intensity:      partial.intensity      || defaults.intensity      as VisualIntensity,
      typoTone:       partial.typoTone       || defaults.typoTone       as TypoTone,
      realism:        partial.realism        || defaults.realism        as RealismStyle,
      hookType:       partial.hookType       || defaults.hookType       as HookType,
      productContext: partial.productContext || defaults.productContext as ProductContext,
      negativeLevel:  partial.negativeLevel  || defaults.negativeLevel  as NegativeLevel,
      preset:         partial.preset         || defaults.preset         as PresetType,
      visualMode:     partial.visualMode     || defaults.visualMode     as VisualMode,
      messageType:    partial.messageType    || MessageType.BENEFIT,
      phoneOrientation: partial.phoneOrientation || PhoneOrientation.FRONT,
      selectedElements: partial.selectedElements?.length
        ? partial.selectedElements
        : autoElements as GraphicElement[],
    };
  }

  // ─── Variación SaaS aleatoria para SMART_BUILDER ────────────────────────
  private buildSaaSVariation(data: GenerationRequest): { scene: string; composition: string; intensity: string } {
    const productDefaults: Record<string, string> = {
      'SYNTIweb':    'HERO_CENTERED',
      'SYNTIstudio': 'FLOATING_UI',
      'SYNTIfood':   'SMARTPHONE_TILTED',
      'SYNTIcat':    'DASHBOARD_OVERLAY',
    };
    const SCENES      = ['HERO_CENTERED', 'SMARTPHONE_TILTED', 'FLOATING_UI', 'DASHBOARD_OVERLAY', 'ABSTRACT_ICONS', 'FLOW_LINES'];
    const COMPOSITIONS= ['CENTERED', 'LEFT_TEXT_RIGHT_VISUAL', 'DYNAMIC_DIAGONAL', 'MINIMAL', 'TECH_LOADED', 'FRAMED'];
    const INTENSITIES = ['SOFT', 'MEDIUM', 'MEDIUM', 'HIGH'];
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const productDefault = productDefaults[data.productType as string] || 'HERO_CENTERED';
    const sceneIsDefault       = !data.visualScene  || data.visualScene  === (VisualScene as any)[productDefault];
    const compositionIsDefault = !data.composition  || data.composition  === CompositionType.CENTERED;
    const intensityIsDefault   = !data.intensity    || data.intensity    === VisualIntensity.MEDIUM;
    return {
      scene:       sceneIsDefault       ? (VisualScene as any)[pick(SCENES)]       : data.visualScene!,
      composition: compositionIsDefault ? (CompositionType as any)[pick(COMPOSITIONS)] : data.composition!,
      intensity:   intensityIsDefault   ? (VisualIntensity as any)[pick(INTENSITIES)]  : data.intensity!,
    };
  }

  // ─── MODO DIGITAL_PRODUCT_PROMO ────────────────────────────────────────
  // Estilo: producto digital 3D + íconos flotantes + gradient de marca + cero personas.
  // Aplica a post, story y carrusel.
  public buildDigitalProductPromoPrompt(
    data: GenerationRequest,
    slideRole?: CarouselSlideRole
  ): string {
    const brand     = this.getBrand(data.productType as string);
    const signature = this.getSignature(data.productType as string);
    const format    = data.format === '9:16'
      ? 'Vertical 9:16 (1080×1920px) — Story / Reel Cover'
      : 'Portrait 3:4 (1080×1440px) — Instagram Feed Post / Carousel Slide';

    // Ajuste de intensidad visual según el rol del slide
    const roleIntensityHint = slideRole === CarouselSlideRole.PORTADA || slideRole === CarouselSlideRole.CTA
      ? 'MAXIMUM IMPACT — high contrast, saturated brand color, dramatic lighting.'
      : slideRole === CarouselSlideRole.PROBLEMA
        ? 'TENSION — desaturated, dark, minimal — visual contrast with the solution slides.'
        : slideRole === CarouselSlideRole.COMPARACION
          ? 'SPLIT composition — left half dark/problem style, right half bright/solution style.'
          : 'BALANCED — professional SaaS ad energy.';

    const signatureElements = signature.mustHaveElements.slice(0, 2).map(e => `- ${e}`).join('\n');
    const forbidden = signature.forbiddenElements.map(f => `- ${f}`).join('\n');

    return `
ROLE: Senior Art Director producing a premium SaaS advertising image for Instagram.

CRITICAL — ZERO TEXT IN IMAGE:
- Do NOT render any text, typography, words, labels, numbers, or UI copy in the image.
- No product names visible. No taglines. No prices. Clean art only — text is added in post-production.

FORMAT: ${format}
Respect this ratio EXACTLY. No bars. No letterboxing. Fill the entire canvas.

BRAND: ${brand.name}
PRIMARY COLOR: ${brand.primary}
SECONDARY COLOR: ${brand.secondary}
ACCENT COLOR: ${brand.accent}
BACKGROUND DARK: ${brand.bgDark}
TAGLINE CONTEXT (DO NOT RENDER): "${brand.tagline}"

VISUAL STYLE: Digital Product Promo — SaaS advertising.
- The hero is the PRODUCT (smartphone/tablet with a UI) — NO humans in this image.
- 3D glossy smartphone or tablet rendered at an elegant angle, screen showing a dark UI interface in brand colors.
- Floating 3D icons around the device: subtle, translucent, brand-colored.
- Background: gradient from ${brand.bgDark} (center) to slightly lighter edges, with a subtle tech mesh/grid pattern.
- Floating badge elements (e.g., "500+ clientes", "★★★★★") in glassmorphism style.
- Depth layers: background gradient → floating decorative icons → central device hero → foreground light effects.
- Light trails or glow halos in ${brand.primary} emanating from the device screen.
- Glassmorphism panels as secondary decorative elements.

PRODUCT SIGNATURE ELEMENTS (include 1-2 per image):
${signatureElements}

COMPOSITION:
- Leave clean empty zones: top 25% and bottom 20% — for text overlay in post-production.
- Central product device should occupy 50-65% of the vertical space.
- Asymmetric but balanced: device slightly off-center creates dynamism.

ROLE DIRECTION (if carousel slide): ${roleIntensityHint}

CUSTOM CONTEXT (reference only, do NOT render):
- Topic: "${data.textInput || 'Solución digital para negocios venezolanos'}"
- Secondary: "${data.secondaryText || ''}"

FORBIDDEN:
${forbidden}
- No persons, no faces, no hands, no humans of any kind.
- No arepas, no food markets, no street vendors, no outdoor markets.
- No English text visible anywhere in the image.
- No bars, no padding, no letterbox borders.

TECHNICAL:
- Photorealistic 3D render quality, 8K detail.
- Cinematic lighting: key light from top-left, rim light in brand color from bottom-right.
- sRGB color space. High dynamic range. No noise.
    `.trim();
  }

  // ─── MODO SMART_BUILDER (post / story) ──────────────────────────────────
  public buildSmartPrompt(data: GenerationRequest): string {
    const brand   = this.getBrand(data.productType as string);
    const niche   = data.niche   || NicheType.SYNTIWEB;
    const preset  = data.preset  || PresetType.DARK_NAVY;
    const secondaryText = data.secondaryText || '';

    // Conceptos por nicho usando paletas correctas
    const productPresets: Record<string, string> = {
      [NicheType.SYNTIWEB]: `
        BRAND: SYNTIweb (SaaS multi-tenant).
        STYLE: "SaaS Glow Promo" / "Tech Glass Advertising".
        VIBE: Technological, reliable, agile, premium, frictionless automation.
        ACCENT COLOR: ${brand.primary} (Violet). Use it for text highlights, UI lines, and glowing objects.
        SECONDARY: ${brand.secondary} (Blue) for supporting elements.
      `,
      [NicheType.STUDIO]: `
        BRAND: SYNTIstudio (Landing pages / oficio.vip).
        STYLE: "Editorial SaaS Light" + "3D mobile showcase".
        VIBE: Productivity, professional web, clarity, order, trust.
        ACCENT COLOR: ${brand.primary} (Sky Blue). CTA/accent: ${brand.accent} (Orange — ONLY for CTA elements).
      `,
      [NicheType.FOOD]: `
        BRAND: SYNTIfood (Digital Menus / aqui.menu).
        STYLE: "Food-Tech Glow" — dark warm backgrounds with product as hero.
        VIBE: Appetite, speed, freshness, delivery visual energy.
        ACCENT COLOR: ${brand.primary} (Terracota). Amber ${brand.accent} for badges and highlights.
        IMPORTANT: NO persons selling food. NO market scenes. The PRODUCT UI is the hero.
      `,
      [NicheType.CATALOG]: `
        BRAND: SYNTIcat (Transactional Catalog / punto.vip).
        STYLE: "Agile Ecommerce SaaS".
        VIBE: Inventory control, transactional order, agile shopping.
        ACCENT COLOR: ${brand.primary} (Indigo). Green ${brand.accent} ONLY for WhatsApp/success elements.
      `,
    };

    const colorPresets: Record<string, string> = {
      [PresetType.DARK_NAVY]:       `PALETTE: ${brand.bgDark}, deep midnight, ${brand.primary} accents. LIGHTING: Cinematic deep shadows, neon glows, high contrast. BACKGROUND: Dark gradient with subtle tech patterns.`,
      [PresetType.SKY_BLUE]:        `PALETTE: ${brand.secondary}, Cyan, White, Light Gray. LIGHTING: Bright, professional, clean, soft shadows. BACKGROUND: Vibrant blue gradient.`,
      [PresetType.LIGHT_GRADIENT]:  `PALETTE: Pure White, Soft Gray (#F1F5F9), ${brand.primary} accents. LIGHTING: High-key, airy, minimal. BACKGROUND: Soft white-to-gray gradient.`,
      [PresetType.MODERN_WHITE]:    `PALETTE: Stark White, Deep text, ${brand.primary} buttons. LIGHTING: Studio lighting, sharp, high clarity. BACKGROUND: Minimalist white studio.`,
      [PresetType.VIBRANT_TECH]:    `PALETTE: ${brand.bgDark}, ${brand.primary}, ${brand.accent}. LIGHTING: Dynamic multi-colored glows, energetic. BACKGROUND: Tech-focused with vibrant light trails.`,
    };

    const saasVariation  = this.buildSaaSVariation(data);
    const resolvedData   = { ...data, visualScene: saasVariation.scene as any, composition: saasVariation.composition as any, intensity: saasVariation.intensity as any };

    const sceneDesc: Record<string, string> = {
      [VisualScene.HERO_CENTERED]:     'Smartphone 3D centrado como foco principal, screen facing camera.',
      [VisualScene.SMARTPHONE_TILTED]: 'Smartphone inclinado con partículas flotantes e iluminación dinámica.',
      [VisualScene.FLOATING_UI]:       'Tarjetas de interfaz flotantes y nodos translúcidos representando funciones de la app.',
      [VisualScene.DASHBOARD_OVERLAY]: 'Vista de dashboard elegante con superposiciones semitransparentes.',
      [VisualScene.ABSTRACT_ICONS]:    'Fondo tecnológico abstracto con íconos de marca prominentes.',
      [VisualScene.COMPARISON]:        'Diseño lado a lado (Antes vs Después).',
      [VisualScene.FLOW_LINES]:        'Líneas de flujo y ondas cinéticas conectando elementos de interfaz.',
    };

    const compositionDesc: Record<string, string> = {
      [CompositionType.CENTERED]:              'CENTRADA — estilo SaaS limpio.',
      [CompositionType.LEFT_TEXT_RIGHT_VISUAL]:'TEXTO IZQUIERDA / VISUAL DERECHA — estilo editorial.',
      [CompositionType.DYNAMIC_DIAGONAL]:      'DIAGONAL DINÁMICA — enérgica y moderna.',
      [CompositionType.MINIMAL]:               'MINIMALISTA — mucho espacio negativo.',
      [CompositionType.TECH_LOADED]:           'CARGADA TECH — densa con partículas y flujos de datos.',
      [CompositionType.FRAMED]:                'ENMARCADA — borde o contenedor tipo tarjeta.',
    };

    const intensityDesc: Record<string, string> = {
      [VisualIntensity.SOFT]:   'Intensidad SUAVE. Limpio, elegante, brillo sutil.',
      [VisualIntensity.MEDIUM]: 'Intensidad MEDIA. Efectos equilibrados.',
      [VisualIntensity.HIGH]:   'Intensidad ALTA. Estilo de anuncios agresivo, brillo fuerte.',
    };

    const formatDesc = data.format === '9:16' ? 'Story / Reel Cover (9:16 Vertical)' : 'Post (3:4 Portrait)';

    // Elementos visuales
    let elementInstructions = '';
    if (data.selectedElements?.includes(GraphicElement.SMARTPHONE)) {
      const oriDesc = { FRONT: 'frontal', LEFT: 'inclinado a la izquierda', RIGHT: 'inclinado a la derecha' }[data.phoneOrientation || 'FRONT'];
      elementInstructions += `- HARDWARE: Smartphone 3D brillante (estilo iPhone), vista ${oriDesc}. Pantalla mostrando UI oscura relacionada con el producto. Profundidad Z.\n`;
    }
    if (data.selectedElements?.includes(GraphicElement.WHATSAPP_CHAT))   elementInstructions += '- ELEMENT: WhatsApp chat UI overlay con burbujas de mensaje.\n';
    if (data.selectedElements?.includes(GraphicElement.WHATSAPP_BUBBLE)) elementInstructions += '- ELEMENT: Burbujas flotantes estilo WhatsApp.\n';
    if (data.selectedElements?.includes(GraphicElement.WHATSAPP_SEND))   elementInstructions += '- ELEMENT: Botón "Enviar" con acento verde WhatsApp.\n';
    if (data.selectedElements?.includes(GraphicElement.WHATSAPP_NOTIF))  elementInstructions += '- ELEMENT: Banner flotante de notificación WhatsApp.\n';
    if (data.selectedElements?.includes(GraphicElement.WHATSAPP_ICON))   elementInstructions += '- ELEMENT: Ícono 3D de WhatsApp con glow sutil.\n';
    if (data.selectedElements?.includes(GraphicElement.QR_CODE))         elementInstructions += '- ELEMENT: QR Code estilizado high-tech con neon glow y glassmorphism.\n';
    if (data.selectedElements?.includes(GraphicElement.TIME_SAVING))     elementInstructions += '- ELEMENT: Cronómetro digital 3D glossy simbolizando velocidad.\n';
    if (data.selectedElements?.includes(GraphicElement.SHOPPING_CART))   elementInstructions += '- ELEMENT: Ícono 3D de carrito de compras con glassmorphism.\n';
    if (data.selectedElements?.includes(GraphicElement.ANALYTICS))       elementInstructions += '- ELEMENT: Gráficos 3D translúcidos y nodos de datos flotando.\n';
    if (data.selectedElements?.includes(GraphicElement.SECURITY))        elementInstructions += '- ELEMENT: Escudo 3D high-tech representando seguridad.\n';
    if (data.selectedIcons?.length)
      elementInstructions += `- INTEGRATED ICONS (Tabler style): ${data.selectedIcons.join(', ')}. Glassmorphism o acentuados con colores de marca.\n`;

    const orthographyInstruction = `
*** CRÍTICO: CERO TEXTO EN LA IMAGEN ***
1. NO INCLUIR ningún texto, palabra, letra, número, logo ni tipografía.
2. El arte debe estar completamente limpio de texto — se añade en post-producción.
3. Idioma de referencia: ESPAÑOL LATINO (Venezuela) — pero NO renderizar nada.
4. NO LOGOS. NO NOMBRES DE MARCA VISIBLES. NO MARCAS DE AGUA.
*************************************`.trim();

    return `
${orthographyInstruction}

ROLE: Senior Art Director for SYNTIweb ecosystem advertising.

BRAND CONCEPT: ${productPresets[niche] || productPresets[NicheType.SYNTIWEB]}
COLOR PALETTE: ${colorPresets[preset] || colorPresets[PresetType.DARK_NAVY]}

FORBIDDEN SCENES (CRITICAL):
- NO women selling at market stalls, no outdoor markets, no street vendors.
- NO arepas, no food being sold by people.
- NO generic stock-photo human scenes.

SCENE: ${sceneDesc[resolvedData.visualScene] || sceneDesc[VisualScene.HERO_CENTERED]}
COMPOSITION: ${compositionDesc[resolvedData.composition] || compositionDesc[CompositionType.CENTERED]}
INTENSITY: ${intensityDesc[resolvedData.intensity] || intensityDesc[VisualIntensity.MEDIUM]}
FORMAT: ${formatDesc}

"Conversion Engineering" focus — every element serves a commercial purpose.

${elementInstructions}

TECHNICAL:
- No messy elements. Professional lighting and depth.
- Glassmorphism, 3D glossy product hero, light trails, neon UI accents.
- High-end premium marketing finish.

TEXT REFERENCE (context only — DO NOT RENDER):
- Main Topic: "${data.textInput}"
- Secondary: "${secondaryText}"

${orthographyInstruction}
    `.trim();
  }

  // ─── MODO LIFESTYLE_AUTHENTIC (HUMAN_SCENE sanado) ────────────────────
  // Personas venezolanas reales — sin mercados, sin arepas.
  public buildLifestyleAuthenticPrompt(data: GenerationRequest): string {
    const brand = this.getBrand(data.productType as string);

    const subjectVariants: Record<string, string[]> = {
      'SYNTIweb': [
        'Venezuelan man, late 30s, casual linen shirt, confident smile, working in a bright modern small tech office in Caracas',
        'Young Venezuelan woman entrepreneur, natural curly hair, stylish blazer over t-shirt, standing in a vibrant coworking space',
        'Venezuelan business owner, confident, in a clean modern office with shelves behind',
        'Venezuelan woman, late 20s, focused and happy, using a smartphone in a minimalist well-lit office',
        'Group of young Venezuelan professionals, diverse features, collaborating around a laptop in a bright café',
      ],
      'SYNTIstudio': [
        'Venezuelan creative professional woman, 25-35, modern glasses, showing a website on a smartphone in a design studio',
        'Young Venezuelan man, 28-38, modern casual style, in a sleek modern barbershop with a laptop visible in background',
        'Venezuelan freelancer, working from a clean home office with indoor plants, satisfied expression',
        'Venezuelan professional, 30-40, in a bright studio, holding a smartphone showing a modern UI',
      ],
      'SYNTIfood': [
        'Venezuelan chef, 30-45, clean white apron, in a modern commercial kitchen, holding a smartphone with a digital menu',
        'Young Venezuelan food entrepreneur, 25-40, at a modern food truck counter, showing a tablet to camera',
        'Venezuelan woman, 22-35, owner of a colorful modern juice bar, smiling while checking orders on phone',
        'Venezuelan restaurant owner, 35-50, in a clean well-lit dining room, using a tablet for operations',
      ],
      'SYNTIcat': [
        'Venezuelan boutique owner, 25-40, in a well-organized modern store, holding a smartphone showing a product catalog',
        'Venezuelan entrepreneur, 28-42, in a clean organized electronics shop, using a smartphone to manage inventory',
        'Young Venezuelan entrepreneur, 20-30, in a tidy craft store, using a smartphone for sales',
        'Venezuelan retail business owner, 30-45, in a modern organized store, smiling while using their phone',
      ],
    };

    // Escenas sin mercados ni vendedoras ambulantes
    const ESCENAS = [
      'modern home office with plants',
      'urban café with laptop',
      'bright coworking space',
      'small retail store interior (modern and organized)',
      'kitchen of a modern restaurant (clean and professional)',
      'minimalist studio apartment',
      'small professional office',
    ];
    const ILUMINACION = [
      'golden morning light from window',
      'bright noon natural light',
      'soft studio lighting',
      'warm evening indoor light',
      'blue hour ambient light',
    ];
    const ANGULO = ['frontal portrait', 'three-quarter view', 'over-the-shoulder shot'];
    const pick   = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const variants      = subjectVariants[data.productType as string] || subjectVariants['SYNTIweb'];
    const randomSubject = (data as any).customHumanVariation ||
      `${variants[Math.floor(Math.random() * variants.length)]}, ${pick(ANGULO)}, in a ${pick(ESCENAS)} with ${pick(ILUMINACION)}`;

    const productAction: Record<string, string> = {
      'SYNTIweb':    'holding a smartphone and looking at the FRONT SCREEN with a satisfied expression, the screen clearly visible',
      'SYNTIstudio': 'proudly showing the FRONT SCREEN of their smartphone to the camera, screen shows a beautiful website interface',
      'SYNTIfood':   'holding a smartphone and pointing at the FRONT SCREEN which shows an appetizing digital menu',
      'SYNTIcat':    'scrolling through a digital catalog on the FRONT SCREEN of their smartphone, surrounded by neatly displayed products',
    };

    const action  = productAction[data.productType as string] || productAction['SYNTIweb'];
    const format  = data.format === '9:16' ? 'vertical 9:16 Reel format' : 'portrait 3:4 Feed format';

    return `
CRITICAL: ZERO text in the image. ZERO typography. ZERO words anywhere. Clean art only.

Create a photorealistic advertising image for Instagram in ${format}.

SCENE: ${randomSubject}, ${action}.

PHONE GEOMETRY (CRITICAL — read carefully):
The person holds the smartphone with their palm behind the device and their thumb on the left edge.
The GLASS SCREEN faces outward toward the camera — the viewer can see the lit display.
The camera bump (rear cameras) is on the side facing AWAY from the camera, hidden behind the device.
The person's fingers wrap around the back — they are not visible from the front.
The screen should show a glowing UI interface in ${brand.primary} color tones.
Think of it as: screen → person's face direction AND screen → camera direction simultaneously (the person is slightly angled).
NEVER show the camera module/lens on the visible face of the phone.

HUMAN DIRECTION:
- Authentic Venezuelan features — diverse, real, not generic stock photo.
- Natural, candid expressions of success and satisfaction.
- Modern professional clothing appropriate to the setting.
- Background fills the entire frame naturally — no solid color panels, no flat color zones.
- Background is a softly blurred (bokeh) version of the environment: office walls, plants, shelving, etc.

BRAND INTEGRATION:
- Subtle brand color ${brand.primary} as ambient glow from the phone screen or environmental accent.
- Phone screen UI shows a clean modern interface in ${brand.primary} (no text on screen).

COMPOSITION:
- The subject occupies the right 60% of the frame. Left side: natural bokeh background — NOT a flat colored panel.
- Leave clean space at top 25% for text overlay (sky, ceiling, or soft blur — not solid color).
- Leave clean space at bottom 20% for text overlay (floor, surface, or soft blur — not solid color).
- High-end editorial photography style.

FORBIDDEN:
- No solid color panels or flat geometric shapes filling any zone of the image.
- No market stalls, no street vendors, no arepas, no outdoor markets.
- No text, words, letters, logos, watermarks.
- No camera bump or rear lens visible on the front-facing side of the phone.
- No distorted hands or faces.

TECHNICAL:
- Photorealistic, 8K, professional lighting, depth of field.
- Aspect ratio: ${data.format}. Fill canvas completely — no bars or padding.

TEXT REFERENCE (do not render): "${data.textInput}"
    `.trim();
  }

  // ─── MODO NARRATIVE_CAROUSEL por slide ───────────────────────────────────
  // Cada slide tiene un rol narrativo que determina su estilo visual.
  public buildNarrativeCarouselSlidePrompt(
    slide: { hook: string; benefit: string },
    productType: string,
    roleSpec: SlideRoleSpec,
    slideNumber: number,
    totalSlides: number,
    generationMode: string
  ): string {
    const brand     = this.getBrand(productType);
    const signature = this.getSignature(productType);

    // En LIFESTYLE_AUTHENTIC usamos escena con persona; en otros, producto digital
    const isHumanMode = generationMode === 'HUMAN_SCENE';

    // Descripción visual por rol
    const roleVisualGuide: Record<CarouselSlideRole, string> = {
      [CarouselSlideRole.PORTADA]: `
PORTADA (Slide 1 of ${totalSlides}) — MAXIMUM VISUAL IMPACT.
Brand color ${brand.primary} dominant. High contrast, dramatic lighting, bold and eye-catching.
The viewer must stop scrolling at this slide.
${isHumanMode
  ? `Confident Venezuelan professional centered in frame, holding a smartphone with the GLASS SCREEN facing the camera (${brand.primary} glow on screen). Background: dramatic dark environment with subtle brand-colored ambient light. Background fills the full frame naturally — no flat colored panels.`
  : `3D smartphone centered, dramatic angle, ${brand.primary} glow emanating from screen, floating brand-colored particles.`
}`,
      [CarouselSlideRole.PROBLEMA]: `
PROBLEMA (Slide ${slideNumber} of ${totalSlides}) — Tension and awareness.
Desaturated, dark, minimal. High negative space. Feels like "before the solution".
${isHumanMode
  ? `Venezuelan business person looking frustrated or overwhelmed at their phone or paper documents. Background: naturally blurred office or workspace, dark tones. No flat color panels anywhere.`
  : `Dark abstract tech background, fragmented or disconnected UI elements suggesting disorder.`
}`,
      [CarouselSlideRole.VALOR]: `
VALOR (Slide ${slideNumber} of ${totalSlides}) — Key benefit revealed.
Energy: Balanced SaaS ad — professional, reassuring, clear.
${isHumanMode
  ? `Venezuelan entrepreneur holding smartphone with SCREEN FACING THE CAMERA (${brand.primary} UI visible on screen). Subject positioned on the right side of frame. LEFT SIDE of frame: naturally soft-blurred bokeh of the background environment (office wall, plants, bookshelves) — NOT a flat blue or colored panel. The left area is environmental bokeh, same as any professional photography.`
  : `Smartphone showing a clean ${brand.primary}-colored UI feature. Floating icon elements.`
}`,
      [CarouselSlideRole.VALOR_1]: `
BENEFICIO 1 (Slide ${slideNumber} of ${totalSlides}) — First key benefit.
${isHumanMode
  ? `Venezuelan business owner interacting with device on the right side of frame. Left side is natural bokeh of the environment — softly blurred background, not a solid color block. Full-frame photorealistic scene.`
  : `Floating UI with ${brand.primary} accents showing a key product feature.`
}`,
      [CarouselSlideRole.VALOR_2]: `
BENEFICIO 2 (Slide ${slideNumber} of ${totalSlides}) — Second key benefit.
${isHumanMode
  ? `Close-up of person's hands holding the phone, screen facing camera, showing a product UI in ${brand.primary}. Background fully blurred (bokeh) — a real photographic depth-of-field look, not geometric color blocks.`
  : `Dashboard UI with analytics elements in ${brand.primary} tones.`
}`,
      [CarouselSlideRole.VALOR_3]: `
BENEFICIO 3 (Slide ${slideNumber} of ${totalSlides}) — Third key benefit, dynamic energy.
${isHumanMode
  ? `Venezuelan professional in action, smartphone slightly tilted but still with screen facing camera. Dynamic angle. Background is natural motion-blurred or bokeh environment.`
  : `Smartphone tilted at a dynamic angle with ${brand.primary} light trails.`
}`,
      [CarouselSlideRole.COMPARACION]: `
ANTES vs DESPUÉS (Slide ${slideNumber} of ${totalSlides}) — Comparison / Transformation.
Split image — left half vs right half with a clear visual divide:
Left half (BEFORE): dark, desaturated, messy — paper documents, disorganized workspace, analog chaos.
Right half (AFTER): ${brand.primary} colored, bright, clean — smartphone showing organized digital solution.
Both halves are photorealistic and fill their respective areas completely. No floating panels.`,
      [CarouselSlideRole.CTA]: `
CTA / CIERRE (Slide ${totalSlides} of ${totalSlides}) — Final call to action.
Composition: Hero centered. Maximum energy and brand identity.
Brand color ${brand.primary} dominant — the most visually saturated slide.
Energy: Exciting, inviting, actionable. The viewer should feel compelled to act.
${isHumanMode
  ? `Venezuelan professional smiling directly at camera with phone showing the brand URL "${brand.url}".`
  : `3D smartphone centered with ${brand.primary} glow at maximum intensity. Floating ${brand.accent} accent elements.`
}`,
    };

    const signatureHint = signature.mustHaveElements[slideNumber % signature.mustHaveElements.length];
    const forbidden = signature.forbiddenElements.slice(0, 2).join(' ');

    return `
Create a professional Instagram carousel slide image. Slide ${slideNumber} of ${totalSlides}.

FORMAT: Portrait 3:4 (1080×1440px). Fill the ENTIRE canvas — NO bars, NO letterbox, NO padding on any side.

CRITICAL — ZERO TEXT IN IMAGE:
No words, no letters, no numbers, no UI copy, no labels anywhere in the image.

BRAND: ${brand.name}
PRIMARY: ${brand.primary} | ACCENT: ${brand.accent} | BACKGROUND: ${brand.bgDark}

${roleVisualGuide[roleSpec.role] || roleVisualGuide[CarouselSlideRole.VALOR]}

PRODUCT SIGNATURE ELEMENT (include in this slide):
- ${signatureHint}

COMPOSITION RULES:
- Leave clean empty space at top 25% for text overlay.
- Leave clean empty space at bottom 20% for text overlay.
- Subject/product occupies the center 55%.
- Rule of thirds for visual balance.

FORBIDDEN:
${forbidden}
- No arepas, no market stalls, no street vendors, no outdoor food markets.
- No bars or padding at image edges.

QUALITY:
- Photorealistic render, 8K detail.
- Professional cinematic lighting. Depth of field.
- sRGB color space. No noise artifacts.

SLIDE CONTEXT (reference only — DO NOT RENDER):
- Hook concept: "${slide.hook}"
- Benefit concept: "${slide.benefit}"
    `.trim();
  }

  // ─── buildSmartPrompt alias para compatibilidad (post/story SMART_BUILDER) ──
  // (El método buildSmartPrompt original ya está reimplementado arriba)

  // ─── generateCreativePost (post y story — sin cambios de flujo) ──────────
  async generateCreativePost(data: GenerationRequest): Promise<GenerationResult> {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("API Key no configurada en VITE_GEMINI_API_KEY");
    }

    const negativePrompts: Record<string, string> = {
      [NegativeLevel.STRICT]: "sin estilo cartoon, sin ilustración infantil, sin saturación excesiva, sin elementos caóticos, sin composición recargada, sin tipografías ilegibles, sin fondos planos vacíos, sin aspecto amateur, sin estética genérica de plantilla, NO ENGLISH TEXT, NO LOGOS, NO TEXT IN CORNERS, NO MARKS, NO AREPAS, NO MARKET STALLS, NO STREET VENDORS",
      [NegativeLevel.MEDIUM]: "sin estilo cartoon, sin ilustración infantil, sin saturación excesiva, sin elementos caóticos, sin aspecto amateur, NO ENGLISH TEXT, NO LOGOS, NO TEXT IN CORNERS, NO AREPAS, NO MARKET STALLS",
      [NegativeLevel.FREE]:   "sin estilo cartoon, sin ilustración infantil, sin aspecto amateur, NO ENGLISH TEXT, NO LOGOS, NO AREPAS",
    };
    const negativePrompt = negativePrompts[data.negativeLevel || NegativeLevel.STRICT];

    try {
      // Paso 1: Copy estratégico
      const copyPrompt = `
Actúa como Copywriter Senior para ${data.niche}.
OBJETIVO: ${data.postObjective}.
TIPO DE MENSAJE: ${data.messageType}.
GANCHO: ${data.hookType}.
INSUMO: "${data.textInput}".
PÚBLICO: Venezuela / Latino.

Genera JSON con:
- hook: gancho corto impactante (máx 5 palabras)
- body: beneficio o frase de valor (máx 8 palabras)
- cta: llamado a la acción (máx 3 palabras)
- caption: copy para Instagram con emojis (máx 30 palabras)

TODO EN ESPAÑOL. Sin palabras en inglés.`;

      const copyResponse = await this.withRetry(() => this.callProxy(TEXT_MODEL, 'generateContent', {
        contents: [{ parts: [{ text: copyPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      }));

      const copyData = JSON.parse(copyResponse.text || "{}");
      const finalData = {
        ...data,
        textInput:     copyData.hook  || data.textInput,
        secondaryText: copyData.body  || data.secondaryText,
      };

      // Paso 2: Selección de prompt según modo
      const imagePart = data.base64Image ? {
        inlineData: { data: data.base64Image.split(',')[1], mimeType: "image/png" }
      } : undefined;

      let imagePrompt: string;
      if (data.customPrompt) {
        imagePrompt = `${data.customPrompt}\n\nNEGATIVE PROMPT: ${negativePrompt}`;
      } else if (data.mode === GenerationMode.DIGITAL_PRODUCT_PROMO) {
        imagePrompt = `${this.buildDigitalProductPromoPrompt(finalData)}\n\nNEGATIVE PROMPT: ${negativePrompt}`;
      } else if (data.mode === GenerationMode.HUMAN_SCENE) {
        imagePrompt = `${this.buildLifestyleAuthenticPrompt(finalData)}\n\nNEGATIVE PROMPT: ${negativePrompt}`;
      } else {
        imagePrompt = `${this.buildSmartPrompt(finalData)}\n\nNEGATIVE PROMPT: ${negativePrompt}`;
      }

      const imageResponse = await this.withRetry(() => this.callImageModel({
        contents: [{
          parts: [
            ...(imagePart ? [imagePart] : []),
            { text: imagePrompt }
          ]
        }],
        generationConfig: {
          imageConfig: { aspectRatio: data.format as any }
        }
      }));

      let imageUrl = '';
      const parts = imageResponse.candidates?.[0]?.content?.parts;
      if (parts) {
        const found = parts.find((p: any) => p.inlineData || p.fileData);
        if (found?.inlineData) {
          imageUrl = `data:${found.inlineData.mimeType || 'image/png'};base64,${found.inlineData.data}`;
        }
      }

      if (!imageUrl) throw new Error("La IA no generó la imagen.");

      return {
        imageUrl,
        caption: copyData.caption || "Post generado con éxito.",
      };
    } catch (error: any) {
      console.error("Error en SYNTIweb Engine:", error);
      throw new Error(`Error: ${error.message}`);
    }
  }

  // ─── generateCarouselHooks — retorna rol narrativo por slide ──────────────
  public async generateCarouselHooks(
    topic: string,
    slideCount: number,
    productType: string,
    postObjective: string
  ): Promise<Array<{ hook: string; benefit: string; role: CarouselSlideRole; messageType: string }>> {
    const arc = NARRATIVE_ARC[slideCount];
    const arcDescription = arc.map((r, i) =>
      `Slide ${i + 1}: [${r.label}] — tipo de mensaje: ${r.messageType}`
    ).join('\n');

    const response = await this.withRetry(() => this.callProxy(TEXT_MODEL, 'generateContent', {
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hook:        { type: Type.STRING },
              benefit:     { type: Type.STRING },
              role:        { type: Type.STRING },
              messageType: { type: Type.STRING },
            },
            required: ['hook', 'benefit', 'role', 'messageType']
          }
        }
      },
      contents: [{
        role: 'user',
        parts: [{
          text: `Eres un experto en marketing digital venezolano para ${productType}.
Objetivo del carrusel: ${postObjective}
Tema: "${topic}"

El carrusel tiene ${slideCount} slides con esta estructura narrativa:
${arcDescription}

Para cada slide genera:
- hook: frase corta (máx 8 palabras), impactante, en español venezolano coloquial
- benefit: frase (máx 12 palabras) explicando el beneficio concreto
- role: el rol indicado para ese slide (PORTADA, PROBLEMA, VALOR, VALOR_1, VALOR_2, VALOR_3, COMPARACION, CTA)
- messageType: el tipo de mensaje indicado (PROBLEM, SOLUTION, BENEFIT, COMPARISON, EMOTIONAL_HOOK, OFFER, STEP_BY_STEP)

Respeta el arco narrativo: slide 1 es el hook, el último es CTA. Progresión coherente.
Responde SOLO el array JSON.`
        }]
      }]
    }));

    const text = response.text;
    if (!text) throw new Error('No response from Gemini text model');
    const parsed = JSON.parse(text);

    // Inyectar rol del arco en caso de que el modelo no lo respete
    return parsed.map((item: any, i: number) => ({
      hook:        item.hook,
      benefit:     item.benefit,
      role:        (arc[i]?.role || item.role) as CarouselSlideRole,
      messageType: item.messageType || arc[i]?.messageType || 'BENEFIT',
    }));
  }

  // ─── generateCarouselImages — con aspectRatio fijo y arco narrativo ───────
  public async generateCarouselImages(
    slides: Array<{ hook: string; benefit: string; role?: CarouselSlideRole; messageType?: string }>,
    productType: string,
    generationMode: string,
    onSlideReady: (index: number, imageUrl: string) => void,
    onSlideError: (index: number, error: string) => void,
    totalSlides?: number
  ): Promise<void> {
    const total      = totalSlides || slides.length;
    const slideCount = slides.length;

    for (let i = 0; i < slideCount; i++) {
      try {
        const slide     = slides[i];
        const globalIdx = total - slideCount + i; // índice real en el carrusel completo
        const arc       = NARRATIVE_ARC[total] || NARRATIVE_ARC[5];
        const roleSpec  = arc[globalIdx] || arc[arc.length - 1];

        let prompt: string;
        if (generationMode === GenerationMode.DIGITAL_PRODUCT_PROMO) {
          // Modo digital product — construimos GenerationRequest mínimo
          const fakeData = {
            textInput:    slide.hook,
            secondaryText:slide.benefit,
            productType:  productType as ProductType,
            format:       FormatType.FEED,
          } as GenerationRequest;
          prompt = this.buildDigitalProductPromoPrompt(fakeData, roleSpec.role);
        } else {
          prompt = this.buildNarrativeCarouselSlidePrompt(
            slide,
            productType,
            roleSpec,
            globalIdx + 1,
            total,
            generationMode
          );
        }

        // El throttle de 7s lo aplica callImageModel → no hace falta delay manual.
        const response = await this.withRetry(() => this.callImageModel({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            imageConfig: { aspectRatio: '3:4' }
          }
        }));

        const imagePart = response.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inlineData?.mimeType?.startsWith('image/')
        );

        if (imagePart?.inlineData?.data) {
          const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          onSlideReady(i, imageUrl);
        } else {
          onSlideError(i, 'No image returned');
        }
      } catch (err: any) {
        onSlideError(i, err.message || 'Generation failed');
      }
    }
  }

  // ─── regenerateSlide — regenera solo un slide preservando contexto narrativo
  public async regenerateSlide(
    slide: CarouselSlide,
    productType: string,
    generationMode: string,
    totalSlides: number,
    onReady: (imageUrl: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const arc      = NARRATIVE_ARC[totalSlides] || NARRATIVE_ARC[5];
      const roleSpec = arc[slide.id] || arc[arc.length - 1];

      let prompt: string;
      if (generationMode === GenerationMode.DIGITAL_PRODUCT_PROMO) {
        const fakeData = {
          textInput:     slide.hook,
          secondaryText: slide.benefit,
          productType:   productType as ProductType,
          format:        FormatType.FEED,
        } as GenerationRequest;
        prompt = this.buildDigitalProductPromoPrompt(fakeData, roleSpec.role);
      } else {
        prompt = this.buildNarrativeCarouselSlidePrompt(
          { hook: slide.hook, benefit: slide.benefit },
          productType,
          roleSpec,
          slide.id + 1,
          totalSlides,
          generationMode
        );
      }

      const response = await this.withRetry(() => this.callImageModel({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          imageConfig: { aspectRatio: '3:4' }
        }
      }));

      const imagePart = response.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData?.mimeType?.startsWith('image/')
      );

      if (imagePart?.inlineData?.data) {
        onReady(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
      } else {
        onError('No image returned from API');
      }
    } catch (err: any) {
      onError(err.message || 'Regeneration failed');
    }
  }

  // ─── detectTextInImage (sin cambios) ────────────────────────────────────
  public async detectTextInImage(imageBase64: string): Promise<{ hasTitle: boolean; hasSubtitle: boolean; title?: string; subtitle?: string }> {
    const prompt = `
Analiza esta imagen y determina si ya contiene un título o subtítulo gráfico (texto superpuesto).
Responde estrictamente en formato JSON:
{
  "hasTitle": boolean,
  "hasSubtitle": boolean,
  "title": "texto detectado o null",
  "subtitle": "texto detectado o null"
}`;
    const cleanBase64 = imageBase64.split(',')[1];
    try {
      const result = await this.withRetry(() => this.callProxy(TEXT_MODEL, 'generateContent', {
        contents: [{ parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }
        ]}],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hasTitle:   { type: Type.BOOLEAN },
              hasSubtitle:{ type: Type.BOOLEAN },
              title:      { type: Type.STRING },
              subtitle:   { type: Type.STRING },
            },
            required: ["hasTitle", "hasSubtitle"]
          }
        }
      }));
      return JSON.parse(result.text || "{}");
    } catch (err) {
      console.error("Error detectando texto en imagen:", err);
      return { hasTitle: false, hasSubtitle: false };
    }
  }

  // ─── analyzeImageAndGeneratePost (sin cambios) ──────────────────────────
  public async analyzeImageAndGeneratePost(
    imageBase64: string | null,
    topic: string,
    format: PostFormat
  ): Promise<AIAnalysis> {
    const prompt = `
Analiza esta solicitud para un post de Instagram de "SYNTIweb".
DATOS DEL POST:
Formato: ${format}.
Tema/Intención: "${topic || 'Promoción general de productos artesanales'}".`;

    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64.split(',')[1] } });
    }

    try {
      const response = await this.withRetry(() => this.callProxy(TEXT_MODEL, 'generateContent', {
        contents: [{ parts }],
        systemInstruction: { parts: [{ text: SOCIAL_SYSTEM_PROMPT }] },
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hook:     { type: Type.STRING },
              body:     { type: Type.STRING },
              cta:      { type: Type.STRING },
              question: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              hooks:    { type: Type.ARRAY, items: { type: Type.STRING } },
              strategy: {
                type: Type.OBJECT,
                properties: {
                  objective:     { type: Type.STRING },
                  bestTime:      { type: Type.STRING },
                  callToAction:  { type: Type.STRING },
                },
                required: ["objective", "bestTime", "callToAction"]
              },
              visualAdvice: {
                type: Type.OBJECT,
                properties: {
                  composition:            { type: Type.STRING },
                  filters:                { type: Type.STRING },
                  textOverlaySuggestion:  { type: Type.STRING },
                },
                required: ["composition", "filters", "textOverlaySuggestion"]
              },
              seo: {
                type: Type.OBJECT,
                properties: {
                  altText:  { type: Type.STRING },
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["altText", "keywords"]
              },
              ads: {
                type: Type.OBJECT,
                properties: {
                  segmentation:  { type: Type.STRING },
                  campaignType:  { type: Type.STRING },
                },
                required: ["segmentation", "campaignType"]
              },
              community: {
                type: Type.OBJECT,
                properties: {
                  conversationStarter: { type: Type.STRING },
                },
                required: ["conversationStarter"]
              }
            },
            required: ["hook", "body", "cta", "question", "hashtags", "hooks", "strategy", "visualAdvice", "seo", "ads", "community"]
          }
        }
      }));

      console.log('Raw Gemini Response:', response);
      const textResponse = response.text;
      if (!textResponse) throw new Error("No hay respuesta del modelo");
      return JSON.parse(textResponse) as AIAnalysis;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  // ─── buildHumanVariation — mantenido para compatibilidad, sin sesgo ──────
  public buildHumanVariation(): string {
    const GENERO = ['Venezuelan entrepreneur', 'professional woman', 'young business owner', 'creative professional', 'small business owner'];
    const ESCENA = [
      'modern home office with plants',
      'urban café with laptop',
      'bright coworking space',
      'small modern retail store',
      'minimalist professional studio',
      'clean modern kitchen (professional)',
    ];
    const ILUMINACION = [
      'golden morning light from window',
      'bright noon natural light',
      'soft studio lighting',
      'warm evening indoor light',
    ];
    const ANGULO = ['frontal portrait', 'three-quarter view', 'over-the-shoulder shot'];
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    return `${pick(GENERO)}, ${pick(ANGULO)}, in a ${pick(ESCENA)} with ${pick(ILUMINACION)}`;
  }
}

export const geminiService = new GeminiService();

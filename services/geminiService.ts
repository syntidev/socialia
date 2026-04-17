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
  VisualMode
} from "../types";
import { SOCIAL_SYSTEM_PROMPT, PRODUCT_DEFAULTS, VISUAL_ELEMENTS_BY_PRODUCT } from "../constants";

// RESTAURAMOS TUS MODELOS (Los que Gemini te asignó)
const MODEL_NAME = "gemini-2.5-flash-image"; 
const TEXT_MODEL = "gemini-3-flash-preview";

export class GeminiService {
  constructor() {}

  private async callProxy(model: string, action: string, payload: any) {
   const response = await fetch('/api/socialia/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        action,
        ...payload
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      const message = errorData.error?.message || errorData.error || response.statusText;
      throw new Error(`Gemini Error: ${message}`);
    }
    
    const data = await response.json();
    // Retornamos todo el objeto de respuesta más un helper .text
    return {
      ...data,
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    };
  }

  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 2000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const isRetryable = error.message?.includes('503') || 
                           error.message?.includes('UNAVAILABLE') || 
                           error.message?.includes('high demand');
        
        if (isRetryable && i < maxRetries - 1) {
          const waitTime = delay * Math.pow(2, i); // Exponential backoff
          console.warn(`Gemini API saturada (503). Reintentando en ${waitTime}ms... (Intento ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  public classifyAndComplete(
    productType: ProductType,
    postObjective: PostObjective,
    partial: Partial<GenerationRequest>
  ): GenerationRequest {
  
    // 1. Mapear ProductType a key de PRODUCT_DEFAULTS
    const keyMap: Record<string, string> = {
      'SYNTIweb':   'SYNTIWEB',
      'SYNTIstudio':'STUDIO',
      'SYNTIfood':  'FOOD',
      'SYNTIcat':   'CATALOG',
    };
    const productKey = keyMap[productType] || 'SYNTIWEB';
    const defaults = (PRODUCT_DEFAULTS as any)[productKey];
  
    // 2. Obtener elementos visuales por objetivo
    const elementsMap = (VISUAL_ELEMENTS_BY_PRODUCT as any)[productKey];
    const objectiveKey = postObjective || 'SELL';
    const autoElements = elementsMap.byObjective[objectiveKey] 
      ?? elementsMap.primary;
  
    // 3. Merge: partial sobreescribe defaults, nunca al revés
    return {
      textInput:      partial.textInput    || '',
      secondaryText:  partial.secondaryText || '',
      styleInput:     partial.styleInput   || 'Estética SaaS Premium, minimalismo tecnológico.',
      format:         partial.format       || FormatType.FEED,
      productType,
      postObjective,
      visualMood:     partial.visualMood   || 'SaaS Moderno y Limpio',
      niche:          partial.niche,
      mode:           partial.mode         || GenerationMode.SMART_BUILDER,
      base64Image:    partial.base64Image,
      customPrompt:   partial.customPrompt || '',
      selectedIcons:  partial.selectedIcons || [],
  
      // Defaults automáticos — sobreescribibles solo en modo avanzado
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
  
      // Elementos visuales automáticos (máx 3)
      selectedElements: partial.selectedElements?.length 
        ? partial.selectedElements 
        : autoElements as GraphicElement[],
    };
  }

  public buildHumanVariation(): string {
    const GENERO = ['woman', 'man', 'young woman', 'middle-aged man', 'group of two people'];
    const EDAD = ['in her 20s', 'in his 30s', 'around 40 years old', 'young adult'];
    const ESCENA = [
      'modern home office with plants',
      'urban café with laptop',
      'outdoor market stall',
      'bright coworking space',
      'small retail store interior',
      'kitchen of a small restaurant',
      'street vendor setup',
      'minimalist studio apartment'
    ];
    const ILUMINACION = [
      'golden morning light from window',
      'bright noon natural light',
      'soft studio lighting',
      'warm evening indoor light',
      'blue hour ambient light',
      'harsh midday sun outdoors'
    ];
    const ELEMENTO_FLOTANTE = [
      'with floating 3D UI elements around them',
      'with subtle particle effects in background',
      'with holographic phone screen visible',
      'with floating product icons nearby',
      '', '', ''  // más probabilidad de sin elementos
    ];
    const ANGULO = ['frontal portrait', 'three-quarter view', 'over-the-shoulder shot', 'candid side angle'];

    const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const genero = pickRandom(GENERO);
    const edad = pickRandom(EDAD);
    const escena = pickRandom(ESCENA);
    const iluminacion = pickRandom(ILUMINACION);
    const elemento = pickRandom(ELEMENTO_FLOTANTE);
    const angulo = pickRandom(ANGULO);

    return `HUMAN_SUBJECT: A ${genero} ${edad}, ${angulo}, in a ${escena} with ${iluminacion} ${elemento}`.trim();
  }

  private buildSaaSVariation(data: GenerationRequest): { scene: string; composition: string; intensity: string } {
    const productDefaults: Record<string, string> = {
      'SYNTIweb': 'HERO_CENTERED',
      'SYNTIstudio': 'FLOATING_UI',
      'SYNTIfood': 'HERO_CENTERED',
      'SYNTIcat': 'DASHBOARD_OVERLAY',
    };

    const SCENES = [
      'HERO_CENTERED', 'SMARTPHONE_TILTED', 'FLOATING_UI',
      'DASHBOARD_OVERLAY', 'ABSTRACT_ICONS', 'FLOW_LINES'
    ];
    const COMPOSITIONS = [
      'CENTERED', 'LEFT_TEXT_RIGHT_VISUAL', 'DYNAMIC_DIAGONAL',
      'MINIMAL', 'TECH_LOADED', 'FRAMED'
    ];
    const INTENSITIES = ['SOFT', 'MEDIUM', 'MEDIUM', 'HIGH']; // más probabilidad de MEDIUM

    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const productDefault = productDefaults[data.productType as string] || 'HERO_CENTERED';

    // Si el usuario dejó el default del producto → aleatorio. Si eligió manualmente → respetar.
    const sceneIsDefault = !data.visualScene || data.visualScene === (VisualScene as any)[productDefault];
    const compositionIsDefault = !data.composition || data.composition === CompositionType.CENTERED;
    const intensityIsDefault = !data.intensity || data.intensity === VisualIntensity.MEDIUM;

    return {
      scene: sceneIsDefault ? (VisualScene as any)[pick(SCENES)] : data.visualScene!,
      composition: compositionIsDefault ? (CompositionType as any)[pick(COMPOSITIONS)] : data.composition!,
      intensity: intensityIsDefault ? (VisualIntensity as any)[pick(INTENSITIES)] : data.intensity!,
    };
  }

  public buildSmartPrompt(data: GenerationRequest): string {
    const niche = data.niche || NicheType.SYNTIWEB;
    const preset = data.preset || PresetType.DARK_NAVY;
    const secondaryText = data.secondaryText || "";
    
    const productPresets = {
      [NicheType.SYNTIWEB]: `
        BRAND: SYNTIweb (SaaS multi-tenant).
        STYLE: "SaaS Glow Promo" / "Tech Glass Advertising".
        VIBE: Technological, reliable, agile, premium, frictionless automation.
        ACCENT COLOR: #4980E4 (Blue). Use it for text highlights, UI lines, and glowing objects.
      `,
      [NicheType.STUDIO]: `
        BRAND: SYNTIstudio (Websites/Landing).
        STYLE: "Editorial SaaS" + "3D mobile showcase".
        VIBE: Productivity, professional web, clarity, order.
        ACCENT COLOR: #4980E4 (Blue). Use it for text highlights, UI lines, and glowing objects.
      `,
      [NicheType.FOOD]: `
        BRAND: SYNTIfood (Digital Menus).
        STYLE: "Food-Tech Glow".
        VIBE: Appetite, speed, freshness, delivery visual energy.
        ACCENT COLOR: #EC6B0B (Orange). Use it for text highlights, UI lines, and glowing objects.
      `,
      [NicheType.CATALOG]: `
        BRAND: SYNTIcat (Transactional Catalog).
        STYLE: "Agile Ecommerce SaaS".
        VIBE: Inventory control, transactional order, agile shopping.
        ACCENT COLOR: #10B981 (Green). Use it for text highlights, UI lines, and glowing objects.
      `
    };

    const colorPresets = {
      [PresetType.DARK_NAVY]: `
        PALETTE: Deep Navy (#0A0A14), Midnight Blue, Sky Blue (#4A80E4) accents.
        LIGHTING: Cinematic, deep shadows, neon blue glows, high contrast.
        BACKGROUND: Deep navy gradient with subtle tech patterns.
      `,
      [PresetType.SKY_BLUE]: `
        PALETTE: Sky Blue (#4A80E4), Cyan, White, Light Gray.
        LIGHTING: Bright, professional, clean, soft shadows.
        BACKGROUND: Vibrant blue gradient or clean tech environment.
      `,
      [PresetType.LIGHT_GRADIENT]: `
        PALETTE: Pure White, Soft Gray (#F1F5F9), Sky Blue (#4A80E4) accents.
        LIGHTING: High-key, airy, minimal, very clean.
        BACKGROUND: Soft white-to-gray gradient, editorial style.
      `,
      [PresetType.MODERN_WHITE]: `
        PALETTE: Stark White, Deep Navy text, Sky Blue buttons.
        LIGHTING: Studio lighting, sharp, high clarity.
        BACKGROUND: Minimalist white studio, very professional and "Apple-style".
      `,
      [PresetType.VIBRANT_TECH]: `
        PALETTE: Deep Navy, Sky Blue, Electric Purple/Magenta accents.
        LIGHTING: Dynamic, multi-colored glows, energetic.
        BACKGROUND: Tech-focused with vibrant light trails and data flows.
      `
    };

    const identityDesc = {
      [PresetType.DARK_NAVY]: "Identidad: Premium Dark SaaS. Enfoque en profundidad, elegancia y tecnología de punta.",
      [PresetType.SKY_BLUE]: "Identidad: Corporate Tech. Enfoque en claridad, confianza y profesionalismo moderno.",
      [PresetType.LIGHT_GRADIENT]: "Identidad: Minimalist Editorial. Enfoque en aire, limpieza y estética Apple-style.",
      [PresetType.MODERN_WHITE]: "Identidad: Stark Studio. Enfoque en pureza visual, alto contraste y realismo de producto.",
      [PresetType.VIBRANT_TECH]: "Identidad: Future Tech. Enfoque en energía, flujos de datos y dinamismo visual."
    }[preset];

    // Aplicar variación aleatoria de SaaS si el usuario dejó los defaults
    const saasVariation = this.buildSaaSVariation(data);
    const resolvedData = { ...data, visualScene: saasVariation.scene as any, composition: saasVariation.composition as any, intensity: saasVariation.intensity as any };

    const sceneDesc = {
      [VisualScene.HERO_CENTERED]: "Héroe con smartphone centrado como foco principal.",
      [VisualScene.SMARTPHONE_TILTED]: "Smartphone inclinado con partículas flotantes e iluminación dinámica.",
      [VisualScene.FLOATING_UI]: "Tarjetas de interfaz de usuario flotantes y nodos translúcidos que representan las funciones de la aplicación.",
      [VisualScene.DASHBOARD_OVERLAY]: "Vista de dashboard elegante con superposiciones semitransparentes.",
      [VisualScene.ABSTRACT_ICONS]: "Fondo tecnológico abstracto con iconos de marca prominentes.",
      [VisualScene.COMPARISON]: "Diseño de comparación lado a lado (Antes vs Después).",
      [VisualScene.FLOW_LINES]: "Líneas de flujo y ondas cinéticas que conectan varios elementos de la interfaz de usuario."
    }[resolvedData.visualScene || VisualScene.HERO_CENTERED];

    const objectiveDesc = {
      [PostObjective.SELL]: "Objetivo: VENDER. Enfoque comercial directo, alta urgencia.",
      [PostObjective.EDUCATE]: "Objetivo: EDUCAR. Informativo, jerarquía clara, tono servicial.",
      [PostObjective.CURIOSITY]: "Objetivo: CURIOSIDAD. Visuales de alta gama, elementos intrigantes.",
      [PostObjective.EXPLAIN]: "Objetivo: EXPLICAR PRODUCTO. Elementos de interfaz detallados, características destacadas.",
      [PostObjective.BRANDING]: "Objetivo: BRANDING. Enfoque en el logo, colores de marca y sensación premium.",
      [PostObjective.LEADS]: "Objetivo: CAPTAR LEADS. Enfoque en elementos de contacto y registro.",
      [PostObjective.ACTIVATE]: "Objetivo: ACTIVAR (CTA Fuerte). Visuales de alto impacto, botones llamativos."
    }[data.postObjective || PostObjective.SELL];

    const messageTypeDesc = {
      [MessageType.PROBLEM]: "Tipo de Mensaje: PROBLEMA. Resaltar puntos de dolor antes de mostrar la solución.",
      [MessageType.SOLUTION]: "Tipo de Mensaje: SOLUCIÓN. Enfoque en el estado 'después' y facilidad de uso.",
      [MessageType.BENEFIT]: "Tipo de Mensaje: BENEFICIO. Listar ventajas clave con iconos.",
      [MessageType.COMPARISON]: "Tipo de Mensaje: COMPARACIÓN. Contraste visual entre la forma antigua y la nueva.",
      [MessageType.TESTIMONY]: "Tipo de Mensaje: TESTIMONIO. Incluir una tarjeta de reseña de usuario o cita.",
      [MessageType.STEP_BY_STEP]: "Tipo de Mensaje: PASO A PASO. Guía visual del proceso (1, 2, 3).",
      [MessageType.OFFER]: "Tipo de Mensaje: OFERTA. Resaltar descuentos o promociones especiales.",
      [MessageType.EMOTIONAL_HOOK]: "Tipo de Mensaje: GANCHO EMOCIONAL. Enfoque en la tranquilidad y el éxito."
    }[data.messageType || MessageType.BENEFIT];

    const compositionDesc = {
      [CompositionType.CENTERED]: "Composición: CENTRADA (Estilo SaaS limpio).",
      [CompositionType.LEFT_TEXT_RIGHT_VISUAL]: "Composición: TEXTO IZQUIERDA / VISUAL DERECHA (Estilo editorial).",
      [CompositionType.DYNAMIC_DIAGONAL]: "Composición: DIAGONAL DINÁMICA (Enérgica y moderna).",
      [CompositionType.MINIMAL]: "Composición: MINIMALISTA (Mucho espacio negativo/aire).",
      [CompositionType.TECH_LOADED]: "Composición: CARGADA TECH (Densa con partículas y flujos de datos).",
      [CompositionType.FRAMED]: "Composición: ENMARCADA (Borde o contenedor tipo tarjeta)."
    }[resolvedData.composition || CompositionType.CENTERED];

    const intensityDesc = {
      [VisualIntensity.SOFT]: "Intensidad: SUAVE. Limpio, elegante, brillo sutil.",
      [VisualIntensity.MEDIUM]: "Intensidad: MEDIA. Efectos equilibrados, partículas perceptibles.",
      [VisualIntensity.HIGH]: "Intensidad: ALTA. Estilo de anuncios agresivo, brillo fuerte, efectos pesados."
    }[resolvedData.intensity || VisualIntensity.MEDIUM];

    const typoToneDesc = {
      [TypoTone.CORPORATE]: "Tono Tipográfico: CORPORATIVO. Sólido, confiable, profesional.",
      [TypoTone.TECH]: "Tono Tipográfico: TECNOLÓGICO. Moderno, acentos monoespaciados, futurista.",
      [TypoTone.AGGRESSIVE_COMMERCIAL]: "Tono Tipográfico: COMERCIAL AGRESIVO. Negrita, grande, alto impacto.",
      [TypoTone.MINIMAL_ELEGANT]: "Tono Tipográfico: MINIMALISTA ELEGANTE. Fino, espaciado, sofisticado.",
      [TypoTone.MODERN_STARTUP]: "Tono Tipográfico: STARTUP MODERNA. Amigable pero profesional, sans-serif."
    }[data.typoTone || TypoTone.TECH];

    const realismDesc = {
      [RealismStyle.REALISTIC_UI]: "Estilo Visual: INTERFAZ REALISTA. Elementos de interfaz perfectos a nivel de píxel.",
      [RealismStyle.GLOSSY_3D]: "Estilo Visual: 3D BRILLANTE. Materiales de alto brillo, profundidad, reflejos.",
      [RealismStyle.MODERN_FLAT]: "Estilo Visual: PLANO MODERNO. Vectores limpios, colores sólidos, sin sombras.",
      [RealismStyle.HYBRID]: "Estilo Visual: HÍBRIDO (Recomendado). Hardware 3D con superposiciones de interfaz plana."
    }[data.realism || RealismStyle.HYBRID];

    const hookDesc = {
      [HookType.QUESTION]: "Tipo de Gancho: PREGUNTA. Involucrando al usuario directamente.",
      [HookType.STRONG_STATEMENT]: "Tipo de Gancho: DECLARACIÓN FUERTE. Afirmación o hecho audaz.",
      [HookType.NUMBER]: "Tipo de Gancho: NÚMERO. Enfoque en datos o lista (ej. '3 Pasos').",
      [HookType.DIRECT_PAIN]: "Tipo de Gancho: DOLOR DIRECTO. Abordando un problema específico del usuario.",
      [HookType.PROMISE]: "Tipo de Gancho: PROMESA. Garantía de resultados o transformación."
    }[data.hookType || HookType.STRONG_STATEMENT];

    const contextDesc = {
      [ProductContext.CATALOG]: "Contexto: CATÁLOGO DE PRODUCTOS. Enfoque en inventario y artículos.",
      [ProductContext.MENU]: "Contexto: MENÚ DIGITAL. Enfoque en comida y pedidos.",
      [ProductContext.LANDING]: "Contexto: PÁGINA DE DESTINO. Enfoque en conversión y registro.",
      [ProductContext.CHECKOUT]: "Contexto: PROCESO DE PAGO. Enfoque en pago y seguridad.",
      [ProductContext.AUTOMATION]: "Contexto: FLUJO DE AUTOMATIZACIÓN. Enfoque en procesos automáticos.",
      [ProductContext.ANALYTICS]: "Contexto: PANEL DE ANALÍTICA. Enfoque en datos y gráficos."
    }[data.productContext || ProductContext.AUTOMATION];

    const formatDesc = data.format === '9:16' ? 'Story / Reel Cover (9:16 Vertical)' : 'Post (3:4 Portrait)';

    // Platform Elements Logic
    let elementInstructions = "";
    if (data.selectedElements?.includes(GraphicElement.SMARTPHONE)) {
      const orientation = data.phoneOrientation || 'FRONT';
      const orientationDesc = {
        'FRONT': 'mirando hacia adelante (vista frontal)',
        'LEFT': 'inclinado hacia la izquierda (vista lateral)',
        'RIGHT': 'inclinado hacia la derecha (vista lateral)'
      }[orientation];
      
      elementInstructions += `- HARDWARE PROTAGONISTA: Un smartphone 3D brillante de alta gama (estilo iPhone) ${orientationDesc}. 
        La pantalla debe mostrar una interfaz de usuario elegante y oscura relacionada con ${contextDesc}. 
        Colócalo con profundidad (capas Z), algunos elementos detrás (Z-3) y otros flotando al frente (Z-1).\n`;
    }

    // WhatsApp Elements
    if (data.selectedElements?.includes(GraphicElement.WHATSAPP_CHAT)) {
      elementInstructions += "- ELEMENT: A realistic WhatsApp chat UI overlay with message bubbles.\n";
    }
    if (data.selectedElements?.includes(GraphicElement.WHATSAPP_BUBBLE)) {
      elementInstructions += "- ELEMENT: Floating WhatsApp-style message bubbles with text.\n";
    }
    if (data.selectedElements?.includes(GraphicElement.WHATSAPP_SEND)) {
      elementInstructions += "- ELEMENT: A prominent 'Send' button with the WhatsApp green accent.\n";
    }
    if (data.selectedElements?.includes(GraphicElement.WHATSAPP_NOTIF)) {
      elementInstructions += "- ELEMENT: A floating WhatsApp notification banner at the top.\n";
    }
    if (data.selectedElements?.includes(GraphicElement.WHATSAPP_ICON)) {
      elementInstructions += "- ELEMENT: A high-quality 3D WhatsApp icon with a subtle glow.\n";
    }

    // Other Platform Elements
    if (data.selectedElements?.includes(GraphicElement.QR_CODE)) {
      elementInstructions += "- ELEMENT: A large, stylized high-tech QR Code with neon glow and glassmorphism texture.\n";
    }
    if (data.selectedElements?.includes(GraphicElement.TIME_SAVING)) {
      elementInstructions += "- ELEMENT: A sleek, digital 3D glossy chronometer symbolizing speed.\n";
    }
    if (data.selectedElements?.includes(GraphicElement.SHOPPING_CART)) {
      elementInstructions += "- ELEMENT: A modern 3D shopping bag or cart icon with glassmorphism effects.\n";
    }
    if (data.selectedElements?.includes(GraphicElement.ANALYTICS)) {
      elementInstructions += "- ELEMENT: Translucent 3D charts and data nodes floating in space.\n";
    }
    if (data.selectedElements?.includes(GraphicElement.SECURITY)) {
      elementInstructions += "- ELEMENT: A high-tech 3D shield or lock icon representing security.\n";
    }

    // Iconify / Tabler Icons integration
    if (data.selectedIcons && data.selectedIcons.length > 0) {
      elementInstructions += `- INTEGRATED ICONS (Tabler style): ${data.selectedIcons.join(', ')}. 
        Style: Semi-transparent glassmorphism or accented with brand colors.\n`;
    }

    const orthographyInstruction = `
      *** IMPORTANTE / CRÍTICO ***
      1. RESPETAR LITERALMENTE LA ORTOGRAFÍA, LOS ACENTOS (TILDES) Y LA NORMA UTF-8 EN TODO EL TEXTO.
      2. EL IDIOMA ES EXCLUSIVAMENTE ESPAÑOL LATINO (VENEZUELA). 
      3. NO ALTERAR, NO OMITIR Y NO TRADUCIR LOS TEXTOS PROPORCIONADOS. 
      4. *** REGLA DE ESPACIOS LIMPIOS ***: NO CREAR TEXTOS NI EMULAR LOGOS EN LA PARTE SUPERIOR IZQUIERDA Y DERECHA, NI EN LA PARTE INFERIOR IZQUIERDA NI DERECHA. NO LOGOS. NO LETRAS DE LA MARCA NI NOMBRES DE PRODUCTOS. SE HARÁN MANUALMENTE CON OTRA HERRAMIENTA.
      5. IMPORTANT: Generate the image WITHOUT any text overlays, titles, or typography. Clean art only.
      ***************************
    `.trim();

    return `
      ${orthographyInstruction}

      ROLE: Senior Art Director for SYNTIweb.
      CONCEPT: ${productPresets[niche]}
      BRAND ACCENT: Use the ACCENT COLOR specified in the CONCEPT for all highlights, glowing lines, and key UI elements to ensure brand identity.
      COLOR PALETTE: ${colorPresets[preset]}
      VISUAL IDENTITY: ${identityDesc}
      CUSTOM STYLE: ${data.styleInput || ''} ${data.visualMood || ''}
      
      IDIOMA Y PÚBLICO: 
      - TODO EL TEXTO DEBE ESTAR EN ESPAÑOL.
      - PÚBLICO OBJETIVO: Latino, específicamente VENEZUELA.
      - PROHIBIDO EL USO DE PALABRAS EN INGLÉS (No English words).
      - IMPORTANTE: No incluir palabras como "AUTOMATION", "DASHBOARD", "MENU" o cualquier término en inglés en las pantallas de los dispositivos o interfaces. Todo debe ser en ESPAÑOL.
      - RESPETO LITERAL DE ACENTOS Y ORTOGRAFÍA (UTF-8).
      
      SCENE: ${sceneDesc}
      OBJECTIVE: ${objectiveDesc}
      MESSAGE TYPE: ${messageTypeDesc}
      COMPOSITION: ${compositionDesc}
      INTENSITY: ${intensityDesc}
      TYPOGRAPHY: ${typoToneDesc}
      REALISM: ${realismDesc}
      HOOK: ${hookDesc}
      CONTEXT: ${contextDesc}
      FORMAT: ${formatDesc}
      
      "Conversion Engineering" (Ingeniería de Conversión) focus.
      
      ${elementInstructions}
      
      TECHNICAL:
      - NO messy elements. Professional lighting and depth.
      - Finish: High-end premium marketing.
      - Glassmorphism, 3D glossy product hero, light trails, neon UI accents, circular checks.

      TEXT REFERENCE ONLY (Context):
      - Main Topic: "${data.textInput}"
      - Secondary Topic: "${secondaryText}"
      - IMPORTANT: TEXT REFERENCE ONLY — do not render any typography in the image. Keep art completely clean of text.

      ${orthographyInstruction}
    `.trim();
  }

  public buildHumanScenePrompt(data: GenerationRequest): string {
    const subjectVariants: Record<string, string[]> = {
      'SYNTIweb': [
        'Venezuelan man in his 30s, wearing a casual linen shirt, warm and friendly smile, working in a modern small tech shop in Caracas',
        'Young Venezuelan woman entrepreneur, curly hair, wearing a stylish blazer over a t-shirt, standing in a vibrant coworking space',
        'Middle-aged Venezuelan business owner, confident and proud, standing in front of a successful hardware store (ferretería)',
        'Venezuelan woman in her late 20s, natural hair, focused and happy, using a smartphone in a clean, minimalist office',
        'A group of young Venezuelan entrepreneurs, diverse features, collaborating around a smartphone in a bright cafe',
      ],
      'SYNTIstudio': [
        'Venezuelan creative professional woman, 25-35, wearing modern glasses, showing a website on a smartphone to a client',
        'Young Venezuelan man, 28-38, modern casual style, standing in a sleek barber shop with a laptop in the background',
        'Venezuelan freelancer woman, working from a beautiful home office with tropical plants, looking at her phone with satisfaction',
        'Venezuelan architect or designer, 30-40, in a bright studio, holding a smartphone showing a 3D model',
      ],
      'SYNTIfood': [
        'Venezuelan woman chef, 30-45, wearing a clean white apron, afro-latino features, holding a phone with a digital menu in a cozy bakery',
        'Young Venezuelan man, 25-40, energetic food vendor at a modern food truck, showing a smartphone to a customer',
        'Venezuelan woman, 22-35, curly hair, owner of a colorful juice bar, smiling while checking orders on her phone',
        'A Venezuelan family running a traditional but modern arepera, the daughter showing the digital menu on a smartphone',
      ],
      'SYNTIcat': [
        'Venezuelan shopkeeper woman, 25-40, in a well-organized boutique, holding a smartphone showing a product catalog',
        'Venezuelan man, 28-42, reseller in a busy but clean electronics store, using a smartphone to manage inventory',
        'Young Venezuelan entrepreneur, 20-30, in a colorful craft store, taking a photo of a product with a smartphone',
        'Venezuelan market vendor, proud and smiling, in a modern market stall with full shelves, using a smartphone for transactions',
      ],
    };

    const productKey = data.productType as string;
    const variants = subjectVariants[productKey] || subjectVariants['SYNTIweb'];
    const humanVariation = (data as any).customHumanVariation ||
      `${variants[Math.floor(Math.random() * variants.length)]}. ${this.buildHumanVariation()}`;
    const randomSubject = humanVariation;

    const productScenes = {
      'SYNTIweb': {
        subject: randomSubject,
        action: 'holding a smartphone in their hands, looking directly at the FRONT SCREEN of the phone with a satisfied expression. The screen is facing the person and is clearly visible to them.',
        environment: 'Authentic Venezuelan small business setting, warm natural light, professional but local vibe',
      },
      'SYNTIstudio': {
        subject: randomSubject,
        action: 'proudly showing the FRONT SCREEN of their smartphone to the camera, the screen shows a beautiful website interface. The person is smiling.',
        environment: 'Modern Venezuelan service business or creative studio, clean and organized background',
      },
      'SYNTIfood': {
        subject: randomSubject,
        action: 'holding a smartphone and pointing at the FRONT SCREEN which shows a delicious digital menu. The person is looking at the camera with an inviting smile.',
        environment: 'Vibrant Venezuelan food business, appetizing atmosphere, warm lighting',
      },
      'SYNTIcat': {
        subject: randomSubject,
        action: 'scrolling through a digital catalog on the FRONT SCREEN of their smartphone, surrounded by their products. The person looks efficient and happy.',
        environment: 'Colorful Venezuelan retail store or market stall, authentic and busy but clean',
      },
    };

    const scene = productScenes[data.productType] || productScenes['SYNTIweb'];
    const format = data.format === '9:16' ? 'vertical 9:16 Reel format' : 'portrait 3:4 Feed format';

    const accentName: Record<string, string> = {
      'SYNTIweb':    'electric blue',
      'SYNTIstudio': 'electric blue',
      'SYNTIfood':   'warm orange',
      'SYNTIcat':    'emerald green',
    };

    const currentAccent = accentName[data.productType] || accentName['SYNTIweb'];

    return `
CRITICAL: Generate image with ZERO text, ZERO typography, ZERO words anywhere. 
Art only. Text will be added in post-production.

Create a photorealistic advertising image for Instagram in ${format}.

SCENE: ${randomSubject}, ${scene.action}.
ENVIRONMENT: ${scene.environment}.

HUMAN INTERACTION LOGIC (CRITICAL):
- The person is interacting with the FRONT of the smartphone.
- The SCREEN of the phone is on the side facing the person's face.
- DO NOT render the screen on the back of the phone (where the cameras are).
- The person is looking at the screen or showing the screen to the viewer.
- The phone's orientation must be logical: screen on one side, cameras on the other.

HUMAN DIRECTION:
- Authentic Venezuelan features, diverse and real (not generic stock photo).
- Natural, candid expressions of success and satisfaction.
- Person should look like a real entrepreneur or business owner in Venezuela.
- NO text overlaid on the image.

BRAND INTEGRATION:
- Subtle brand color ${currentAccent} in the environment or as a glow from the phone screen.
- The phone screen should show a clean, modern UI in ${currentAccent} (but NO text).

COMPOSITION:
- Leave clear space at top 30% for text overlay.
- Leave clear space at bottom 20% for text overlay.
- High-end editorial photography style.

TECHNICAL:
- Photorealistic, 8k, professional lighting, depth of field.
- Aspect ratio: ${data.format}

NEGATIVE: text, words, letters, logos, watermarks, screen on the back of the phone, distorted hands, generic stock photo look, white background.
    `.trim();
  }

  async generateCreativePost(data: GenerationRequest): Promise<GenerationResult> {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("API Key no configurada en VITE_GEMINI_API_KEY");
    }

    const negativePrompts = {
      [NegativeLevel.STRICT]: "sin estilo cartoon, sin ilustración infantil, sin saturación excesiva, sin elementos caóticos, sin composición recargada, sin tipografías futuristas ilegibles, sin fondos planos vacíos, sin colores neón agresivos, sin aspecto amateur, sin estética genérica de plantilla, sin 3D exagerado, sin ruido visual, sin iconografía inconsistente, strictly follow brand guidelines, NO ENGLISH TEXT, NO PALABRAS EN INGLÉS, NO LOGOS, NO TEXT IN CORNERS, NO BRAND NAMES IN CORNERS, NO MARKS",
      [NegativeLevel.MEDIUM]: "sin estilo cartoon, sin ilustración infantil, sin saturación excesiva, sin elementos caóticos, sin composición recargada, sin tipografías futuristas ilegibles, sin fondos planos vacíos, sin colores neón agresivos, sin aspecto amateur, NO ENGLISH TEXT, NO LOGOS, NO TEXT IN CORNERS",
      [NegativeLevel.FREE]: "sin estilo cartoon, sin ilustración infantil, sin aspecto amateur, NO ENGLISH TEXT, NO LOGOS"
    };

    const negativePrompt = negativePrompts[data.negativeLevel || NegativeLevel.STRICT];

    try {
      // 1. GENERACIÓN DE COPY ESTRATÉGICO (Hooks, Contexto, CTA)
      // Esto es esencial para que la imagen tenga el texto correcto y el caption sea profesional.
      const copyPrompt = `
        Actúa como un Copywriter Senior y Estratega de Marketing para ${data.niche}.
        OBJETIVO: ${data.postObjective}.
        TIPO DE MENSAJE: ${data.messageType}.
        GANCHO SELECCIONADO: ${data.hookType}.
        INSUMO DEL USUARIO: "${data.textInput}".
        PÚBLICO: Venezuela / Latino.
        
        Genera un objeto JSON con:
        - hook: Un gancho corto e impactante (máx 5 palabras).
        - body: Un beneficio o frase de valor (máx 8 palabras).
        - cta: Un llamado a la acción directo (máx 3 palabras).
        - caption: Un copy para Instagram con emojis (máx 30 palabras).
        
        IMPORTANTE: Todo en ESPAÑOL, respetando acentos y ortografía. Sin palabras en inglés.
      `;

      const copyResponse = await this.withRetry(() => this.callProxy(TEXT_MODEL, 'generateContent', {
        contents: [{ parts: [{ text: copyPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      }));

      const copyData = JSON.parse(copyResponse.text || "{}");
      
      // Actualizamos los textos para el prompt de imagen
      const finalData = {
        ...data,
        textInput: copyData.hook || data.textInput,
        secondaryText: copyData.body || data.secondaryText
      };

      // 2. GENERACIÓN DE IMAGEN
      const imagePart = data.base64Image ? {
        inlineData: {
          data: data.base64Image.split(',')[1],
          mimeType: "image/png"
        }
      } : undefined;

      const imagePrompt = data.customPrompt 
        ? `${data.customPrompt}\n\nNEGATIVE PROMPT: ${negativePrompt}`
        : data.mode === 'HUMAN_SCENE'
          ? `${this.buildHumanScenePrompt(finalData)}\n\nNEGATIVE PROMPT: ${negativePrompt}`
          : `${this.buildSmartPrompt(finalData)}\n\nNEGATIVE PROMPT: ${negativePrompt}`;

      const imageResponse = await this.withRetry(() => this.callProxy(MODEL_NAME, 'generateContent', {
        contents: [{
          parts: [
            ...(imagePart ? [imagePart] : []),
            { text: imagePrompt }
          ]
        }],
        generationConfig: {
          imageConfig: {
            aspectRatio: data.format as any
          }
        }
      }));

      let imageUrl = '';
      const parts = imageResponse.candidates?.[0]?.content?.parts;
      if (parts) {
        const foundPart = parts.find(p => p.inlineData || p.fileData);
        if (foundPart?.inlineData) {
          imageUrl = `data:${foundPart.inlineData.mimeType || 'image/png'};base64,${foundPart.inlineData.data}`;
        }
      }

      if (!imageUrl) throw new Error("La IA no generó la imagen.");

      return { 
        imageUrl, 
        caption: copyData.caption || "Post generado con éxito." 
      };
    } catch (error: any) {
      console.error("Error en SYNTIweb Engine:", error);
      throw new Error(`Error: ${error.message}`);
    }
  }

  // ─── MÉTODO 1: genera todos los hooks del carrusel de una vez (texto) ───
  public async generateCarouselHooks(
    topic: string,
    slideCount: 3 | 5 | 7,
    productType: string,
    postObjective: string
  ): Promise<Array<{ hook: string; benefit: string }>> {
    const response = await this.withRetry(() => this.callProxy(TEXT_MODEL, 'generateContent', {
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hook:    { type: Type.STRING },
              benefit: { type: Type.STRING }
            },
            required: ['hook', 'benefit']
          }
        }
      },
      contents: [{
        role: 'user',
        parts: [{
          text: `Eres un experto en marketing digital venezolano.
Producto: ${productType}
Objetivo: ${postObjective}
Tema del carrusel: "${topic}"

Genera exactamente ${slideCount} slides para un carrusel de Instagram.
Cada slide debe tener:
- hook: frase corta de máximo 8 palabras, impactante, en español venezolano coloquial
- benefit: una frase de máximo 12 palabras explicando el beneficio concreto

Progresión: el slide 1 plantea el problema, los intermedios desarrollan, el último tiene CTA claro.
Responde SOLO con el array JSON, sin markdown, sin explicaciones.`
        }]
      }]
    }));

    const text = response.text;
    if (!text) throw new Error('No response from Gemini text model');
    return JSON.parse(text);
  }

  // ─── MÉTODO 2: genera imágenes en serie con delay ───
  public async generateCarouselImages(
    slides: Array<{ hook: string; benefit: string }>,
    productType: string,
    generationMode: string,
    onSlideReady: (index: number, imageUrl: string) => void,
    onSlideError: (index: number, error: string) => void
  ): Promise<void> {
    const DELAY_MS = 3000;

    for (let i = 0; i < slides.length; i++) {
      try {
        const slide = slides[i];
        const prompt = this.buildCarouselSlidePrompt(slide, productType, i + 1, slides.length);

        const response = await this.withRetry(() => this.callProxy(MODEL_NAME, 'generateContent', {
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
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

      // delay entre slides excepto el último
      if (i < slides.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }
  }

  // ─── MÉTODO PRIVADO: prompt por slide ───
  private buildCarouselSlidePrompt(
    slide: { hook: string; benefit: string },
    productType: string,
    slideNumber: number,
    totalSlides: number
  ): string {
    const productScenes: Record<string, string> = {
      'SYNTIfood':   'Venezuelan restaurant or bakery, warm lighting, food on table, authentic local setting',
      'SYNTIcat':    'Venezuelan retail store or boutique, colorful products displayed, busy local market feel',
      'SYNTIstudio': 'Venezuelan professional working on laptop or phone, modern home office or coworking space',
      'SYNTIweb':    'Venezuelan small business owner smiling at smartphone, vibrant urban background'
    };

    const scene = productScenes[productType] || productScenes['SYNTIweb'];

    return `Create a professional Instagram carousel slide image. Slide ${slideNumber} of ${totalSlides}.

Scene: ${scene}
Visual style: authentic Venezuelan human scene, warm and vibrant colors, natural lighting, photorealistic
Composition: rule of thirds, subject on left third, right side has breathing space for text overlay
Color mood: energetic and approachable, not corporate

CRITICAL RULES:
- ZERO text in the image. No words, no letters, no numbers anywhere.
- No logos embedded in the image.
- Clean background areas suitable for text overlay.
- Real person as subject (not illustrated, not cartoon).
- Slide progression context: ${slideNumber === 1 ? 'opening slide, problem awareness' : slideNumber === totalSlides ? 'closing slide, call to action energy' : 'middle slide, educational tone'}

Aspect ratio: 3:4 vertical portrait (taller than wide, like a phone screen).
  Width MUST be shorter than height. NOT square. NOT landscape.
  Output dimensions: 768px wide × 1024px tall minimum.
  High resolution, photorealistic.`;
  }

  public async detectTextInImage(imageBase64: string): Promise<{ hasTitle: boolean; hasSubtitle: boolean; title?: string; subtitle?: string }> {
    const prompt = `
      Analiza esta imagen y determina si ya contiene un título o subtítulo gráfico (texto superpuesto).
      Responde estrictamente en formato JSON:
      {
        "hasTitle": boolean,
        "hasSubtitle": boolean,
        "title": "texto detectado o null",
        "subtitle": "texto detectado o null"
      }
    `;

    const cleanBase64 = imageBase64.split(',')[1];
    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64
        }
      }
    ];

    try {
      const result = await this.withRetry(() => this.callProxy(TEXT_MODEL, 'generateContent', {
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hasTitle: { type: Type.BOOLEAN },
              hasSubtitle: { type: Type.BOOLEAN },
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING }
            },
            required: ["hasTitle", "hasSubtitle"]
          }
        }
      }));

      const response = result.text || "{}";
      return JSON.parse(response);
    } catch (err) {
      console.error("Error detectando texto en imagen:", err);
      return { hasTitle: false, hasSubtitle: false };
    }
  }

  public async analyzeImageAndGeneratePost(
    imageBase64: string | null,
    topic: string,
    format: PostFormat
  ): Promise<AIAnalysis> {
    const prompt = `
      Analiza esta solicitud para un post de Instagram de "SYNTIweb".
      
      DATOS DEL POST:
      Formato: ${format}.
      Tema/Intención: "${topic || 'Promoción general de productos artesanales'}".
    `;

    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
      const cleanBase64 = imageBase64.split(',')[1];
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64
        }
      });
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
              hook: { type: Type.STRING, description: "Frase corta de impacto (Paso 1)" },
              body: { type: Type.STRING, description: "Explicación del beneficio (Paso 2)" },
              cta: { type: Type.STRING, description: "Llamado a la acción (Paso 3)" },
              question: { type: Type.STRING, description: "Pregunta para generar comentarios (Paso 4)" },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hashtags (Paso 5)" },
              hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
              strategy: {
                type: Type.OBJECT,
                properties: {
                  objective: { type: Type.STRING },
                  bestTime: { type: Type.STRING },
                  callToAction: { type: Type.STRING }
                },
                required: ["objective", "bestTime", "callToAction"]
              },
              visualAdvice: {
                type: Type.OBJECT,
                properties: {
                  composition: { type: Type.STRING },
                  filters: { type: Type.STRING },
                  textOverlaySuggestion: { type: Type.STRING }
                },
                required: ["composition", "filters", "textOverlaySuggestion"]
              },
              seo: {
                type: Type.OBJECT,
                properties: {
                  altText: { type: Type.STRING },
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["altText", "keywords"]
              },
              ads: {
                type: Type.OBJECT,
                properties: {
                  segmentation: { type: Type.STRING },
                  campaignType: { type: Type.STRING }
                },
                required: ["segmentation", "campaignType"]
              },
              community: {
                type: Type.OBJECT,
                properties: {
                  conversationStarter: { type: Type.STRING }
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
}

export const geminiService = new GeminiService();

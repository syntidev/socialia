export enum FormatType {
  FEED = '3:4',
  REEL = '9:16'
}

export enum ProductType {
  MAIN = 'SYNTIweb',
  STUDIO = 'SYNTIstudio',
  FOOD = 'SYNTIfood',
  CAT = 'SYNTIcat'
}

export enum NicheType {
  SYNTIWEB = 'SYNTIWEB',
  STUDIO = 'STUDIO',
  FOOD = 'FOOD',
  CATALOG = 'CATALOG'
}

export enum PresetType {
  DARK_NAVY = 'DARK_NAVY',
  SKY_BLUE = 'SKY_BLUE',
  LIGHT_GRADIENT = 'LIGHT_GRADIENT',
  MODERN_WHITE = 'MODERN_WHITE',
  VIBRANT_TECH = 'VIBRANT_TECH'
}

export enum GenerationMode {
  SMART_BUILDER = 'SMART_BUILDER',
  CLASSIC = 'CLASSIC',
  HUMAN_SCENE = 'HUMAN_SCENE',
  DIGITAL_PRODUCT_PROMO = 'DIGITAL_PRODUCT_PROMO'
}

export enum CarouselSlideRole {
  PORTADA      = 'PORTADA',
  PROBLEMA     = 'PROBLEMA',
  VALOR        = 'VALOR',
  VALOR_1      = 'VALOR_1',
  VALOR_2      = 'VALOR_2',
  VALOR_3      = 'VALOR_3',
  COMPARACION  = 'COMPARACION',
  CTA          = 'CTA'
}

export enum VisualMode {
  DARK_FORCE = 'DARK_FORCE',
  SAAS_LIGHT = 'SAAS_LIGHT'
}

export enum GraphicElement {
  QR_CODE = 'QR_CODE',
  TIME_SAVING = 'TIME_SAVING',
  SHOPPING_CART = 'SHOPPING_CART',
  ANALYTICS = 'ANALYTICS',
  SECURITY = 'SECURITY',
  SMARTPHONE = 'SMARTPHONE',
  WHATSAPP_CHAT = 'WHATSAPP_CHAT',
  WHATSAPP_BUBBLE = 'WHATSAPP_BUBBLE',
  WHATSAPP_SEND = 'WHATSAPP_SEND',
  WHATSAPP_NOTIF = 'WHATSAPP_NOTIF',
  WHATSAPP_ICON = 'WHATSAPP_ICON',
  COLOR_PALETTE = 'COLOR_PALETTE',
  CURRENCY_CONVERSION = 'CURRENCY_CONVERSION',
  ADD_PRODUCT = 'ADD_PRODUCT'
}

export enum VisualScene {
  HERO_CENTERED = 'HERO_CENTERED',
  SMARTPHONE_TILTED = 'SMARTPHONE_TILTED',
  FLOATING_UI = 'FLOATING_UI',
  DASHBOARD_OVERLAY = 'DASHBOARD_OVERLAY',
  ABSTRACT_ICONS = 'ABSTRACT_ICONS',
  COMPARISON = 'COMPARISON',
  FLOW_LINES = 'FLOW_LINES'
}

export enum PostObjective {
  SELL = 'SELL',
  EDUCATE = 'EDUCATE',
  CURIOSITY = 'CURIOSITY',
  EXPLAIN = 'EXPLAIN',
  BRANDING = 'BRANDING',
  LEADS = 'LEADS',
  ACTIVATE = 'ACTIVATE'
}

export enum MessageType {
  PROBLEM = 'PROBLEM',
  SOLUTION = 'SOLUTION',
  BENEFIT = 'BENEFIT',
  COMPARISON = 'COMPARISON',
  TESTIMONY = 'TESTIMONY',
  STEP_BY_STEP = 'STEP_BY_STEP',
  OFFER = 'OFFER',
  EMOTIONAL_HOOK = 'EMOTIONAL_HOOK'
}

export enum CompositionType {
  CENTERED = 'CENTERED',
  LEFT_TEXT_RIGHT_VISUAL = 'LEFT_TEXT_RIGHT_VISUAL',
  DYNAMIC_DIAGONAL = 'DYNAMIC_DIAGONAL',
  MINIMAL = 'MINIMAL',
  TECH_LOADED = 'TECH_LOADED',
  FRAMED = 'FRAMED'
}

export enum VisualIntensity {
  SOFT = 'SOFT',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum TypoTone {
  CORPORATE = 'CORPORATE',
  TECH = 'TECH',
  AGGRESSIVE_COMMERCIAL = 'AGGRESSIVE_COMMERCIAL',
  MINIMAL_ELEGANT = 'MINIMAL_ELEGANT',
  MODERN_STARTUP = 'MODERN_STARTUP'
}

export enum RealismStyle {
  REALISTIC_UI = 'REALISTIC_UI',
  GLOSSY_3D = 'GLOSSY_3D',
  MODERN_FLAT = 'MODERN_FLAT',
  HYBRID = 'HYBRID'
}

export enum HookType {
  QUESTION = 'QUESTION',
  STRONG_STATEMENT = 'STRONG_STATEMENT',
  NUMBER = 'NUMBER',
  DIRECT_PAIN = 'DIRECT_PAIN',
  PROMISE = 'PROMISE'
}

export enum ProductContext {
  CATALOG = 'CATALOG',
  MENU = 'MENU',
  LANDING = 'LANDING',
  CHECKOUT = 'CHECKOUT',
  AUTOMATION = 'AUTOMATION',
  ANALYTICS = 'ANALYTICS'
}

export enum NegativeLevel {
  STRICT = 'STRICT',
  MEDIUM = 'MEDIUM',
  FREE = 'FREE'
}

export enum PhoneOrientation {
  FRONT = 'FRONT',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface GenerationRequest {
  textInput: string;
  secondaryText?: string;
  objective?: string; // Legacy field, keeping for compatibility during refactor
  
  // New Structured Fields
  visualScene?: VisualScene;
  postObjective?: PostObjective;
  messageType?: MessageType;
  composition?: CompositionType;
  intensity?: VisualIntensity;
  typoTone?: TypoTone;
  realism?: RealismStyle;
  hookType?: HookType;
  productContext?: ProductContext;
  negativeLevel?: NegativeLevel;

  styleInput: string;
  format: FormatType;
  productType: ProductType;
  niche?: NicheType;
  preset?: PresetType;
  mode?: GenerationMode;
  base64Image?: string;
  visualMood: string;
  visualMode: VisualMode;
  customPrompt?: string;
  selectedElements?: GraphicElement[];
  selectedIcons?: string[];
  phoneOrientation?: PhoneOrientation;
}

export interface GenerationResult {
  imageUrl: string;
  caption: string;
}

export enum PostFormat {
  FEED_PORTRAIT = '3:4',
  REEL_STORY = '9:16'
}

export interface AIAnalysis {
  hook: string;
  body: string;
  cta: string;
  question: string;
  hashtags: string[];
  strategy: {
    objective: string;
    bestTime: string;
    callToAction: string;
  };
  visualAdvice: {
    composition: string;
    filters: string;
    textOverlaySuggestion: string;
  };
  seo: {
    altText: string;
    keywords: string[];
  };
  ads: {
    segmentation: string;
    campaignType: string;
  };
  community: {
    conversationStarter: string;
  };
  hooks: string[]; // For Reels
}

export enum AppPhase {
  PHASE_01 = 'PHASE_01',
  PHASE_02 = 'PHASE_02',
  PHASE_03 = 'PHASE_03'
}

export enum CreationMode {
  POST = 'POST',
  STORY = 'STORY',
  CAROUSEL = 'CAROUSEL'
}

export interface AppState {
  loading: boolean;
  error: string | null;
  result: GenerationResult | null;
  socialAnalysis: AIAnalysis | null;
  isAnalyzing: boolean;
}

export interface VisualEditorState {
  titlePos: { x: number; y: number };
  subtitlePos: { x: number; y: number };
  logoPos: { x: number; y: number };
  titleSize: number;
  subtitleSize: number;
  logoSize: number;
  titleColor: string;
  subtitleColor: string;
  logoType: 'negative' | 'positive';
  showLogo: boolean;
  titleAlign?: 'left' | 'center' | 'right';
  subtitleAlign?: 'left' | 'center' | 'right';
  titleShadow?: boolean;
  subtitleShadow?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
}

export interface CarouselSlide {
  id: number;
  hook: string;
  benefit: string;
  imageUrl: string | null;
  sealedImage: string | null;
  status: 'pending' | 'generating' | 'done' | 'error';
  editorState?: VisualEditorState;
  // Contexto narrativo — se preserva al regenerar
  role?: CarouselSlideRole;
  messageTypeBeat?: MessageType;
  visualSceneOverride?: VisualScene;
  compositionOverride?: CompositionType;
  topic?: string;
  postObjective?: PostObjective;
}

export interface CarouselConfig {
  topic: string;
  slideCount: 3 | 5 | 7;
  productType: ProductType;
  postObjective: PostObjective;
}

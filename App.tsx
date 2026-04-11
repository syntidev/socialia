
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { geminiService } from './services/geminiService';
import html2canvas from 'html2canvas';
import { 
  FormatType, 
  GenerationRequest, 
  GenerationResult, 
  ProductType, 
  VisualMode, 
  NicheType, 
  PresetType, 
  GenerationMode, 
  GraphicElement, 
  PhoneOrientation,
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
  VisualEditorState,
  AppPhase,
  CreationMode,
  CarouselSlide,
  CarouselConfig
} from './types';
import RoleTabs from './components/RoleTabs';
import PostPreview from './components/PostPreview';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'motion/react';
import LogoPositive from './assets/brand/syntiweb-logo-positive.svg?react';
import { 
  CameraIcon, 
  SparklesIcon, 
  ArrowDownTrayIcon, 
  ClipboardIcon,
  CheckIcon,
  PhotoIcon,
  XMarkIcon,
  GlobeAltIcon,
  BeakerIcon,
  ShoppingBagIcon,
  CakeIcon,
  Square3Stack3DIcon,
  QrCodeIcon,
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  SwatchIcon,
  CommandLineIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  DocumentTextIcon,
  ViewColumnsIcon,
  BoltIcon,
  PencilIcon,
  CubeIcon,
  LinkIcon,
  PuzzlePieceIcon,
  NoSymbolIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const nicheColors = {
  [ProductType.MAIN]: '#4A80E4',
  [ProductType.STUDIO]: '#8B5CF6',
  [ProductType.FOOD]: '#F97316',
  [ProductType.CAT]: '#10B981'
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<GenerationRequest>({
    textInput: '',
    secondaryText: '',
    objective: 'Vender y captar leads',
    styleInput: 'Estética SaaS Premium, minimalismo tecnológico, acabados de cristal (glassmorphism), iluminación profesional, estilo Apple.',
    format: FormatType.FEED,
    productType: ProductType.MAIN,
    niche: NicheType.SYNTIWEB,
    preset: PresetType.DARK_NAVY,
    mode: GenerationMode.SMART_BUILDER,
    base64Image: undefined,
    visualMood: 'SaaS Moderno y Limpio',
    visualMode: VisualMode.DARK_FORCE,
    customPrompt: '',
    selectedElements: [],
    selectedIcons: [],
    phoneOrientation: PhoneOrientation.FRONT,
    visualScene: VisualScene.HERO_CENTERED,
    postObjective: PostObjective.SELL,
    messageType: MessageType.BENEFIT,
    composition: CompositionType.CENTERED,
    intensity: VisualIntensity.MEDIUM,
    typoTone: TypoTone.TECH,
    realism: RealismStyle.HYBRID,
    hookType: HookType.STRONG_STATEMENT,
    productContext: ProductContext.AUTOMATION,
    negativeLevel: NegativeLevel.STRICT
  });

  const [reviewedText, setReviewedText] = useState('');
  const [reviewedSecondaryText, setReviewedSecondaryText] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [bufferSchedule, setBufferSchedule] = useState('');
  const [suggestedTime, setSuggestedTime] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [imagenSellada, setImagenSellada] = useState<string | null>(null);
  const [isSealing, setIsSealing] = useState(false);
  const [activePhase, setActivePhase] = useState<AppPhase>(AppPhase.PHASE_01);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [bufferProfiles, setBufferProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [bufferError, setBufferError] = useState<string | null>(null);

  const [creationMode, setCreationMode] = useState<CreationMode>(CreationMode.POST);
  const [carouselConfig, setCarouselConfig] = useState<CarouselConfig>({
    topic: '',
    slideCount: 5,
    productType: ProductType.MAIN,
    postObjective: PostObjective.EDUCATE
  });
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const [visualEditor, setVisualEditor] = useState<VisualEditorState>({
    titlePos: { x: 0, y: 24 },
    subtitlePos: { x: 0, y: 260 },
    logoPos: { x: 85, y: 280 },
    titleSize: 24,
    subtitleSize: 14,
    logoSize: 110,
    titleColor: '#ffffff',
    subtitleColor: '#ffffff',
    logoType: 'negative',
    showLogo: true,
    titleAlign: 'center',
    subtitleAlign: 'center',
    titleShadow: true,
    subtitleShadow: true,
    showTitle: true,
    showSubtitle: true
  });

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImagenSellada(null);
  }, [formData.textInput, formData.secondaryText, formData.preset, formData.composition, formData.format]);

  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [socialAnalysis, setSocialAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const resetVisualEditor = useCallback((preset: PresetType) => {
    const isDark = [PresetType.DARK_NAVY, PresetType.SKY_BLUE, PresetType.VIBRANT_TECH].includes(preset);
    setVisualEditor({
      titlePos: { x: 0, y: 24 },
      subtitlePos: { x: 0, y: 260 },
      logoPos: { x: 85, y: 280 },
      titleSize: 24,
      subtitleSize: 14,
      logoSize: 110,
      titleColor: isDark ? '#ffffff' : '#111827',
      subtitleColor: isDark ? '#ffffff' : '#111827',
      logoType: isDark ? 'negative' : 'positive',
      showLogo: true,
      titleAlign: 'center',
      subtitleAlign: 'center',
      titleShadow: true,
      subtitleShadow: true,
      showTitle: true,
      showSubtitle: true
    });
  }, []);


  // Remove the problematic sync useEffect that was overwriting detected text
  
  useEffect(() => {
    setCarouselConfig(p => ({ ...p, productType: formData.productType }));
  }, [formData.productType]);

  useEffect(() => {
    if (socialAnalysis?.strategy?.bestTime) {
      console.log('DEBUG: Seteando suggestedTime:', socialAnalysis.strategy.bestTime);
      setSuggestedTime(socialAnalysis.strategy.bestTime);
    } else {
      console.log('DEBUG: No hay bestTime en socialAnalysis');
    }
  }, [socialAnalysis]);

  const applySuggestedTime = () => {
    if (!suggestedTime) return;
    
    console.log('DEBUG: Aplicando hora sugerida:', suggestedTime);
    
    // Intentar extraer la primera hora (ej: "11:00 AM" o "11:00")
    const timeMatch = suggestedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let [_, hours, minutes, ampm] = timeMatch;
      let h = parseInt(hours);
      
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
        if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
      }
      
      let now = new Date();
      let scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, parseInt(minutes));
      
      // Si la hora ya pasó hoy, sugerir para mañana
      if (scheduledDate < now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }
      
      const year = scheduledDate.getFullYear();
      const month = String(scheduledDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduledDate.getDate()).padStart(2, '0');
      const hh = String(scheduledDate.getHours()).padStart(2, '0');
      const mm = String(scheduledDate.getMinutes()).padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}T${hh}:${mm}`;
      console.log('DEBUG: Nueva fecha programada:', formattedDate);
      setBufferSchedule(formattedDate);
    } else {
      console.warn('DEBUG: No se pudo parsear la hora sugerida:', suggestedTime);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, base64Image: base64 }));
        
        // Automatically jump to Phase 2 (Edit)
        setActivePhase(AppPhase.PHASE_02);
        
        // Reset editor with safe positions
        resetVisualEditor(formData.preset || PresetType.DARK_NAVY);

        // Analyze image to detect existing text
        try {
          const analysis = await geminiService.detectTextInImage(base64);
          if (analysis.hasTitle || analysis.hasSubtitle) {
            setVisualEditor(prev => ({
              ...prev,
              showTitle: !analysis.hasTitle,
              showSubtitle: !analysis.hasSubtitle
            }));
            
            if (analysis.title) setReviewedText(analysis.title);
            if (analysis.subtitle) setReviewedSecondaryText(analysis.subtitle);
          }
        } catch (err) {
          console.error("Error analizando imagen subida:", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSocialAnalysis(null);
    setImagenSellada(null);
    
    // Sync reviewed texts from formData when generating new art
    setReviewedText(formData.textInput);
    setReviewedSecondaryText(formData.secondaryText);
    
    resetVisualEditor(formData.preset || PresetType.DARK_NAVY);

    try {
      const completeRequest = geminiService.classifyAndComplete(
        formData.productType,
        formData.postObjective || PostObjective.SELL,
        {
          ...formData,
          textInput: reviewedText || formData.textInput,
          secondaryText: reviewedSecondaryText || formData.secondaryText
        }
      );

      const response = await geminiService.generateCreativePost(completeRequest);
      setResult(response);
      setActivePhase(AppPhase.PHASE_02);
      
      // Activar cooldown de 3 segundos
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const sellarImagen = async () => {
    if (!previewRef.current) return;
    setIsSealing(true);
    try {
      // Small delay to ensure images are loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = previewRef.current;
      const targetWidth = 1080;
      const currentWidth = element.offsetWidth;
      const scaleFactor = targetWidth / currentWidth;

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: scaleFactor,
        logging: false,
        onclone: (clonedDoc) => {
          // Force elements to be visible in the clone
          const images = clonedDoc.getElementsByTagName('img');
          for (let i = 0; i < images.length; i++) {
            images[i].style.visibility = 'visible';
          }
        }
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      setImagenSellada(dataUrl);

      if (creationMode === CreationMode.CAROUSEL) {
        setSlides(prev => prev.map((s, i) =>
          i === activeSlideIndex ? { ...s, sealedImage: dataUrl } : s
        ));
      }
    } catch (err) {
      console.error('Error al sellar imagen:', err);
      setError('Error al procesar la imagen final.');
    } finally {
      setIsSealing(false);
    }
  };

  const resizeImageForGemini = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      if (!base64.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(base64);
    });
  };

  const handleAnalyzeSocial = async () => {
    console.log('DEBUG: Iniciando handleAnalyzeSocial');
    const imageToAnalyze = imagenSellada || result?.imageUrl || formData.base64Image || null;
    
    setIsAnalyzing(true);
    setError(null);
    setActivePhase(AppPhase.PHASE_03);

    try {
      let optimizedImage: string | null = null;
      if (imageToAnalyze) {
        console.log('DEBUG: Redimensionando imagen para Gemini...');
        optimizedImage = await resizeImageForGemini(imageToAnalyze);
        console.log('DEBUG: Imagen optimizada (longitud):', optimizedImage.length);
      } else {
        console.log('DEBUG: No hay imagen, procediendo con análisis de solo texto.');
      }
      
      console.log('DEBUG: Llamando a geminiService.analyzeImageAndGeneratePost...');
      const combinedTopic = `${reviewedText || formData.textInput} ${reviewedSecondaryText || formData.secondaryText}`.trim() || formData.customPrompt || 'Promoción general';
      
      const analysis = await geminiService.analyzeImageAndGeneratePost(
        optimizedImage,
        combinedTopic,
        formData.format === FormatType.FEED ? PostFormat.FEED_PORTRAIT : PostFormat.REEL_STORY
      );
      
      console.log('DEBUG: Análisis recibido con éxito:', analysis);
      setSocialAnalysis(analysis);
      
      // Activar cooldown de 3 segundos
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);
    } catch (err: any) {
      console.error('DEBUG: Error en handleAnalyzeSocial:', err);
      setError(err.message || 'Error al analizar la estrategia social.');
    } finally {
      console.log('DEBUG: Finalizando handleAnalyzeSocial (setIsAnalyzing(false))');
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const downloadImage = () => {
    const imageToDownload = imagenSellada || result?.imageUrl;
    if (imageToDownload) {
      const link = document.createElement('a');
      link.href = imageToDownload;
      link.download = `syntiweb_${formData.niche?.toLowerCase()}_${Date.now()}.png`;
      link.click();
    }
  };

  const uploadToCloudinary = async (base64Image: string): Promise<string> => {
    console.log('DEBUG: Iniciando uploadToCloudinary');
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    console.log('DEBUG: Config Cloudinary:', { cloudName, uploadPreset: uploadPreset ? 'Presente' : 'Faltante' });

    if (!cloudName || !uploadPreset) {
      throw new Error('Configuración de Cloudinary incompleta en .env. Asegúrate de que las variables empiecen con VITE_');
    }

    try {
      // Optimizar imagen: Convertir base64 a JPEG comprimido antes de subir
      console.log('DEBUG: Optimizando imagen a JPEG...');
      const blob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('No se pudo obtener el contexto del canvas'));
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Error al comprimir imagen'));
          }, 'image/jpeg', 0.85); // 85% de calidad es el punto dulce entre peso y nitidez
        };
        img.onerror = () => reject(new Error('Error al cargar imagen para optimización'));
      });

      console.log('DEBUG: Imagen optimizada (nuevo tamaño):', blob.size);

      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', uploadPreset);

      console.log('DEBUG: Enviando POST a Cloudinary...');
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('DEBUG: Error respuesta Cloudinary:', errorData);
        throw new Error(errorData.error?.message || 'Error al subir a Cloudinary. Verifica que el preset sea "Unsigned".');
      }

      const data = await response.json();
      console.log('DEBUG: Subida a Cloudinary exitosa:', data.secure_url);
      return data.secure_url;
    } catch (err: any) {
      console.error('DEBUG: Error en uploadToCloudinary:', err);
      throw err;
    }
  };

  const sendToMake = async () => {
    const finalImage = imagenSellada || result?.imageUrl || formData.base64Image;
    if (!finalImage || !socialAnalysis) return;
    
    setIsSending(true);
    setError(null);

    try {
      // 1. Subir imagen a Cloudinary (Make necesita una URL pública)
      const cloudinaryUrl = await uploadToCloudinary(finalImage);
      
      // 2. Armar el paquete de datos (Data Bundle)
      const payload = {
        image_url: cloudinaryUrl,
        hook: socialAnalysis.hook,
        body: socialAnalysis.body,
        cta: socialAnalysis.cta,
        question: socialAnalysis.question,
        hashtags: socialAnalysis.hashtags,
        full_caption: [
          socialAnalysis.hook,
          socialAnalysis.body,
          socialAnalysis.cta,
          socialAnalysis.question,
          socialAnalysis.hashtags.map((h: string) => `#${h}`).join(' ')
        ].join('\n\n'),
        scheduled_at: bufferSchedule || null,
        timestamp: new Date().toISOString(),
        user_email: 'syntidev@gmail.com'
      };

      const response = await fetch('/api/socialia/make', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error en Make.com: ${response.statusText}`);
      }
      
      setSendSuccess(true);
      setTimeout(() => { 
        setSendSuccess(false); 
        setShowPublishModal(false); 
      }, 3000);
      
    } catch (err: any) {
      console.error('Error enviando a Make:', err);
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (showPublishModal && bufferProfiles.length === 0) {
      fetchBufferChannels();
    }
  }, [showPublishModal]);

  const fetchBufferChannels = async () => {
    setBufferError(null);
    try {
      const organizationId = "69d202e4ad39170ebb42784a";

      // Get Channels
      const channelsResponse = await fetch('/api/socialia/buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetChannels {
              channels(input: { organizationId: "${organizationId}" }) {
                id
                name
                displayName
                service
                avatar
              }
            }
          `
        })
      });
      const channelsData = await channelsResponse.json();
      const channels = channelsData.data?.channels;

      if (Array.isArray(channels)) {
        setBufferProfiles(channels);
        if (channels.length > 0) {
          setSelectedProfileId(channels[0].id);
        }
      } else {
        throw new Error('Respuesta de canales inesperada');
      }
    } catch (err: any) {
      console.error('Error fetching Buffer channels:', err);
      setBufferError('Error al conectar con Buffer. Verifica tu token.');
    }
  };

  const sendToBuffer = async () => {
    const finalImage = imagenSellada || result?.imageUrl || formData.base64Image;
    if (!finalImage || !socialAnalysis || !selectedProfileId) return;

    setIsSending(true);
    setError(null);

    try {
      const cloudinaryUrl = await uploadToCloudinary(finalImage);
      const fullCaption = [
        socialAnalysis.hook,
        socialAnalysis.body,
        socialAnalysis.cta,
        socialAnalysis.question,
        socialAnalysis.hashtags.map((h: string) => `#${h}`).join(' ')
      ].join('\n\n');

      const publishResponse = await fetch('/api/socialia/buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
  mutation CreatePost {
    createPost(input: {
      text: ${JSON.stringify(fullCaption)},
      channelId: "${selectedProfileId}",
      schedulingType: automatic,
      mode: ${bufferSchedule ? 'customScheduled' : 'addToQueue'},
      ${bufferSchedule ? `dueAt: "${new Date(bufferSchedule).toISOString()}",` : ''}
      metadata: {
        instagram: {
          type: post,
          shouldShareToFeed: true
        }
      },
      assets: {
        images: [{ url: "${cloudinaryUrl}" }]
      }
    }) {
      ... on PostActionSuccess { post { id } }
      ... on MutationError { message }
    }
  }
          `
        })
      });

      const publishData = await publishResponse.json();
      const error = publishData.data?.createPost?.message;

      if (error) {
        throw new Error(error);
      }

      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setShowPublishModal(false);
      }, 3000);

    } catch (err: any) {
      console.error('Error sending to Buffer:', err);
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const isPhaseEnabled = (phase: AppPhase): boolean => {
    const hasImage = result !== null || formData.base64Image !== undefined;
    switch (phase) {
      case AppPhase.PHASE_01: return true;
      case AppPhase.PHASE_02: return hasImage;
      case AppPhase.PHASE_03: return true; // Always allow Phase 3 for strategy
      default: return false;
    }
  };

  const handleGenerateCarousel = async () => {
    if (!carouselConfig.topic.trim()) return;
    setIsGeneratingCarousel(true);

    try {
      // Paso 1: generar todos los hooks de una vez
      const hooks = await geminiService.generateCarouselHooks(
        carouselConfig.topic,
        carouselConfig.slideCount,
        carouselConfig.productType,
        carouselConfig.postObjective
      );

      // Paso 2: inicializar slides en estado pending
      const initialSlides: CarouselSlide[] = hooks.map((h, i) => ({
        id: i,
        hook: h.hook,
        benefit: h.benefit,
        imageUrl: null,
        sealedImage: null,
        status: 'pending'
      }));
      setSlides(initialSlides);

      // Paso 3: generar imágenes en serie
      await geminiService.generateCarouselImages(
        hooks,
        carouselConfig.productType,
        formData.mode || 'HUMAN_SCENE',
        (index, imageUrl) => {
          setSlides(prev => prev.map((s, i) =>
            i === index ? { ...s, imageUrl, status: 'done' } : s
          ));
        },
        (index, error) => {
          setSlides(prev => prev.map((s, i) =>
            i === index ? { ...s, status: 'error' } : s
          ));
          console.error(`Slide ${index} failed:`, error);
        }
      );
    } catch (err) {
      console.error('Carousel generation failed:', err);
    } finally {
      setIsGeneratingCarousel(false);
    }
  };

  const handleRetrySlide = async (index: number) => {
    const slide = slides[index];
    if (!slide) return;
    setSlides(prev => prev.map((s, i) =>
      i === index ? { ...s, status: 'generating' } : s
    ));
    await geminiService.generateCarouselImages(
      [{ hook: slide.hook, benefit: slide.benefit }],
      carouselConfig.productType,
      formData.mode || 'HUMAN_SCENE',
      (_, imageUrl) => {
        setSlides(prev => prev.map((s, i) =>
          i === index ? { ...s, imageUrl, status: 'done' } : s
        ));
      },
      (_, error) => {
        setSlides(prev => prev.map((s, i) =>
          i === index ? { ...s, status: 'error' } : s
        ));
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans selection:bg-brand-primary/30 text-slate-200">
      {/* Modern Header with Navigation */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-strong rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">SYNTI<span className="text-brand-primary">studio</span></h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">AI Creative Engine</p>
            </div>
          </div>
          
          {/* Phase Navigation Tabs - Integrated in Header */}
          <nav className="hidden md:flex items-center bg-slate-900/50 p-1 rounded-2xl border border-slate-800/50">
            {[
              { id: AppPhase.PHASE_01, label: '01. Concepto', icon: 'tabler:bulb' },
              { id: AppPhase.PHASE_02, label: '02. Diseño', icon: 'tabler:palette' },
              { id: AppPhase.PHASE_03, label: '03. Estrategia', icon: 'tabler:rocket' },
            ].map((phase) => {
              const enabled = isPhaseEnabled(phase.id);
              const active = activePhase === phase.id;
              return (
                <button
                  key={phase.id}
                  onClick={() => enabled && setActivePhase(phase.id)}
                  disabled={!enabled}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    active 
                      ? 'bg-brand-primary text-white shadow-strong' 
                      : enabled 
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' 
                        : 'text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Icon icon={phase.icon} className="w-4 h-4" />
                  {phase.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan</span>
              <span className="text-[11px] font-bold text-brand-primary">PRO UNLIMITED</span>
            </div>
            <button className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors">
              <Icon icon="tabler:user" className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-2 flex gap-1">
        {[
          { id: AppPhase.PHASE_01, label: 'Concepto', icon: 'tabler:bulb' },
          { id: AppPhase.PHASE_02, label: 'Diseño', icon: 'tabler:palette' },
          { id: AppPhase.PHASE_03, label: 'Estrategia', icon: 'tabler:rocket' },
        ].map((phase) => (
          <button
            key={phase.id}
            onClick={() => isPhaseEnabled(phase.id) && setActivePhase(phase.id)}
            disabled={!isPhaseEnabled(phase.id)}
            className={`flex-1 flex flex-col items-center py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activePhase === phase.id ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400'
            }`}
          >
            <Icon icon={phase.icon} className="w-4 h-4 mb-1" />
            {phase.label}
          </button>
        ))}
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <AnimatePresence mode="wait">
          {activePhase === AppPhase.PHASE_01 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
              {/* Input Panel */}
              <section className="lg:col-span-7 space-y-8">
                <div className="glass-card p-8 space-y-8">
                  
                  {/* ── PASO 0: Selector de formato ── */}
                  <div className="mb-8 p-6 bg-slate-800/30 rounded-3xl border border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">
                      ¿Qué vas a crear hoy?
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { mode: CreationMode.POST,     label: 'POST',     sub: '3:4',   icon: 'tabler:photo' },
                        { mode: CreationMode.STORY,    label: 'STORY',    sub: '9:16',  icon: 'tabler:device-mobile' },
                        { mode: CreationMode.CAROUSEL, label: 'CARRUSEL', sub: 'Serie', icon: 'tabler:layers-intersect' },
                      ].map(({ mode, label, sub, icon }) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setCreationMode(mode);
                            if (mode === CreationMode.POST) setFormData(p => ({ ...p, format: FormatType.FEED }));
                            if (mode === CreationMode.STORY) setFormData(p => ({ ...p, format: FormatType.REEL }));
                            if (mode === CreationMode.CAROUSEL) setFormData(p => ({ ...p, format: FormatType.FEED }));
                          }}
                          className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all group ${
                            creationMode === mode
                              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-strong'
                              : 'border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          <Icon icon={icon} className={`w-6 h-6 ${creationMode === mode ? 'text-brand-primary' : 'text-slate-500 group-hover:text-slate-400'}`} />
                          <span className="font-black text-[11px] tracking-widest">{label}</span>
                          <span className="text-[9px] font-bold opacity-60 uppercase tracking-tighter">{sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {creationMode === CreationMode.CAROUSEL && (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 mb-8 space-y-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Configurar carrusel
                      </p>

                      {/* Tema */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                          ¿De qué trata el carrusel?
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 5 razones para tener menú digital"
                          className="input-field"
                          value={carouselConfig.topic}
                          onChange={e => setCarouselConfig(p => ({ ...p, topic: e.target.value }))}
                        />
                      </div>

                      {/* Número de slides */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-3 block">
                          ¿Cuántos slides?
                        </label>
                        <div className="flex gap-3">
                          {([3, 5, 7] as const).map(n => (
                            <button
                              key={n}
                              onClick={() => setCarouselConfig(p => ({ ...p, slideCount: n }))}
                              className={`flex-1 py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                                carouselConfig.slideCount === n
                                  ? 'border-brand-primary bg-brand-primary text-white shadow-strong'
                                  : 'border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Botón generar */}
                      <button
                        onClick={handleGenerateCarousel}
                        disabled={isGeneratingCarousel || !carouselConfig.topic.trim()}
                        className={`w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] text-white transition-all shadow-strong ${
                          isGeneratingCarousel || !carouselConfig.topic.trim()
                            ? 'bg-slate-700 cursor-not-allowed opacity-50'
                            : 'bg-brand-primary hover:bg-brand-primary/90 active:scale-95'
                        }`}
                      >
                        {isGeneratingCarousel ? '⏳ GENERANDO...' : '🎠 GENERAR CARRUSEL'}
                      </button>
                    </div>
                  )}

                  {slides.length > 0 && creationMode === CreationMode.CAROUSEL && (
                    <div className="mt-6">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-3">
                        Slides generados ({slides.filter(s => s.status === 'done').length}/{slides.length})
                      </p>
                      <div className="flex gap-3 overflow-x-auto pb-3">
                        {slides.map((slide, i) => (
                          <div
                            key={slide.id}
                            onClick={() => {
                              if (slide.status !== 'done' || !slide.imageUrl) return;
                              setActiveSlideIndex(i);
                              setResult({ imageUrl: slide.imageUrl, caption: slide.hook });
                              setReviewedText(slide.hook);
                              setReviewedSecondaryText(slide.benefit);
                              setImagenSellada(slide.sealedImage || null);
                              if (slide.editorState) {
                                setVisualEditor(slide.editorState);
                              } else {
                                resetVisualEditor(formData.preset || PresetType.DARK_NAVY);
                              }
                              setActivePhase(AppPhase.PHASE_02);
                            }}
                            className={`flex-shrink-0 w-32 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                              activeSlideIndex === i ? 'border-[#4A80E4]' : 'border-gray-200'
                            }`}
                          >
                            {slide.status === 'done' && slide.imageUrl ? (
                              <div className="relative">
                                <img src={slide.imageUrl} alt={`Slide ${i + 1}`} className="w-full aspect-[3/4] object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                                  <p className="text-white text-[8px] font-bold truncate">{slide.hook}</p>
                                </div>
                              </div>
                            ) : slide.status === 'generating' || slide.status === 'pending' ? (
                              <div className="w-full aspect-[3/4] bg-gray-100 flex flex-col items-center justify-center gap-2">
                                <div className="w-6 h-6 border-2 border-[#4A80E4] border-t-transparent rounded-full animate-spin" />
                                <p className="text-[8px] text-gray-400 font-bold">
                                  {slide.status === 'pending' ? 'EN COLA' : 'GENERANDO'}
                                </p>
                              </div>
                            ) : (
                              <div className="w-full aspect-[3/4] bg-red-50 flex flex-col items-center justify-center gap-2 p-2">
                                <p className="text-[8px] text-red-400 font-bold text-center">ERROR</p>
                                <button
                                  onClick={e => { e.stopPropagation(); handleRetrySlide(i); }}
                                  className="text-[8px] bg-red-400 text-white px-2 py-1 rounded-lg font-black"
                                >
                                  REINTENTAR
                                </button>
                              </div>
                            )}
                            <div className="p-1 bg-white">
                              <p className="text-[8px] font-black text-gray-400">SLIDE {i + 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Material Visual Upload */}
                  <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5 text-[#4A80E4]" />
                  MATERIAL VISUAL
                </label>
                {formData.base64Image && (
                  <button 
                    onClick={() => setFormData(p => ({ ...p, base64Image: undefined }))}
                    className="text-xs font-bold text-red-500 hover:text-red-600"
                  >
                    ELIMINAR
                  </button>
                )}
              </div>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center transition-all duration-300 ${formData.base64Image ? 'border-[#4A80E4] bg-[#4A80E4]/5' : 'border-gray-200 hover:border-[#4A80E4] hover:bg-gray-50'}`}>
                  {formData.base64Image ? (
                    <img src={formData.base64Image} alt="Upload" className="h-full w-full object-contain rounded-2xl p-2" />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:text-[#4A80E4] group-hover:scale-110 transition-transform">
                        <PhotoIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Sube una foto del producto</p>
                      <p className="text-[10px] text-gray-400 mt-1">O arrastra el archivo aquí</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Simplified Form Phase 01 */}
            <div className="space-y-10">
              {/* Section: Core Identity */}
              <div className="space-y-6 p-8 bg-slate-800/30 rounded-[2rem] border border-slate-700/50 shadow-inner">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                    <Icon icon="tabler:brand-instagram" className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Identidad del Post</h3>
                </div>
                
                {/* Product Selector */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2 block">Producto / Nicho</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: ProductType.MAIN, label: 'SYNTIweb', color: nicheColors[ProductType.MAIN], icon: 'tabler:world' },
                      { id: ProductType.STUDIO, label: 'STUDIO', color: nicheColors[ProductType.STUDIO], icon: 'tabler:camera' },
                      { id: ProductType.FOOD, label: 'FOOD', color: nicheColors[ProductType.FOOD], icon: 'tabler:tools-kitchen-2' },
                      { id: ProductType.CAT, label: 'SYNTIcat', color: nicheColors[ProductType.CAT], icon: 'tabler:shopping-bag' },
                    ].map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => setFormData(p => ({ ...p, productType: prod.id }))}
                        className={`group relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                          formData.productType === prod.id
                            ? 'shadow-strong scale-105 border-transparent'
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                        }`}
                        style={{ 
                          backgroundColor: formData.productType === prod.id ? prod.color : undefined,
                          color: formData.productType === prod.id ? 'white' : undefined
                        }}
                      >
                        <Icon icon={prod.icon} className={`w-6 h-6 transition-transform group-hover:scale-110 ${formData.productType === prod.id ? 'text-white' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-black tracking-widest uppercase">{prod.label}</span>
                        {formData.productType === prod.id && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                            <Icon icon="tabler:check" className="w-4 h-4" style={{ color: prod.color }} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Objective Selector */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2 block">Objetivo</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: PostObjective.SELL, label: 'Vender', icon: 'tabler:shopping-cart' },
                      { id: PostObjective.EDUCATE, label: 'Enseñar', icon: 'tabler:school' },
                      { id: PostObjective.BRANDING, label: 'Dar a conocer', icon: 'tabler:speakerphone' },
                    ].map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => setFormData(p => ({ ...p, postObjective: obj.id }))}
                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          formData.postObjective === obj.id
                            ? 'bg-brand-primary border-brand-primary text-white shadow-strong scale-[1.02]'
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                        }`}
                      >
                        <Icon icon={obj.icon} className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{obj.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hook (Title) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] block">Gancho (Título)</label>
                    <span className={`text-[9px] font-bold ${formData.textInput.length > 40 ? 'text-brand-accent' : 'text-slate-500'}`}>
                      {formData.textInput.length}/45
                    </span>
                  </div>
                  <textarea 
                    placeholder="Ej: Tu Catálogo en WhatsApp"
                    maxLength={45}
                    rows={2}
                    className="input-field resize-none"
                    value={formData.textInput}
                    onChange={(e) => setFormData(p => ({ ...p, textInput: e.target.value }))}
                  />
                </div>

                {/* Benefit (Explanation) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] block">Beneficio (Explicación)</label>
                    <span className={`text-[9px] font-bold ${formData.secondaryText.length > 55 ? 'text-brand-accent' : 'text-slate-500'}`}>
                      {formData.secondaryText.length}/60
                    </span>
                  </div>
                  <textarea 
                    placeholder="Ej: Sincronizado y Profesional"
                    maxLength={60}
                    rows={2}
                    className="input-field resize-none"
                    value={formData.secondaryText}
                    onChange={(e) => setFormData(p => ({ ...p, secondaryText: e.target.value }))}
                  />
                </div>
              </div>

              {/* Section: Visual Style */}
              <div className="space-y-8 p-8 bg-slate-800/30 rounded-[2rem] border border-slate-700/50 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                      <Icon icon="tabler:palette" className="w-5 h-5 text-brand-primary" />
                    </div>
                    <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Estilo Visual</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modo avanzado</span>
                    <button
                      onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                        isAdvancedMode ? 'bg-brand-primary' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isAdvancedMode ? 'translate-x-5.5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Generation Mode Selector */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: GenerationMode.SMART_BUILDER, label: 'Tech SaaS', icon: '🤖' },
                    { id: GenerationMode.HUMAN_SCENE, label: 'Escena humana', icon: '👤' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setFormData(p => ({ ...p, mode: mode.id }))}
                      className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                        formData.mode === mode.id
                          ? 'bg-brand-primary border-brand-primary text-white shadow-strong scale-[1.02]'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-xl">{mode.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Fields */}
              {isAdvancedMode && (
                <div className="space-y-8 pt-6 border-t-2 border-dashed border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  {/* Preset Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">
                        <SwatchIcon className="w-4 h-4 inline mr-2" />
                        PRESET DE COLOR
                      </label>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {[
                        { id: PresetType.DARK_NAVY, label: 'DARK NAVY', bg: 'bg-[#0A0A14]', text: 'text-white' },
                        { id: PresetType.SKY_BLUE, label: 'SKY BLUE', bg: 'bg-[#4A80E4]', text: 'text-white' },
                        { id: PresetType.LIGHT_GRADIENT, label: 'LIGHT GRAD', bg: 'bg-gradient-to-br from-[#4A80E4] via-white to-[#4A80E4]', text: 'text-gray-900' },
                        { id: PresetType.MODERN_WHITE, label: 'MODERN WHITE', bg: 'bg-white', text: 'text-gray-900' },
                        { id: PresetType.VIBRANT_TECH, label: 'VIBRANT TECH', bg: 'bg-gradient-to-br from-[#0A0A14] via-[#4A80E4] to-purple-600', text: 'text-white' },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setFormData(p => ({ ...p, preset: preset.id }))}
                          className={`relative h-20 rounded-2xl border-2 transition-all overflow-hidden flex items-center justify-center ${
                            formData.preset === preset.id 
                              ? 'border-[#4A80E4] ring-4 ring-[#4A80E4]/10 scale-105 shadow-lg' 
                              : 'border-[#CBD5E1] opacity-80 hover:opacity-100 hover:border-gray-300'
                          } ${preset.bg}`}
                        >
                          <span className={`text-[9px] font-black tracking-widest ${preset.text}`}>{preset.label}</span>
                          {formData.preset === preset.id && (
                            <div className="absolute inset-0 bg-[#4A80E4]/10 pointer-events-none" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Scene Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">
                      <PhotoIcon className="w-4 h-4 inline mr-2" />
                      ESCENA VISUAL
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: VisualScene.HERO_CENTERED, label: 'Hero Smartphone' },
                        { id: VisualScene.SMARTPHONE_TILTED, label: 'Smartphone + Partículas' },
                        { id: VisualScene.FLOATING_UI, label: 'UI Flotante (Cards)' },
                        { id: VisualScene.DASHBOARD_OVERLAY, label: 'Dashboard + Overlay' },
                        { id: VisualScene.ABSTRACT_ICONS, label: 'Abstracto + Iconos' },
                        { id: VisualScene.COMPARISON, label: 'Comparación (A vs B)' },
                        { id: VisualScene.FLOW_LINES, label: 'Flujo de Líneas' },
                      ].map((scene) => (
                        <button
                          key={scene.id}
                          onClick={() => setFormData(p => ({ ...p, visualScene: scene.id }))}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${
                            formData.visualScene === scene.id
                              ? 'bg-[#4A80E4] border-[#4A80E4] text-white shadow-md'
                              : 'bg-white border-[#CBD5E1] text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {scene.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Composition Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">
                      <ViewColumnsIcon className="w-4 h-4 inline mr-2" />
                      COMPOSICIÓN
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: CompositionType.CENTERED, label: 'Centrado (Clean SaaS)' },
                        { id: CompositionType.LEFT_TEXT_RIGHT_VISUAL, label: 'Izquierda Texto / Derecha Visual' },
                        { id: CompositionType.DYNAMIC_DIAGONAL, label: 'Diagonal Dinámico' },
                        { id: CompositionType.MINIMAL, label: 'Minimal (Mucho Aire)' },
                        { id: CompositionType.TECH_LOADED, label: 'Cargado Tech (Partículas)' },
                        { id: CompositionType.FRAMED, label: 'Enmarcado (Tarjeta)' },
                      ].map((comp) => (
                        <button
                          key={comp.id}
                          onClick={() => setFormData(p => ({ ...p, composition: comp.id }))}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${
                            formData.composition === comp.id
                              ? 'bg-[#4A80E4] border-[#4A80E4] text-white shadow-md'
                              : 'bg-white border-[#CBD5E1] text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {comp.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Intensity Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">
                      <BoltIcon className="w-4 h-4 inline mr-2" />
                      INTENSIDAD VISUAL
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: VisualIntensity.SOFT, label: 'Suave' },
                        { id: VisualIntensity.MEDIUM, label: 'Media' },
                        { id: VisualIntensity.HIGH, label: 'Alta' },
                      ].map((int) => (
                        <button
                          key={int.id}
                          onClick={() => setFormData(p => ({ ...p, intensity: int.id }))}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${
                            formData.intensity === int.id
                              ? 'bg-[#4A80E4] border-[#4A80E4] text-white shadow-md'
                              : 'bg-white border-[#CBD5E1] text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {int.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Typography Tone Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">
                      <PencilIcon className="w-4 h-4 inline mr-2" />
                      TONO TIPOGRÁFICO
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: TypoTone.CORPORATE, label: 'Corporativo' },
                        { id: TypoTone.TECH, label: 'Tecnológico' },
                        { id: TypoTone.AGGRESSIVE_COMMERCIAL, label: 'Comercial Agresivo' },
                        { id: TypoTone.MINIMAL_ELEGANT, label: 'Minimal Elegante' },
                        { id: TypoTone.MODERN_STARTUP, label: 'Startup Moderno' },
                      ].map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => setFormData(p => ({ ...p, typoTone: tone.id }))}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${
                            formData.typoTone === tone.id
                              ? 'bg-[#4A80E4] border-[#4A80E4] text-white shadow-md'
                              : 'bg-white border-[#CBD5E1] text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Realism Style Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">
                      <CubeIcon className="w-4 h-4 inline mr-2" />
                      ESTILO VISUAL (REALISMO)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: RealismStyle.REALISTIC_UI, label: 'UI Realista' },
                        { id: RealismStyle.GLOSSY_3D, label: '3D Glossy' },
                        { id: RealismStyle.MODERN_FLAT, label: 'Flat Moderno' },
                        { id: RealismStyle.HYBRID, label: 'Híbrido (Recomendado)' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setFormData(p => ({ ...p, realism: style.id }))}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${
                            formData.realism === style.id
                              ? 'bg-[#4A80E4] border-[#4A80E4] text-white shadow-md'
                              : 'bg-white border-[#CBD5E1] text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hook Type Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">
                      <LinkIcon className="w-4 h-4 inline mr-2" />
                      GANCHO (HOOK)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: HookType.QUESTION, label: 'Pregunta' },
                        { id: HookType.STRONG_STATEMENT, label: 'Declaración Fuerte' },
                        { id: HookType.NUMBER, label: 'Número' },
                        { id: HookType.DIRECT_PAIN, label: 'Dolor Directo' },
                        { id: HookType.PROMISE, label: 'Promesa' },
                      ].map((hook) => (
                        <button
                          key={hook.id}
                          onClick={() => setFormData(p => ({ ...p, hookType: hook.id }))}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${
                            formData.hookType === hook.id
                              ? 'bg-[#4A80E4] border-[#4A80E4] text-white shadow-md'
                              : 'bg-white border-[#CBD5E1] text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {hook.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Context Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">
                      <PuzzlePieceIcon className="w-4 h-4 inline mr-2" />
                      CONTEXTO DEL PRODUCTO
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: ProductContext.CATALOG, label: 'Catálogo' },
                        { id: ProductContext.MENU, label: 'Menú' },
                        { id: ProductContext.LANDING, label: 'Landing' },
                        { id: ProductContext.CHECKOUT, label: 'Checkout' },
                        { id: ProductContext.AUTOMATION, label: 'Automatización' },
                        { id: ProductContext.ANALYTICS, label: 'Analytics' },
                      ].map((ctx) => (
                        <button
                          key={ctx.id}
                          onClick={() => setFormData(p => ({ ...p, productContext: ctx.id }))}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${
                            formData.productContext === ctx.id
                              ? 'bg-[#4A80E4] border-[#4A80E4] text-white shadow-md'
                              : 'bg-white border-[#CBD5E1] text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {ctx.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Negative Level Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">
                      <NoSymbolIcon className="w-4 h-4 inline mr-2" />
                      LIMPIEZA / NEGATIVE
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: NegativeLevel.STRICT, label: 'Estricto' },
                        { id: NegativeLevel.MEDIUM, label: 'Medio' },
                        { id: NegativeLevel.FREE, label: 'Libre' },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => setFormData(p => ({ ...p, negativeLevel: lvl.id }))}
                          className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${
                            formData.negativeLevel === lvl.id
                              ? 'bg-[#4A80E4] border-[#4A80E4] text-white shadow-md'
                              : 'bg-white border-[#CBD5E1] text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Builder Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <CommandLineIcon className="w-5 h-5 text-[#4A80E4]" />
                  SMART PROMPT BUILDER
                </label>
                <button 
                  onClick={() => copyToClipboard(formData.customPrompt || '', setPromptCopied)}
                  className="text-[10px] font-bold text-[#4A80E4] hover:text-[#3a6fd3] flex items-center gap-1 transition-colors"
                >
                  {promptCopied ? <CheckIcon className="w-3 h-3" /> : <ClipboardIcon className="w-3 h-3" />}
                  {promptCopied ? 'COPIADO' : 'COPIAR PROMPT'}
                </button>
              </div>
              
              <div className="space-y-4">
                <textarea 
                  rows={4}
                  placeholder="Instrucciones adicionales para el diseño..."
                  className="w-full bg-white border-2 border-[#CBD5E1] text-gray-900 focus:border-[#4A80E4] focus:ring-4 focus:ring-[#4A80E4]/10 placeholder:text-gray-400 rounded-xl transition-all outline-none px-4 py-3 text-xs font-mono resize-none"
                  value={formData.customPrompt}
                  onChange={(e) => setFormData(p => ({ ...p, customPrompt: e.target.value }))}
                />
              </div>
            </div>

            {/* Generate Button Section */}
            <div className="pt-6 space-y-4">
              <button
                onClick={handleGenerate}
                disabled={loading || cooldown}
                className={`w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] text-white shadow-strong transition-all flex items-center justify-center gap-3 ${
                  loading || cooldown ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-brand-primary hover:bg-brand-primary/90 active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    GENERANDO...
                  </>
                ) : cooldown ? (
                  <>
                    <Icon icon="tabler:clock" className="w-5 h-5" />
                    ESPERA...
                  </>
                ) : (
                  <>
                    <Icon icon="tabler:sparkles" className="w-5 h-5" />
                    GENERAR ARTE
                  </>
                )}
              </button>
              
              {isPhaseEnabled(AppPhase.PHASE_02) && (
                <button
                  onClick={() => setActivePhase(AppPhase.PHASE_02)}
                  className="w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] text-brand-primary border-2 border-brand-primary hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-3"
                >
                  <Icon icon="tabler:arrow-right" className="w-5 h-5" />
                  CONTINUAR A EDICIÓN
                </button>
              )}

              <button
                onClick={handleAnalyzeSocial}
                disabled={isAnalyzing || cooldown}
                className={`w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] text-slate-400 border-2 border-slate-700 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-3 ${
                  cooldown ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Icon icon={isAnalyzing ? "tabler:loader-2" : cooldown ? "tabler:clock" : "tabler:rocket"} className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'ANALIZANDO...' : cooldown ? 'ESPERA...' : 'SALTAR A ESTRATEGIA'}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-[10px] font-bold text-center">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Preview Column in Phase 1 for context */}
        <section className="hidden lg:block lg:col-span-5 space-y-6">
          <div className="glass-card p-8 sticky top-24">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-8 uppercase tracking-widest">
              <CameraIcon className="w-5 h-5 text-brand-primary" />
              Vista Rápida
            </h2>
            <div className="aspect-[3/4] bg-slate-50/50 rounded-3xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner">
              {loading ? (
                <div className="flex flex-col items-center justify-center space-y-6 p-12 text-center">
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin shadow-soft"></div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black tracking-[0.2em] uppercase text-brand-primary animate-pulse">Generando Arte...</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">SYNTIweb Engine v2.5</p>
                  </div>
                </div>
              ) : result?.imageUrl || formData.base64Image ? (
                <img src={result?.imageUrl || formData.base64Image} alt="Preview" className="w-full h-full object-cover animate-in fade-in duration-700" />
              ) : (
                <div className="text-center p-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SparklesIcon className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">El arte aparecerá aquí</p>
                  <p className="text-[9px] text-slate-300 font-bold uppercase mt-2 tracking-widest">Configura tu post a la izquierda</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </motion.div>
    )}

    {activePhase === AppPhase.PHASE_02 && (
      <motion.div
        key="phase2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-5xl mx-auto w-full"
      >
        {/* Output Panel (Vista Previa) */}
        <section className="space-y-8">
          <div className="glass-card p-10 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-800/50">
              <div className="flex items-center gap-5">
                <button 
                  onClick={() => setActivePhase(AppPhase.PHASE_01)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-slate-400"
                >
                  <Icon icon="tabler:arrow-left" className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <CameraIcon className="w-6 h-6 text-brand-primary" />
                    EDITOR DE ARTE DIGITAL
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ajusta los elementos visuales y sella tu diseño</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {result && (
                  <button 
                    onClick={downloadImage}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    DESCARGAR
                  </button>
                )}
                <button
                  onClick={handleAnalyzeSocial}
                  disabled={isAnalyzing}
                  className={`px-8 py-3 rounded-2xl font-black text-[11px] tracking-[0.2em] text-white shadow-strong transition-all flex items-center justify-center gap-3 ${
                    isAnalyzing ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-brand-primary to-brand-secondary hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ANALIZANDO...
                    </>
                  ) : (
                    <>
                      <Icon icon="tabler:sparkles" className="w-5 h-5" />
                      GENERAR ESTRATEGIA
                    </>
                  )}
                </button>
              </div>
            </div>

            {!result && !loading && !formData.base64Image && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl p-12">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <SparklesIcon className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-center text-xs font-bold tracking-widest uppercase opacity-40">Esperando parámetros...</p>
              </div>
            )}

            {(result || formData.base64Image) && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <PostPreview 
                  ref={previewRef}
                  image={result?.imageUrl || formData.base64Image || null}
                  caption={socialAnalysis?.hook || reviewedText || formData.textInput || 'Vista previa del post'}
                  format={formData.format === FormatType.FEED ? PostFormat.FEED_PORTRAIT : PostFormat.REEL_STORY}
                  visualText={socialAnalysis?.visualAdvice.textOverlaySuggestion}
                  mainText={reviewedText}
                  secondaryText={reviewedSecondaryText}
                  preset={formData.preset}
                  composition={formData.composition}
                  editorState={visualEditor}
                  onEditorChange={(update) => {
                    setVisualEditor(prev => {
                      const newState = { ...prev, ...update };
                      if (creationMode === CreationMode.CAROUSEL && slides.length > 0) {
                        const newSlides = [...slides];
                        newSlides[activeSlideIndex] = {
                          ...newSlides[activeSlideIndex],
                          editorState: newState
                        };
                        setSlides(newSlides);
                      }
                      return newState;
                    });
                  }}
                />

                {/* Seal Image Button */}
                {(result?.imageUrl || formData.base64Image) && (
                  <div className="mt-10 w-full max-w-[400px] p-8 bg-slate-800/30 rounded-[2rem] border border-slate-700/50 shadow-inner">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Paso Final: Sellar para continuar</p>
                    <button
                      onClick={sellarImagen}
                      disabled={isSealing}
                      className={`w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-strong ${
                        imagenSellada ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-primary hover:bg-brand-primary/90'
                      } text-white`}
                    >
                      <Icon icon={imagenSellada ? "tabler:check" : "tabler:stamp"} className="w-6 h-6" />
                      {isSealing ? 'SELLANDO...' : imagenSellada ? 'DISEÑO SELLADO' : 'SELLAR DISEÑO FINAL'}
                    </button>
                    {imagenSellada && (
                      <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-4 text-center animate-pulse">
                        ¡Listo! Ya puedes ir a la Fase 03
                      </p>
                    )}
                  </div>
                )}

                {/* Review Texts Section (Moved below image) */}
                <div className="mt-10 w-full space-y-6 pt-6 border-t border-slate-800 bg-brand-primary/5 p-8 rounded-[2rem]">
                  <label className="text-[12px] font-black text-white flex items-center gap-3 uppercase tracking-widest">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                      <PencilIcon className="w-5 h-5 text-brand-primary" />
                    </div>
                    REVISAR TEXTOS ANTES DE GENERAR
                  </label>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] block">Texto para Estrategia (Principal)</label>
                      <input 
                        type="text"
                        className="input-field"
                        value={reviewedText}
                        onChange={(e) => setReviewedText(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] block">Texto para Estrategia (Secundario)</label>
                      <input 
                        type="text"
                        className="input-field"
                        value={reviewedSecondaryText}
                        onChange={(e) => setReviewedSecondaryText(e.target.value)}
                      />
                    </div>
                     {/* Buffer Integration Button */}
                {(result?.imageUrl || formData.base64Image) && (
                  <div className="mt-10 w-full max-w-[450px] flex gap-4">
                    <button
                      onClick={downloadImage}
                      className="flex-1 py-4 bg-slate-800 border-2 border-slate-700 hover:border-brand-primary text-slate-300 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-soft"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      DESCARGAR
                    </button>
                    <button
                      onClick={handleAnalyzeSocial}
                      disabled={!isPhaseEnabled(AppPhase.PHASE_03) || isAnalyzing || cooldown}
                      className="flex-[2] py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-strong disabled:opacity-30 disabled:grayscale"
                    >
                      <Icon icon={isAnalyzing ? "tabler:loader-2" : cooldown ? "tabler:clock" : "tabler:rocket"} className={`w-6 h-6 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      {isAnalyzing ? 'ANALIZANDO...' : cooldown ? 'ESPERA...' : 'CONTINUAR A ESTRATEGIA'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  </motion.div>
)}

    {activePhase === AppPhase.PHASE_03 && (
      <motion.div
        key="phase3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-6xl mx-auto w-full space-y-10"
      >
        <div className="glass-card p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActivePhase(AppPhase.PHASE_02)}
              className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all text-slate-400 shadow-strong"
            >
              <Icon icon="tabler:arrow-left" className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <RocketLaunchIcon className="w-7 h-7 text-brand-primary" />
                ESTRATEGIA SOCIAL & PUBLICACIÓN
              </h2>
              <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">
                Optimizado para {formData.format === FormatType.FEED ? 'Instagram Feed' : 'Instagram Stories/Reels'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPublishModal(true)}
              disabled={!socialAnalysis}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-strong disabled:opacity-30"
            >
              <Icon icon="tabler:rocket" className="w-6 h-6" />
              PUBLICAR CONTENIDO
            </button>
          </div>
        </div>

        {/* Social Strategy Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {isAnalyzing ? (
              <div className="glass-card p-16 flex flex-col items-center justify-center space-y-8 min-h-[500px]">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin shadow-soft"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon icon="tabler:ai" className="w-8 h-8 text-brand-primary animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-black tracking-[0.3em] uppercase text-brand-primary animate-pulse">Analizando con Roles de Expertos</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sincronizando con SYNTIweb Intelligence</p>
                </div>
              </div>
            ) : (
              socialAnalysis && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <RoleTabs data={socialAnalysis} />
                </div>
              )
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Icon icon="tabler:photo" className="w-4 h-4 text-[#4A80E4]" />
                Arte Finalizado
              </h3>
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 shadow-inner">
                {imagenSellada ? (
                  <img src={imagenSellada} alt="Final" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 text-[10px] font-bold uppercase p-6 text-center">
                    Sella la imagen en la Fase 02 para verla aquí
                  </div>
                )}
              </div>
            </div>

            {socialAnalysis && (
              <div className="bg-gradient-to-br from-[#4A80E4] to-blue-700 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Icon icon="tabler:chart-bar" className="w-4 h-4" />
                  Resumen de Impacto
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[9px] font-bold uppercase opacity-60 mb-1">Mejor Horario</p>
                    <p className="text-sm font-bold">{socialAnalysis.strategy.bestTime}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[9px] font-bold uppercase opacity-60 mb-1">Objetivo</p>
                    <p className="text-sm font-bold">{socialAnalysis.strategy.objective}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</main>

      <footer className="max-w-7xl mx-auto px-4 mt-12 text-center">
        <p className="text-[10px] font-bold text-gray-300 tracking-[0.3em] uppercase">
          &copy; {new Date().getFullYear()} SYNTIweb Digital Solutions Agency &bull; AI Creative Studio
        </p>
      </footer>

      {/* Publish Modal (Make.com) */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon icon="tabler:rocket" className="w-6 h-6" />
                <h3 className="text-sm font-black uppercase tracking-widest">Publicar Contenido</h3>
              </div>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vía 01: Automatización</p>
                  <button
                    onClick={sendToMake}
                    disabled={isSending || !socialAnalysis}
                    className={`w-full py-4 rounded-xl font-black text-xs tracking-widest text-white shadow-lg transition-all flex flex-col items-center justify-center gap-1 ${
                      sendSuccess ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>ENVIANDO...</span>
                      </div>
                    ) : sendSuccess ? (
                      <div className="flex items-center gap-2">
                        <CheckIcon className="w-5 h-5" />
                        <span>¡LISTO!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Icon icon="tabler:bolt" className="w-5 h-5 text-yellow-300" />
                        <span>ENVIAR A MAKE.COM</span>
                      </div>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vía 02: Buffer Directo</p>
                  
                  {bufferError ? (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-[9px] font-bold mb-3">
                      {bufferError}
                    </div>
                  ) : bufferProfiles.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {bufferProfiles.map(profile => (
                          <button
                            key={profile.id}
                            onClick={() => setSelectedProfileId(profile.id)}
                            className={`flex-shrink-0 w-10 h-10 rounded-xl border-2 transition-all relative ${
                              selectedProfileId === profile.id ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-transparent grayscale opacity-50'
                            }`}
                          >
                            <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-lg object-cover" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <Icon icon={`tabler:brand-${profile.service}`} className="w-2.5 h-2.5 text-indigo-600" />
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={sendToBuffer}
                        disabled={isSending || !selectedProfileId}
                        className={`w-full py-4 rounded-xl font-black text-xs tracking-widest text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                          sendSuccess ? 'bg-green-500' : 'bg-slate-800 hover:bg-slate-900'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isSending ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Icon icon="tabler:brand-buffer" className="w-5 h-5" />
                        )}
                        <span>{sendSuccess ? '¡LISTO!' : 'ENVIAR A BUFFER'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">Programación (Opcional)</label>
                  <button 
                    onClick={() => setBufferSchedule('')}
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    Publicar ahora
                  </button>
                </div>
                
                {suggestedTime && (
                  <div className="mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[10px] text-indigo-600 font-medium leading-tight">
                        Sugerencia IA: <span className="font-bold">{suggestedTime}</span>
                      </span>
                    </div>
                    <button 
                      onClick={applySuggestedTime}
                      className="px-2 py-1 bg-indigo-600 text-white text-[9px] font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      APLICAR
                    </button>
                  </div>
                )}

                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="datetime-local"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#CBD5E1] text-gray-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 placeholder:text-gray-400 rounded-xl transition-all outline-none text-xs font-mono"
                    value={bufferSchedule}
                    onChange={(e) => setBufferSchedule(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 block">Vista Previa del Caption</label>
                <div className="p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xs text-gray-700 max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                  {socialAnalysis ? (
                    <>
                      <span className="font-black text-indigo-600">{socialAnalysis.hook}</span>
                      {"\n\n"}
                      {socialAnalysis.body}
                      {"\n\n"}
                      <span className="font-bold">{socialAnalysis.cta}</span>
                      {"\n\n"}
                      {socialAnalysis.question}
                      {"\n\n"}
                      <span className="text-pink-600 font-medium">
                        {Array.isArray(socialAnalysis.hashtags) ? socialAnalysis.hashtags.map(h => `#${h}`).join(' ') : ''}
                      </span>
                    </>
                  ) : (
                    <p className="italic text-gray-400">Genera la estrategia para ver el caption unificado.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

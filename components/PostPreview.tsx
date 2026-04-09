import React, { forwardRef, useState, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Camera, AlignLeft, AlignCenter, AlignRight, Eye, EyeOff, RotateCcw, Grid3x3 } from 'lucide-react';
import { motion } from 'motion/react';
import { PostFormat, PresetType, CompositionType, VisualEditorState } from '../types';
import { FORMAT_DIMENSIONS } from '../constants';
import LogoNegative from '../assets/brand/syntiweb-logo-negative.svg?react';
import LogoPositive from '../assets/brand/syntiweb-logo-positive.svg?react';

interface PostPreviewProps {
  image: string | null;
  caption: string;
  format: PostFormat;
  visualText?: string;
  mainText?: string;
  secondaryText?: string;
  preset?: PresetType;
  composition?: CompositionType;
  editorState?: VisualEditorState;
  onEditorChange?: (state: Partial<VisualEditorState>) => void;
  onSeal?: () => void;
  isSealing?: boolean;
  imagenSellada?: string | null;
}

const BRAND_COLORS = ['#ffffff', '#111827', '#4980E4', '#EC6B0B', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

const PostPreview = forwardRef<HTMLDivElement, PostPreviewProps>(({
  image,
  caption,
  format,
  visualText,
  mainText,
  secondaryText,
  preset = PresetType.DARK_NAVY,
  composition = CompositionType.CENTERED,
  editorState,
  onEditorChange,
  onSeal,
  isSealing,
  imagenSellada,
}, ref) => {
  const dimensions = FORMAT_DIMENSIONS[format];
  const shortCaption = caption.length > 120 ? caption.substring(0, 120) + '...' : caption;
  const isReel = format === PostFormat.REEL_STORY;
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeEl, setActiveEl] = useState<'title' | 'subtitle' | 'logo' | null>(null);

  const LogoComponent = editorState?.logoType === 'positive' ? LogoPositive : LogoNegative;

  const textShadow = (active: boolean) =>
    active ? '0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)' : 'none';

  const update = useCallback((patch: Partial<VisualEditorState>) => {
    onEditorChange?.(patch);
  }, [onEditorChange]);

  const handleDragEnd = (el: 'title' | 'subtitle' | 'logo', info: any) => {
    if (!editorState || !containerRef.current) return;
    
    const offset = info.offset || { x: 0, y: 0 };
    
    // Threshold to prevent accidental moves on click
    if (Math.abs(offset.x) < 2 && Math.abs(offset.y) < 2) return;

    const currentPos = el === 'title' ? (editorState.titlePos || { x: 0, y: 24 }) : 
                     el === 'subtitle' ? (editorState.subtitlePos || { x: 0, y: 300 }) : 
                     (editorState.logoPos || { x: 85, y: 340 });

    const x = Math.round(currentPos.x + (offset.x || 0));
    const y = Math.round(currentPos.y + (offset.y || 0));
    
    if (el === 'title') update({ titlePos: { x, y } });
    else if (el === 'subtitle') update({ subtitlePos: { x, y } });
    else if (el === 'logo') update({ logoPos: { x, y } });
  };

  // Color picker row
  const ColorRow = ({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) => (
    <div className="space-y-1.5">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {BRAND_COLORS.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: c,
              borderColor: value === c ? '#4980E4' : 'rgba(0,0,0,0.1)',
              boxShadow: value === c ? '0 0 0 2px white, 0 0 0 4px #4980E4' : 'none',
            }}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-5 h-5 rounded-full cursor-pointer border border-slate-200 overflow-hidden p-0"
          title="Color personalizado"
        />
      </div>
    </div>
  );

  // Slider row
  const SliderRow = ({ label, value, min, max, onChange, unit = 'px' }: {
    label: string; value: number; min: number; max: number;
    onChange: (v: number) => void; unit?: string;
  }) => (
    <div className="flex flex-col gap-2 group">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-brand-primary transition-colors">{label}</span>
        <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20 shadow-sm">{value}{unit}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-primary hover:bg-slate-200 transition-all"
          style={{
            WebkitAppearance: 'none',
          }}
        />
      </div>
    </div>
  );

  // Align buttons
  // Align row
  const AlignRow = ({ label, value, onChange }: {
    label: string;
    value: 'left' | 'center' | 'right';
    onChange: (v: 'left' | 'center' | 'right') => void;
  }) => (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'left', icon: AlignLeft },
          { id: 'center', icon: AlignCenter },
          { id: 'right', icon: AlignRight },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id as any)}
            className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${value === opt.id ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <opt.icon size={16} />
          </button>
        ))}
      </div>
    </div>
  );

  // Section header in editor
  const SectionHeader = ({ label, active, onToggle, children, icon: Icon }: {
    label: string; active: boolean; onToggle: () => void; children?: React.ReactNode; icon?: any;
  }) => (
    <div
      className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all ${activeEl === label.toLowerCase().split(' ')[0] ? 'bg-brand-primary/5' : 'hover:bg-slate-50'}`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full shadow-sm ${active ? 'bg-brand-primary animate-pulse' : 'bg-slate-300'}`} />
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.1em]">{label}</span>
          {activeEl === label.toLowerCase().split(' ')[0] && (
            <span className="text-[8px] font-bold text-brand-primary uppercase tracking-widest mt-0.5">Editando ahora</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
      {/* LEFT: Phone Mockup */}
      <div className="flex flex-col items-center flex-shrink-0 mx-auto lg:mx-0">
        <div className="bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden w-[280px] relative"
          style={{ boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          {/* Status bar */}
          <div className="h-8 bg-white flex justify-between items-center px-6 text-[10px] font-black text-gray-900">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2 bg-gray-900 rounded-sm opacity-20" />
              <div className="w-2 h-2 bg-gray-900 rounded-full opacity-20" />
            </div>
          </div>

          {/* IG header */}
          {!isReel && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-pink-600 font-black text-[10px]">SW</div>
                </div>
                <span className="text-[11px] font-black tracking-tight">syntiweb</span>
              </div>
              <MoreHorizontal size={16} className="text-gray-400" />
            </div>
          )}

          {/* Canvas */}
          <div
            ref={(node) => {
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
              (containerRef as any).current = node;
            }}
            className={`w-full bg-slate-100 relative ${dimensions.aspect} overflow-hidden`}
            style={{ cursor: 'default' }}
          >
            {/* Image */}
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover select-none" crossOrigin="anonymous" draggable={false} />
            ) : (
              <div className="text-slate-300 flex flex-col items-center justify-center w-full h-full">
                <Camera size={48} strokeWidth={1} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-4">Esperando Arte</span>
              </div>
            )}

            {/* Title overlay */}
            {editorState?.showTitle !== false && mainText && image && (
              <motion.div
                drag
                dragConstraints={containerRef} 
                dragElastic={0}
                dragMomentum={false}
                onDragStart={() => setActiveEl('title')}
                onDragEnd={(_, info) => handleDragEnd('title', info)}
                style={{
                  position: 'absolute',
                  left: editorState?.titlePos?.x ?? 0,
                  top: editorState?.titlePos?.y ?? 24,
                  x: 0, y: 0,
                  pointerEvents: 'auto', cursor: 'grab',
                  width: '100%',
                  textAlign: editorState?.titleAlign || 'center',
                  zIndex: 40,
                  padding: '0 20px'
                }}
                whileDrag={{ scale: 1.02, zIndex: 50, cursor: 'grabbing' }}
              >
                <h2 style={{
                  fontSize: editorState?.titleSize ? `${editorState.titleSize}px` : '24px',
                  color: editorState?.titleColor || '#ffffff',
                  fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em',
                  textTransform: 'uppercase',
                  textShadow: textShadow(editorState?.titleShadow !== false),
                  userSelect: 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {mainText}
                </h2>
              </motion.div>
            )}

            {/* Subtitle overlay */}
            {editorState?.showSubtitle !== false && secondaryText && image && (
              <motion.div
                drag
                dragConstraints={containerRef} 
                dragElastic={0}
                dragMomentum={false}
                onDragStart={() => setActiveEl('subtitle')}
                onDragEnd={(_, info) => handleDragEnd('subtitle', info)}
                style={{
                  position: 'absolute',
                  left: editorState?.subtitlePos?.x ?? 0,
                  top: editorState?.subtitlePos?.y ?? 300,
                  x: 0, y: 0,
                  pointerEvents: 'auto', cursor: 'grab',
                  width: '100%',
                  textAlign: editorState?.subtitleAlign || 'center',
                  zIndex: 35,
                  padding: '0 20px'
                }}
                whileDrag={{ scale: 1.02, zIndex: 50, cursor: 'grabbing' }}
              >
                <p style={{
                  fontSize: editorState?.subtitleSize ? `${editorState.subtitleSize}px` : '14px',
                  color: editorState?.subtitleColor || '#ffffff',
                  fontWeight: 700, lineHeight: 1.3,
                  textShadow: textShadow(editorState?.subtitleShadow !== false),
                  userSelect: 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {secondaryText}
                </p>
              </motion.div>
            )}

            {/* Logo */}
            {image && editorState?.showLogo !== false && (
              <motion.div
                drag 
                dragConstraints={containerRef} 
                dragElastic={0}
                dragMomentum={false}
                onDragStart={() => setActiveEl('logo')}
                onDragEnd={(_, info) => handleDragEnd('logo', info)}
                style={{
                  position: 'absolute',
                  left: editorState?.logoPos?.x ?? 85,
                  top: editorState?.logoPos?.y ?? 340,
                  x: 0, y: 0,
                  zIndex: 30, cursor: 'grab',
                }}
                whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
              >
                {LogoComponent && <LogoComponent className="h-auto" style={{ width: editorState?.logoSize ? `${editorState.logoSize}px` : '110px' }} />}
              </motion.div>
            )}

            {/* Reel side actions */}
            {isReel && (
              <div className="absolute bottom-24 right-3 flex flex-col gap-5 text-white items-center">
                <div className="flex flex-col items-center gap-1"><Heart size={22} fill="white" /><span className="text-[10px] font-black">2.4k</span></div>
                <div className="flex flex-col items-center gap-1"><MessageCircle size={22} fill="white" /><span className="text-[10px] font-black">128</span></div>
                <Send size={22} />
                <MoreHorizontal size={22} />
              </div>
            )}
          </div>

          {/* IG actions */}
          {!isReel && (
            <div className="p-4 bg-white">
              <div className="flex justify-between mb-3">
                <div className="flex gap-4 text-gray-900"><Heart size={20} /><MessageCircle size={20} /><Send size={20} /></div>
                <Bookmark size={20} />
              </div>
              <div className="text-[11px] leading-tight">
                <p className="font-black mb-1.5">2,450 Me gusta</p>
                <p className="line-clamp-2"><span className="font-black mr-1.5">syntiweb</span>{shortCaption}</p>
                <button className="text-slate-400 mt-1 font-bold italic text-[10px]">ver más...</button>
              </div>
            </div>
          )}

          {isReel && (
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-white p-[2px]">
                  <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center font-black text-[10px] text-white">SW</div>
                </div>
                <span className="font-black text-sm tracking-tight">syntiweb</span>
                <button className="text-[10px] font-black border border-white/40 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm">Seguir</button>
              </div>
              <p className="text-[11px] line-clamp-2 opacity-90 leading-relaxed">{shortCaption}</p>
            </div>
          )}

          <div className="h-6 bg-white flex items-center justify-center">
            <div className="w-24 h-1 bg-slate-100 rounded-full" />
          </div>
        </div>
      </div>

      {/* RIGHT: Editor Panel */}
      {image && (
        <div className="flex-1 w-full max-w-md space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em]">Editor Maestro</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ajustes de precisión</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditorChange?.({
                  titlePos: { x: 0, y: 24 }, subtitlePos: { x: 0, y: 300 }, logoPos: { x: 85, y: 340 },
                  titleSize: 24, subtitleSize: 14, logoSize: 110,
                  titleColor: '#ffffff', subtitleColor: '#ffffff', logoType: 'negative', showLogo: true,
                  titleAlign: 'center', subtitleAlign: 'center', titleShadow: true, subtitleShadow: true,
                })}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                title="Resetear diseño"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {/* TÍTULO */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft">
              <SectionHeader
                label="Título principal"
                active={editorState?.showTitle !== false}
                onToggle={() => setActiveEl('title')}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); update({ showTitle: editorState?.showTitle === false }); }}
                  className="text-slate-400 hover:text-brand-primary transition-colors"
                >
                  {editorState?.showTitle === false ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </SectionHeader>
              {activeEl === 'title' && (
                <div className="p-5 space-y-5 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <SliderRow label="Tamaño" value={editorState?.titleSize || 24} min={12} max={80} onChange={v => update({ titleSize: v })} />
                  <AlignRow label="Alinear" value={editorState?.titleAlign || 'center'} onChange={v => update({ titleAlign: v })} />
                  <ColorRow label="Color" value={editorState?.titleColor || '#ffffff'} onChange={c => update({ titleColor: c })} />
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sombra</span>
                    <button
                      onClick={() => update({ titleShadow: editorState?.titleShadow === false })}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${editorState?.titleShadow !== false ? 'bg-brand-primary text-white shadow-soft' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {editorState?.titleShadow !== false ? 'ACTIVADA' : 'DESACTIVADA'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SUBTÍTULO */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft">
              <SectionHeader
                label="Subtítulo"
                active={editorState?.showSubtitle !== false}
                onToggle={() => setActiveEl('subtitle')}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); update({ showSubtitle: editorState?.showSubtitle === false }); }}
                  className="text-slate-400 hover:text-brand-primary transition-colors"
                >
                  {editorState?.showSubtitle === false ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </SectionHeader>
              {activeEl === 'subtitle' && (
                <div className="p-5 space-y-5 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <SliderRow label="Tamaño" value={editorState?.subtitleSize || 14} min={10} max={50} onChange={v => update({ subtitleSize: v })} />
                  <AlignRow label="Alinear" value={editorState?.subtitleAlign || 'center'} onChange={v => update({ subtitleAlign: v })} />
                  <ColorRow label="Color" value={editorState?.subtitleColor || '#ffffff'} onChange={c => update({ subtitleColor: c })} />
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sombra</span>
                    <button
                      onClick={() => update({ subtitleShadow: editorState?.subtitleShadow === false })}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${editorState?.subtitleShadow !== false ? 'bg-brand-primary text-white shadow-soft' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {editorState?.subtitleShadow !== false ? 'ACTIVADA' : 'DESACTIVADA'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LOGO */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft">
              <SectionHeader
                label="Logo SYNTIweb"
                active={editorState?.showLogo !== false}
                onToggle={() => setActiveEl('logo')}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); update({ showLogo: editorState?.showLogo === false }); }}
                  className="text-slate-400 hover:text-brand-primary transition-colors"
                >
                  {editorState?.showLogo !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </SectionHeader>
              {activeEl === 'logo' && (
                <div className="p-5 space-y-5 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <SliderRow label="Tamaño" value={editorState?.logoSize || 110} min={40} max={250} onChange={v => update({ logoSize: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => update({ logoType: 'negative' })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editorState?.logoType === 'negative' ? 'bg-slate-900 text-white shadow-strong' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      Negativo
                    </button>
                    <button
                      onClick={() => update({ logoType: 'positive' })}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editorState?.logoType === 'positive' ? 'bg-white text-slate-900 border-2 border-slate-200 shadow-soft' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      Positivo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-brand-primary/5 rounded-[2rem] border border-brand-primary/10">
            <p className="text-[10px] text-slate-500 font-bold text-center leading-relaxed uppercase tracking-widest">
              Arrastra los elementos directamente sobre la imagen.<br/>
              Usa la grilla para una alineación perfecta.
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

PostPreview.displayName = 'PostPreview';
export default PostPreview;

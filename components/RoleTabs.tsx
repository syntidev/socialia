import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Copy, 
  Check, 
  Target, 
  Users, 
  Search, 
  Sparkles, 
  Clock, 
  MousePointer2,
  Zap,
  Eye,
  Megaphone
} from 'lucide-react';
import { AIAnalysis } from '../types';

interface RoleTabsProps {
  data: AIAnalysis;
}

const RoleTabs: React.FC<RoleTabsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'content' | 'ads' | 'seo'>('content');
  const [copied, setCopied] = useState(false);

  // Editable states initialized from props
  const [editableContent, setEditableContent] = useState({
    hook: data.hook,
    body: data.body,
    cta: data.cta,
    question: data.question,
    hashtags: data.hashtags.join(', ')
  });

  // Update local state if data prop changes
  React.useEffect(() => {
    setEditableContent({
      hook: data.hook,
      body: data.body,
      cta: data.cta,
      question: data.question,
      hashtags: data.hashtags.join(', ')
    });
  }, [data]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'content', label: 'Contenido', icon: Sparkles, colorClass: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-100', accentColor: 'pink' },
    { id: 'strategy', label: 'Estrategia', icon: Target, colorClass: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100', accentColor: 'blue' },
    { id: 'ads', label: 'Publicidad', icon: Megaphone, colorClass: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-100', accentColor: 'purple' },
    { id: 'seo', label: 'SEO', icon: Search, colorClass: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-100', accentColor: 'green' },
  ] as const;

  const currentTab = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden glass-card">
      <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1.5 ${activeTab === tab.id ? `bg-white ${tab.colorClass} shadow-soft border border-slate-100` : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8 min-h-[450px]">
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Editor de Estrategia Social</h3>
                <button 
                  onClick={() => {
                    const allText = `${editableContent.hook}\n\n${editableContent.body}\n\n${editableContent.cta}\n\n${editableContent.question}\n\n${editableContent.hashtags.split(',').map(h => `#${h.trim()}`).join(' ')}`;
                    copyToClipboard(allText);
                  }} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-[10px] font-black ${currentTab.colorClass} hover:bg-slate-100 transition-all`}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'COPIADO' : 'COPIAR TODO'}
                </button>
              </div>

              <div className="space-y-5">
                {/* Paso 1: Hook */}
                <div className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-pink-100 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-pink-600 text-white rounded-lg w-6 h-6 flex items-center justify-center text-[10px] font-black shadow-sm">1</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hook (Impacto)</span>
                    </div>
                    <button onClick={() => copyToClipboard(editableContent.hook)} className="text-slate-300 hover:text-pink-600 transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <textarea 
                    className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-800 leading-relaxed focus:ring-0 resize-none min-h-[40px]"
                    value={editableContent.hook}
                    onChange={(e) => setEditableContent(p => ({ ...p, hook: e.target.value }))}
                    rows={2}
                  />
                </div>

                {/* Paso 2: Cuerpo */}
                <div className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-pink-100 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-pink-600 text-white rounded-lg w-6 h-6 flex items-center justify-center text-[10px] font-black shadow-sm">2</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cuerpo (Beneficio)</span>
                    </div>
                    <button onClick={() => copyToClipboard(editableContent.body)} className="text-slate-300 hover:text-pink-600 transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <textarea 
                    className="w-full bg-transparent border-none p-0 text-sm text-slate-600 leading-relaxed focus:ring-0 resize-none min-h-[80px]"
                    value={editableContent.body}
                    onChange={(e) => setEditableContent(p => ({ ...p, body: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* Paso 3: CTA */}
                <div className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-pink-100 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-pink-600 text-white rounded-lg w-6 h-6 flex items-center justify-center text-[10px] font-black shadow-sm">3</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CTA (Acción)</span>
                    </div>
                    <button onClick={() => copyToClipboard(editableContent.cta)} className="text-slate-300 hover:text-pink-600 transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-sm font-black text-pink-600 leading-relaxed focus:ring-0"
                    value={editableContent.cta}
                    onChange={(e) => setEditableContent(p => ({ ...p, cta: e.target.value }))}
                  />
                </div>

                {/* Paso 4: Pregunta */}
                <div className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-pink-100 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-pink-600 text-white rounded-lg w-6 h-6 flex items-center justify-center text-[10px] font-black shadow-sm">4</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pregunta (Interacción)</span>
                    </div>
                    <button onClick={() => copyToClipboard(editableContent.question)} className="text-slate-300 hover:text-pink-600 transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-sm italic text-slate-500 leading-relaxed focus:ring-0"
                    value={editableContent.question}
                    onChange={(e) => setEditableContent(p => ({ ...p, question: e.target.value }))}
                  />
                </div>

                {/* Paso 5: Hashtags */}
                <div className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-pink-100 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-pink-600 text-white rounded-lg w-6 h-6 flex items-center justify-center text-[10px] font-black shadow-sm">5</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hashtags (Alcance)</span>
                    </div>
                    <button onClick={() => copyToClipboard(editableContent.hashtags.split(',').map(h => `#${h.trim()}`).join(' '))} className="text-slate-300 hover:text-pink-600 transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-[11px] font-bold text-pink-600 leading-relaxed focus:ring-0"
                    value={editableContent.hashtags}
                    onChange={(e) => setEditableContent(p => ({ ...p, hashtags: e.target.value }))}
                    placeholder="separados por coma..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={10} /> Horario
                  </p>
                  <p className="text-[10px] font-bold text-gray-700">{data.strategy.bestTime}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Target size={10} /> Objetivo
                  </p>
                  <p className="text-[10px] font-bold text-gray-700 truncate">{data.strategy.objective}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Search size={10} /> SEO
                  </p>
                  <p className="text-[10px] font-bold text-gray-700 truncate">{data.seo.keywords.slice(0, 2).join(', ')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Megaphone size={10} /> Ads
                  </p>
                  <p className="text-[10px] font-bold text-gray-700 truncate">{data.ads.campaignType}</p>
                </div>
              </div>

              <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl">
                <h3 className="text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Zap size={12} /> Nota del Creador
                </h3>
                <p className="text-xs text-orange-700 leading-relaxed font-medium italic">"{data.visualAdvice.composition}"</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'strategy' && (
            <motion.div 
              key="strategy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                    <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Target size={14} /> Objetivo
                    </h4>
                    <p className="text-blue-900 text-xs font-bold">{data.strategy.objective}</p>
                 </div>
                 <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                    <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MousePointer2 size={14} /> Call to Action
                    </h4>
                    <p className="text-blue-900 text-xs font-bold">{data.strategy.callToAction}</p>
                 </div>
              </div>
              
              <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl">
                 <h4 className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Users size={14} /> Gestión de Comunidad
                 </h4>
                 <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                    <p className="text-indigo-900 text-xs font-bold mb-1">Pregunta para los seguidores:</p>
                    <p className="text-indigo-700 text-xs italic">"{data.community.conversationStarter}"</p>
                 </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Clock size={14} />
                Mejor hora: <span className="text-gray-900">{data.strategy.bestTime}</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'ads' && (
            <motion.div 
              key="ads"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
               <div className="bg-purple-600 p-6 rounded-2xl text-white shadow-lg shadow-purple-100">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-80">Estrategia Paid Media</h3>
                 <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Tipo de Campaña</p>
                      <p className="text-sm font-bold">{data.ads.campaignType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Segmentación</p>
                      <p className="text-sm font-bold leading-relaxed">{data.ads.segmentation}</p>
                    </div>
                 </div>
               </div>

               <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50">
                 <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-3 flex items-center gap-2">
                   <Megaphone size={12} /> Tips Técnicos
                 </h4>
                 <ul className="text-xs space-y-3 text-gray-600 font-medium">
                   <li className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                     Verificar API de Conversiones (CAPI).
                   </li>
                   <li className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                     Usar formato 9:16 para Reels.
                   </li>
                   <li className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                     Excluir compradores recientes.
                   </li>
                 </ul>
               </div>
            </motion.div>
          )}

          {activeTab === 'seo' && (
            <motion.div 
              key="seo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Eye size={14} /> Alt Text (Accesibilidad)
                </h3>
                <div className="bg-gray-50 p-4 rounded-2xl text-xs text-gray-700 font-medium leading-relaxed border border-gray-100">
                  {data.seo.altText}
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Search size={14} /> Palabras Clave
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.seo.keywords.map((kw, i) => (
                    <span key={i} className="border border-green-100 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-[10px] font-bold">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 p-4 rounded-2xl border border-gray-200 text-center">
                Optimizado para Instagram Search & Google
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RoleTabs;

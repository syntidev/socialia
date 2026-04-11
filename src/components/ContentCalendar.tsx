import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { CalendarPost, CalendarPostStatus, CalendarPostType, CalendarState } from '../types/calendar';

interface ContentCalendarProps {
  onLoadPost?: (post: CalendarPost) => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ onLoadPost }) => {
  const [state, setState] = useState<CalendarState>({ posts: [], lastSync: null });
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<CalendarPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PASO 2: Carga inicial desde API
  useEffect(() => {
    loadCalendar();
  }, []);

  const loadCalendar = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/socialia/calendar');
      if (response.ok) {
        const data = await response.json();
        setState(data);
      } else {
        // Si falla (404 o error), inicializa con array vacío
        setState({ posts: [], lastSync: null });
      }
    } catch (error) {
      // No bloquear UI en caso de error
      console.error('Error cargando calendario:', error);
      setState({ posts: [], lastSync: null });
    } finally {
      setIsLoading(false);
    }
  };

  // PASO 3: Guardar calendario
  const saveCalendar = async (posts: CalendarPost[]) => {
    try {
      const newState: CalendarState = {
        posts,
        lastSync: new Date().toISOString(),
      };
      const response = await fetch('/api/socialia/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts }),
      });
      if (response.ok) {
        setState(newState);
      }
    } catch (error) {
      console.error('Error guardando calendario:', error);
    }
  };

  // PASO 4: Importar desde JSON
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'uint8array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const imported: CalendarPost[] = rows
          .filter(row => row.titulo) // ignorar filas vacías
          .map(row => {
            // Manejar fecha Excel nativa (Date object) o string
            let dia = '';
            if (row.dia instanceof Date) {
              dia = row.dia.toISOString().split('T')[0];
            } else if (typeof row.dia === 'number') {
              // Fecha serial de Excel
              const date = XLSX.SSF.parse_date_code(row.dia);
              dia = `${date.y}-${String(date.m).padStart(2,'0')}-${String(date.d).padStart(2,'0')}`;
            } else {
              dia = String(row.dia || '').trim();
            }

            return {
              id: crypto.randomUUID(),
              dia,
              tipo: (String(row.tipo || 'POST').toUpperCase()) as CalendarPost['tipo'],
              producto: String(row.producto || 'MAIN').trim(),
              objetivo: String(row.objetivo || '').trim(),
              titulo: String(row.titulo || '').trim(),
              subtitulo: String(row.subtitulo || '').trim(),
              caption: String(row.caption || '').trim(),
              hashtags: String(row.hashtags || '').trim(),
              estado: (String(row.estado || 'pendiente').toLowerCase()) as CalendarPost['estado'],
              buffer_id: String(row.buffer_id || '').trim() || undefined,
              slides: row.slides ? Number(row.slides) : undefined,
            };
          });

        setState(prev => ({
          posts: imported,
          lastSync: new Date().toISOString()
        }));
        saveCalendar(imported);
        alert('Cronograma importado correctamente');
      } catch (err) {
        console.error('Error al leer Excel:', err);
        alert('Error al leer el archivo Excel. Verifica que tenga el formato correcto.');
      }
    };
    reader.readAsArrayBuffer(file);

    // Limpiar input
    if (e.target) {
      e.target.value = '';
    }
  };

  // Manejo del modal
  const openNewPost = () => {
    setEditingPost({
      id: '',
      dia: new Date().toISOString().split('T')[0],
      tipo: 'POST',
      producto: 'MAIN',
      objetivo: '',
      titulo: '',
      subtitulo: '',
      caption: '',
      hashtags: '',
      estado: 'pendiente',
    });
    setShowModal(true);
  };

  const openEditPost = (post: CalendarPost) => {
    setEditingPost({ ...post });
    setShowModal(true);
  };

  const savePost = () => {
    if (!editingPost) return;

    const post: CalendarPost = {
      ...editingPost,
      id: editingPost.id || crypto.randomUUID(),
    };

    const updatedPosts = editingPost.id
      ? state.posts.map(p => (p.id === editingPost.id ? post : p))
      : [...state.posts, post];

    saveCalendar(updatedPosts);
    setShowModal(false);
    setEditingPost(null);
  };

  const deletePost = (id: string) => {
    if (window.confirm('¿Eliminar este post?')) {
      const updatedPosts = state.posts.filter(p => p.id !== id);
      saveCalendar(updatedPosts);
    }
  };

  // Ordenar posts por día
  const sortedPosts = [...state.posts].sort((a, b) => a.dia.localeCompare(b.dia));

  // Funciones auxiliares para estilos
  const getTypoBadgeColor = (tipo: CalendarPostType) => {
    const colors = {
      POST: 'bg-blue-500',
      STORY: 'bg-purple-500',
      CARRUSEL: 'bg-orange-500',
      REEL: 'bg-pink-500',
    };
    return colors[tipo];
  };

  const getStatusBadgeColor = (status: CalendarPostStatus) => {
    const colors = {
      pendiente: 'bg-slate-600',
      generado: 'bg-blue-600',
      publicado: 'bg-green-600',
      fallido: 'bg-red-600',
    };
    return colors[status];
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header con botones */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-widest mb-1">CALENDARIO DE CONTENIDOS</h2>
          {state.lastSync && (
            <p className="text-xs text-slate-400">
              Última sincronización: {new Date(state.lastSync).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs tracking-wide transition-colors"
            title="Importa un archivo .xlsx con columnas: dia, tipo, producto, objetivo, titulo, subtitulo, caption, hashtags, estado"
          >
            IMPORTAR EXCEL (.xlsx)
          </button>
          <button
            onClick={openNewPost}
            className="px-4 py-2 bg-brand-primary hover:bg-opacity-90 text-white rounded-xl font-bold text-xs tracking-wide transition-colors"
          >
            NUEVO POST
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="px-4 py-3 text-left font-black text-xs text-white tracking-widest">Día</th>
                <th className="px-4 py-3 text-left font-black text-xs text-white tracking-widest">Tipo</th>
                <th className="px-4 py-3 text-left font-black text-xs text-white tracking-widest">Producto</th>
                <th className="px-4 py-3 text-left font-black text-xs text-white tracking-widest">Título</th>
                <th className="px-4 py-3 text-left font-black text-xs text-white tracking-widest">Estado</th>
                <th className="px-4 py-3 text-center font-black text-xs text-white tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Sin posts en el calendario
                  </td>
                </tr>
              ) : (
                sortedPosts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-200 font-semibold">{formatDate(post.dia)}</td>
                    <td className="px-4 py-3">
                      <span className={`${getTypoBadgeColor(post.tipo)} text-white text-xs font-bold px-2 py-1 rounded`}>
                        {post.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 truncate max-w-[100px]">{post.producto}</td>
                    <td
                      className="px-4 py-3 text-slate-200 truncate max-w-[200px] cursor-help"
                      title={post.titulo}
                    >
                      {post.titulo.substring(0, 30)}
                      {post.titulo.length > 30 ? '...' : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${getStatusBadgeColor(post.estado)} text-white text-xs font-bold px-2 py-1 rounded`}>
                        {post.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        {post.estado !== 'publicado' && onLoadPost && (
                          <button
                            onClick={() => onLoadPost(post)}
                            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            USAR
                          </button>
                        )}
                        <button
                          onClick={() => openEditPost(post)}
                          className="text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          EDITAR
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                        >
                          ELIMINAR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      {showModal && editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <h3 className="text-xl font-black text-white tracking-widest mb-6">
              {editingPost.id ? 'EDITAR POST' : 'NUEVO POST'}
            </h3>

            <div className="space-y-4">
              {/* Día */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Día</label>
                <input
                  type="date"
                  value={editingPost.dia}
                  onChange={(e) => setEditingPost({ ...editingPost, dia: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Tipo</label>
                <select
                  value={editingPost.tipo}
                  onChange={(e) => setEditingPost({ ...editingPost, tipo: e.target.value as CalendarPostType })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                >
                  <option value="POST">POST</option>
                  <option value="STORY">STORY</option>
                  <option value="CARRUSEL">CARRUSEL</option>
                  <option value="REEL">REEL</option>
                </select>
              </div>

              {/* Producto */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Producto</label>
                <input
                  type="text"
                  placeholder="MAIN, STUDIO, FOOD, CAT"
                  value={editingPost.producto}
                  onChange={(e) => setEditingPost({ ...editingPost, producto: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Objetivo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Objetivo</label>
                <input
                  type="text"
                  placeholder="Ej: Engagement, Leads, Awareness"
                  value={editingPost.objetivo}
                  onChange={(e) => setEditingPost({ ...editingPost, objetivo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Título</label>
                <input
                  type="text"
                  value={editingPost.titulo}
                  onChange={(e) => setEditingPost({ ...editingPost, titulo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Subtítulo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={editingPost.subtitulo}
                  onChange={(e) => setEditingPost({ ...editingPost, subtitulo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Caption</label>
                <textarea
                  rows={3}
                  value={editingPost.caption}
                  onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Hashtags</label>
                <input
                  type="text"
                  placeholder="#tag1 #tag2"
                  value={editingPost.hashtags}
                  onChange={(e) => setEditingPost({ ...editingPost, hashtags: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Estado</label>
                <select
                  value={editingPost.estado}
                  onChange={(e) => setEditingPost({ ...editingPost, estado: e.target.value as CalendarPostStatus })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="generado">Generado</option>
                  <option value="publicado">Publicado</option>
                  <option value="fallido">Fallido</option>
                </select>
              </div>

              {/* Buffer ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Buffer ID (opcional)</label>
                <input
                  type="text"
                  value={editingPost.buffer_id || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, buffer_id: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Slides - solo si es CARRUSEL */}
              {editingPost.tipo === 'CARRUSEL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Cantidad de Slides</label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={editingPost.slides || 3}
                    onChange={(e) => setEditingPost({ ...editingPost, slides: parseInt(e.target.value) || 3 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                  />
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wide mb-1">Notas (opcional)</label>
                <textarea
                  rows={2}
                  value={editingPost.notas || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, notas: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPost(null);
                }}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs tracking-wide transition-colors"
              >
                CANCELAR
              </button>
              <button
                onClick={savePost}
                className="px-6 py-2 bg-brand-primary hover:bg-opacity-90 text-white rounded-xl font-bold text-xs tracking-wide transition-colors"
              >
                GUARDAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;

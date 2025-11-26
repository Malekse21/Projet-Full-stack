import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, Sparkles, Image as ImageIcon, Calendar, Loader2, Save } from 'lucide-react';
import { generateMemoryMetadata } from '../services/geminiService';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId: string | null;
  viewId: string | null;
}

const MemoryModal: React.FC<MemoryModalProps> = ({ isOpen, onClose, editId, viewId }) => {
  const { memories, folders, addMemory, updateMemory } = useStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [folderId, setFolderId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const isViewMode = !!viewId && !editId;
  const targetId = editId || viewId;

  useEffect(() => {
    if (isOpen && targetId) {
      const memory = memories.find(m => m.id === targetId);
      if (memory) {
        setTitle(memory.title);
        setDescription(memory.description);
        setDate(memory.date.split('T')[0]);
        setFolderId(memory.folderId || '');
        setImageUrl(memory.imageUrl || '');
        setTags(memory.tags || []);
      }
    } else if (isOpen && !targetId) {
      // Reset for new entry
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setFolderId('');
      setImageUrl('');
      setTags([]);
    }
  }, [isOpen, targetId, memories]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiEnhance = async () => {
    setIsAiLoading(true);
    try {
      const metadata = await generateMemoryMetadata(
        imageUrl || undefined,
        title,
        description
      );
      
      setTitle(metadata.title);
      setDescription(metadata.description);
      setTags(metadata.tags);
    } catch (error) {
      console.error(error);
      alert("Erreur de génération IA");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const memoryData = {
        title,
        description,
        date,
        folderId: folderId || undefined,
        imageUrl: imageUrl || undefined,
        tags
      };

      if (editId) {
        await updateMemory(editId, memoryData);
      } else {
        await addMemory(memoryData);
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       {/* Backdrop */}
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

       {/* Modal Card */}
       <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
               {isViewMode ? 'Détails du souvenir' : editId ? 'Modifier le souvenir' : 'Nouveau souvenir'}
             </h2>
             <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
               <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
             
             {/* Image Section */}
             <div className="mb-6">
               {imageUrl ? (
                 <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-inner group border border-gray-200 dark:border-gray-700">
                   <img src={imageUrl} alt="Memory" className="w-full h-64 object-contain" />
                   {!isViewMode && (
                     <button 
                       onClick={() => setImageUrl('')}
                       className="absolute top-2 right-2 p-2 bg-white/90 text-gray-700 rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
                     >
                       <X size={16} />
                     </button>
                   )}
                 </div>
               ) : !isViewMode && (
                 <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-400 transition-colors">
                   <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                   <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-3">
                      <ImageIcon size={24} />
                   </div>
                   <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Ajouter une photo</span>
                   <span className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 5MB</span>
                 </label>
               )}
             </div>

             {/* View Mode */}
             {isViewMode ? (
               <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                       <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                       {folderId && (
                         <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-medium">
                           {folders.find(f => f.id === folderId)?.name}
                         </span>
                       )}
                    </div>
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none">
                     <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">{description}</p>
                  </div>

                  {tags.length > 0 && (
                     <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                        {tags.map(t => (
                           <span key={t} className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300 font-medium">#{t}</span>
                        ))}
                     </div>
                  )}
               </div>
             ) : (
                /* Edit/Create Form */
                <form id="memory-form" onSubmit={handleSubmit} className="space-y-5">
                  
                  <div className="flex justify-between items-center">
                     <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Informations</label>
                     <button
                       type="button"
                       onClick={handleAiEnhance}
                       disabled={isAiLoading || (!imageUrl && !title && !description)}
                       className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                       Magie IA
                     </button>
                  </div>

                  <div>
                     <input
                       type="text"
                       required
                       value={title}
                       onChange={(e) => setTitle(e.target.value)}
                       className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                       placeholder="Donnez un titre à ce souvenir..."
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
                       <input
                         type="date"
                         required
                         value={date}
                         onChange={(e) => setDate(e.target.value)}
                         className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1.5">Dossier</label>
                       <select
                         value={folderId}
                         onChange={(e) => setFolderId(e.target.value)}
                         className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                       >
                         <option value="">Aucun dossier</option>
                         {folders.map(f => (
                           <option key={f.id} value={f.id}>{f.name}</option>
                         ))}
                       </select>
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                     <textarea
                       rows={5}
                       value={description}
                       onChange={(e) => setDescription(e.target.value)}
                       className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                       placeholder="Racontez l'histoire de ce moment..."
                     />
                  </div>
                  
                  {tags.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                        {tags.map((t, i) => (
                           <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">#{t}</span>
                        ))}
                     </div>
                  )}

                </form>
             )}
          </div>

          <div className="p-4 sm:px-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
             <button 
               onClick={onClose}
               className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
             >
               {isViewMode ? 'Fermer' : 'Annuler'}
             </button>
             
             {!isViewMode && (
               <button 
                 type="submit" 
                 form="memory-form"
                 className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
               >
                 <Save size={16} />
                 {editId ? 'Enregistrer' : 'Créer'}
               </button>
             )}
          </div>
       </div>
    </div>
  );
};

export default MemoryModal;
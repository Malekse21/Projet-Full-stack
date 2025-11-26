import React from 'react';
import { Memory, Folder } from '../types';
import { useStore } from '../store';
import { Heart, FileText, Calendar, MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
  onEdit: () => void;
  onView: () => void;
  folder?: Folder;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onEdit, onView, folder }) => {
  const { toggleFavorite, deleteMemory } = useStore();
  const [showMenu, setShowMenu] = React.useState(false);

  // Close menu on click outside
  React.useEffect(() => {
    const close = () => setShowMenu(false);
    if (showMenu) window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [showMenu]);

  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Image / Thumbnail */}
      <div 
        className="relative h-48 bg-gray-100 dark:bg-gray-700 cursor-pointer overflow-hidden"
        onClick={onView}
      >
        {memory.imageUrl ? (
          <img 
            src={memory.imageUrl} 
            alt={memory.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <FileText size={48} />
          </div>
        )}

        {/* Overlay Badge */}
        {folder && (
           <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-medium">
             {folder.name}
           </div>
        )}

        {/* Favorite Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(memory.id); }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            memory.isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-black/30 text-white hover:bg-black/50'
          }`}
        >
          <Heart size={14} className={memory.isFavorite ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
           <h3 
             className="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 transition-colors"
             onClick={onView}
           >
             {memory.title}
           </h3>
           
           <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                 <MoreHorizontal size={18} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-10 py-1 text-sm animate-in fade-in zoom-in-95 duration-100">
                  <button onClick={(e) => { e.stopPropagation(); onView(); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                    <Eye size={14} /> Voir
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                    <Edit2 size={14} /> Modifier
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  <button onClick={(e) => { e.stopPropagation(); deleteMemory(memory.id); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              )}
           </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
           {memory.description || "Aucune description..."}
        </p>

        <div className="flex items-center justify-between mt-auto text-xs text-gray-400">
           <div className="flex items-center gap-1.5">
             <Calendar size={12} />
             {new Date(memory.date).toLocaleDateString('fr-FR')}
           </div>
           
           {memory.tags && memory.tags.length > 0 && (
             <div className="flex gap-1">
               {memory.tags.slice(0, 2).map((t, i) => (
                 <span key={i} className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                   #{t}
                 </span>
               ))}
               {memory.tags.length > 2 && <span>+{memory.tags.length - 2}</span>}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
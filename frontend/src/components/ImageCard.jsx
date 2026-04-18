import { Trash2, ImageIcon, MoreVertical, Check } from 'lucide-react';
import { useState } from 'react';

export default function ImageCard({ image, onDelete, viewMode = 'grid', selected, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const size = image.size < 1024
    ? `${image.size} B`
    : image.size < 1024 * 1024
    ? `${(image.size / 1024).toFixed(1)} KB`
    : `${(image.size / (1024 * 1024)).toFixed(1)} MB`;

  const handleCheckbox = (e) => { e.stopPropagation(); onSelect?.(image._id); };

  if (viewMode === 'list') {
    return (
      <div className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}>
        <div onClick={handleCheckbox} className="shrink-0">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100'}`}>
            {selected && <Check size={11} className="text-white" strokeWidth={3} />}
          </div>
        </div>
        <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0">
          {!imgError ? (
            <img src={image.filePath} alt={image.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={16} className="text-gray-300 dark:text-gray-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{image.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{size}</p>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Image</span>
        <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all">
            <MoreVertical size={15} className="text-gray-500 dark:text-gray-400" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 w-36 z-20">
                <button onClick={() => { onDelete(image._id, image.name); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer ${
        selected
          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg'
      }`}
    >
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10" onClick={handleCheckbox}>
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shadow-sm ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white/90 dark:bg-gray-800/90 dark:border-gray-600 opacity-0 group-hover:opacity-100'}`}>
          {selected && <Check size={11} className="text-white" strokeWidth={3} />}
        </div>
      </div>
      <div className="aspect-square bg-gray-50 dark:bg-gray-700/50 overflow-hidden relative">
        {!imgError ? (
          <img src={image.filePath} alt={image.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={28} className="text-gray-200 dark:text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <div className="p-3 flex items-start justify-between gap-1 bg-white dark:bg-gray-800">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{image.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{size}</p>
        </div>
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
            <MoreVertical size={14} className="text-gray-400 dark:text-gray-500" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 w-36 z-20">
                <button onClick={() => { onDelete(image._id, image.name); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

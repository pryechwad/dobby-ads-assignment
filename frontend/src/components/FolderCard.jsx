import { Folder, Trash2, ChevronRight, MoreVertical, Check } from 'lucide-react';
import { useState } from 'react';

const formatSize = (bytes) => {
  if (!bytes) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function FolderCard({ folder, onClick, onDelete, viewMode = 'grid', selected, onSelect }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCheckbox = (e) => {
    e.stopPropagation();
    onSelect?.(folder._id);
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
        onClick={onClick}
      >
        <div onClick={handleCheckbox} className="shrink-0">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100'}`}>
            {selected && <Check size={11} className="text-white" strokeWidth={3} />}
          </div>
        </div>
        <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center shrink-0">
          <Folder size={18} className="text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{folder.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{formatSize(folder.size)}</p>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">Folder</span>
        <div className="relative ml-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all">
            <MoreVertical size={15} className="text-gray-500 dark:text-gray-400" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 w-36 z-20">
                <button onClick={() => { onDelete(folder._id, folder.name); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
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
      className={`group relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
        selected
          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 shadow-md'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50/60 dark:hover:shadow-indigo-900/20'
      }`}
      onClick={onClick}
    >
      {/* Checkbox */}
      <div className="absolute top-3 left-3 z-10" onClick={handleCheckbox}>
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-100'}`}>
          {selected && <Check size={11} className="text-white" strokeWidth={3} />}
        </div>
      </div>
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl flex items-center justify-center border border-amber-100 dark:border-amber-800/30">
          <Folder size={22} className="text-amber-500" />
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
            <MoreVertical size={15} className="text-gray-400 dark:text-gray-500" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 w-36 z-20">
                <button onClick={() => { onDelete(folder._id, folder.name); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <p className="font-semibold text-gray-800 dark:text-gray-100 truncate text-sm mb-0.5">{folder.name}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{formatSize(folder.size)}</p>
      <ChevronRight size={14} className="absolute bottom-4 right-4 text-gray-200 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
    </div>
  );
}

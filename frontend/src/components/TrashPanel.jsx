import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Trash2, RotateCcw, Folder, ImageIcon, Check, X } from 'lucide-react';
import { useToast } from './Toast';
import { useConfirm } from './ConfirmDialog';

const fmtBytes = (b) => b < 1024 ? `${b} B` : b < 1024 ** 2 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 ** 2).toFixed(1)} MB`;
const daysLeft = (deletedAt) => Math.max(0, 30 - Math.floor((Date.now() - new Date(deletedAt)) / 86400000));

export default function TrashPanel({ onStorageChange }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/images/trash');
    setFolders(data.folders);
    setImages(data.images);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTrash(); }, [fetchTrash]);

  const toggle = (key) => setSelected(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const selectAll = () => setSelected(new Set([
    ...folders.map(f => `f:${f._id}`),
    ...images.map(i => `i:${i._id}`),
  ]));

  const clearSelection = () => setSelected(new Set());

  const handleRestore = async (keys) => {
    await Promise.all([...keys].map(key => {
      const [type, id] = key.split(':');
      return type === 'f' ? api.patch(`/folders/${id}/restore`) : api.patch(`/images/${id}/restore`);
    }));
    toast(`${keys.size} item${keys.size > 1 ? 's' : ''} restored`, 'success');
    clearSelection();
    fetchTrash();
    onStorageChange?.();
  };

  const handlePermanentDelete = async (keys) => {
    const ok = await confirm(`Permanently delete ${keys.size} item${keys.size > 1 ? 's' : ''}? This cannot be undone.`);
    if (!ok) return;
    await Promise.all([...keys].map(key => {
      const [type, id] = key.split(':');
      return type === 'f' ? api.delete(`/folders/${id}/permanent`) : api.delete(`/images/${id}/permanent`);
    }));
    toast(`${keys.size} item${keys.size > 1 ? 's' : ''} permanently deleted`, 'success');
    clearSelection();
    fetchTrash();
    onStorageChange?.();
  };

  const total = folders.length + images.length;

  if (loading) return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div>
      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-2xl">
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex-1">{selected.size} selected</span>
          <button onClick={selectAll} className="text-xs font-medium text-indigo-600 hover:underline px-2 py-1">Select all</button>
          <button
            onClick={() => handleRestore(selected)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={12} /> Restore
          </button>
          <button
            onClick={() => handlePermanentDelete(selected)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={clearSelection} className="p-1.5 hover:bg-indigo-100 rounded-lg">
            <X size={14} className="text-indigo-500" />
          </button>
        </div>
      )}

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-5">
            <Trash2 size={34} className="text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Trash is empty</h3>
          <p className="text-sm text-gray-400">Deleted items appear here for 30 days</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
          {[...folders.map(f => ({ ...f, _type: 'folder' })), ...images.map(i => ({ ...i, _type: 'image' }))].map((item) => {
            const key = `${item._type === 'folder' ? 'f' : 'i'}:${item._id}`;
            const isSelected = selected.has(key);
            const days = daysLeft(item.deletedAt);
            return (
              <div key={item._id} className={`group flex items-center gap-3 px-4 py-3 transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}>
                {/* Checkbox */}
                <div onClick={() => toggle(key)} className="shrink-0 cursor-pointer">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 opacity-0 group-hover:opacity-100'}`}>
                    {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item._type === 'folder' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {item._type === 'folder'
                    ? <Folder size={18} className="text-amber-500" />
                    : item.filePath
                      ? <img src={item.filePath} alt={item.name} className="w-full h-full object-cover rounded-xl" onError={(e) => { e.target.style.display = 'none'; }} />
                      : <ImageIcon size={16} className="text-gray-400" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item._type === 'folder' ? 'Folder' : fmtBytes(item.size)} · <span className={days <= 3 ? 'text-red-400' : 'text-gray-400'}>{days}d left</span></p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(new Set([key]))}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Restore"
                  >
                    <RotateCcw size={14} className="text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(new Set([key]))}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

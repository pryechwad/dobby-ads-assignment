import { useState, useEffect } from 'react';
import { X, Folder, ChevronRight, Home, Check } from 'lucide-react';
import api from '../services/api';

export default function MoveModal({ selectedCount, onClose, onMove }) {
  const [folders, setFolders] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [crumbs, setCrumbs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/folders${currentId ? `?parentId=${currentId}` : ''}`)
      .then(({ data }) => setFolders(data))
      .finally(() => setLoading(false));
  }, [currentId]);

  useEffect(() => {
    if (!currentId) { setCrumbs([]); return; }
    api.get(`/folders/breadcrumb/${currentId}`).then(({ data }) => setCrumbs(data));
  }, [currentId]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Move {selectedCount} item{selectedCount > 1 ? 's' : ''} to…</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 text-xs flex-wrap">
          <button onClick={() => setCurrentId(null)} className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
            <Home size={12} /> My Drive
          </button>
          {crumbs.map((c) => (
            <span key={c.id} className="flex items-center gap-1">
              <ChevronRight size={11} className="text-gray-300 dark:text-gray-600" />
              <button onClick={() => setCurrentId(c.id)} className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">{c.name}</button>
            </span>
          ))}
        </div>

        {/* Folder list */}
        <div className="max-h-60 overflow-y-auto">
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : folders.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No subfolders here</p>
          ) : (
            folders.map((f) => (
              <button
                key={f._id}
                onClick={() => setCurrentId(f._id)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center shrink-0">
                  <Folder size={15} className="text-amber-500" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200 truncate flex-1">{f.name}</span>
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onMove(currentId)}
            className="flex-1 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Check size={14} />
            Move here
          </button>
        </div>
      </div>
    </div>
  );
}

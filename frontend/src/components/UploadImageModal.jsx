import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, ImageIcon, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function UploadImageModal({ folderId, onClose, onUploaded }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setPreview(URL.createObjectURL(accepted[0]));
      if (!name) setName(accepted[0].name.replace(/\.[^/.]+$/, ''));
    }
  }, [name]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', name.trim());
      formData.append('folderId', folderId);
      const { data } = await api.post('/images', formData);
      onUploaded(data);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Upload size={18} className="text-indigo-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Upload Image</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="relative h-44">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium">Click to change</p>
                </div>
                <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ImageIcon size={22} className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isDragActive ? 'Drop it here!' : 'Drag & drop or click to select'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, GIF, WebP — up to 10MB</p>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Image name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
          />

          {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file || !name.trim()}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Uploading…
                </>
              ) : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

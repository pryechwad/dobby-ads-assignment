import { useState } from 'react';
import { X, Moon, Sun, Check, Folder, User, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, TEMPLATES } from '../context/ThemeContext';
import api from '../services/api';

export default function ProfileModal({ onClose, onTemplateActivated }) {
  const { user, updateUser } = useAuth();
  const { dark, setDark, template, setTemplate } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [activatingTemplate, setActivatingTemplate] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || name === user?.name) return;
    setSaving(true);
    try {
      const { data } = await api.patch('/auth/me', { name: name.trim() });
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleActivateTemplate = async (tmpl) => {
    setActivatingTemplate(tmpl.id);
    try {
      // 1. Create root folder named after the template
      const { data: rootFolder } = await api.post('/folders', { name: tmpl.name, parentId: null });
      // 2. Create sub-folders inside root, collect results
      const subFolders = tmpl.folders.length > 0
        ? await Promise.all(
            tmpl.folders.map((folderName) =>
              api.post('/folders', { name: folderName, parentId: rootFolder._id }).then((r) => r.data)
            )
          )
        : [];
      setTemplate(tmpl.id);
      // Pass both root and sub-folders so Dashboard can render immediately
      onTemplateActivated?.(rootFolder, subFolders);
      onClose();
    } finally {
      setActivatingTemplate(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Account & Settings</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Profile */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Profile</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display name"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={user?.email}
                  disabled
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 rounded-xl cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim() || name === user?.name}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </section>

          {/* Appearance */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Appearance</p>
            <button
              onClick={() => setDark(!dark)}
              className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                {dark ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {dark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className={`w-10 h-5.5 rounded-full transition-colors relative ${dark ? 'bg-indigo-600' : 'bg-gray-300'}`}
                style={{ height: '22px', width: '40px' }}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </section>

          {/* Templates */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Workspace Templates</p>
            <p className="text-xs text-gray-400 mb-3">Activate a template to auto-create starter folders</p>
            <div className="space-y-2">
              {TEMPLATES.map((tmpl) => {
                const isActive = template === tmpl.id;
                const isLoading = activatingTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-100 dark:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <Sparkles size={14} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{tmpl.name}</p>
                        <p className="text-xs text-gray-400">{tmpl.desc}</p>
                        {tmpl.folders.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {tmpl.folders.map((f) => (
                              <span key={f} className="inline-flex items-center gap-0.5 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                                <Folder size={9} /> {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {isActive ? (
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleActivateTemplate(tmpl)}
                        disabled={!!activatingTemplate}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 shrink-0 px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      >
                        {isLoading ? 'Creating…' : 'Activate'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

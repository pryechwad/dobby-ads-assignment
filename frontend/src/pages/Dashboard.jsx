import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Breadcrumb from '../components/Breadcrumb';
import FolderCard from '../components/FolderCard';
import ImageCard from '../components/ImageCard';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadImageModal from '../components/UploadImageModal';
import {
  FolderPlus, Upload, LogOut, Layers, Clock, FolderOpen,
  LayoutGrid, List, Search, Plus, Home, ChevronDown, Menu, X, Image, Settings, Trash2
} from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import MoveModal from '../components/MoveModal';
import TrashPanel from '../components/TrashPanel';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';

const NAV = [
  { id: 'files', label: 'My Drive', icon: Home },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'images', label: 'Images', icon: Image },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

const fmtBytes = (b) => b < 1024 ? `${b} B` : b < 1024**2 ? `${(b/1024).toFixed(1)} KB` : b < 1024**3 ? `${(b/1024**2).toFixed(1)} MB` : `${(b/1024**3).toFixed(2)} GB`;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [recentImages, setRecentImages] = useState([]);
  const [crumbs, setCrumbs] = useState([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('files');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selected, setSelected] = useState(new Set()); // { id: 'folder'|'image' } — store as 'f:id' or 'i:id'
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  useTheme();

  const fetchContents = useCallback(async () => {
    setLoading(true);
    try {
      const params = currentFolderId ? `?parentId=${currentFolderId}` : '';
      const [foldersRes, imagesRes] = await Promise.all([
        api.get(`/folders${params}`),
        currentFolderId ? api.get(`/images?folderId=${currentFolderId}`) : Promise.resolve({ data: [] }),
      ]);
      setFolders(foldersRes.data);
      setImages(imagesRes.data);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  const fetchBreadcrumb = useCallback(async () => {
    if (!currentFolderId) { setCrumbs([]); return; }
    const { data } = await api.get(`/folders/breadcrumb/${currentFolderId}`);
    setCrumbs(data);
  }, [currentFolderId]);

  const fetchRecent = useCallback(async () => {
    const { data } = await api.get('/images/recent');
    setRecentImages(data);
  }, []);

  const fetchStorage = useCallback(async () => {
    const { data } = await api.get('/images/storage');
    setStorageUsed(data.used);
  }, []);

  useEffect(() => {
    fetchContents();
    fetchBreadcrumb();
    fetchRecent();
    fetchStorage();
  }, [fetchContents, fetchBreadcrumb, fetchRecent, fetchStorage]);

  const navigateTo = (folderId) => {
    setCurrentFolderId(folderId);
    setActiveNav('files');
    setSidebarOpen(false);
    setSelected(new Set());
  };

  const toggleSelect = (key) => setSelected(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const clearSelection = () => setSelected(new Set());

  const selectAll = () => {
    const all = new Set([
      ...filteredFolders.map(f => `f:${f._id}`),
      ...filteredImages.map(i => `i:${i._id}`),
    ]);
    setSelected(all);
  };

  const handleBulkDelete = async () => {
    const count = selected.size;
    const ok = await confirm(`Delete ${count} selected item${count > 1 ? 's' : ''}? This cannot be undone.`);
    if (!ok) return;
    await Promise.all([...selected].map(key => {
      const [type, id] = key.split(':');
      return type === 'f' ? api.delete(`/folders/${id}`) : api.delete(`/images/${id}`);
    }));
    clearSelection();
    fetchContents();
    fetchRecent();
    fetchStorage();
    toast(`${count} item${count > 1 ? 's' : ''} deleted`, 'success');
  };

  const handleBulkMove = async (targetId) => {
    await Promise.all([...selected].map(key => {
      const [type, id] = key.split(':');
      return type === 'f'
        ? api.patch(`/folders/${id}/move`, { targetId })
        : api.patch(`/images/${id}/move`, { targetId });
    }));
    clearSelection();
    setShowMoveModal(false);
    fetchContents();
    fetchRecent();
    toast(`Moved ${selected.size} item${selected.size > 1 ? 's' : ''}`, 'success');
  };

  const handleDeleteFolder = async (id, name) => {
    const ok = await confirm(`"${name}" and all its contents will be permanently deleted.`);
    if (!ok) return;
    try {
      await api.delete(`/folders/${id}`);
      setFolders((prev) => prev.filter((f) => f._id !== id));
      fetchRecent();
      fetchStorage();
      toast('Folder deleted', 'success');
    } catch { toast('Failed to delete folder', 'error'); }
  };

  const handleDeleteImage = async (id, name) => {
    const ok = await confirm(`"${name}" will be permanently deleted.`);
    if (!ok) return;
    try {
      await api.delete(`/images/${id}`);
      setImages((prev) => prev.filter((i) => i._id !== id));
      fetchRecent();
      fetchContents();
      fetchStorage();
      toast('Image deleted', 'success');
    } catch { toast('Failed to delete image', 'error'); }
  };

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredImages = images.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const isEmpty = !loading && filteredFolders.length === 0 && filteredImages.length === 0;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
          <Layers size={16} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight">Dobby Ads</span>
      </div>

      {/* New button */}
      <div className="px-3 mb-4">
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-2 w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md text-sm font-medium text-gray-700 dark:text-gray-200 transition-all"
          >
            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
              <Plus size={14} className="text-white" />
            </div>
            New
            <ChevronDown size={14} className="ml-auto text-gray-400" />
          </button>
          {showNewMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNewMenu(false)} />
              <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-1.5 w-52 z-20 overflow-hidden">
                <button
                  onClick={() => { setShowCreateFolder(true); setShowNewMenu(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <FolderPlus size={15} className="text-amber-500" />
                  </div>
                  New folder
                </button>
                {currentFolderId && (
                  <button
                    onClick={() => { setShowUpload(true); setShowNewMenu(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <Upload size={15} className="text-indigo-500" />
                    </div>
                    Upload image
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveNav(id); setSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeNav === id
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon size={17} className={activeNav === id ? 'text-indigo-600' : 'text-gray-400'} />
            {label}
          </button>
        ))}
      </nav>

      {/* Storage indicator */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 mt-2">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Storage used</span>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">{fmtBytes(storageUsed)}</p>
        </div>
      </div>

      {/* User */}
      <div className="px-3 pb-4">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <ChevronDown size={13} className="text-gray-400 shrink-0" />
          </button>
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-1.5 w-full z-20">
                <button
                  onClick={() => { setShowProfile(true); setShowUserMenu(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings size={15} />
                  Profile & Settings
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc] dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shrink-0">
        {SidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 md:hidden shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} className="text-gray-500" />
            </button>
            {SidebarContent()}
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 h-14 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu size={18} className="text-gray-600" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files and folders…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 border border-transparent focus:border-gray-300 dark:focus:border-gray-600 rounded-2xl pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* View toggle — desktop */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <List size={15} />
            </button>
          </div>

          {/* Upload button — desktop */}
          {currentFolderId && (
            <button
              onClick={() => setShowUpload(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200"
            >
              <Upload size={14} />
              Upload
            </button>
          )}
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 pb-24 md:pb-6 dark:bg-gray-950">

          {/* Page title + breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {activeNav === 'files' ? 'My Drive' : activeNav === 'recent' ? 'Recent' : activeNav === 'trash' ? 'Trash' : 'All Images'}
              </h1>
              {activeNav === 'files' && crumbs.length > 0 && (
                <div className="mt-1">
                  <Breadcrumb crumbs={crumbs} onNavigate={navigateTo} />
                </div>
              )}
            </div>
            {activeNav === 'files' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  <FolderPlus size={14} />
                  <span className="hidden sm:inline">New Folder</span>
                  <span className="sm:hidden">Folder</span>
                </button>
                {currentFolderId && (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="sm:hidden flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    <Upload size={14} />
                    Upload
                  </button>
                )}
              </div>
            )}
          </div>

          {/* FILES TAB */}
          {activeNav === 'files' && (
            <>
              {/* Bulk action toolbar */}
              {selected.size > 0 && (
                <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-2xl">
                  <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex-1">{selected.size} selected</span>
                  <button onClick={selectAll} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1">Select all</button>
                  <button
                    onClick={() => setShowMoveModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Move
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                  >
                    Delete
                  </button>
                  <button onClick={clearSelection} className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 rounded-lg transition-colors">
                    <X size={14} className="text-indigo-500 dark:text-indigo-400" />
                  </button>
                </div>
              )}
              {loading ? (
                <LoadingSkeleton viewMode={viewMode} />
              ) : isEmpty ? (
                <EmptyState
                  icon={FolderOpen}
                  title={currentFolderId ? 'This folder is empty' : 'Welcome to My Drive'}
                  sub={currentFolderId ? 'Create a subfolder or upload images' : 'Create your first folder to get started'}
                  action={
                    <button
                      onClick={() => setShowCreateFolder(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95"
                    >
                      <FolderPlus size={15} />
                      Create Folder
                    </button>
                  }
                />
              ) : (
                <div className="space-y-7">
                  {filteredFolders.length > 0 && (
                    <section>
                      <SectionHeader title="Folders" count={filteredFolders.length} />
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {filteredFolders.map((folder) => (
                            <FolderCard
                              key={folder._id}
                              folder={folder}
                              onClick={() => navigateTo(folder._id)}
                              onDelete={handleDeleteFolder}
                              viewMode="grid"
                              selected={selected.has(`f:${folder._id}`)}
                              onSelect={(id) => toggleSelect(`f:${id}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                          {filteredFolders.map((folder) => (
                            <FolderCard
                              key={folder._id}
                              folder={folder}
                              onClick={() => navigateTo(folder._id)}
                              onDelete={handleDeleteFolder}
                              viewMode="list"
                              selected={selected.has(`f:${folder._id}`)}
                              onSelect={(id) => toggleSelect(`f:${id}`)}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {filteredImages.length > 0 && (
                    <section>
                      <SectionHeader title="Images" count={filteredImages.length} />
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                          {filteredImages.map((image) => (
                            <ImageCard key={image._id} image={image} onDelete={handleDeleteImage} viewMode="grid"
                              selected={selected.has(`i:${image._id}`)}
                              onSelect={(id) => toggleSelect(`i:${id}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                          {filteredImages.map((image) => (
                            <ImageCard key={image._id} image={image} onDelete={handleDeleteImage} viewMode="list"
                              selected={selected.has(`i:${image._id}`)}
                              onSelect={(id) => toggleSelect(`i:${id}`)}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  )}
                </div>
              )}
            </>
          )}

          {/* RECENT TAB */}
          {activeNav === 'recent' && (
            <div>
              {recentImages.length === 0 ? (
                <EmptyState icon={Clock} title="No recent uploads" sub="Files you upload will appear here" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {recentImages.map((img) => (
                    <div key={img._id}>
                      <ImageCard image={img} onDelete={handleDeleteImage} viewMode="grid" />
                      {img.folderId && (
                        <p className="text-xs text-gray-400 mt-1 px-1 truncate">in {img.folderId.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* IMAGES TAB */}
          {activeNav === 'images' && (
            <div>
              {images.length === 0 && !currentFolderId ? (
                <EmptyState icon={Image} title="No images yet" sub="Open a folder and upload images" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {images.map((img) => (
                    <ImageCard key={img._id} image={img} onDelete={handleDeleteImage} viewMode="grid" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRASH TAB */}
          {activeNav === 'trash' && (
            <TrashPanel onStorageChange={fetchStorage} />
          )}


        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center z-30">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                activeNav === id ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Icon size={20} strokeWidth={activeNav === id ? 2.5 : 1.8} />
              {label}
            </button>
          ))}
          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-gray-400"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center -mt-5 shadow-lg shadow-indigo-300">
              <Plus size={18} className="text-white" />
            </div>
            <span className="mt-0.5">New</span>
          </button>
        </nav>
      </div>

      {showMoveModal && (
        <MoveModal
          selectedCount={selected.size}
          onClose={() => setShowMoveModal(false)}
          onMove={handleBulkMove}
        />
      )}
      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          onTemplateActivated={(rootFolder, subFolders) => {
            // Navigate into the root folder and directly set its sub-folders
            setCurrentFolderId(rootFolder._id);
            setFolders(subFolders);
            setImages([]);
            setActiveNav('files');
            toast(`"${rootFolder.name}" template activated!`, 'success');
          }}
        />
      )}
      {showCreateFolder && (
        <CreateFolderModal
          parentId={currentFolderId}
          onClose={() => setShowCreateFolder(false)}
          onCreated={(folder) => {
            setFolders((prev) => [folder, ...prev]);
            setShowCreateFolder(false);
            toast('Folder created!', 'success');
          }}
        />
      )}
      {showUpload && currentFolderId && (
        <UploadImageModal
          folderId={currentFolderId}
          onClose={() => setShowUpload(false)}
          onUploaded={(image) => {
            setImages((prev) => [image, ...prev]);
            fetchContents();
            fetchRecent();
            fetchStorage();
            setShowUpload(false);
            toast('Image uploaded!', 'success');
          }}
        />
      )}
    </div>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</span>
      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">{count}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
        <Icon size={34} className="text-indigo-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs">{sub}</p>
      {action}
    </div>
  );
}

function LoadingSkeleton({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full w-1/3" />
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full w-1/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full w-3/4" />
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import Layout from './components/Layout';
import MemoryCard from './components/MemoryCard';
import MemoryModal from './components/MemoryModal';
import { 
  Plus, 
  Search, 
  Folder, 
  Clock, 
  HardDrive,
  Trash2,
  Loader2,
  Lock,
  Mail,
  User
} from 'lucide-react';

const App: React.FC = () => {
  const { 
    user, 
    login, 
    register, 
    restoreSession, 
    memories, 
    folders,
    searchQuery,
    setSearchQuery,
    filterFolderId,
    setFilterFolderId,
    addFolder,
    deleteFolder
  } = useStore();
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Memory Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  // New Folder State
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);

  useEffect(() => {
    restoreSession();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = authMode === 'login' 
        ? await login(email, password)
        : await register(name, email, password);
      
      if (!success) setError(authMode === 'login' ? 'Identifiants invalides' : 'E-mail déjà utilisé');
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim(), '#3b82f6');
      setNewFolderName('');
    }
    setIsAddingFolder(false);
  };

  const filteredMemories = memories
    .filter(m => {
      // Search
      const matchesSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // Folder
      const matchesFolder = filterFolderId ? m.folderId === filterFolderId : true;
      
      return matchesSearch && matchesFolder;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-4">
                <Lock size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {authMode === 'login' ? 'Bienvenue' : 'Créer un compte'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Gérez vos souvenirs en toute simplicité.
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                    placeholder="vous@exemple.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setError('');
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {authMode === 'login' ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD CONTENT ---
  const SidebarContent = (
    <div className="px-3 space-y-6">
      
      {/* Main Nav */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
          Bibliothèque
        </h3>
        <nav className="space-y-1">
          <button
            onClick={() => setFilterFolderId(null)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              !filterFolderId 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <HardDrive size={18} />
            Tous les souvenirs
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-50 cursor-not-allowed">
            <Clock size={18} />
            Récents
          </button>
        </nav>
      </div>

      {/* Folders */}
      <div>
        <div className="flex items-center justify-between px-3 mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Dossiers
          </h3>
          <button 
            onClick={() => setIsAddingFolder(true)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Créer un dossier"
          >
            <Plus size={16} />
          </button>
        </div>

        <nav className="space-y-1">
          {isAddingFolder && (
             <div className="px-3 py-1">
               <input
                 autoFocus
                 type="text"
                 className="w-full px-2 py-1 text-sm border border-blue-400 rounded-md outline-none dark:bg-gray-700 dark:text-white"
                 placeholder="Nom du dossier..."
                 value={newFolderName}
                 onChange={(e) => setNewFolderName(e.target.value)}
                 onBlur={createFolder}
                 onKeyDown={(e) => e.key === 'Enter' && createFolder()}
               />
             </div>
          )}

          {folders.map(folder => (
            <div 
              key={folder.id} 
              className={`group flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer ${
                filterFolderId === folder.id 
                  ? 'bg-gray-100 dark:bg-gray-700' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setFilterFolderId(folder.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Folder size={18} className="text-gray-400 group-hover:text-blue-500" />
                <span className={`text-sm font-medium truncate ${filterFolderId === folder.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {folder.name}
                </span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {folders.length === 0 && !isAddingFolder && (
            <p className="px-3 text-xs text-gray-400 italic">Aucun dossier créé</p>
          )}
        </nav>
      </div>

    </div>
  );

  return (
    <Layout sidebarContent={SidebarContent}>
      
      {/* Header Actions */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {filterFolderId ? folders.find(f => f.id === filterFolderId)?.name : 'Mes Souvenirs'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredMemories.length} élément{filteredMemories.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white shadow-sm"
            />
          </div>
          
          <button 
            onClick={() => { setEditingId(null); setViewingId(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredMemories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Folder size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Aucun souvenir trouvé</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            Commencez par ajouter votre premier souvenir ou modifiez vos filtres de recherche.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Créer un souvenir
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMemories.map(memory => (
            <MemoryCard 
              key={memory.id} 
              memory={memory} 
              folder={folders.find(f => f.id === memory.folderId)}
              onEdit={() => { setEditingId(memory.id); setViewingId(null); setIsModalOpen(true); }}
              onView={() => { setViewingId(memory.id); setEditingId(null); setIsModalOpen(true); }}
            />
          ))}
        </div>
      )}

      <MemoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editId={editingId}
        viewId={viewingId}
      />
    </Layout>
  );
};

export default App;
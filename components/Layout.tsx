import React from 'react';
import { useStore } from '../store';
import { 
  LogOut, 
  Menu, 
  Moon, 
  Sun,
  User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, sidebarContent }) => {
  const { 
    user, 
    logout, 
    darkMode, 
    toggleDarkMode,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-sm">
            M
          </div>
          <span className="font-bold text-lg tracking-tight">Souvenirs</span>
        </div>

        {/* Sidebar Navigation (passed from App) */}
        <div className="flex-1 overflow-y-auto py-4">
          {sidebarContent}
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 md:flex-none"></div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={darkMode ? "Mode clair" : "Mode sombre"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;
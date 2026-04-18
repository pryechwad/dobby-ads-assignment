import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ crumbs, onNavigate }) {
  return (
    <nav className="flex items-center gap-0.5 text-sm flex-wrap">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <Home size={13} />
        <span className="font-medium">My Drive</span>
      </button>
      {crumbs.map((crumb) => (
        <span key={crumb.id} className="flex items-center gap-0.5">
          <ChevronRight size={13} className="text-gray-300 dark:text-gray-600" />
          <button
            onClick={() => onNavigate(crumb.id)}
            className="px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-medium transition-colors"
          >
            {crumb.name}
          </button>
        </span>
      ))}
    </nav>
  );
}

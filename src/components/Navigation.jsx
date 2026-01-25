import { useTheme } from '../hooks/useTheme';

const Navigation = ({ currentView, onViewChange }) => {
  const { theme, toggleTheme } = useTheme();
  const views = [
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex w-full">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Motiv</h1>
            </div>
            {/* Mobile and Desktop Navigation */}
            <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
              <div className="flex space-x-2 sm:space-x-8">
                {views.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`inline-flex items-center px-2 sm:px-3 pt-1 border-b-2 text-xs sm:text-sm font-medium transition-colors ${
                      currentView === view.id
                        ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="mr-1 sm:mr-2">{view.icon}</span>
                    <span className="hidden xs:inline">{view.label}</span>
                  </button>
                ))}
              </div>
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

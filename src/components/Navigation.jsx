const Navigation = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex w-full">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Motiv</h1>
            </div>
            {/* Mobile and Desktop Navigation */}
            <div className="ml-auto flex space-x-2 sm:space-x-8">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={`inline-flex items-center px-2 sm:px-3 pt-1 border-b-2 text-xs sm:text-sm font-medium transition-colors ${
                    currentView === view.id
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-1 sm:mr-2">{view.icon}</span>
                  <span className="hidden xs:inline">{view.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

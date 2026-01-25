import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import MonthCalendar from './components/MonthCalendar';
import AnalyticsView from './components/AnalyticsView';
import CategoryManager from './components/CategoryManager';
import DayView from './components/DayView';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authView, setAuthView] = useState('login'); // 'login', 'signup', 'forgot-password'

  const handleDayClick = (date) => {
    setSelectedDate(date);
  };

  const handleDayViewClose = () => {
    setSelectedDate(null);
    setRefreshKey(prev => prev + 1); // Force calendar to refresh
  };

  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <MonthCalendar key={refreshKey} onDayClick={handleDayClick} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'categories':
        return <CategoryManager />;
      default:
        return <MonthCalendar key={refreshKey} onDayClick={handleDayClick} />;
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication pages if user is not logged in
  if (!user) {
    switch (authView) {
      case 'signup':
        return <SignUp onSwitchToLogin={() => setAuthView('login')} />;
      case 'forgot-password':
        return (
          <ForgotPassword onSwitchToLogin={() => setAuthView('login')} />
        );
      case 'login':
      default:
        return (
          <Login
            onSwitchToSignUp={() => setAuthView('signup')}
            onSwitchToForgotPassword={() => setAuthView('forgot-password')}
          />
        );
    }
  }

  // User is authenticated, show the main app
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main>
        {renderView()}
      </main>

      {/* Day View Modal */}
      {selectedDate && (
        <DayView date={selectedDate} onClose={handleDayViewClose} />
      )}
    </div>
  );
}

export default App;

import { SearchBar } from '../../ui/components/SearchBar';
import { Cart } from '../../ui/components/Cart';
import { LoginScreen } from '../../ui/components/LoginScreen';
import { useAuthStore } from '../../ui/stores/auth-store';

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const roleBadge = {
    OWNER: 'bg-amber-100 text-amber-800',
    ADMIN: 'bg-blue-100 text-blue-800',
    ASSISTANT: 'bg-gray-100 text-gray-600',
  }[user?.role ?? 'ASSISTANT'] || 'bg-gray-100 text-gray-600';

  const roleName = {
    OWNER: 'مالك',
    ADMIN: 'مدير',
    ASSISTANT: 'كاشير',
  }[user?.role ?? 'ASSISTANT'] || 'كاشير';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-l from-blue-700 to-blue-500 text-white px-6 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">نظام إدارة الصيدليات</h1>
            <p className="text-xs text-blue-100">Pharmacy Management System</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">{user?.displayName || user?.username}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge}`}>
              {roleName}
            </span>
            <button
              onClick={logout}
              className="text-xs text-blue-200 hover:text-white transition-colors"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-y-auto">
            <SearchBar />
          </div>

          <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Cart />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

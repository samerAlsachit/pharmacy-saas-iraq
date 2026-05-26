import { SearchBar } from '../../ui/components/SearchBar';
import { Cart } from '../../ui/components/Cart';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-l from-blue-700 to-blue-500 text-white px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">نظام إدارة الصيدليات</h1>
          <p className="text-sm text-blue-100 mt-1">Pharmacy Management System</p>
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

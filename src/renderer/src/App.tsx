import { SearchBar } from '../../ui/components/SearchBar';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-l from-blue-700 to-blue-500 text-white px-6 py-4 shadow-md">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">نظام إدارة الصيدليات</h1>
          <p className="text-sm text-blue-100 mt-1">Pharmacy Management System</p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SearchBar />
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <p>أضف أصنافاً للبدء</p>
        </div>
      </main>
    </div>
  );
}

export default App;

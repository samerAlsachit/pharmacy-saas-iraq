import { useEffect, useRef, useState } from 'react';
import { usePosStore } from '../stores/pos-store';

export function SearchBar() {
  const { query, results, selectedIndex, setQuery, setResults, setSelectedIndex, addToCart } =
    usePosStore();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value || value.length < 1) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (window.electronAPI?.searchProducts) {
        const products = await window.electronAPI.searchProducts(value);
        setResults(products);
        setSelectedIndex(products.length > 0 ? 0 : -1);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(Math.min(selectedIndex + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(Math.max(selectedIndex - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      addToCart(results[selectedIndex]);
      setQuery('');
      setResults([]);
    } else if (e.key === 'Escape') {
      setResults([]);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="ابحث بالباركود أو الاسم..."
          className="w-full h-14 px-4 pr-12 text-lg rounded-xl border-2 border-gray-200 
                     focus:border-blue-500 focus:outline-none bg-white shadow-sm
                     placeholder:text-gray-400"
        />
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isFocused && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-80 overflow-y-auto">
          {results.map((product, index) => (
            <button
              key={product.id}
              onMouseDown={() => {
                addToCart(product);
                setQuery('');
                setResults([]);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-right transition-colors
                ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}
                ${index !== results.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {product.nameAr}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {product.nameEn}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {product.category}
                  </span>
                  <span className="text-xs text-gray-400">{product.barcode}</span>
                </div>
              </div>
              <div className="text-left">
                <div className="font-semibold text-blue-600">
                  {product.sellPrice.toLocaleString()} د.ع
                </div>
                <div className={`text-xs ${product.stockQty > product.minThreshold ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stockQty > 0 ? `متبقي ${product.stockQty}` : 'غير متوفر'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

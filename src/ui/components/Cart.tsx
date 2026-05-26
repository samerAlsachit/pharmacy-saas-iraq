import { usePosStore, getCartTotal, getCartCount } from '../stores/pos-store';

export function Cart() {
  const { cart, updateCartQty, removeFromCart, clearCart } = usePosStore();
  const total = getCartTotal(cart);
  const count = getCartCount(cart);

  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        <p className="text-lg">السلة فارغة</p>
        <p className="text-sm mt-1">أضف الأصناف باستخدام البحث</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">
          السلة <span className="text-sm font-normal text-gray-500">({count})</span>
        </h2>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          تفريغ
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {cart.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {item.product.nameAr}
              </div>
              <div className="text-sm text-gray-500">
                {(item.price * item.qty).toLocaleString()} د.ع
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => updateCartQty(item.product.id, item.qty - 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              <span className="w-8 text-center font-semibold text-gray-900 text-sm">
                {item.qty}
              </span>

              <button
                onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => removeFromCart(item.product.id)}
              className="p-1 text-gray-300 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 px-4 py-4 space-y-2 bg-gray-50 rounded-b-xl">
        <div className="flex justify-between text-sm text-gray-600">
          <span>المجموع الفرعي</span>
          <span>{total.toLocaleString()} د.ع</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>الإجمالي</span>
          <span className="text-blue-600">{total.toLocaleString()} د.ع</span>
        </div>
        <button
          className="w-full mt-3 py-3 bg-gradient-to-l from-green-600 to-green-500 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-600 transition-all shadow-md active:scale-[0.98]"
        >
          إتمام البيع ({count})
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'تسجيل دخول',
  LOGIN_FAILED: 'فشل تسجيل دخول',
  CHECKOUT: 'بيع',
  CHECKOUT_UNDO: 'إلغاء بيع',
  STOCK_ADJUST: 'تعديل رصيد',
  PRODUCT_CREATE: 'إضافة منتج',
  PRODUCT_UPDATE: 'تعديل منتج',
  SYNC_PULL: 'سحب مزامنة',
  SYNC_PUSH: 'دفع مزامنة',
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'text-green-600 bg-green-50',
  LOGIN_FAILED: 'text-red-600 bg-red-50',
  CHECKOUT: 'text-blue-600 bg-blue-50',
  CHECKOUT_UNDO: 'text-amber-600 bg-amber-50',
  STOCK_ADJUST: 'text-orange-600 bg-orange-50',
  PRODUCT_CREATE: 'text-purple-600 bg-purple-50',
  PRODUCT_UPDATE: 'text-indigo-600 bg-indigo-50',
  SYNC_PULL: 'text-gray-600 bg-gray-50',
  SYNC_PUSH: 'text-gray-600 bg-gray-50',
};

interface Props {
  onClose: () => void;
}

export function AuditLogViewer({ onClose }: Props) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    window.electronAPI.getAuditLogs(pageSize, page * pageSize).then((r) => {
      setLogs(r.logs);
      setTotal(r.total);
    });
  }, [page]);

  const label = (a: string) => ACTION_LABELS[a] || a;
  const color = (a: string) => ACTION_COLORS[a] || 'text-gray-600 bg-gray-50';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">سجل المراجعة</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {logs.length === 0 && (
            <p className="text-center text-gray-400 py-10">لا توجد سجلات</p>
          )}
          {logs.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${color(entry.action)}`}>
                {label(entry.action)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{entry.details}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {entry.userId} &middot; {new Date(entry.createdAt).toLocaleString('ar-IQ')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {total > pageSize && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-30"
            >
              السابق
            </button>
            <span>صفحة {page + 1} من {Math.ceil(total / pageSize)} ({total} سجل)</span>
            <button
              disabled={(page + 1) * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-30"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

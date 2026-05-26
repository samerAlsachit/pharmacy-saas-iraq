import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface DashboardData {
  todaySales: number;
  todayProfit: number;
  todayTxCount: number;
  lowStockCount: number;
  expiringSoonCount: number;
  dailySales: { date: string; total: number }[];
}

function MetricCard({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-sm text-gray-400 mr-1">{unit}</span>}
      </p>
    </div>
  );
}

function LatestTx({ limit }: { limit: number }) {
  const [txs, setTxs] = useState<{ id: string; total: number; createdAt: string; items: { qty: number }[] }[]>([]);

  useEffect(() => {
    window.electronAPI.getRecentTransactions(limit).then(setTxs).catch(() => {});
  }, [limit]);

  if (txs.length === 0) return <p className="text-sm text-gray-400">لا توجد معاملات حديثة</p>;

  return (
    <div className="space-y-2">
      {txs.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleTimeString('ar-IQ')}</span>
            <span className="text-xs text-gray-400">{tx.items?.length || 0} صنف</span>
          </div>
          <span className="text-sm font-medium">{tx.total.toLocaleString()} د.ع</span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'warn' | 'error' }[]>([]);

  const addToast = useCallback((msg: string, type: 'warn' | 'error') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const fetchData = useCallback(async () => {
    const d = await window.electronAPI.getDashboard();
    setData(d);
    if (d.lowStockCount > 0) addToast(`${d.lowStockCount} منتج أقل من الحد الأدنى`, 'warn');
    if (d.expiringSoonCount > 0) addToast(`${d.expiringSoonCount} منتج قرب انتهاء الصلاحية`, 'warn');
  }, [addToast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const exportExcel = () => {
    if (!data) return;
    import('xlsx').then((XLSX) => {
      const rows = [
        ['المؤشر', 'القيمة'],
        ['مبيعات اليوم', data.todaySales],
        ['أرباح اليوم', data.todayProfit],
        ['عدد المعاملات', data.todayTxCount],
        ['منتجات أقل من الحد', data.lowStockCount],
        ['منتجات قرب الانتهاء', data.expiringSoonCount],
        ...data.dailySales.map((d) => [`مبيعات ${d.date}`, d.total]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
      XLSX.writeFile(wb, `dashboard-${new Date().toISOString().slice(0, 10)}.xlsx`);
    });
  };

  const exportPdf = () => {
    if (!data) return;
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.setLanguage('ar');
      doc.text('تقرير المبيعات اليومي', 105, 20, { align: 'center' });
      doc.text(`مبيعات اليوم: ${data.todaySales.toLocaleString()} د.ع`, 20, 40);
      doc.text(`أرباح اليوم: ${data.todayProfit.toLocaleString()} د.ع`, 20, 50);
      doc.text(`عدد المعاملات: ${data.todayTxCount}`, 20, 60);
      doc.text(`منتجات أقل من الحد: ${data.lowStockCount}`, 20, 70);
      doc.text(`منتجات قرب الانتهاء: ${data.expiringSoonCount}`, 20, 80);
      data.dailySales.forEach((d, i) => {
        doc.text(`${d.date}: ${d.total.toLocaleString()} د.ع`, 20, 95 + i * 10);
      });
      doc.save(`dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
    });
  };

  return (
    <>
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
                t.type === 'warn' ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {t.msg}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">المؤشرات اليومية</h2>
            <p className="text-sm text-gray-500">تحديث تلقائي كل 30 ثانية</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportExcel}
              className="px-4 py-2 text-sm bg-green-50 text-green-700 rounded-xl hover:bg-green-100 border border-green-200 transition-colors"
            >Excel</button>
            <button onClick={exportPdf}
              className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-xl hover:bg-red-100 border border-red-200 transition-colors"
            >PDF</button>
          </div>
        </div>

        {!data ? (
          <p className="text-center text-gray-400 py-10">جاري التحميل...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="مبيعات اليوم" value={data.todaySales} unit="د.ع" color="text-green-700" />
              <MetricCard label="أرباح اليوم" value={data.todayProfit} unit="د.ع" color="text-blue-700" />
              <MetricCard label="أقل من الحد" value={data.lowStockCount} color="text-amber-700" />
              <MetricCard label="قرب الانتهاء" value={data.expiringSoonCount} color="text-red-700" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">مبيعات آخر 7 أيام</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${Number(v).toLocaleString()} د.ع`} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">آخر المعاملات</h3>
              <LatestTx limit={10} />
            </div>
          </>
        )}
      </div>
    </>
  );
}

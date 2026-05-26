import { useEffect, useState, useRef } from 'react';

export function SupplierInvoice() {
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [importRows, setImportRows] = useState<{
    name: string; barcode?: string; price?: number; qty?: number
  }[]>([]);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [status, setStatus] = useState('');
  const [reviewItems, setReviewItems] = useState<Record<number, { productId: string; newPrice: number; newQty: number }>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.electronAPI.getSuppliers().then(setSuppliers);
  }, []);

  const handleExport = async () => {
    if (!selected) return;
    const products = await window.electronAPI.exportSupplierProducts(selected);
    import('xlsx').then((XLSX) => {
      const rows = products.map((p) => [
        p.barcode, p.nameAr, p.nameEn, p.stockQty, p.purchasePrice, p.sellPrice, p.expiryDate?.slice(0, 10),
      ]);
      const ws = XLSX.utils.aoa_to_sheet([
        ['الباركود', 'الاسم عربي', 'الاسم إنجليزي', 'الكمية', 'سعر الشراء', 'سعر البيع', 'تاريخ الانتهاء'],
        ...rows,
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, selected);
      XLSX.writeFile(wb, `products-${selected}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('جاري قراءة الملف...');

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer);
      import('xlsx').then((XLSX) => {
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const header = json[0];
        const nameIdx = header.findIndex((h: string) => /اسم|name|product/i.test(String(h)));
        const barcodeIdx = header.findIndex((h: string) => /باركود|barcode/i.test(String(h)));
        const priceIdx = header.findIndex((h: string) => /سعر|price/i.test(String(h)));
        const qtyIdx = header.findIndex((h: string) => /كمية|qty|quantity|stock/i.test(String(h)));

        const rows = json.slice(1).filter((r: any[]) => r[nameIdx] || r[barcodeIdx]).map((r: any[]) => ({
          name: String(r[nameIdx] || ''),
          barcode: barcodeIdx >= 0 ? String(r[barcodeIdx] || '') : undefined,
          price: priceIdx >= 0 ? Number(r[priceIdx]) || undefined : undefined,
          qty: qtyIdx >= 0 ? Number(r[qtyIdx]) || undefined : undefined,
        }));

        setImportRows(rows);
        setStatus(`تم قراءة ${rows.length} منتج. جاري المطابقة...`);

        window.electronAPI.importPreview(rows).then((m) => {
          setPreview(m);
          const items: Record<number, any> = {};
          m.forEach((match: any, i: number) => {
            if (match.match) {
              items[i] = {
                productId: match.match.id,
                newPrice: match.input.price || match.match.purchasePrice || 0,
                newQty: match.input.qty || match.match.stockQty || 0,
              };
            }
          });
          setReviewItems(items);
          setStatus('');
        });
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = async () => {
    const items = Object.values(reviewItems).filter(Boolean);
    if (items.length === 0) return;
    setStatus('جاري التحديث...');
    const result = await window.electronAPI.confirmImport(items as any);
    setStatus(`تم تحديث ${result.count} منتج بنجاح`);
    setPreview(null);
    setImportRows([]);
  };

  const confidenceColor = (c: string) => {
    switch (c) {
      case 'exact': return 'text-green-700 bg-green-50';
      case 'high': return 'text-blue-700 bg-blue-50';
      case 'medium': return 'text-amber-700 bg-amber-50';
      case 'low': return 'text-orange-700 bg-orange-50';
      default: return 'text-red-700 bg-red-50';
    }
  };

  const confidenceLabel = (c: string) => {
    switch (c) {
      case 'exact': return 'تام';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'ضعيفة';
      default: return 'لا يوجد';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">فواتير الموردين</h2>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
          >
            <option value="">اختر مورد...</option>
            {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={handleExport}
          disabled={!selected}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          تصدير Excel
        </button>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">استيراد فاتورة</h3>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          يدعم Excel و CSV. الأعمدة المطلوبة: اسم المنتج (أو باركود)، سعر الشراء، الكمية
        </p>
      </div>

      {status && (
        <p className="text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-xl">{status}</p>
      )}

      {preview && preview.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">المنتج المستورد</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">المطابقة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الثقة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">السعر الجديد</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الكمية الجديدة</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((m: any, i: number) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">{m.input.name}</td>
                    <td className="px-4 py-3">
                      {m.match ? (
                        <span className="text-gray-800">{m.match.nameAr} <span className="text-gray-400">({m.match.barcode})</span></span>
                      ) : (
                        <span className="text-red-500">لم يتم العثور</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${confidenceColor(m.confidence)}`}>
                        {confidenceLabel(m.confidence)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.match ? (
                        <input
                          type="number"
                          value={reviewItems[i]?.newPrice ?? ''}
                          onChange={(e) => setReviewItems((r) => ({ ...r, [i]: { ...r[i], productId: m.match!.id, newPrice: Number(e.target.value), newQty: r[i]?.newQty || 0 } }))}
                          className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {m.match ? (
                        <input
                          type="number"
                          value={reviewItems[i]?.newQty ?? ''}
                          onChange={(e) => setReviewItems((r) => ({ ...r, [i]: { ...r[i], productId: m.match!.id, newPrice: r[i]?.newPrice || 0, newQty: Number(e.target.value) } }))}
                          className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {preview.filter((m: any) => m.match).length} / {preview.length} منتج متطابق
            </span>
            <button
              onClick={handleConfirm}
              disabled={Object.keys(reviewItems).length === 0}
              className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              تأكيد التحديث
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function generateReceiptHtml(result: CheckoutResult): string {
  const date = new Date(result.createdAt).toLocaleString('ar-IQ');
  const lines = result.items.map(
    (item) => `
      <tr>
        <td style="padding:6px 4px;">${item.product.nameAr}</td>
        <td style="padding:6px 4px;text-align:center;">${item.qty}</td>
        <td style="padding:6px 4px;text-align:left;">${(item.price * item.qty).toLocaleString()} د.ع</td>
      </tr>`,
  ).join('');

  return `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <title>فاتورة</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; padding: 20px; color: #222; }
    .receipt { max-width: 300px; margin: auto; }
    h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
    .sub { text-align: center; color: #666; font-size: 12px; margin-bottom: 12px; }
    .divider { border: none; border-top: 1px dashed #999; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { border-bottom: 1px solid #999; padding: 6px 4px; font-size: 12px; color: #555; }
    td { border-bottom: 1px solid #eee; }
    .total-row td { border: none; font-weight: bold; font-size: 15px; padding-top: 8px; }
    .footer { text-align: center; font-size: 11px; color: #888; margin-top: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body onload="window.print()">
  <div class="receipt">
    <h1>صيدلية السلامة</h1>
    <div class="sub">Pharmacy Management System</div>
    <div class="sub" style="margin-top:-6px">${date}</div>
    <hr class="divider">
    <table>
      <thead>
        <tr>
          <th style="text-align:right;">الصنف</th>
          <th>الكمية</th>
          <th style="text-align:left;">المجموع</th>
        </tr>
      </thead>
      <tbody>
        ${lines}
      </tbody>
    </table>
    <hr class="divider">
    <table>
      <tr class="total-row">
        <td style="text-align:right;">الإجمالي</td>
        <td></td>
        <td style="text-align:left;color:#2563eb;">${result.total.toLocaleString()} د.ع</td>
      </tr>
    </table>
    <div class="footer">
      شكراً لتعاملكم<br>
      ${result.id.slice(0, 8)}
    </div>
  </div>
</body>
</html>`;
}

export function printReceipt(html: string): void {
  const w = window.open('', '_blank', 'width=400,height=600');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

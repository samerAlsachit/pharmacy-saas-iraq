function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>نظام إدارة الصيدليات</h1>
        <p className="subtitle">Pharmacy Management System</p>
      </header>
      <main className="app-main">
        <div className="status-card">
          <div className="status-indicator online" />
          <span>النظام جاهز للعمل</span>
        </div>
      </main>
    </div>
  );
}

export default App;

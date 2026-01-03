export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '220px',
          backgroundColor: '#111',
          color: '#fff',
          padding: '20px'
        }}
      >
        <h2 style={{ marginBottom: '20px' }}>
          Admin Panel
        </h2>

        <nav>
          <p><a href="/admin" style={{ color: '#fff' }}>Dashboard</a></p>
          <p><a href="/admin/exams" style={{ color: '#fff' }}>Exam Blueprints</a></p>
          <p><a href="/admin/questions" style={{ color: '#fff' }}>Question Bank</a></p>
          <p><a href="/admin/tests" style={{ color: '#fff' }}>Tests</a></p>
          <p><a href="/admin/packages" style={{ color: '#fff' }}>Packages</a></p>
          <p><a href="/admin/users" style={{ color: '#fff' }}>Users</a></p>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px' }}>
        {children}
      </main>
    </div>
  );
}

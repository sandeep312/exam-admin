'use client';

import { useRouter } from 'next/navigation';

export default function StudentLayout({ children }) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: '220px',
          background: '#111',
          color: '#fff',
          padding: '20px',
        }}
      >
        <h2 style={{ marginBottom: '30px' }}>Student Panel</h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <SidebarLink
            label="Dashboard"
            onClick={() => router.push('/student/dashboard')}
          />

          <SidebarLink
            label="My Packages"
            onClick={() => router.push('/student/packages')}
          />

          <SidebarLink
            label="Profile"
            onClick={() => router.push('/student/profile')}
          />

          <SidebarLink
            label="Logout"
            onClick={() => {
              // auth logout later
              router.push('/login');
            }}
          />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: '30px',
          background: '#f9f9f9',
        }}
      >
        {children}
      </main>
    </div>
  );
}

/* -------- Sidebar Item -------- */
function SidebarLink({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: '#fff',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '15px',
      }}
    >
      {label}
    </button>
  );
}

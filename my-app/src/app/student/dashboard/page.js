'use client';

export default function StudentDashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
        Student Dashboard
      </h1>

      <p style={{ marginTop: '10px', color: '#555' }}>
        Welcome to your dashboard. Your packages and tests will appear here.
      </p>

      <div
        style={{
          marginTop: '30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        <StatCard title="Active Packages" value="0" />
        <StatCard title="Available Tests" value="0" />
        <StatCard title="Completed Tests" value="0" />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '6px',
        boxShadow: '0 0 4px rgba(0,0,0,0.1)',
      }}
    >
      <h3 style={{ marginBottom: '10px' }}>{title}</h3>
      <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{value}</p>
    </div>
  );
}

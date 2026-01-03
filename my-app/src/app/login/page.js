export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f4f6'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          Admin Login
        </h2>

        <div style={{ marginBottom: '12px' }}>
          <label>Email</label>
          <input
            type="email"
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Password</label>
          <input
            type="password"
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <button style={{
          width: '100%',
          padding: '10px',
          background: 'black',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}>
          Login
        </button>
      </div>
    </div>
  );
}

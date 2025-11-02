import { authApi } from '../utils/api';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          AI Email Sorting
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Automatically categorize and summarize your emails with AI
        </p>
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Sign in with Google
        </button>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
          Connect your Gmail account to get started
        </p>
      </div>
    </div>
  );
}

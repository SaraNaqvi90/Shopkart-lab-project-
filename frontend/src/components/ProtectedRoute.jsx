import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { customer, checkingSession } = useAuth();

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="font-body text-sm text-charcoal/60">Checking your session…</p>
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

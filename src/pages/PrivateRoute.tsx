import { Navigate } from "react-router-dom";
import { useWorldApp } from '@/contexts/WorldAppContext';

export default function PrivateRoute({ children }) {
  const { user, isLoading } = useWorldApp();
  if (isLoading) return <div>Loading…</div>;
  return user ? children : <Navigate to="/login" />;
}

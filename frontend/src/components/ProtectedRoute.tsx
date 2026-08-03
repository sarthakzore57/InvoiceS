import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Loader from './ui/Loader';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader label="Securing workspace" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

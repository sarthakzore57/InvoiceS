import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './ui/Loader';

/** Prevent direct URLs from exposing administrator-only screens to employees. */
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { employee, loading } = useAuth();
  if (loading) return <Loader label="Checking access" />;
  return employee?.role === 'admin' ? children : <Navigate to="/" replace />;
}

import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import InvoiceCreate from './pages/InvoiceCreate';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import ProductPricing from './pages/ProductPricing';
import Areas from './pages/Areas';
import Visit from './pages/Visit';
import VisitNote from './pages/VisitNote';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/invoice/new" element={<InvoiceCreate />} />
        <Route path="/invoice/:invoiceId/edit" element={<InvoiceCreate />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/products" element={<ProductPricing />} />
        <Route path="/areas" element={<Areas />} />
        <Route path="/visit" element={<Visit />} />
        <Route path="/visit/:outletId" element={<VisitNote />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

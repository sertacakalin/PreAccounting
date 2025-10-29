import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/Auth/LoginPage';
import PrivateRoute from '@/components/Auth/PrivateRoute';
import MainLayout from '@/components/Layout/MainLayout';
import CustomerList from '@/components/Admin/CustomerManagement/CustomerList';
import CustomerInvoiceList from '@/components/Customer/InvoiceList';
import AdminSummaryReport from '@/components/Admin/Reports/SummaryReport';
import PersonalReport from '@/components/Customer/MyReports/PersonalReport';

// Placeholder Dashboards
const AdminDashboard = () => <div>Admin Dashboard</div>;
const CustomerDashboard = () => <div>Customer Dashboard</div>;

const AppRoutes = () => {
  const { auth } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<MainLayout />}>
          {/* Default route after login */}
          <Route index element={auth?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/customer/dashboard" />} />

          {/* Admin Routes */}
          <Route path="admin" element={<PrivateRoute allowedRoles={['ADMIN']} />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="reports" element={<AdminSummaryReport />} />
            {/* Other admin routes will go here */}
          </Route>

          {/* Customer Routes */}
          <Route path="customer" element={<PrivateRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="invoices" element={<CustomerInvoiceList />} />
            <Route path="reports" element={<PersonalReport />} />
            {/* Other customer routes will go here */}
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={auth ? "/" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

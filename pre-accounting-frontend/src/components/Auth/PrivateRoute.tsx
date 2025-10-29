import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PrivateRouteProps {
  allowedRoles?: Array<'ADMIN' | 'CUSTOMER'>;
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    // Optional: Redirect to an unauthorized page or back to a safe page
    return <Navigate to="/" replace />; 
  }

  return <Outlet />; // Render child routes
};

export default PrivateRoute;

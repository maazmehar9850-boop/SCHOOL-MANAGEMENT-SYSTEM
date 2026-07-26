import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, roles, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const allowedRoles = roles || (role ? [role] : null);

  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default Route → Login */}
        <Route path="/" element={<Login />} />

        {/* Register Page */}
        <Route path="/register" element={<Register />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Customer Dashboard */}
        <Route
          path="/customer"
          element={
            <PrivateRoute requiredRole="customer">
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
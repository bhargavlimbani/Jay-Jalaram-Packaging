import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {

  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (

    <div className="bg-blue-600 text-white flex justify-between p-4">

      <h1 className="text-xl font-bold">
        Jai Jalaram Packaging
      </h1>

      <div className="flex gap-4">

        <Link to="/">Home</Link>

        <Link to="/products">View Products</Link>

        {user?.role === "customer" && <Link to="/customer">Customer Dashboard</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
        {user && <Link to="/profile">Profile</Link>}

        {!user && <Link to="/login">Login</Link>}

        {user && (
          <button onClick={handleLogout}>
            Logout
          </button>
        )}

      </div>

    </div>

  );
}

export default Navbar;

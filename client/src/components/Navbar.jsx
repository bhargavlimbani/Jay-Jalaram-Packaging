import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">

      <h1 className="text-xl font-bold">
        Jai Jalaram Packaging
      </h1>

      <div className="flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/products">view Products</Link>
        <Link to="/login">Login</Link>
      </div>

    </nav>
  );
}

export default Navbar;
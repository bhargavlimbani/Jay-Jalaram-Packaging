import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";

function Navbar() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showProductsMenu, setShowProductsMenu] = useState(false);

  const productCategories = [
    { label: "Carton Box", value: "carton-box" },
    { label: "Corucated Box", value: "corucated-box" },
    { label: "Printed Corucated Box", value: "printed-corucated-box" },
    { label: "Duplex Box", value: "duplex-box" },
  ];

  const openCategory = (category) => {
    setShowProductsMenu(false);
    navigate(`/products?category=${category}`);
  };

  return (
    <div className="flex flex-col gap-4 bg-white px-4 py-4 text-gray-900 shadow-sm md:flex-row md:items-center md:justify-between">
      <Link to="/" className="flex items-center gap-3">
        <img
          src={logo}
          alt="Jai Jalaram Packaging"
          className="h-24 w-auto object-contain md:h-28"
        />
        <div>
          <p className="text-2xl font-bold leading-tight md:text-3xl">Jai Jalaram Packaging</p>
          <p className="text-base text-gray-500">Corrugated Box Manufacturer</p>
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-4 text-sm font-medium md:text-base">
        <Link to="/">Home</Link>

        <div
          className="relative"
          onMouseEnter={() => setShowProductsMenu(true)}
          onMouseLeave={() => setShowProductsMenu(false)}
        >
          <button
            type="button"
            className="rounded px-2 py-1 hover:text-blue-600"
            onClick={() => setShowProductsMenu((prev) => !prev)}
          >
            View Products
          </button>

          {showProductsMenu && (
            <div className="absolute right-0 z-20 mt-2 min-w-[220px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg md:right-auto md:left-0">
              {productCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  onClick={() => openCategory(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {user?.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
        {user && <Link to="/profile">Profile</Link>}

        {!user && <Link to="/login">Login</Link>}
      </div>
    </div>
  );
}

export default Navbar;

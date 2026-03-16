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
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="brand-container">
        <div className="flex flex-col gap-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-[24px] bg-[var(--brand-primary-soft)] p-2 shadow-sm">
              <img
                src={logo}
                alt="Jai Jalaram Packaging"
                className="h-16 w-auto object-contain md:h-20"
              />
            </div>
            <div>
              <p className="brand-kicker">Industrial Packaging</p>
              <p className="text-2xl font-black leading-tight md:text-3xl">
                Jai Jalaram Packaging
              </p>
              <p className="text-sm text-slate-500 md:text-base">
                Corrugated boxes built for transport, display, and custom branding.
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold md:text-base">
            <Link to="/" className="rounded-full px-4 py-2 hover:bg-amber-50">
              Home
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setShowProductsMenu(true)}
              onMouseLeave={() => setShowProductsMenu(false)}
            >
              <button
                type="button"
                className="rounded-full px-4 py-2 hover:bg-amber-50"
                onClick={() => setShowProductsMenu((prev) => !prev)}
              >
                Shop Boxes
              </button>

              {showProductsMenu && (
                <div className="absolute right-0 z-20 mt-3 min-w-[250px] rounded-[24px] border border-black/10 bg-white p-3 shadow-2xl md:right-auto md:left-0">
                  {productCategories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      className="block w-full rounded-2xl px-4 py-3 text-left text-sm hover:bg-amber-50"
                      onClick={() => openCategory(category.value)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/order" className="rounded-full px-4 py-2 hover:bg-amber-50">
              Custom Order
            </Link>

            {user?.role === "admin" && (
              <Link to="/admin" className="rounded-full px-4 py-2 hover:bg-amber-50">
                Admin Dashboard
              </Link>
            )}

            {user && (
              <Link to="/profile" className="rounded-full px-4 py-2 hover:bg-amber-50">
                Profile
              </Link>
            )}

            {user && user.role !== "admin" && (
              <Link to="/invoices" className="rounded-full px-4 py-2 hover:bg-amber-50">
                Invoices
              </Link>
            )}

            {!user ? (
              <Link to="/login" className="brand-button">
                Login
              </Link>
            ) : user.role === "customer" ? (
              <Link to="/customer" className="brand-button-dark">
                My Orders
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

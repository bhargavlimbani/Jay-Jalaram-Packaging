import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  const inferCategory = (product) => {
    const text = `${product.name || ""} ${product.description || ""}`.toLowerCase();

    if (text.includes("printed")) {
      return "printed-corucated-box";
    }

    if (text.includes("duplex")) {
      return "duplex-box";
    }

    if (text.includes("carton")) {
      return "carton-box";
    }

    return "corucated-box";
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log(error);
        setProducts([]);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || inferCategory(product) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryTitleMap = {
    "carton-box": "Carton Box",
    "corucated-box": "Corucated Box",
    "printed-corucated-box": "Printed Corucated Box",
    "duplex-box": "Duplex Box",
  };

  return (
    <div>
      <Navbar />

      <div className="p-10">
        <h1 className="text-3xl font-bold text-center mb-8">
          {categoryTitleMap[selectedCategory] || "All Packaging Boxes"}
        </h1>

        <input
          type="text"
          placeholder="Search boxes..."
          className="border p-2 mb-8 w-full rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="shadow-lg p-4 rounded hover:shadow-xl bg-white">
                <img
                  src={product.image_data || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="h-56 w-full rounded bg-gray-100 object-contain p-2"
                />

                <h3 className="font-bold text-lg mt-3">
                  {product.name}
                </h3>

                <p className="text-gray-600 mt-2">
                  {product.description || "Quality packaging product"}
                </p>

                <p className="font-bold text-blue-600 mt-3">
                  Rs. {product.price} / piece
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  Stock: {product.stock}
                </p>

                <Link to="/customer">
                  <button className="bg-blue-600 text-white px-4 py-2 mt-3 rounded w-full hover:bg-blue-700">
                    Order Box
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl border bg-white p-6 text-center text-gray-600">
              No products found.
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Link to="/order">
            <button className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700">
              Request Custom Box
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Products;

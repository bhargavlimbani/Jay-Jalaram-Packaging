import { useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Products() {

  const [search, setSearch] = useState("");

  const boxes = [
    {
      id: 1,
      name: "Small Corrugated Box",
      size: "10 x 10 x 10 inch",
      price: 15
    },
    {
      id: 2,
      name: "Medium Shipping Box",
      size: "15 x 15 x 15 inch",
      price: 25
    },
    {
      id: 3,
      name: "Large Industrial Box",
      size: "20 x 20 x 20 inch",
      price: 40
    },
    {
      id: 4,
      name: "Printed Custom Box",
      size: "Custom Size",
      price: 50
    },
    {
      id: 5,
      name: "Heavy Duty Box",
      size: "25 x 25 x 25 inch",
      price: 60
    },
    {
      id: 6,
      name: "Export Packaging Box",
      size: "30 x 30 x 30 inch",
      price: 80
    }
  ];

  const filteredBoxes = boxes.filter((box) =>
    box.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      <Navbar />

      <div className="p-10">

        <h1 className="text-3xl font-bold text-center mb-8">
          All Packaging Boxes
        </h1>

        <input
          type="text"
          placeholder="Search boxes..."
          className="border p-2 mb-8 w-full rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-6">

          {filteredBoxes.map((box) => (

            <div key={box.id} className="shadow-lg p-4 rounded hover:shadow-xl">

              <img
                src="https://via.placeholder.com/300"
                alt="box"
                className="rounded"
              />

              <h3 className="font-bold text-lg mt-3">
                {box.name}
              </h3>

              <p className="text-gray-600">
                Size: {box.size}
              </p>

              <p className="font-bold text-blue-600">
                ₹ {box.price} / piece
              </p>

              <Link to="/order">
                <button className="bg-blue-600 text-white px-4 py-2 mt-3 rounded w-full hover:bg-blue-700">
                  Order Box
                </button>
              </Link>

            </div>

          ))}

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
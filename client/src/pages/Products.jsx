import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Products() {
  return (

    <div>

      <Navbar />

      <div className="p-10">

        <h1 className="text-3xl font-bold text-center mb-8">
          All Packaging Boxes
        </h1>

        <div className="grid grid-cols-3 gap-6">

          <div className="shadow-lg p-4 rounded">
            <img src="https://via.placeholder.com/300" alt="box"/>
            <h3 className="font-bold mt-3">Small Corrugated Box</h3>
          </div>

          <div className="shadow-lg p-4 rounded">
            <img src="https://via.placeholder.com/300" alt="box"/>
            <h3 className="font-bold mt-3">Medium Shipping Box</h3>
          </div>

          <div className="shadow-lg p-4 rounded">
            <img src="https://via.placeholder.com/300" alt="box"/>
            <h3 className="font-bold mt-3">Large Industrial Box</h3>
          </div>

          <div className="shadow-lg p-4 rounded">
            <img src="https://via.placeholder.com/300" alt="box"/>
            <h3 className="font-bold mt-3">Printed Custom Box</h3>
          </div>

          <div className="shadow-lg p-4 rounded">
            <img src="https://via.placeholder.com/300" alt="box"/>
            <h3 className="font-bold mt-3">Heavy Duty Box</h3>
          </div>

          <div className="shadow-lg p-4 rounded">
            <img src="https://via.placeholder.com/300" alt="box"/>
            <h3 className="font-bold mt-3">Export Packaging Box</h3>
          </div>
          <Link to="/order">
  <button className="bg-blue-600 text-white px-4 py-2 mt-2 rounded">
    Request Custom Box
  </button>
</Link>

        </div>

      </div>

    </div>

  );
}

export default Products;
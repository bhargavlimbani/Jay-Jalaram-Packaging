import { useContext } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const { user } = useContext(AuthContext);

  return (

    <div>

      <Navbar />

      {/* Hero Section */}
      <div className="text-center py-20 bg-gray-100">

        <h1 className="text-4xl font-bold mb-4">
          Jai Jalaram Packaging
        </h1>

        <p className="text-lg text-gray-700 mb-6">
          High Quality Corrugated Boxes for Industrial Packaging
        </p>

        {user?.role === "customer" && (
          <p className="text-base font-medium text-blue-700">
            Welcome back, {user.name}
          </p>
        )}



      </div>

      {/* Products Preview */}
      <div className="p-10">

        <h2 className="text-2xl font-bold text-center mb-8">
          Our Packaging Boxes
        </h2>

        <div className="grid grid-cols-3 gap-6">

          <div className="shadow-lg p-4 rounded">
            <img src="https://via.placeholder.com/300" alt="box"/>
            <h3 className="font-bold mt-3">Small Corrugated Box</h3>
            <p>Best for lightweight packaging.</p>
          </div>

          <div className="shadow-lg p-4 rounded">
            <img src="https://via.placeholder.com/300" alt="box"/>
            <h3 className="font-bold mt-3">Medium Shipping Box</h3>
            <p>Ideal for product shipping.</p>
          </div>

          <div className="shadow-lg p-4 rounded">
            <img src="https://via.placeholder.com/300" alt="box"/>
            <h3 className="font-bold mt-3">Large Industrial Box</h3>
            <p>Heavy duty packaging.</p>
          </div>

        </div>

        <div className="text-center mt-6">

          <Link to="/products">
            <button className="bg-blue-600 text-white px-6 py-2 rounded">
              Click here to order boxes
            </button>
          </Link>

        </div>

      </div>

      {/* Contact Section */}
      <div className="bg-gray-800 text-white text-center p-10">

        <h2 className="text-2xl mb-4">
          Contact Us
        </h2>

        <p>9429315940</p>
        <p>6355990290</p>
        <p>9909309111</p>

        <p className="mt-4">
          Shapar Veraval, Rajkot, Gujarat – 360024
        </p>

      </div>

    </div>

  );
}

export default Home;

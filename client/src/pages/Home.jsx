import { useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import smallBoxImage from "../assets/small.png";
import mediumBoxImage from "../assets/Medium.png";
import largeBoxImage from "../assets/large.png";

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <Navbar />

      <div className="bg-gray-100 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold">Jai Jalaram Packaging</h1>

        <p className="mb-6 text-lg text-gray-700">
          High Quality Corrugated Boxes for Industrial Packaging
        </p>

        {user?.role === "customer" && (
          <p className="text-base font-medium text-blue-700">
            Welcome back, {user.name}
          </p>
        )}
      </div>

      <div className="p-10">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Our Packaging Boxes
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="overflow-hidden rounded shadow-lg">
            <img
              src={smallBoxImage}
              alt="Small Corrugated Box"
              className="h-64 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="mt-3 font-bold">Small Corrugated Box</h3>
              <p>Best for lightweight packaging.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded shadow-lg">
            <img
              src={mediumBoxImage}
              alt="Medium Shipping Box"
              className="h-64 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="mt-3 font-bold">Medium Shipping Box</h3>
              <p>Ideal for product shipping.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded shadow-lg">
            <img
              src={largeBoxImage}
              alt="Large Industrial Box"
              className="h-64 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="mt-3 font-bold">Large Industrial Box</h3>
              <p>Heavy duty packaging.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/products">
            <button className="rounded bg-blue-600 px-6 py-2 text-white">
              Click here to order boxes
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 p-10 text-center text-white">
        <h2 className="mb-4 text-2xl">Contact Us</h2>

        <p>Maheshbhai - 9429315940</p>
        <p>Bhargav - 6355990290</p>
        <p>Vijaybhai - 9909309111</p>

        <a
          href="https://maps.app.goo.gl/Kn4HBcCYZhP6kJVR7"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-blue-300 underline underline-offset-4 hover:text-blue-200"
        >
          Shapar Veraval, Rajkot, Gujarat - 360024
        </a>
      </div>
    </div>
  );
}

export default Home;

import { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function OrderForm() {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
  }

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = () => {

    const orderData = {
      name,
      phone,
      length,
      width,
      height,
      quantity,
      note
    };

    console.log("Order Submitted:", orderData);

    alert("Order request submitted!");

  };

  return (
    <div>

      <Navbar />

      <div className="flex justify-center mt-10">

        <div className="bg-white p-8 shadow-lg rounded w-96">

          <h2 className="text-2xl font-bold mb-6 text-center">
            Custom Box Order
          </h2>

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Customer Name"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Phone Number"
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Box Length (inch)"
            onChange={(e) => setLength(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Box Width (inch)"
            onChange={(e) => setWidth(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Box Height (inch)"
            onChange={(e) => setHeight(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Quantity"
            onChange={(e) => setQuantity(e.target.value)}
          />

          <textarea
            className="w-full border p-2 mb-3 rounded"
            placeholder="Special Instructions"
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Submit Order
          </button>

        </div>

      </div>

    </div>
  );
}

export default OrderForm;
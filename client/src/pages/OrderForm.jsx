import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function OrderForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [customDesign, setCustomDesign] = useState("");
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const q = parseFloat(quantity) || 0;
    const rate = 0.02;

    setPrice(Number((l * w * h * q * rate).toFixed(2)));
  }, [length, width, height, quantity]);

  const handleSubmit = async () => {
    try {
      await api.post("/orders", {
        order_type: "custom",
        customer_name: name,
        customer_phone: phone,
        box_length: length,
        box_width: width,
        box_height: height,
        quantity,
        total_price: price,
        custom_design: customDesign,
        note,
      });

      navigate("/customer");
    } catch (error) {
      console.log(error);
      setMessage(
        error.response?.data?.message || "Unable to submit custom order."
      );
    }
  };

  return (
    <div>
      <Navbar />

      <div className="flex justify-center mt-10">
        <div className="bg-white p-8 shadow-lg rounded w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Custom Box Order
          </h2>

          {message && (
            <div className="mb-3 rounded bg-red-100 px-3 py-2 text-sm text-red-700">
              {message}
            </div>
          )}

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Box Length (inch)"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Box Width (inch)"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Box Height (inch)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <div className="text-lg font-bold mb-3">
            Estimated Price: Rs. {price}
          </div>

          <textarea
            className="w-full border p-2 mb-3 rounded"
            placeholder="Custom Design Details"
            value={customDesign}
            onChange={(e) => setCustomDesign(e.target.value)}
          />

          <textarea
            className="w-full border p-2 mb-3 rounded"
            placeholder="Special Instructions"
            value={note}
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

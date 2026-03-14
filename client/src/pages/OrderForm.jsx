import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function OrderForm() {
  const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [customDesign, setCustomDesign] = useState("");
  const [designFileName, setDesignFileName] = useState("");
  const [designFileData, setDesignFileData] = useState("");
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

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setDesignFileName("");
      setDesignFileData("");
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Please upload only PDF file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setMessage("PDF size must be 5 MB or smaller.");
      setDesignFileName("");
      setDesignFileData("");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDesignFileName(file.name);
      setDesignFileData(reader.result);
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

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
        design_file_name: designFileName,
        design_file_data: designFileData,
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

          <input
            type="file"
            accept="application/pdf"
            className="w-full border p-2 mb-3 rounded"
            onChange={handleFileChange}
          />

          <p className="mb-3 text-xs text-gray-500">
            Upload PDF only. Maximum size: 5 MB.
          </p>

          {designFileName && (
            <p className="mb-3 text-sm text-green-700">
              Selected PDF: {designFileName}
            </p>
          )}

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

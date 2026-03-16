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
    <div className="brand-page">
      <Navbar />

      <section className="brand-container py-8 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="brand-panel p-8 md:p-10">
            <p className="brand-kicker">Custom Manufacturing</p>
            <h1 className="mt-3 text-4xl font-black">Build your box specification.</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Share box size, quantity, design notes, and PDF artwork. We will review the request and confirm production through your order dashboard.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[24px] bg-[var(--brand-surface-strong)] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
                  Estimated Price
                </p>
                <p className="mt-2 text-4xl font-black">Rs. {price}</p>
              </div>
              <div className="rounded-[24px] bg-white p-5 text-sm leading-7 text-slate-600">
                Upload PDF only. Maximum file size: 5 MB. Include print design, dieline, or special branding instructions if available.
              </div>
            </div>
          </div>

          <div className="brand-panel p-8 md:p-10">
            <h2 className="text-3xl font-black">Custom Box Order</h2>

            {message && (
              <div className="mt-5 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">
                {message}
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="brand-label">Customer Name</label>
                <input
                  className="brand-input"
                  placeholder="Customer Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="brand-label">Phone Number</label>
                <input
                  className="brand-input"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="brand-label">Box Length</label>
                <input
                  className="brand-input"
                  placeholder="Box Length (inch)"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              </div>

              <div>
                <label className="brand-label">Box Width</label>
                <input
                  className="brand-input"
                  placeholder="Box Width (inch)"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </div>

              <div>
                <label className="brand-label">Box Height</label>
                <input
                  className="brand-input"
                  placeholder="Box Height (inch)"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>

              <div>
                <label className="brand-label">Quantity</label>
                <input
                  className="brand-input"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="brand-label">Custom Design Details</label>
                <textarea
                  className="brand-input min-h-[120px]"
                  placeholder="Custom Design Details"
                  value={customDesign}
                  onChange={(e) => setCustomDesign(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="brand-label">Design PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="brand-input"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {designFileName && (
              <p className="mt-4 text-sm font-semibold text-green-700">
                Selected PDF: {designFileName}
              </p>
            )}

            <div className="mt-4">
              <label className="brand-label">Special Instructions</label>
              <textarea
                className="brand-input min-h-[120px]"
                placeholder="Special Instructions"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button className="brand-button mt-6 w-full" onClick={handleSubmit}>
              Submit Order
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OrderForm;

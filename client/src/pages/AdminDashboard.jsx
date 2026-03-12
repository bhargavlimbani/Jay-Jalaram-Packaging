import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {

  const [orders, setOrders] = useState([]);

  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // ---------------- ORDERS ----------------

  const fetchOrders = async () => {

    const res = await fetch("http://localhost:5000/api/orders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      setOrders(data);
    } else if (Array.isArray(data.orders)) {
      setOrders(data.orders);
    } else {
      setOrders([]);
    }

  };

  const updateStatus = async (id, status) => {

    await fetch(`http://localhost:5000/api/orders/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ status })
    });

    fetchOrders();

  };

  // ---------------- PRODUCTS ----------------

  const fetchProducts = async () => {

    const res = await fetch("http://localhost:5000/api/products");

    const data = await res.json();

    setProducts(data);

  };

  const addProduct = async () => {

    await fetch("http://localhost:5000/api/products", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name,
        price,
        stock
      })

    });

    setName("");
    setPrice("");
    setStock("");

    fetchProducts();

  };

  const deleteProduct = async (id) => {

    await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE"
    });

    fetchProducts();

  };

  // ---------------- STATS ----------------

  const pending = orders.filter(o => o.status === "pending").length;
  const accepted = orders.filter(o => o.status === "Accepted").length;
  const rejected = orders.filter(o => o.status === "Rejected").length;

  const chartData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [
      {
        label: "Orders",
        data: [pending, accepted, rejected],
        backgroundColor: ["orange", "green", "red"]
      }
    ]
  };

  const totalSales = Array.isArray(orders)
    ? orders.reduce((sum, order) => sum + (order.price || 0), 0)
    : 0;

  return (

    <div>

      <Navbar />

      <div className="p-10">

        <h1 className="text-3xl font-bold mb-6">
          Admin Dashboard
        </h1>

        {/* TOTAL SALES */}

        <div className="bg-green-500 text-white p-4 rounded mb-6">
          Total Sales: ₹ {totalSales}
        </div>

        {/* ORDER STATS */}

        <div className="grid grid-cols-4 gap-4 mb-10">

          <div className="bg-blue-500 text-white p-4 rounded">
            Total Orders: {orders.length}
          </div>

          <div className="bg-yellow-500 text-white p-4 rounded">
            Pending: {pending}
          </div>

          <div className="bg-green-500 text-white p-4 rounded">
            Accepted: {accepted}
          </div>

          <div className="bg-red-500 text-white p-4 rounded">
            Rejected: {rejected}
          </div>

        </div>

        {/* ORDERS CHART */}

        <div className="w-96 mb-10">
          <Bar data={chartData} />
        </div>

        {/* ORDERS TABLE */}

        <h2 className="text-2xl font-bold mb-4">
          Orders
        </h2>

        <table className="w-full border mb-16">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">Customer</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Box Size</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>

            </tr>

          </thead>

          <tbody>

            {orders.map((order) => (

              <tr key={order.id}>

                <td className="border p-2">
                  {order.name}
                </td>

                <td className="border p-2">
                  {order.phone}
                </td>

                <td className="border p-2">
                  {order.length} × {order.width} × {order.height}
                </td>

                <td className="border p-2">
                  {order.quantity}
                </td>

                <td className="border p-2">
                  ₹ {order.price}
                </td>

                <td className="border p-2">
                  {order.status}
                </td>

                <td className="border p-2">

                  <button
                    className="bg-green-600 text-white px-3 py-1 mr-2 rounded"
                    onClick={() => updateStatus(order.id, "Accepted")}
                  >
                    Accept
                  </button>

                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => updateStatus(order.id, "Rejected")}
                  >
                    Reject
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {/* PRODUCT MANAGEMENT */}

        <h2 className="text-2xl font-bold mb-4">
          Product Management
        </h2>

        <input
          className="border p-2 mr-2"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 mr-2"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          className="border p-2 mr-2"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <button
          className="bg-green-600 text-white px-4 py-2"
          onClick={addProduct}
        >
          Add Product
        </button>

        {/* PRODUCT LIST */}

        <table className="w-full border mt-6">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">Name</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Action</th>

            </tr>

          </thead>

          <tbody>

            {products.map((product) => (

              <tr key={product.id}>

                <td className="border p-2">
                  {product.name}
                </td>

                <td className="border p-2">
                  ₹ {product.price}
                </td>

                <td className="border p-2">
                  {product.stock}
                </td>

                <td className="border p-2">

                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}

export default AdminDashboard;
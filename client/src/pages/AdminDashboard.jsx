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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {

    const res = await fetch("http://localhost:5000/api/orders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();
    setOrders(data);

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

  return (

    <div>

      <Navbar />

      <div className="p-10">

        <h1 className="text-3xl font-bold mb-6">
          Admin Dashboard
        </h1>

        {/* Stats Cards */}

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

        {/* Chart */}

        <div className="w-96 mb-10">
          <Bar data={chartData} />
        </div>

        {/* Orders Table */}

        <table className="w-full border">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">Customer</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Box Size</th>
              <th className="border p-2">Quantity</th>
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

      </div>

    </div>

  );
}

export default AdminDashboard;
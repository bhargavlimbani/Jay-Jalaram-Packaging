import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function CustomerDashboard() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {

    try {

      const res = await fetch("http://localhost:5000/api/orders/my", {
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

    } catch (error) {
      console.log(error);
      setOrders([]);
    }

  };

  return (
    <div>

      <Navbar />

      <div className="p-10">

        <h1 className="text-3xl font-bold mb-6">
          My Orders
        </h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          onClick={() => window.location.href = "/order"}
        >
          Place Custom Box Order
        </button>

        <table className="w-full border">

          <thead>

            <tr className="bg-gray-200">

              <th className="border p-2">Order ID</th>
              <th className="border p-2">Box Size</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Status</th>

            </tr>

          </thead>

          <tbody>

            {Array.isArray(orders) && orders.map((order) => (

              <tr key={order.id}>

                <td className="border p-2">{order.id}</td>

                <td className="border p-2">
                  {order.length} × {order.width} × {order.height}
                </td>

                <td className="border p-2">{order.quantity}</td>

                <td className="border p-2">{order.status}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default CustomerDashboard;
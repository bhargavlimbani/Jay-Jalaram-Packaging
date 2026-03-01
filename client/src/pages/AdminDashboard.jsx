import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function AdminDashboard() {

  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchOrders(); // refresh after update
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Jai Jalaram Packaging - Admin Dashboard 🚀</h1>

      <h2>All Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            style={{
              border: "1px solid black",
              marginBottom: "10px",
              padding: "10px"
            }}
          >
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Quantity:</strong> {order.quantity}</p>
            <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
            <p><strong>Status:</strong> {order.status}</p>

            {order.status === "pending" && (
              <>
                <button onClick={() => updateStatus(order.id, "accepted")}>
                  Accept
                </button>

                <button
                  onClick={() => updateStatus(order.id, "rejected")}
                  style={{ marginLeft: "10px" }}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;
import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { getProfile } from "../services/authService";
import { Link } from "react-router-dom";

function CustomerDashboard() {
  const { user, updateUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [chatMessages, setChatMessages] = useState({});
  const [chatInputs, setChatInputs] = useState({});
  const [openChatOrderId, setOpenChatOrderId] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        updateUser(profile);
      } catch (error) {
        console.log(error);
      }
    };

    loadProfile();
    fetchProducts();
    fetchMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setProducts([]);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      console.log(error);
      setOrders([]);
    }
  };

  const fetchOrderChat = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/chat`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to load chat.");
        return;
      }
      setChatMessages((prev) => ({ ...prev, [orderId]: data.messages || [] }));
      setOpenChatOrderId((prev) => (prev === orderId ? null : orderId));
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while loading chat.");
    }
  };

  const sendChatMessage = async (orderId) => {
    try {
      const text = chatInputs[orderId] || "";
      if (!text.trim()) {
        setMessage("Please write a chat message before sending.");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to send chat message.");
        return;
      }
      setChatInputs((prev) => ({ ...prev, [orderId]: "" }));
      setChatMessages((prev) => ({ ...prev, [orderId]: data.messages || [] }));
      setMessage("Chat message sent successfully.");
      fetchMyOrders();
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while sending the chat message.");
    }
  };

  const placeOrder = async (productId) => {
    const quantity = Number(quantities[productId] || 1);

    if (!quantity || quantity < 1) {
      setMessage("Please enter a valid quantity.");
      return;
    }

    setLoadingProductId(productId);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to place order.");
        return;
      }
      setMessage("Order placed successfully. It is now waiting for admin approval.");
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
      fetchMyOrders();
      fetchProducts();
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while placing the order.");
    } finally {
      setLoadingProductId(null);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to cancel order.");
        return;
      }
      setMessage("Order cancelled successfully.");
      fetchMyOrders();
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while cancelling the order.");
    }
  };

  const renderChatPanel = (orderId) =>
    openChatOrderId === orderId ? (
      <div className="mt-3 rounded border bg-slate-50 p-3">
        <div className="max-h-48 overflow-y-auto rounded border bg-white p-3">
          {(chatMessages[orderId] || []).length > 0 ? (
            chatMessages[orderId].map((chat, index) => (
              <div key={`${orderId}-${index}`} className="mb-3">
                <p className="text-xs font-semibold uppercase text-gray-500">{chat.sender}</p>
                <p className="text-sm text-gray-800">{chat.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No chat messages yet.</p>
          )}
        </div>
        <textarea
          className="mt-3 w-full rounded border p-2 text-sm"
          rows="2"
          placeholder="Type message to admin"
          value={chatInputs[orderId] || ""}
          onChange={(e) =>
            setChatInputs((prev) => ({ ...prev, [orderId]: e.target.value }))
          }
        />
        <button
          className="mt-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          onClick={() => sendChatMessage(orderId)}
        >
          Send Chat
        </button>
      </div>
    ) : null;

  return (
    <div>
      <Navbar />
      <div className="p-10">
        
        <div className="mb-6 rounded border border-blue-200 bg-blue-50 px-4 py-4">
          <h2 className="text-xl font-semibold">Welcome, {user?.name || "Customer"}</h2>
          <p className="mt-1 text-sm text-gray-700">
            Email: {user?.email || "-"} | Phone: {user?.phone || "-"}
          </p>
        </div>
        {message && <div className="mb-6 rounded bg-blue-100 px-4 py-3 text-blue-900">{message}</div>}
        <h2 className="mb-4 text-2xl font-bold">All Products</h2>
        <div className="mb-6">
          <Link to="/order">
            <button className="rounded bg-green-600 px-5 py-3 text-white hover:bg-green-700">
              Custom Box Order
            </button>
          </Link>
        </div>
        <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const isCustomProduct =
              product.name === "Custom Size Box" || product.name === "Custom Design Box";
            return (
              <div key={product.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <img
                  src={product.image_data || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="mb-4 h-40 w-full rounded bg-gray-100 object-contain p-2"
                />
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{product.description || "Standard packaging product"}</p>
                {product.name === "Custom Size Box" && <p className="mt-2 text-sm text-blue-700">Use the custom box order form for custom size requirement.</p>}
                {product.name === "Custom Design Box" && <p className="mt-2 text-sm text-blue-700">Use the custom box order form for custom design requirement.</p>}
                <p className="mt-3 font-semibold text-green-700">Price: Rs. {product.price}</p>
                <p className="mt-1 text-sm text-gray-700">Stock: {product.stock}</p>
                <div className="mt-4 flex gap-3">
                  <input
                    type="number"
                    min="1"
                    className="w-24 rounded border px-3 py-2"
                    value={quantities[product.id] || 1}
                    onChange={(e) =>
                      setQuantities((prev) => ({ ...prev, [product.id]: e.target.value }))
                    }
                    disabled={isCustomProduct}
                  />
                  {isCustomProduct ? (
                    <Link to="/order" className="flex-1">
                      <button className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Custom Box Order
                      </button>
                    </Link>
                  ) : (
                    <button
                      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                      onClick={() => placeOrder(product.id)}
                      disabled={loadingProductId === product.id || Number(product.stock) <= 0}
                    >
                      {Number(product.stock) > 0 ? "Order Now" : "Out of Stock"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <h2 className="mb-4 text-2xl font-bold">My Order History</h2>
        <table className="w-full border bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Order ID</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Total Price</th>
              <th className="border p-2">Approval Status</th>
              <th className="border p-2">Chat</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="border p-2 align-top">{order.id}</td>
                  <td className="border p-2 align-top">
                    {order.order_type === "custom"
                      ? `Custom Box (${order.box_length} x ${order.box_width} x ${order.box_height})`
                      : order.Product?.name || "Product removed"}
                  </td>
                  <td className="border p-2 align-top">{order.quantity}</td>
                  <td className="border p-2 align-top">Rs. {order.total_price}</td>
                  <td className="border p-2 align-top">{order.status}</td>
                  <td className="border p-2 align-top">
                    {renderChatPanel(order.id)}
                  </td>
                  <td className="border p-2 align-top">
                    <button
                      className="mb-2 rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
                      onClick={() => fetchOrderChat(order.id)}
                    >
                      Chat
                    </button>
                    <br />
                    {order.status === "Pending" ? (
                      <button
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border p-4 text-center" colSpan="7">No orders found yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerDashboard;

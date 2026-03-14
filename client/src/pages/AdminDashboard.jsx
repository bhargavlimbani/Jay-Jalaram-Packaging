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
  Legend,
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
  const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
  const ALLOWED_IMAGE_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "svg",
    "avif",
    "jfif",
  ];
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInputs, setChatInputs] = useState({});
  const [openChatOrderId, setOpenChatOrderId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    image_data: "",
    price: "",
    stock: "",
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
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

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/customers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setCustomers([]);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to load customer details.");
        return;
      }
      setSelectedCustomer(data);
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while loading customer details.");
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
      fetchOrders();
      if (selectedCustomer?.id) {
        fetchCustomerDetails(selectedCustomer.id);
      }
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while sending the chat message.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to update order status.");
        return;
      }
      setMessage(`Order ${status.toLowerCase()} successfully.`);
      fetchOrders();
      fetchProducts();
      fetchCustomers();
      await fetchOrderChat(id);
      if (selectedCustomer?.id) {
        fetchCustomerDetails(selectedCustomer.id);
      }
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while updating order status.");
    }
  };

  const resetForm = () => {
    setProductForm({ name: "", description: "", image_data: "", price: "", stock: "" });
    setEditingProductId(null);
  };

  const handleProductImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setProductForm((prev) => ({ ...prev, image_data: "" }));
      return;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    const isImageMime = file.type.startsWith("image/");
    const isAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension);

    if (!isImageMime && !isAllowedExtension) {
      setMessage("Please upload a valid image file for product photo.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setMessage("Product image size must be 10 MB or smaller.");
      setProductForm((prev) => ({ ...prev, image_data: "" }));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProductForm((prev) => ({ ...prev, image_data: reader.result }));
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const saveProduct = async () => {
    try {
      const url = editingProductId
        ? `http://localhost:5000/api/products/${editingProductId}`
        : "http://localhost:5000/api/products";
      const method = editingProductId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(productForm),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(data?.message || data?.error || `Unable to save product. (${res.status})`);
        return;
      }
      setMessage(editingProductId ? "Product updated successfully." : "Product added successfully.");
      resetForm();
      fetchProducts();
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while saving the product.");
    }
  };

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      image_data: product.image_data || "",
      price: product.price || "",
      stock: product.stock || "",
    });
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Unable to delete product.");
        return;
      }
      setMessage("Product deleted successfully.");
      fetchProducts();
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while deleting the product.");
    }
  };

  const pending = orders.filter((order) => order.status === "Pending").length;
  const accepted = orders.filter((order) => order.status === "Accepted").length;
  const rejected = orders.filter((order) => order.status === "Rejected").length;

  const chartData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [
      {
        label: "Orders",
        data: [pending, accepted, rejected],
        backgroundColor: ["orange", "green", "red"],
      },
    ],
  };

  const totalSales = Array.isArray(orders)
    ? orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0)
    : 0;

  const viewPdf = (fileData, fileName) => {
    const pdfWindow = window.open("", "_blank");

    if (!pdfWindow) {
      setMessage("Popup blocked. Please allow popups to view the PDF.");
      return;
    }

    pdfWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${fileName || "Design PDF"}</title>
          <style>
            html, body { margin: 0; height: 100%; background: #111827; }
            iframe { border: 0; width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <iframe src="${fileData}" title="${fileName || "Design PDF"}"></iframe>
        </body>
      </html>
    `);
    pdfWindow.document.close();
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
          placeholder="Type message to customer"
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
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        {message && <div className="mb-6 rounded bg-blue-100 px-4 py-3 text-blue-900">{message}</div>}
        <div className="mb-6 rounded bg-green-500 p-4 text-white">Total Sales: Rs. {totalSales}</div>
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded bg-blue-500 p-4 text-white">Total Orders: {orders.length}</div>
          <div className="rounded bg-yellow-500 p-4 text-white">Pending: {pending}</div>
          <div className="rounded bg-green-500 p-4 text-white">Accepted: {accepted}</div>
          <div className="rounded bg-red-500 p-4 text-white">Rejected: {rejected}</div>
        </div>
        <div className="mb-10 w-full max-w-xl">
          <Bar data={chartData} />
        </div>
        <h2 className="mb-4 text-2xl font-bold">Customer Orders</h2>
        <table className="mb-16 w-full border bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Customer</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Total Price</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Chat</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="border p-2 align-top">{order.User?.name || "Customer"}</td>
                  <td className="border p-2 align-top">
                    {order.order_type === "custom"
                      ? `Custom Box (${order.box_length} x ${order.box_width} x ${order.box_height})`
                      : order.Product?.name || "Product removed"}
                  </td>
                  <td className="border p-2 align-top">{order.quantity}</td>
                  <td className="border p-2 align-top">Rs. {order.total_price}</td>
                  <td className="border p-2 align-top">{order.status}</td>
                  <td className="border p-2 align-top">
                    {order.customer_reply && (
                      <p className="mb-2 text-sm text-blue-700">Customer reply: {order.customer_reply}</p>
                    )}
                    {order.design_file_data && (
                      <div className="mt-2 text-sm">
                        <button
                          type="button"
                          className="mr-3 text-blue-700 underline"
                          onClick={() =>
                            viewPdf(order.design_file_data, order.design_file_name)
                          }
                        >
                          View PDF
                        </button>
                        <a
                          className="text-blue-700 underline"
                          href={order.design_file_data}
                          download={order.design_file_name || "design.pdf"}
                        >
                          Download PDF
                        </a>
                      </div>
                    )}
                    {renderChatPanel(order.id)}
                  </td>
                  <td className="border p-2 align-top">
                    <button className="mb-2 mr-2 rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700" onClick={() => fetchOrderChat(order.id)}>Chat</button>
                    <button className="mr-2 rounded bg-green-600 px-3 py-1 text-white disabled:opacity-60" onClick={() => updateStatus(order.id, "Accepted")} disabled={order.status === "Accepted"}>Accept</button>
                    <button className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-60" onClick={() => updateStatus(order.id, "Rejected")} disabled={order.status === "Rejected"}>Reject</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td className="border p-4 text-center" colSpan="7">No customer orders found.</td></tr>
            )}
          </tbody>
        </table>
        <h2 className="mb-4 text-2xl font-bold">All Customers</h2>
        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.length > 0 ? customers.map((customer) => (
            <button key={customer.id} className="rounded-xl border bg-white p-5 text-left shadow-sm hover:border-blue-400" onClick={() => fetchCustomerDetails(customer.id)}>
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <p className="mt-1 text-sm text-gray-700">{customer.email}</p>
              <p className="mt-1 text-sm text-gray-700">{customer.phone || "No phone"}</p>
            </button>
          )) : <div className="rounded border bg-white p-4">No customers found.</div>}
        </div>
        {selectedCustomer && (
          <div className="mb-16 rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold">{selectedCustomer.name}</h3>
            <p className="mt-2 text-sm text-gray-700">Email: {selectedCustomer.email}</p>
            <p className="mt-1 text-sm text-gray-700">Phone: {selectedCustomer.phone || "-"}</p>
            <p className="mt-1 text-sm text-gray-700">Address: {selectedCustomer.address || "-"}</p>
            <h4 className="mt-6 mb-3 text-xl font-semibold">Customer Order History</h4>
            <table className="w-full border bg-white">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Order ID</th>
                  <th className="border p-2">Product</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Total Price</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Chat Summary</th>
                </tr>
              </thead>
              <tbody>
                {selectedCustomer.Orders?.length > 0 ? selectedCustomer.Orders.map((order) => (
                  <tr key={order.id}>
                    <td className="border p-2">{order.id}</td>
                    <td className="border p-2">
                      {order.order_type === "custom"
                        ? `Custom Box (${order.box_length} x ${order.box_width} x ${order.box_height})`
                        : order.Product?.name || "Product removed"}
                    </td>
                    <td className="border p-2">{order.quantity}</td>
                    <td className="border p-2">Rs. {order.total_price}</td>
                    <td className="border p-2">{order.status}</td>
                    <td className="border p-2">
                      {order.admin_comment || "-"}
                      {order.customer_reply && <p className="mt-2 text-sm text-blue-700">Customer reply: {order.customer_reply}</p>}
                      {order.design_file_data && (
                        <div className="mt-2 text-sm">
                          <button
                            type="button"
                            className="mr-3 text-blue-700 underline"
                            onClick={() =>
                              viewPdf(order.design_file_data, order.design_file_name)
                            }
                          >
                            View PDF
                          </button>
                          <a
                            className="text-blue-700 underline"
                            href={order.design_file_data}
                            download={order.design_file_name || "design.pdf"}
                          >
                            Download PDF
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : <tr><td className="border p-4 text-center" colSpan="6">No order history for this customer.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <h2 className="mb-4 text-2xl font-bold">Product Management</h2>
        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input className="rounded border p-2" placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
          <input className="rounded border p-2" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
          <input className="rounded border p-2" type="file" accept="image/*" onChange={handleProductImageChange} />
          <input className="rounded border p-2" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
          <input className="rounded border p-2" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
        </div>
        <p className="mb-4 text-xs text-gray-500">
          Upload product photo in common image formats. Maximum size: 10 MB.
        </p>
        {productForm.image_data && (
          <div className="mb-4">
            <img
              src={productForm.image_data}
              alt="Product preview"
              className="h-24 w-24 rounded object-cover border"
            />
          </div>
        )}
        <div className="mb-6">
          <button className="mr-2 rounded bg-green-600 px-4 py-2 text-white" onClick={saveProduct}>{editingProductId ? "Update Product" : "Add Product"}</button>
          <button className="rounded bg-gray-500 px-4 py-2 text-white" onClick={resetForm}>Clear</button>
        </div>
        <table className="w-full border bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Photo</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map((product) => (
              <tr key={product.id}>
                <td className="border p-2">
                  {product.image_data ? (
                    <img
                      src={product.image_data}
                      alt={product.name}
                      className="h-14 w-14 rounded object-cover"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">{product.description || "-"}</td>
                <td className="border p-2">Rs. {product.price}</td>
                <td className="border p-2">{product.stock}</td>
                <td className="border p-2">
                  <button className="mr-2 rounded bg-blue-600 px-3 py-1 text-white" onClick={() => startEdit(product)}>Edit</button>
                  <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={() => deleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            )) : <tr><td className="border p-4 text-center" colSpan="6">No products found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;

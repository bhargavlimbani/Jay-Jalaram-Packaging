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
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [adminComments, setAdminComments] = useState({});
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
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

  const updateStatus = async (id, status) => {
    try {
      const adminComment = adminComments[id] || "";

      if (status === "Rejected" && !adminComment.trim()) {
        setMessage("Please add a rejection comment before rejecting the order.");
        return;
      }

      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          status,
          admin_comment: adminComment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Unable to update order status.");
        return;
      }

      setMessage(`Order ${status.toLowerCase()} successfully.`);
      setAdminComments((prev) => ({ ...prev, [id]: "" }));
      fetchOrders();
      fetchProducts();
      fetchCustomers();
      if (selectedCustomer?.id) {
        fetchCustomerDetails(selectedCustomer.id);
      }
    } catch (error) {
      console.log(error);
      setMessage("Something went wrong while updating order status.");
    }
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      stock: "",
    });
    setEditingProductId(null);
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

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || data.error || "Unable to save product.");
        return;
      }

      setMessage(
        editingProductId
          ? "Product updated successfully."
          : "Product added successfully."
      );
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

  return (
    <div>
      <Navbar />

      <div className="p-10">
        <h1 className="mb-6 text-3xl font-bold">
          Admin Dashboard
        </h1>

        {message && (
          <div className="mb-6 rounded bg-blue-100 px-4 py-3 text-blue-900">
            {message}
          </div>
        )}

        <div className="mb-6 rounded bg-green-500 p-4 text-white">
          Total Sales: Rs. {totalSales}
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded bg-blue-500 p-4 text-white">
            Total Orders: {orders.length}
          </div>
          <div className="rounded bg-yellow-500 p-4 text-white">
            Pending: {pending}
          </div>
          <div className="rounded bg-green-500 p-4 text-white">
            Accepted: {accepted}
          </div>
          <div className="rounded bg-red-500 p-4 text-white">
            Rejected: {rejected}
          </div>
        </div>

        <div className="mb-10 w-full max-w-xl">
          <Bar data={chartData} />
        </div>

        <h2 className="mb-4 text-2xl font-bold">
          Customer Orders
        </h2>

        <table className="mb-16 w-full border bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Customer</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Total Price</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Comments</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="border p-2">{order.User?.name || "Customer"}</td>
                  <td className="border p-2">
                    {order.order_type === "custom"
                      ? `Custom Box (${order.box_length} x ${order.box_width} x ${order.box_height})`
                      : order.Product?.name || "Product removed"}
                  </td>
                  <td className="border p-2">{order.quantity}</td>
                  <td className="border p-2">Rs. {order.total_price}</td>
                  <td className="border p-2">{order.status}</td>
                  <td className="border p-2">
                    <textarea
                      className="w-full rounded border p-2 text-sm"
                      rows="3"
                      placeholder="Admin comment"
                      value={adminComments[order.id] ?? order.admin_comment ?? ""}
                      onChange={(e) =>
                        setAdminComments((prev) => ({
                          ...prev,
                          [order.id]: e.target.value,
                        }))
                      }
                    />
                    {order.customer_reply && (
                      <p className="mt-2 text-sm text-blue-700">
                        Customer reply: {order.customer_reply}
                      </p>
                    )}
                  </td>
                  <td className="border p-2">
                    <button
                      className="mr-2 rounded bg-green-600 px-3 py-1 text-white disabled:opacity-60"
                      onClick={() => updateStatus(order.id, "Accepted")}
                      disabled={order.status === "Accepted"}
                    >
                      Accept
                    </button>
                    <button
                      className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-60"
                      onClick={() => updateStatus(order.id, "Rejected")}
                      disabled={order.status === "Rejected"}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border p-4 text-center" colSpan="7">
                  No customer orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <h2 className="mb-4 text-2xl font-bold">
          All Customers
        </h2>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.length > 0 ? (
            customers.map((customer) => (
              <button
                key={customer.id}
                className="rounded-xl border bg-white p-5 text-left shadow-sm hover:border-blue-400"
                onClick={() => fetchCustomerDetails(customer.id)}
              >
                <h3 className="text-lg font-semibold">{customer.name}</h3>
                <p className="mt-1 text-sm text-gray-700">{customer.email}</p>
                <p className="mt-1 text-sm text-gray-700">{customer.phone || "No phone"}</p>
              </button>
            ))
          ) : (
            <div className="rounded border bg-white p-4">
              No customers found.
            </div>
          )}
        </div>

        {selectedCustomer && (
          <div className="mb-16 rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold">{selectedCustomer.name}</h3>
            <p className="mt-2 text-sm text-gray-700">Email: {selectedCustomer.email}</p>
            <p className="mt-1 text-sm text-gray-700">Phone: {selectedCustomer.phone || "-"}</p>
            <p className="mt-1 text-sm text-gray-700">Address: {selectedCustomer.address || "-"}</p>

            <h4 className="mt-6 mb-3 text-xl font-semibold">
              Customer Order History
            </h4>

            <table className="w-full border bg-white">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Order ID</th>
                  <th className="border p-2">Product</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Total Price</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Comments</th>
                </tr>
              </thead>
              <tbody>
                {selectedCustomer.Orders?.length > 0 ? (
                  selectedCustomer.Orders.map((order) => (
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
                        {order.customer_reply && (
                          <p className="mt-2 text-sm text-blue-700">
                            Customer reply: {order.customer_reply}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border p-4 text-center" colSpan="6">
                      No order history for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="mb-4 text-2xl font-bold">
          Product Management
        </h2>

        <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            className="rounded border p-2"
            placeholder="Product Name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
          />
          <input
            className="rounded border p-2"
            placeholder="Description"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          />
          <input
            className="rounded border p-2"
            placeholder="Price"
            value={productForm.price}
            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
          />
          <input
            className="rounded border p-2"
            placeholder="Stock"
            value={productForm.stock}
            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <button
            className="mr-2 rounded bg-green-600 px-4 py-2 text-white"
            onClick={saveProduct}
          >
            {editingProductId ? "Update Product" : "Add Product"}
          </button>
          <button
            className="rounded bg-gray-500 px-4 py-2 text-white"
            onClick={resetForm}
          >
            Clear
          </button>
        </div>

        <table className="w-full border bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">{product.description || "-"}</td>
                  <td className="border p-2">Rs. {product.price}</td>
                  <td className="border p-2">{product.stock}</td>
                  <td className="border p-2">
                    <button
                      className="mr-2 rounded bg-blue-600 px-3 py-1 text-white"
                      onClick={() => startEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded bg-red-600 px-3 py-1 text-white"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border p-4 text-center" colSpan="5">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;

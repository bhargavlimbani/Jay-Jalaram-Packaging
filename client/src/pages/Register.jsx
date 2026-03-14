import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRegister = async () => {
    try {
      setErrorMessage("");

      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMessage("Name, email, and password are required");
        return;
      }

      if (!emailPattern.test(email.trim())) {
        setErrorMessage("Please enter a valid email address");
        return;
      }

      await registerUser(name.trim(), email.trim(), phone.trim(), address.trim(), password);
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Register to place orders, track history, and manage your profile.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage("");
              }}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrorMessage("");
              }}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              rows="4"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrorMessage("");
              }}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleRegister}
          className="mt-6 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Register
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

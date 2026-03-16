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
    <div className="brand-auth-shell flex items-center justify-center">
      <div className="brand-panel w-full max-w-3xl p-8 md:p-12">
        <p className="brand-kicker">New Customer</p>
        <h2 className="mt-3 text-4xl font-black text-gray-900">Create Account</h2>
        <p className="mt-3 text-sm text-gray-600">
          Register to place orders, track history, and manage your profile.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="brand-label">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage("");
              }}
              className="brand-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="brand-label">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              className="brand-input"
            />
          </div>

          <div>
            <label className="brand-label">Phone Number</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrorMessage("");
              }}
              className="brand-input"
            />
          </div>

          <div>
            <label className="brand-label">Password</label>
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              className="brand-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="brand-label">Address</label>
            <textarea
              rows="4"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrorMessage("");
              }}
              className="brand-input"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleRegister}
          className="brand-button mt-6 w-full"
        >
          Register
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-amber-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

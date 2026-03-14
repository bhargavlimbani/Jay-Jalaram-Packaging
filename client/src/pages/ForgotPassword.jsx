import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordRequest } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleReset = async () => {
    try {
      setErrorMessage("");
      setMessage("");

      if (!emailPattern.test(email.trim())) {
        setErrorMessage("Please enter a valid email address");
        return;
      }

      setLoading(true);
      const res = await forgotPasswordRequest(email.trim());
      setMessage(res.message);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to send reset email right now"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your registered email and we will send a password reset link.
        </p>

        <div className="mt-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage("");
              setMessage("");
            }}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500"
          />
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

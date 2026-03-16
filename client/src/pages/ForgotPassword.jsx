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
    <div className="brand-auth-shell flex items-center justify-center">
      <div className="brand-panel w-full max-w-lg p-8 md:p-10">
        <p className="brand-kicker">Account Recovery</p>
        <h2 className="mt-3 text-4xl font-black text-gray-900">Forgot Password</h2>
        <p className="mt-3 text-sm text-gray-600">
          Enter your registered email and we will send a password reset link.
        </p>

        <div className="mt-6">
          <label className="brand-label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage("");
              setMessage("");
            }}
            className="brand-input"
          />
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="brand-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-amber-700 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

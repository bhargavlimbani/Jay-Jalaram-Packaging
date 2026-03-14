import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPasswordRequest } from "../services/authService";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setErrorMessage("");
      setMessage("");

      if (!password.trim() || password.length < 6) {
        setErrorMessage("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        return;
      }

      setLoading(true);
      const res = await resetPasswordRequest(token, password);
      setMessage(res.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to reset password right now"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your new password for your Jai Jalaram Packaging account.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
                setMessage("");
              }}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrorMessage("");
                setMessage("");
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

        {message && (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Back to{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;

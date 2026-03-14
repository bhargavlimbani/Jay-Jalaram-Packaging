import { useState, useContext } from "react";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async () => {
    try {
      setErrorMessage("");

      if (!emailPattern.test(email.trim())) {
        setErrorMessage("Please enter a valid email address");
        return;
      }

      const data = await loginUser(email.trim(), password);

      login(data.user, data.token);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          Login
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorMessage("");
          }}
          className="w-full border p-2 rounded mb-4"
        />

        {/* Password */}
        <div className="flex">

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage("");
            }}
            className="w-full border p-2 rounded-l"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="bg-gray-200 px-3 rounded-r"
          >
            {showPassword ? "Hide" : "Show"}
          </button>

        </div>

        {errorMessage && (
          <p className="mt-3 text-sm font-medium text-red-600">{errorMessage}</p>
        )}

        {/* Forgot password */}
        <div className="text-right mt-2">

          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>

        </div>

        {/* Login Button */}
        <button
          type="button"
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700"
        >
          Login
        </button>

        {/* Register */}
        <p className="text-center mt-4 text-sm">

          <Link
            to="/register"
            className="text-blue-600 ml-1 hover:underline"
          >
            Don't have an account? Sign Up
          </Link>

        </p>

      </div>

    </div>

  );
}

export default Login;

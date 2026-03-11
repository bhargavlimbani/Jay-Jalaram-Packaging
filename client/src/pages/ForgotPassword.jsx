import { useState } from "react";

function ForgotPassword() {

  const [email, setEmail] = useState("");

  const handleReset = () => {
    alert("Password reset link will be sent to email");
  };

  return (
    <div>

      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <button onClick={handleReset}>
        Reset Password
      </button>

    </div>
  );
}

export default ForgotPassword;
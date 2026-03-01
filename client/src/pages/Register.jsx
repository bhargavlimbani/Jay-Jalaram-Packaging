import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await registerUser(name, email, password);
      alert("Registration successful");
      navigate("/");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div>
      <h2>Customer Register</h2>

      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
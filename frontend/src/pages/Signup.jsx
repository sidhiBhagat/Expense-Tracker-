import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  // const BASE_URL = import.meta.env.VITE_API_URL;
  
  const navigate = useNavigate();

  const handleSignup = async () => {
    // Basic frontend validation
    if (!username || !email || !password) {
      setMsg("All fields are required");
      return;
    }

    if (password.length < 6) {
      setMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("http://13.207.189.198:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (data.success) {
        setMsg("Signup successful ✅");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setMsg(data.message);
      }
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      setMsg("Could not connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create Account</h2>

        <input
          className="input"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="input"
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Create password (min 6 characters)"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn" onClick={handleSignup} disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p
          className="message"
          style={{ color: msg.includes("successful") ? "green" : "red" }}
        >
          {msg}
        </p>

        <div className="link">
          Already have an account? <a href="/">Login</a>
        </div>
      </div>
    </div>
  );
}

export default Signup;

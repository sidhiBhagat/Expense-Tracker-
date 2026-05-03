import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  // const BASE_URL = import.meta.env.VITE_API_URL;
  const handleLogin = async () => {
    console.log("Sending request.....")
    try {
      const res = await fetch("https://expense-tracker-production-3f89.up.railway.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const text = await res.text();
      console.log("RAW:", text);

      const data = JSON.parse(text);

      if (data.success) {
          // Save token — required for all protected API calls
          localStorage.setItem("token", data.token);

          // Save user info
          localStorage.setItem("user_id", data.user.user_id);
          localStorage.setItem("email", data.user.email);
          localStorage.setItem("username", data.user.username);

          navigate("/dashboard");
      } else {
        setMsg(data.message);
      }
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      setMsg("Server error");
    }
};

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>

        <input
          className="input"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn" onClick={handleLogin}>
          Login
        </button>

        <p className="message">{msg}</p>

        <div className="link">
            <p>Do not have an account?</p>
          <a href="/signup">Create Account</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
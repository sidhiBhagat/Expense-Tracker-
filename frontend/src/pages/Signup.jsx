// import { useState } from "react";
// import { signupUser } from "../services/api";

// function Signup() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSignup = async () => {
//     const data = await signupUser({ email, password });

//     if (data.success) {
//       alert("Signup successful ✅");
//     } else {
//       alert("User already exists ❌");
//     }
//   };

//   return (
//     <div>
//       <h2>Signup</h2>

//       <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
//       <input onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

//       <button onClick={handleSignup}>Signup</button>
//     </div>
//   );
// }

// export default Signup;

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState(""); // ✅ fixed
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    const res = await fetch("http://127.0.0.1:5000/signup", {
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
          placeholder="Create password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn" onClick={handleSignup}>
          Sign Up
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
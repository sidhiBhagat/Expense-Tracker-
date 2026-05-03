// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [msg, setMsg] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     try {
//       const res = await fetch("http://127.0.0.1:5000/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ email, password })
//       });

//       const data = await res.json();

//       if (data.success) {
//         setMsg("Login successful ✅");

//         // store user id
//         localStorage.setItem("user_id", data.user_id);

//         // go to dashboard
//         navigate("/dashboard");
//       } else {
//         setMsg(data.message);
//       }

//     } catch (error) {
//       console.log(error);
//       setMsg("Server error ❌");
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>

//       <input
//         type="email"
//         placeholder="Email"
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       <button onClick={handleLogin}>Login</button>

//       <p>{msg}</p>
//     </div>
//   );
// }

// export default Login;
// function Login() {
//   return <h2>Login Page Working ✅</h2>;
// }

// export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("email", data.email); 
        localStorage.setItem("username", data.username);

        navigate("/dashboard");
    } else {
      setMsg(data.message);
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
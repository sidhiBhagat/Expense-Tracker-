import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import Monthly from "./pages/Monthly";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/monthly" element={<Monthly />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// function App() {
//   return <h1>React is working 🚀</h1>;
// }

// export default App;
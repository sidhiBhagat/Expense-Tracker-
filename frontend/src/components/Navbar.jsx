import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="navbar">

      {/* Logo Section */}
      <div>
        <div className="logo">Expense Tracker</div>
        <div className="tagline">Track your bills & expenses</div>
      </div>

      {/* Navigation */}
      <div className="nav-links">
        <span onClick={() => navigate("/dashboard")}>Home</span>
        <span onClick={() => navigate("/monthly")}>Monthly</span>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </div>
  );
}

export default Navbar;
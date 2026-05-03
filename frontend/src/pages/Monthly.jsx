import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

function Monthly() {
  const token = localStorage.getItem("token"); // JWT token

  const [month, setMonth] = useState("");
  const [data, setData] = useState([]);

  const BASE_URL = "http://127.0.0.1:5000";

  const fetchMonthly = async () => {
    if (!month) return;
    const [year, mon] = month.split("-");
    try {
      const res = await fetch(
        `${BASE_URL}/monthly-expenses/${year}/${parseInt(mon)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMonthly();
  }, [month]);

  const income = data
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = data
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = income - expense;

  return (
    <div className="dashboard">

      <Navbar />

      <h2 className="welcome">Monthly Overview 📊</h2>

      {/* Month Picker */}
      <div className="form-card">
        <input
          className="input"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="summary">
        <div className="card-box">
          <h4>Balance</h4>
          <p>₹{balance}</p>
        </div>

        <div className="card-box">
          <h4 className="income">Income</h4>
          <p>₹{income}</p>
        </div>

        <div className="card-box">
          <h4 className="expense">Expense</h4>
          <p>₹{expense}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="transaction-list">
        <h3>Transactions</h3>

        {data.length === 0 && <p>No data for this month</p>}

        {data.map((t) => (
          <div className="transaction-item" key={t.id}>
            <span>
              {t.title} - ₹{t.amount} ({t.type}) |{" "}
              {new Date(t.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short"
              })}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Monthly;
